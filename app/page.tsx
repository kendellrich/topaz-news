import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface Story {
  category: string;
  headline: string;
  summary: string;
  url: string;
}

function getStories(): { stories: Story[]; updatedAt: string } {
  const dataPath = join(process.cwd(), 'public', 'stories.json');
  if (existsSync(dataPath)) {
    const raw = readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw);
  }
  // Fallback stories if no data file exists yet
  return {
    updatedAt: new Date().toISOString(),
    stories: [
      {
        category: 'ANTHROPIC',
        headline: 'Claude Opus 4.7 just released',
        summary: 'Anthropic dropped Opus 4.7 on April 16, 2026. The latest and most capable model in the Claude 4 family with improvements across reasoning and coding.',
        url: 'https://www.anthropic.com/news',
      },
      {
        category: 'ANTHROPIC',
        headline: 'Claude Mythos accidentally leaked',
        summary: 'A new model more powerful than Opus was revealed via an Anthropic data exposure. Early testers say it is a step change in capability.',
        url: 'https://fortune.com/2026/03/26/anthropic-says-testing-mythos-powerful-new-ai-model-after-data-leak-reveals-its-existence-step-change-in-capabilities/',
      },
      {
        category: 'POLICY',
        headline: 'Federal judge blocks Pentagon retaliation against Anthropic',
        summary: 'After refusing to enable mass surveillance and autonomous weapons, the DoD punished Anthropic. A judge called it First Amendment retaliation.',
        url: 'https://siliconangle.com/2026/03/27/anthropic-launch-new-claude-mythos-model-advanced-reasoning-features/',
      },
      {
        category: 'PRODUCT',
        headline: 'Claude can now use your Mac',
        summary: 'Pro and Max users can now let Claude open apps, click buttons, and navigate their screen autonomously.',
        url: 'https://www.anthropic.com/news',
      },
      {
        category: 'INDUSTRY',
        headline: 'MCP is now the universal AI standard',
        summary: 'Anthropic donated MCP to the Linux Foundation. OpenAI, Microsoft, and Google have all adopted it as the default way AI connects to tools.',
        url: 'https://techcrunch.com/2026/01/02/in-2026-ai-will-move-from-hype-to-pragmatism/',
      },
      {
        category: 'INDUSTRY',
        headline: 'Atlassian cuts 1,600 jobs for AI pivot',
        summary: 'The Australian software giant replaced its CTO with two AI-focused CTOs and redirected resources toward AI development.',
        url: 'https://aibusiness.com/generative-ai/10-ai-predictions-2026',
      },
    ],
  };
}

export default function Home() {
  const { stories, updatedAt } = getStories();

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const lastUpdated = new Date(updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const gold = '#c9a84c';
  const dark = '#1a1a1a';
  const cream = '#f5f0e8';

  return (
    <main style={{ backgroundColor: cream, minHeight: '100vh', fontFamily: 'Georgia, serif' }}>

      <div style={{ backgroundColor: dark, padding: '14px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: gold, fontWeight: 700, fontSize: '15px' }}>Topaz Technologies</span>
          <span style={{ color: '#555', fontSize: '12px' }}>|</span>
          <span style={{ color: '#888', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>AI Intelligence</span>
        </div>
        <span style={{ color: '#888', fontSize: '11px' }}>{today}</span>
      </div>

      <div style={{ backgroundColor: dark, padding: '40px 32px 48px' }}>
        <p style={{ color: gold, fontSize: '11px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '12px' }}>
          AI Briefing
        </p>
        <h1 style={{ color: '#ffffff', fontSize: '38px', fontWeight: 700, lineHeight: 1.15, maxWidth: '480px', marginBottom: '16px' }}>
          What is happening in AI right now
        </h1>
        <p style={{ color: '#aaa', fontSize: '14px', maxWidth: '420px', lineHeight: 1.6 }}>
          A daily snapshot of the most important developments in artificial intelligence. Updated every morning.
        </p>
      </div>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 32px' }}>
        {stories.map((story, index) => (
          <a
            key={index}
            href={story.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none', display: 'block', marginBottom: '12px' }}
          >
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e8e0d0',
              borderRadius: '4px',
              padding: '24px 28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '16px',
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ color: gold, fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase' as const, marginBottom: '8px', fontFamily: 'sans-serif' }}>
                  {story.category}
                </p>
                <p style={{ color: dark, fontSize: '16px', fontWeight: 700, lineHeight: 1.35, marginBottom: '8px' }}>
                  {story.headline}
                </p>
                <p style={{ color: '#666', fontSize: '13px', lineHeight: 1.65, fontFamily: 'sans-serif' }}>
                  {story.summary}
                </p>
              </div>
              <span style={{ color: gold, fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>›</span>
            </div>
          </a>
        ))}
      </div>

      <div style={{ textAlign: 'center' as const, padding: '24px 32px 48px', borderTop: '1px solid #e0d8c8' }}>
        <p style={{ color: '#aaa', fontSize: '12px', fontFamily: 'sans-serif' }}>
          Last updated {lastUpdated} · Built by{' '}
          <a href="https://topaztech.co" style={{ color: gold, textDecoration: 'underline' }}>
            Topaz Technologies
          </a>
          {' · topaztech.co'}
        </p>
      </div>

    </main>
  );
}
