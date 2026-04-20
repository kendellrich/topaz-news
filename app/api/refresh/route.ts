import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const RSS_FEEDS = [
      'https://www.anthropic.com/rss.xml',
      'https://techcrunch.com/category/artificial-intelligence/feed/',
    ];

    const Parser = (await import('rss-parser')).default;
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const fs = await import('fs');
    const path = await import('path');

    const parser = new Parser();
    const client = new Anthropic();

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

    const prompt = `You are an AI news editor for a professional briefing page called AI Briefing by Topaz Technologies.

Here are the latest headlines from top AI news sources:

${allItems.map((item, i) => `${i + 1}. TITLE: ${item.title}
   URL: ${item.link}
   SNIPPET: ${item.contentSnippet?.slice(0, 300)}
   DATE: ${item.pubDate}
`).join('\n')}

Pick the 6 most important stories. For each write a 1-2 sentence plain English summary.
Assign one of these categories: ANTHROPIC, OPENAI, PRODUCT, INDUSTRY, POLICY, RESEARCH

Return ONLY a JSON array, no other text:
[{"category":"CATEGORY","headline":"Short headline","summary":"Summary sentence.","url":"url"}]`;

    const message = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    const clean = responseText.replace(/```json|```/g, '').trim();
    const stories = JSON.parse(clean);

    const dataPath = path.join(process.cwd(), 'public', 'stories.json');
    fs.writeFileSync(dataPath, JSON.stringify({ stories, updatedAt: new Date().toISOString() }));

    return NextResponse.json({ success: true, stories });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 });
  }
}