import React, { useState, useEffect, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
} from "react-router-dom";
import MainMenu from "./components/MainMenu";
import LiveQuiz from "./components/LiveQuiz";
import Results from "./components/Results";
import "./bootstrap.css";

function QuizWrapper({ socket }) {
  const { categoryName } = useParams();

  const [userData, setUserData] = useState({});
  const [roomId, setRoomId] = useState(""); // NEW: store room ID
  const [quizState, setQuizState] = useState(null);
  const [isQuizOver, setIsQuizOver] = useState(false);
  const [isWaitingRoom, setIsWaitingRoom] = useState(false);
  const [timer, setTimer] = useState(0);

  const isUserDataEmpty = useCallback(() => {
    return !userData.name || !roomId; // also require roomId
  }, [userData, roomId]);

  // Handle native WebSocket messages
  useEffect(() => {
    if (!socket) return;

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);

        switch (msg.type) {
          case "roomIdAssigned":
            setRoomId(msg.roomId);
            console.log("Assigned roomId:", msg.roomId);
            break;

          case "quizStart":
            setIsWaitingRoom(false);
            setQuizState(msg.state || {}); // full reset for start
            setTimer(msg?.state?.timer || 0);
            break;

          case "quizStateUpdate":
            setQuizState((state) => ({
              ...state,
              ...(msg?.state || {}),
              leaderboard: msg?.state?.leaderboard || [],
            }));
            setTimer(msg?.state.timer || 0);
            break;

          case "leaderboardUpdate":
            setQuizState((state) => ({
              ...state,
              leaderboard: msg?.state?.leaderboard || [],
            }));
            break;

          case "quizOver":
            setQuizState((state) => ({
              ...state,
              leaderboard: msg?.state?.leaderboard || [],
              question: null, // no more questions
              timer: 0,
            }));
            setIsQuizOver(true);
            break;

          case "timerUpdate":
            setTimer(msg?.state?.timer || 0);
            break;

          default:
            break;
        }
      } catch (err) {
        console.error("Error parsing message from server:", event.data);
      }
    };

    return () => {
      socket.onmessage = null;
    };
  }, [socket]);

  // Modified startQuiz to include roomId
  const startQuiz = (user, room) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "joinQuiz",
        data: { ...user, category: categoryName, roomId: room },
      })
    );
    setIsWaitingRoom(true);
  };

  // sendAnswer includes roomId now
  const sendAnswer = (optionIndex, time) => {
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      console.error("WebSocket is not connected");
      return;
    }
    socket.send(
      JSON.stringify({
        type: "submitAnswer",
        data: {
          answer: optionIndex,
          player: userData.name,
          roomId,
          time: time || 1,
        },
      })
    );
  };

  function getScore(leaderboard, playerName) {
    if (!leaderboard || !playerName) return 0;

    for (const player of leaderboard) {
      if (player.name === playerName) {
        return player.score;
      }
    }

    return 0;
  }

  if (isUserDataEmpty()) {
    return (
      <MainMenu
        userData={userData}
        updateUserData={setUserData}
        startQuiz={(user, room) => {
          setRoomId(room);
          startQuiz(user, room);
        }}
      />
    );
  }

  if (isWaitingRoom) {
    return (
      <div className="waiting-room">
        <h2>Waiting Room</h2>
        <p>
          Hi <strong>{userData.name}</strong>, waiting for other players in room{" "}
          <strong>{roomId}</strong>...
        </p>
        <p>The quiz will start soon!</p>
        <button
          onClick={() => {
            if (socket && socket.readyState === WebSocket.OPEN) {
              socket.send(
                JSON.stringify({
                  type: "startQuiz",
                  data: { category: categoryName, roomId },
                })
              );
            }
          }}
        >
          Start game
        </button>
      </div>
    );
  }

  if (isQuizOver) {
    return (
      <Results userData={userData} globalData={quizState?.leaderboard || []} />
    );
  }

  return quizState ? (
    <LiveQuiz
      question={quizState.question}
      timer={timer}
      leaderboard={quizState.leaderboard}
      score={getScore(quizState.leaderboard, userData?.name)}
      onAnswer={sendAnswer}
      socket={socket}
      userData={userData}
    />
  ) : (
    <h3>Waiting for quiz to start...</h3>
  );
}

export default function App() {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = new WebSocket("ws://localhost:4000");
    setSocket(s);

    s.onopen = () => {
      console.log("WebSocket connection opened");
    };
    s.onclose = () => {
      console.log("WebSocket connection closed");
    };
    s.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => s.close();
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/:categoryName"
          element={<QuizWrapper socket={socket} />}
        />
      </Routes>
    </Router>
  );
}
