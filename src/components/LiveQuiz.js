import React, { useState, useEffect, useRef } from "react";
import "../bootstrap.css";

export default function LiveQuiz({
  socket,
  question,
  timer,
  leaderboard,
  score,
  onAnswer,
  userData,
}) {
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const answeredRef = useRef(false);
  const [answeredTime, setAnsweredTime] = useState(1);

  // Reset state when a new question arrives
  useEffect(() => {
    setSelectedOption(null);
    setShowAnswer(false);
    answeredRef.current = false;
  }, [question]);

  // Automatically submit answer when timer hits 0
  useEffect(() => {
    if (timer === 0 && !answeredRef.current) {
      answeredRef.current = true;
      onAnswer(selectedOption, answeredTime);
      setShowAnswer(true);
    }
  }, [timer, selectedOption, onAnswer, answeredTime]);

  // Send quizReset on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "quizReset",
            data: { player: userData.name },
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [socket, userData.name]);

  return (
    <div className="app-container">
      <header>Brain Buzz</header>
      <div className="quiz-container">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-timer">
            <strong>Timer:</strong> {timer}s
          </div>
          <div className="leaderboard">
            <h3>Leaderboard</h3>
            <br />
            <table>
              <thead>
                <tr>
                  <th>Player</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((p, idx) => (
                  <tr
                    key={idx}
                    className={p.name === userData.name ? "highlight" : ""}
                  >
                    <td>{p.name}</td>
                    <td>{p.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <br />
          <div className="sidebar-score">
            <strong>Your Score:</strong> {score}
          </div>
        </aside>

        {/* Question Area */}
        <section className="question-area">
          <div className="question-card">
            <h3>{question.text}</h3>
            <div className="options">
              {question.options.map((opt, i) => {
                let btnClass = "";

                if (showAnswer) {
                  if (i === question.correctAnswerIndex) {
                    btnClass = "correct";
                  } else if (
                    i === selectedOption &&
                    selectedOption !== question.correctAnswerIndex
                  ) {
                    btnClass = "incorrect";
                  }
                } else {
                  btnClass = i === selectedOption ? "selected" : "";
                }

                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={() => {
                      if (!showAnswer) {
                        setSelectedOption(i);
                        setAnsweredTime(timer);
                      }
                    }}
                    disabled={showAnswer}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
