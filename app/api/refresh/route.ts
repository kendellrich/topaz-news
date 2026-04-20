import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET() {
  try {
    const redis = Redis.fromEnv();

    const RSS_FEEDS = [
      'https://www.anthropic.com/rss.xml',
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://feeds.arstechnica.com/arstechnica/technology-lab',
      'https://www.technologyreview.com/feed/',
      'https://openai.com/blog/rss.xml',
    ];

    const Parser = (await import('rss-parser')).default;
    const parser = new Parser();

    const allItems: { title: string; link: string; contentSnippet: string; pubDate: string }[] = [];

    for (const feedUrl of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedUrl);
        const items = feed.items.slice(0, 5).map((item) => ({
          title: item.title || '',
          link: item.link || '',
          contentSnippet: item.contentSnippet || item.summary || '',
          pubDate: item.pubDate || '',
        }));
        allItems.push(...items);
      } catch {
        console.error('Failed to fetch feed:', feedUrl);
      }
    }

    if (allItems.length === 0) {
      return NextResponse.json({ error: 'No feed items found' }, { status: 500 });
    }

    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const client = new Anthropic();

    const prompt = `You are an AI news editor for a professional briefing page called AI Briefing by Topaz Technologies.

Here are the latest headlines from top AI news sources:

${allItems.map((item, i) => `${i + 1}. TITLE: ${item.title}
   URL: ${item.link}
   SNIPPET: ${item.contentSnippet?.slice(0, 300)}
   DATE: ${item.pubDate}
`).join('\n')}

Pick the 6 most important stories. Focus on:
- New model releases or major product launches
- Big industry moves, funding, or layoffs
- Policy, legal, or government AI news
- Genuinely useful new features for AI users

For each story write a 1-2 sentence plain English summary. No hype, no fluff.
Assign one of these categories: ANTHROPIC, OPENAI, PRODUCT, INDUSTRY, POLICY, RESEARCH

Return ONLY a JSON array, no other text:
[{"category":"CATEGORY","headline":"Short headline under 10 words","summary":"One to two sentence summary.","url":"original article URL"}]`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = responseText.replace(/```json|```/g, '').trim();
    const stories = JSON.parse(clean);

    const data = { stories, updatedAt: new Date().toISOString() };
    await redis.set('ai-stories', JSON.stringify(data));

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 });
  }
}
