import { useEffect, useMemo, useRef, useState } from "react";
import renderMathInElement from "katex/dist/contrib/auto-render";
import { generatePollResults } from "../utils/poll";

export default function PollCard({ postId, poll }) {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const contentRef = useRef(null);
  const hasVoted = selectedIndex !== null;

  const results = useMemo(
    () => generatePollResults({ postId, correctIndex: poll.correctIndex, difficulty: poll.difficulty }),
    [postId, poll.correctIndex, poll.difficulty]
  );

  useEffect(() => {
    if (!contentRef.current) return;

    renderMathInElement(contentRef.current, {
      delimiters: [
        { left: "\\(", right: "\\)", display: false },
        { left: "\\[", right: "\\]", display: true }
      ],
      throwOnError: false
    });
  }, [postId, selectedIndex, poll.question, poll.options]);

  return (
    <section className="poll-card" ref={contentRef} aria-label="Quick poll">
      <div className="poll-title">Quick poll</div>
      <div className="poll-question">{poll.question}</div>

      <div className="poll-options">
        {poll.options.map((option, index) => {
          const isCorrect = index === poll.correctIndex;
          const isSelected = index === selectedIndex;
          const optionClasses = [
            "poll-option",
            hasVoted ? "is-locked" : "",
            isSelected ? "is-selected" : "",
            hasVoted && isCorrect ? "is-correct" : "",
            hasVoted && isSelected && !isCorrect ? "is-incorrect-selected" : ""
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={`${postId}:${index}`}
              className={optionClasses}
              onClick={() => {
                if (hasVoted) return;
                setSelectedIndex(index);
              }}
              disabled={hasVoted}
              type="button"
            >
              <span className="poll-option-text">{option}</span>

              {hasVoted && (
                <>
                  <span
                    className="poll-option-bar"
                    style={{ width: `${results.percentages[index]}%` }}
                    aria-hidden="true"
                  />
                  <span className="poll-option-meta">
                    {Math.round(results.percentages[index])}% ({results.counts[index]})
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {hasVoted && (
        <div className="poll-result-note">
          Correct answer: <strong>{poll.options[poll.correctIndex]}</strong>
        </div>
      )}
    </section>
  );
}
