import { useCallback, useEffect, useState } from 'react';
import { ExerciseCard } from './components/ExerciseCard';
import { GrammarRulesPanel } from './components/GrammarRulesPanel';
import {
  TOPICS,
  SET_SIZE_OPTIONS,
  type Level,
  type SetSize,
  type TopicId,
} from './data/topics';
import type { Exercise } from './types/exercise';
import { pickExercises } from './utils/pickExercise';
import './App.css';

export default function App() {
  const [topic, setTopic] = useState<TopicId>('Konjunktiv II');
  const [level, setLevel] = useState<Level>('B1');
  const [setSize, setSetSize] = useState<SetSize>(5);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState({ total: 0, correct: 0, wrong: 0 });
  const [setId, setSetId] = useState(0);
  const [referenceOpen, setReferenceOpen] = useState(false);
  const [partialNotice, setPartialNotice] = useState<string | null>(null);

  const topicLabel = TOPICS.find((t) => t.id === topic)?.label ?? topic;

  useEffect(() => {
    setExercises([]);
    setError(null);
    setPartialNotice(null);
  }, [topic, level]);

  useEffect(() => {
    if (!referenceOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setReferenceOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [referenceOpen]);

  const onResult = useCallback((correct: boolean) => {
    setScore((s) => ({
      total: s.total + 1,
      correct: s.correct + (correct ? 1 : 0),
      wrong: s.wrong + (correct ? 0 : 1),
    }));
  }, []);

  function generateSet() {
    setLoading(true);
    setError(null);
    setPartialNotice(null);
    try {
      const list = pickExercises(topic, level, setSize);
      if (!list.length) {
        setExercises([]);
        setError(
          'No exercises for this topic and level. Try another combination.'
        );
        return;
      }
      if (list.length < setSize) {
        setPartialNotice(
          `Showing all ${list.length} exercise${list.length === 1 ? '' : 's'} available for this topic and level (you asked for ${setSize}).`
        );
      }
      setSetId((n) => n + 1);
      setExercises(list);
    } catch {
      setExercises([]);
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <div className="logo">Deutsch Trainer</div>
        <h1>Grammar practice</h1>
        <p className="subtitle">
          Generate sets of exercises by topic and CEFR level (A1–B2). Open the
          grammar reference only when you need it.
        </p>
      </header>

      <p className="section-label">Topic</p>
      <div className="topics" role="tablist" aria-label="Grammar topics">
        {TOPICS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={topic === t.id}
            className={'topic-btn' + (t.id === topic ? ' active' : '')}
            onClick={() => setTopic(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="layout-main">
        <div className="practice-column">
          <div className="practice-toolbar">
            <p className="section-label practice-toolbar-label">Practice</p>
            <button
              type="button"
              className={
                'ref-toggle-btn' + (referenceOpen ? ' ref-toggle-btn--on' : '')
              }
              aria-expanded={referenceOpen}
              aria-controls="grammar-reference-drawer"
              onClick={() => setReferenceOpen((o) => !o)}
            >
              {referenceOpen ? 'Close reference' : 'Grammar reference'}
            </button>
          </div>

          <div className="controls">
            <select
              className="level-select"
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              aria-label="CEFR level"
            >
              <option value="A1">A1</option>
              <option value="A2">A2</option>
              <option value="B1">B1</option>
              <option value="B2">B2</option>
            </select>
            <select
              className="level-select set-size-select"
              id="set-size"
              value={setSize}
              onChange={(e) =>
                setSetSize(Number(e.target.value) as SetSize)
              }
              aria-label="Number of questions in the set"
            >
              {SET_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n} questions
                </option>
              ))}
            </select>
            <button
              type="button"
              className="generate-btn"
              disabled={loading}
              onClick={generateSet}
            >
              Generate set
            </button>
          </div>

          <div className="score-bar">
            <div className="score-item">
              <div className="score-dot total" />
              <span className="score-num">{score.total}</span>
              <span>attempted</span>
            </div>
            <div className="score-item">
              <div className="score-dot correct" />
              <span className="score-num">{score.correct}</span>
              <span>correct</span>
            </div>
            <div className="score-item">
              <div className="score-dot wrong" />
              <span className="score-num">{score.wrong}</span>
              <span>wrong</span>
            </div>
          </div>

          {error && <div className="error-box">{error}</div>}
          {partialNotice && !error && (
            <div className="info-box" role="status">
              {partialNotice}
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading…</p>
            </div>
          )}

          {!loading && exercises.length > 0 && (
            <div className="exercise-stack">
              {exercises.map((ex, i) => (
                <ExerciseCard
                  key={`${setId}-${i}`}
                  exercise={ex}
                  topicLabel={topicLabel}
                  questionNumber={i + 1}
                  onResult={onResult}
                />
              ))}
            </div>
          )}

          {!loading && exercises.length === 0 && !error && (
            <div className="empty-state">
              <div className="empty-icon">de/</div>
              <div className="empty-title">
                Choose topic, level, and size — then generate a set
              </div>
              <div className="empty-sub">
                Several questions appear together. Use “Grammar reference” for
                Wikipedia extracts when you want them.
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={'reference-backdrop' + (referenceOpen ? ' is-visible' : '')}
        aria-hidden={!referenceOpen}
        onClick={() => setReferenceOpen(false)}
      />

      <aside
        id="grammar-reference-drawer"
        className={'reference-drawer' + (referenceOpen ? ' is-open' : '')}
        aria-hidden={!referenceOpen}
        aria-label="Grammar reference from Wikipedia"
      >
        <div className="reference-drawer-header">
          <p className="reference-drawer-title">Grammar reference</p>
          <button
            type="button"
            className="reference-drawer-close"
            onClick={() => setReferenceOpen(false)}
            aria-label="Close grammar reference"
          >
            ×
          </button>
        </div>
        {referenceOpen && (
          <GrammarRulesPanel topicId={topic} topicLabel={topicLabel} />
        )}
      </aside>
    </div>
  );
}
