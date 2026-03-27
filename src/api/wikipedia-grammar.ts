import type { TopicId } from '@/data/topics';
import { WIKI_PAGE_TITLES } from '@/data/wiki-topics';

export type WikipediaSide = {
  title: string;
  extract: string;
  url: string;
};

export type WikipediaTopicResult = {
  en: WikipediaSide | null;
  de: WikipediaSide | null;
};

type WikiLang = 'en' | 'de';

type QueryExtractPage = {
  title?: string;
  missing?: true;
  extract?: string;
};

function wikiArticleUrl(lang: WikiLang, title: string): string {
  const slug = title.replace(/ /g, '_');
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(slug)}`;
}

async function fetchExtract(
  lang: WikiLang,
  pageTitle: string,
  signal: AbortSignal
): Promise<WikipediaSide | null> {
  const base = `https://${lang}.wikipedia.org/w/api.php`;
  const params = new URLSearchParams({
    action: 'query',
    prop: 'extracts',
    explaintext: '1',
    exsectionformat: 'plain',
    redirects: '1',
    exchars: '1200',
    titles: pageTitle.replace(/_/g, ' '),
    format: 'json',
    origin: '*',
  });

  const res = await fetch(`${base}?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Wikipedia HTTP ${res.status}`);
  }

  const data = (await res.json()) as {
    query?: { pages?: Record<string, QueryExtractPage> };
  };

  const pages = data.query?.pages;
  if (!pages) return null;

  const page = Object.values(pages)[0];
  if (!page || page.missing) return null;

  const title = page.title ?? pageTitle;
  const extract = (page.extract ?? '').trim();
  if (!extract) return null;

  return {
    title,
    extract,
    url: wikiArticleUrl(lang, title),
  };
}

export async function fetchWikipediaGrammar(
  topicId: TopicId,
  signal: AbortSignal
): Promise<WikipediaTopicResult | null> {
  const titles = WIKI_PAGE_TITLES[topicId];
  if (!titles) return null;

  const [en, de] = await Promise.all([
    fetchExtract('en', titles.en, signal),
    fetchExtract('de', titles.de, signal),
  ]);

  if (!en && !de) return null;

  return { en, de };
}
