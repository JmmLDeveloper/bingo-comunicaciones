import { css } from "@emotion/react";
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import socketContext from "../store/socketContext";

function SetName() {
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState(null);
  const [gameMode, setGameMode] = useState("NORMAL");
  const [modeHasBeenChange, setModeHasBeenChange] = useState(false);
  const navigate = useNavigate();

  const { socket, onLobby, setOnLobby } = useContext(socketContext);

  useEffect(() => {
    if (onLobby && response) {
      navigate("/game", {
        state: {
          player: response.player,
          initialPlayers: response.otherPlayers,
        },
      });
    }
  }, [onLobby, response]);

  useEffect(() => {
    socket.on("joined-game", (response) => {
      setOnLobby(true);
      setResponse(response);
    });

    socket.on("game-already-on", () => {
      setMessage(" Hay una partidad en curso intentelo mas tarde ");
    });
  }, []);

  const requestGame = (ev) => {
    ev.preventDefault();
    socket.emit("request-game", { playerName });
  };

  const changeMode = () => {
    socket.emit("set-mode", {
      mode: gameMode,
    });
    setModeHasBeenChange(true);
  };

  return (
    <div
      css={css`
        width: 100%;
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        form {
          width: max(40%, 400px);
          display: grid;

          grid-template-rows: 1fr;

          row-gap: 0.2rem;

          input {
            padding: 0.3rem 0.8rem;
            font-size: 1.4rem;
          }

          label {
            font-size: 1.4rem;
          }
          margin-bottom: 5rem;
        }
        .game-on-message {
          margin-top: 0.5rem;
          font-size: 1.4rem;
          text-align: center;
          color: tomato;
        }
      `}
    >
      <form onSubmit={requestGame}>
        <label htmlFor="player-name"> Ingrese Nombre de jugador </label>
        <input
          value={playerName}
          onChange={(ev) => setPlayerName(ev.target.value)}
          id="player-name"
          type="text"
        />

        <button className="btn" type="submit">
          Comenzar a jugar
        </button>
        <p className="game-on-message"> {message} </p>
      </form>

      <div
        css={css`
          width: max(40%, 400px);
          label {
            font-size: 1.4rem;
          }
          select {
            font-size: 1.4rem;
          }
        `}
      >
        <label htmlFor="game-mode"> Modo de Juego </label>

        <select
          value={gameMode}
          onChange={(ev) => setGameMode(ev.target.value)}
          id="game-mode"
        >
          <option value="FULL">Llenar carton completo </option>
          <option value="NORMAL"> Tradicional </option>
        </select>

        <button onClick={changeMode} className="btn" type="submit">
          Cambiar modo de juego
        </button>
        {modeHasBeenChange && (
          <p
            css={css`
              text-align: center;
              margin-top: 0.4rem;
            `}
          >
            El siguiente juego que comienze usara el modo: {gameMode}
          </p>
        )}
      </div>
    </div>
  );
}

export default SetName;
