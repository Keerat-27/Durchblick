import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Exercise } from '../types/exercise';
import { normalize } from '../utils/normalize';
import './ExerciseCard.css';

const TYPE_LABELS: Record<Exercise['type'], string> = {
  fill_blank: 'Fill in the blank',
  multiple_choice: 'Multiple choice',
  error_correction: 'Error correction',
};

type Props = {
  exercise: Exercise;
  topicLabel: string;
  /** 1-based index when showing multiple questions in one set */
  questionNumber?: number;
  onResult: (correct: boolean) => void;
};

export function ExerciseCard({
  exercise,
  topicLabel,
  questionNumber,
  onResult,
}: Props) {
  const [answered, setAnswered] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [mcChoice, setMcChoice] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswered(false);
    setFillInput('');
    setMcChoice(null);
  }, [exercise]);

  useEffect(() => {
    if (exercise.type === 'fill_blank' || exercise.type === 'error_correction') {
      const t = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
  }, [exercise]);

  const [feedback, setFeedback] = useState<{
    correct: boolean;
    main: ReactNode;
    explanation: string;
  } | null>(null);

  useEffect(() => {
    setFeedback(null);
  }, [exercise]);

  function finish(correct: boolean, main: ReactNode, explanation: string) {
    setFeedback({ correct, main, explanation });
    setAnswered(true);
    onResult(correct);
  }

  function checkFillBlank() {
    if (answered || exercise.type !== 'fill_blank') return;
    const user = fillInput.trim();
    if (!user) return;
    const ok = normalize(user) === normalize(exercise.answer);
    if (ok) {
      finish(
        true,
        <span className="fb-ok">„{exercise.answer}"</span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Your answer: <span className="fb-bad">„{user}"</span> — Correct:{' '}
          <span className="fb-ok">„{exercise.answer}"</span>
        </>,
        exercise.explanation
      );
    }
  }

  function checkErrorCorrection() {
    if (answered || exercise.type !== 'error_correction') return;
    const user = fillInput.trim();
    if (!user) return;
    const ok = normalize(user) === normalize(exercise.answer);
    if (ok) {
      finish(
        true,
        <span className="fb-ok">„{exercise.answer}"</span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Wrong part: <span className="fb-bad">„{exercise.error_word}"</span> → should be{' '}
          <span className="fb-ok">„{exercise.correct_word}"</span>
        </>,
        exercise.explanation
      );
    }
  }

  function checkMC(index: number) {
    if (answered || exercise.type !== 'multiple_choice') return;
    const correctIdx = exercise.correct_index;
    const ok = index === correctIdx;
    setMcChoice(index);
    if (ok) {
      finish(
        true,
        <span className="fb-ok">„{exercise.options[correctIdx]}"</span>,
        exercise.explanation
      );
    } else {
      finish(
        false,
        <>
          Your answer: <span className="fb-bad">„{exercise.options[index]}"</span> — Correct:{' '}
          <span className="fb-ok">„{exercise.options[correctIdx]}"</span>
        </>,
        exercise.explanation
      );
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== 'Enter' || answered) return;
    if (exercise.type === 'fill_blank') checkFillBlank();
    if (exercise.type === 'error_correction') checkErrorCorrection();
  }

  const promptBlank = (s: string) => {
    const parts = s.split('___');
    if (parts.length === 1) return s;
    return (
      <>
        {parts[0]}
        <strong className="blank-mark">___</strong>
        {parts.slice(1).join('___')}
      </>
    );
  };

  const inputClass =
    'fill-input' +
    (answered && feedback
      ? feedback.correct
        ? ' correct-ans'
        : ' wrong-ans'
      : '');

  return (
    <div className="exercise-card">
      <div className="exercise-header">
        {questionNumber != null && (
          <span className="exercise-q-num" aria-label={`Question ${questionNumber}`}>
            Q{questionNumber}
          </span>
        )}
        <span className="exercise-type-badge">{TYPE_LABELS[exercise.type]}</span>
        <span className="exercise-topic">{topicLabel}</span>
      </div>
      <div className="exercise-body">
        <p className="exercise-instruction">{exercise.instruction}</p>

        {exercise.type === 'fill_blank' && (
          <>
            <p className="exercise-prompt">{promptBlank(exercise.sentence)}</p>
            {exercise.hint && (
              <p className="exercise-hint">Hint: {exercise.hint}</p>
            )}
            <input
              ref={inputRef}
              type="text"
              className={inputClass}
              placeholder="Type your answer…"
              value={fillInput}
              disabled={answered}
              onChange={(e) => setFillInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="submit-btn"
              disabled={answered}
              onClick={checkFillBlank}
            >
              Check answer
            </button>
          </>
        )}

        {exercise.type === 'multiple_choice' && (
          <>
            <p className="exercise-prompt">{promptBlank(exercise.sentence)}</p>
            <div className="mc-options">
              {exercise.options.map((opt, i) => {
                const correctIdx = exercise.correct_index;
                let cls = 'mc-option';
                if (answered && feedback) {
                  if (i === correctIdx) cls += ' correct-opt';
                  else if (i === mcChoice && !feedback.correct) cls += ' wrong-opt';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    disabled={answered}
                    onClick={() => checkMC(i)}
                  >
                    <span className="opt-letter">
                      {['A', 'B', 'C', 'D'][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {exercise.type === 'error_correction' && (
          <>
            <p className="exercise-prompt exercise-prompt-muted">
              {exercise.wrong_sentence}
            </p>
            <input
              ref={inputRef}
              type="text"
              className={inputClass}
              placeholder="Type the corrected sentence…"
              value={fillInput}
              disabled={answered}
              onChange={(e) => setFillInput(e.target.value)}
              onKeyDown={onKeyDown}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="submit-btn"
              disabled={answered}
              onClick={checkErrorCorrection}
            >
              Check answer
            </button>
          </>
        )}
      </div>

      {feedback && (
        <div
          className={
            'feedback show ' + (feedback.correct ? 'correct' : 'wrong')
          }
        >
          <div className="feedback-verdict">
            {feedback.correct ? 'Richtig!' : 'Falsch'}
          </div>
          <div className="feedback-main">{feedback.main}</div>
          <div className="feedback-explanation">{feedback.explanation}</div>
        </div>
      )}
    </div>
  );
}
