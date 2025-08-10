import React, { useState, useEffect } from "react";
import Confetti from "react-confetti";

export default function Quiz({
  score,
  setScore,
  correctAnswers,
  setCorrectAnswers,
  category,
  endQuiz,
}) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [timer, setTimer] = useState(15);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const currentQuestion = category.questions[currentQIndex];

  // Timer logic
  useEffect(() => {
    if (timer > 0 && selectedOption === null) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
    if (timer === 0 && selectedOption === null) {
      handleAnswer(-1); // Time's up, no answer selected
    }
  }, [timer, selectedOption]);

  const handleAnswer = (optionIndex) => {
    setSelectedOption(optionIndex);
    const isCorrect = optionIndex === currentQuestion.correctAnswerIndex;

    if (isCorrect) {
      setScore(score + timer * 10);
      setCorrectAnswers(correctAnswers + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1000);
    }

    // Move to next question after short delay
    setTimeout(() => {
      if (currentQIndex + 1 < category.questions.length) {
        setCurrentQIndex(currentQIndex + 1);
        setSelectedOption(null);
        setTimer(15);
      } else {
        // End quiz
        endQuiz(
          score + (isCorrect ? timer * 10 : 0),
          correctAnswers + (isCorrect ? 1 : 0)
        );
      }
    }, 1500);
  };

  return (
    <>
      {showConfetti && <Confetti />}
      <header>Brain Buzz</header>

      <div className="quiz-container">
        {/* Sidebar */}
        <div className="sidebar">
          <div className="questions-listing-wrapper">
            {category.questions.map((_, idx) => (
              <button
                key={idx}
                className={idx === currentQIndex ? "active" : ""}
              >
                Question {idx + 1}
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="sidebar-timer">Time: {timer}s</div>
            <div className="sidebar-score">Score: {score}</div>
          </div>
        </div>

        {/* Question Area */}
        <div className="question-area">
          <div className="question-card">
            <h3>{currentQuestion.questionText}</h3>
            <div className="options">
              {currentQuestion.options.map((opt, index) => {
                let className = "";
                if (selectedOption !== null) {
                  if (index === currentQuestion.correctAnswerIndex)
                    className = "correct";
                  else if (index === selectedOption) className = "incorrect";
                }
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedOption !== null}
                    className={className}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
