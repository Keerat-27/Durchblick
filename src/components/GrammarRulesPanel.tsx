import { useEffect, useState } from 'react';
import { fetchWikipediaGrammar, type WikipediaTopicResult } from '../api/wikipediaGrammar';
import type { TopicId } from '../data/topics';
import './GrammarRulesPanel.css';

type Props = { topicId: TopicId; topicLabel: string };

function splitIntoParagraphs(text: string): string[] {
  const chunks = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  return chunks.length ? chunks : [text.trim()].filter(Boolean);
}

function articleHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function GrammarRulesPanel({ topicId, topicLabel }: Props) {
  const [wiki, setWiki] = useState<WikipediaTopicResult | null>(null);
  const [wikiLoading, setWikiLoading] = useState(true);
  const [wikiError, setWikiError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    setWiki(null);
    setWikiError(null);
    setWikiLoading(true);

    fetchWikipediaGrammar(topicId, ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) {
          setWiki(data);
          setWikiError(data ? null : 'empty');
        }
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        const code =
          err instanceof Error ? err.message : String(err);
        setWiki(null);
        setWikiError(code);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setWikiLoading(false);
      });

    return () => ctrl.abort();
  }, [topicId, refreshKey]);

  const headlineDe = wiki?.de?.title;
  const headlineEn = wiki?.en?.title;
  const displayTitle = headlineDe ?? headlineEn ?? topicLabel;
  const subtitle =
    headlineDe && headlineEn && headlineDe !== headlineEn ? headlineEn : null;

  return (
    <section className="grammar-panel" aria-labelledby="grammar-heading">
      <div className="grammar-panel-inner">
        <p className="section-label grammar-panel-eyebrow">
          {topicLabel}
        </p>
        <h2 id="grammar-heading" className="grammar-title">
          {wikiLoading ? topicLabel : displayTitle}
        </h2>
        {!wikiLoading && subtitle && (
          <p className="grammar-title-sub">{subtitle}</p>
        )}
        {!wikiLoading && !subtitle && headlineDe && !headlineEn && wiki?.de && (
          <p className="grammar-title-sub wiki-single-lang-note">
            {articleHost(wiki.de.url)}
          </p>
        )}
        {!wikiLoading && !subtitle && headlineEn && !headlineDe && wiki?.en && (
          <p className="grammar-title-sub wiki-single-lang-note">
            {articleHost(wiki.en.url)}
          </p>
        )}

        {wikiLoading && (
          <div className="wiki-loading" aria-live="polite" aria-busy="true">
            <div className="wiki-skeleton" aria-hidden>
              <div className="wiki-skeleton-line wiki-skeleton-line--long" />
              <div className="wiki-skeleton-line wiki-skeleton-line--med" />
              <div className="wiki-skeleton-line wiki-skeleton-line--short" />
            </div>
          </div>
        )}

        {!wikiLoading && wiki && (wiki.en || wiki.de) && (
          <>
            <div
              className={
                'wiki-columns' +
                (wiki.en && wiki.de ? '' : ' wiki-columns--single')
              }
              role="presentation"
            >
              {wiki.en && (
                <article
                  className="wiki-col wiki-col-en"
                  aria-label="English Wikipedia extract"
                >
                  <h3 className="wiki-col-title">
                    <a
                      href={wiki.en.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {wiki.en.title}
                    </a>
                    <span className="wiki-lang-tag">EN</span>
                  </h3>
                  <div className="wiki-extract">
                    {splitIntoParagraphs(wiki.en.extract).map((p, i) => (
                      <p key={i} className={i === 0 ? 'wiki-extract-lead' : undefined}>
                        {p}
                      </p>
                    ))}
                  </div>
                  <a
                    className="wiki-read-more"
                    href={wiki.en.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {articleHost(wiki.en.url)} →
                  </a>
                </article>
              )}
              {wiki.de && (
                <article
                  className="wiki-col wiki-col-de"
                  aria-label="German Wikipedia extract"
                >
                  <h3 className="wiki-col-title">
                    <a
                      href={wiki.de.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {wiki.de.title}
                    </a>
                    <span className="wiki-lang-tag">DE</span>
                  </h3>
                  <div className="wiki-extract">
                    {splitIntoParagraphs(wiki.de.extract).map((p, i) => (
                      <p key={i} className={i === 0 ? 'wiki-extract-lead' : undefined}>
                        {p}
                      </p>
                    ))}
                  </div>
                  <a
                    className="wiki-read-more"
                    href={wiki.de.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {articleHost(wiki.de.url)} →
                  </a>
                </article>
              )}
            </div>
            <p className="wiki-attribution">
              <a
                href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use"
                target="_blank"
                rel="noreferrer noopener"
              >
                Wikipedia
              </a>
              {' · '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noreferrer noopener"
              >
                CC BY-SA 4.0
              </a>
              . Extracts via the Wikimedia API (length-limited).
            </p>
          </>
        )}

        {!wikiLoading && !wiki && (
          <div className="wiki-error-panel" role="alert">
            <p className="wiki-error-text">
              {wikiError === 'empty'
                ? 'No extract returned for this topic.'
                : wikiError
                  ? `Request failed: ${wikiError}`
                  : 'Could not load this topic.'}
            </p>
            <button
              type="button"
              className="wiki-retry-btn"
              onClick={() => setRefreshKey((k) => k + 1)}
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
