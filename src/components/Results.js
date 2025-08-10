import React from "react";

export default function Results({ userData, globalData = [] }) {
  const sortedLeaderboard = [...globalData].sort((a, b) => b.score - a.score);
  const globalUser = sortedLeaderboard.find((p) => p.name === userData.name) || {};
  const globalRank = sortedLeaderboard.findIndex((p) => p.name === userData.name) + 1;

  const scoreText = globalUser.score > 200 || globalRank === 1 ? 'Well done' : 'Better luck next time';

  return (
    <>
      <header>Brain Buzz</header>

      <div className="results-container">
        <div className="results-card">
          <h1>🎉 Quiz Completed! 🎉</h1>
          <p className="player-name">
            {scoreText},{" "}
            <strong>{globalUser.name || userData.name || "Player"}</strong>!
          </p>
          <p className="score">
            Final Score: <span>{globalUser.score}</span>
          </p>
          <p className="correct">
            Correct Answers:{" "}
            <span>
              {globalUser.correctAnswers} / {globalUser.totalQuestions}
            </span>
          </p>
        </div>

        {/* Leaderboard */}
        <div className="leaderboard">
          <h2>🏆 Leaderboard</h2>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Name</th>
                <th>Score</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaderboard.map((player, index) => (
                <tr
                  key={index}
                  className={
                    player.phoneNumber === userData.phone ? "highlight" : ""
                  }
                >
                  <td>{index + 1}</td>
                  <td>{player.name}</td>
                  <td>{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
