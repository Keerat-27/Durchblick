import { useEffect, useState } from 'react';
import {
  fetchWikipediaGrammar,
  type WikipediaTopicResult,
} from '@/api/wikipedia-grammar';
import type { TopicId } from '@/data/topics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Props = { topicId: TopicId; topicLabel: string };

function splitIntoParagraphs(text: string): string[] {
  const chunks = text
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
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

    fetchWikipediaGrammar(topicId, ctrl.signal)
      .then((data) => {
        if (!ctrl.signal.aborted) {
          setWiki(data);
          setWikiError(data ? null : 'empty');
        }
      })
      .catch((err: unknown) => {
        if (ctrl.signal.aborted) return;
        const code = err instanceof Error ? err.message : String(err);
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
    <section className="min-w-0" aria-labelledby="grammar-heading">
      <Card className="border-border/60 bg-transparent shadow-none ring-0">
        <CardContent className="space-y-4 px-0">
          <p className="font-sans text-[10px] font-extrabold tracking-[0.16em] text-muted-foreground uppercase">
            {topicLabel}
          </p>
          <h2
            id="grammar-heading"
            className="font-heading text-2xl leading-tight font-extrabold tracking-tight text-foreground"
          >
            {wikiLoading ? topicLabel : displayTitle}
          </h2>
          {!wikiLoading && subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
          {!wikiLoading &&
            !subtitle &&
            headlineDe &&
            !headlineEn &&
            wiki?.de && (
              <p className="font-sans text-xs font-bold text-muted-foreground">
                {articleHost(wiki.de.url)}
              </p>
            )}
          {!wikiLoading &&
            !subtitle &&
            headlineEn &&
            !headlineDe &&
            wiki?.en && (
              <p className="font-sans text-xs font-bold text-muted-foreground">
                {articleHost(wiki.en.url)}
              </p>
            )}

          {wikiLoading && (
            <div className="space-y-3 py-2" aria-live="polite" aria-busy="true">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-[92%] rounded-md" />
              <Skeleton className="h-3 w-[68%] rounded-md" />
            </div>
          )}

          {!wikiLoading && wiki && (wiki.en || wiki.de) && (
            <>
              <div
                className={cn(
                  'grid gap-0 overflow-hidden rounded-2xl border-2 border-[var(--duo-border)] dark:border-border',
                  wiki.en && wiki.de ? 'md:grid-cols-2' : 'grid-cols-1'
                )}
                role="presentation"
              >
                {wiki.en && (
                  <article
                    className="flex min-h-0 flex-col gap-0 bg-muted/25 p-4 md:border-r-2 md:border-[var(--duo-border)] dark:md:border-border"
                    aria-label="English Wikipedia extract"
                  >
                    <h3 className="mb-3 flex flex-wrap items-center justify-between gap-2 font-heading text-base font-extrabold">
                      <a
                        href={wiki.en.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="border-b-2 border-transparent text-foreground decoration-transparent transition-colors hover:border-[var(--chart-2)] hover:text-[var(--chart-2)]"
                      >
                        {wiki.en.title}
                      </a>
                      <span className="font-sans text-[9px] font-extrabold tracking-widest text-muted-foreground uppercase">
                        EN
                      </span>
                    </h3>
                    <ScrollArea className="max-h-[min(52vh,28rem)] pr-3">
                      <div className="space-y-3 text-sm leading-relaxed text-foreground">
                        {splitIntoParagraphs(wiki.en.extract).map((p, i) => (
                          <p
                            key={i}
                            className={cn(
                              i === 0 && 'text-[15px] leading-relaxed'
                            )}
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                    <a
                      className="mt-3 inline-block font-sans text-[11px] font-extrabold tracking-wide text-[var(--chart-2)]"
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
                    className="flex min-h-0 flex-col gap-0 bg-muted/15 p-4"
                    aria-label="German Wikipedia extract"
                  >
                    <h3 className="mb-3 flex flex-wrap items-center justify-between gap-2 font-heading text-base font-extrabold">
                      <a
                        href={wiki.de.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="border-b-2 border-transparent text-foreground decoration-transparent transition-colors hover:border-[var(--chart-2)] hover:text-[var(--chart-2)]"
                      >
                        {wiki.de.title}
                      </a>
                      <span className="font-sans text-[9px] font-extrabold tracking-widest text-muted-foreground uppercase">
                        DE
                      </span>
                    </h3>
                    <ScrollArea className="max-h-[min(52vh,28rem)] pr-3">
                      <div className="space-y-3 text-sm leading-relaxed text-foreground">
                        {splitIntoParagraphs(wiki.de.extract).map((p, i) => (
                          <p
                            key={i}
                            className={cn(
                              i === 0 && 'text-[15px] leading-relaxed'
                            )}
                          >
                            {p}
                          </p>
                        ))}
                      </div>
                    </ScrollArea>
                    <a
                      className="mt-3 inline-block font-sans text-[11px] font-extrabold tracking-wide text-[var(--chart-2)]"
                      href={wiki.de.url}
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      {articleHost(wiki.de.url)} →
                    </a>
                  </article>
                )}
              </div>
              <Separator className="bg-[var(--duo-border)] dark:bg-border" />
              <p className="font-sans text-[11px] font-semibold leading-relaxed text-muted-foreground">
                <a
                  href="https://foundation.wikimedia.org/wiki/Policy:Terms_of_Use"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-extrabold text-[var(--chart-2)] underline-offset-2 hover:underline"
                >
                  Wikipedia
                </a>
                {' · '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-extrabold text-[var(--chart-2)] underline-offset-2 hover:underline"
                >
                  CC BY-SA 4.0
                </a>
                . Extracts via the Wikimedia API (length-limited).
              </p>
            </>
          )}

          {!wikiLoading && !wiki && (
            <div
              className="flex flex-col gap-3 rounded-2xl border-2 border-[var(--duo-border)] bg-muted/25 p-4 dark:border-border"
              role="alert"
            >
              <p className="font-sans text-sm font-semibold text-muted-foreground">
                {wikiError === 'empty'
                  ? 'No extract returned for this topic.'
                  : wikiError
                    ? `Request failed: ${wikiError}`
                    : 'Could not load this topic.'}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit rounded-full font-sans text-[10px] font-extrabold tracking-widest uppercase"
                onClick={() => {
                  setWikiError(null);
                  setWikiLoading(true);
                  setRefreshKey((k) => k + 1);
                }}
              >
                Retry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
