import React, { useState } from "react";

export default function MainMenu({ updateUserData, userData, startQuiz }) {
  const [name, setName] = useState(userData.name || "");
  const [roomId, setRoomId] = useState("");

  const handleStartNewQuiz = () => {
    if (!name.trim()) return alert("Please enter your name");
    updateUserData({ name });
    // Pass no roomId to create new room
    startQuiz({ name });
  };

  const handleJoinExistingRoom = () => {
    if (!name.trim()) return alert("Please enter your name");
    if (!roomId.trim()) return alert("Please enter a room ID");
    updateUserData({ name });
    startQuiz({ name }, roomId);
  };

  return (
    <>
      <header>Brain Buzz</header>
      <div className="main-menu">
        <div className="form-wrapper">
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div style={{ margin: "15px 0" }}>
            <input
              type="text"
              placeholder="Enter Room ID to join"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              style={{ marginRight: "10px" }}
            />
            <button className="btn-primary" onClick={handleJoinExistingRoom}>
              Join Room
            </button>
          </div>

          <hr style={{ margin: "20px 0" }} />

          <button className="btn-primary" onClick={handleStartNewQuiz}>
            Create New Room & Start Quiz
          </button>
        </div>
      </div>
    </>
  );
}
