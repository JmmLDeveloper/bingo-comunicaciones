import { css } from "@emotion/react";
import React, { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BingoCard from "../components/BingoCard";
import PlayerCard from "../components/PlayerCard";
import socketContext from "../store/socketContext";

function checkWin(table, numbers, mode) {
  const validDigit = (digit) => digit == -1 || numbers.includes(digit);
  const indices = [0, 1, 2, 3, 4];
  if (mode === "FULL") {
    return table.flat().every((d) => validDigit(d));
  }
  for (let i = 0; i < 5; i++) {
    // checks column (x,i)
    if (indices.every((idx) => validDigit(table[idx][i]))) {
      return true;
    }
    // check row (i,x)
    if (table[i].every(validDigit)) {
      return true;
    }
  }
  // checks diags
  if (
    indices.every((idx) => validDigit(table[idx][idx])) ||
    indices.every((idx) => validDigit(table[4 - idx][idx]))
  ) {
    return true;
  }
  return false;
}

function Game() {
  const { state } = useLocation();

  const navigate = useNavigate();

  const [table, setTable] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [players, setPlayers] = useState(state.initialPlayers || []);
  const [announcedNumbers, setAnnouncedNumbers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [tableAccepted, setTableAccepted] = useState(false);
  const [mode, setMode] = useState(null);

  const { socket, onLobby, setOnLobby } = useContext(socketContext);

  useEffect(() => {
    if (!onLobby) {
      navigate("/");
    }
  }, [onLobby]);

  useEffect(() => {
    socket.on("table-assigned", (res) => {
      setTable(res.table);
    });

    socket.on("game-has-started", () => {
      setGameStarted(true);
    });

    socket.on("player-connected", (response) => {
      setPlayers([...players, response.player]);
    });

    socket.on("num_announced", ({ number }) => {
      const newAnnouncedNumbers = [...announcedNumbers, number];
      if (checkWin(table, newAnnouncedNumbers)) {
        socket.emit("claim-win");
      }
      setAnnouncedNumbers([...announcedNumbers, number]);
    });

    socket.on("win_announced", (response) => {
      setWinner(response.winner);
    });

    socket.on("player-disconnected", ({ player }) => {
      setPlayers([...players.filter((p) => p.id != player.id), player]);
    });

    socket.on("lobby-closed", ({ mode }) => {
      setMode(mode);
    });

    return () => {
      socket.off("table-assigned");
      socket.off("game-has-started");
      socket.off("num_announced");
      socket.off("win_announced");
      socket.off("player-connected");
      socket.off("player-disconnected");
    };
  }, [players, announcedNumbers, table]);

  return (
    <div
      css={css`
        padding: 2rem;
        h1 {
          width: 100%;
          text-align: center;
          margin-bottom: 4rem;
        }

        h3 {
          margin: 0.5rem 0;
        }
      `}
    >
      {winner != null ? (
        winner.id == state.player.id ? (
          <h1>Haz Ganado!!!!</h1>
        ) : (
          <h1> ha ganado {winner.name} </h1>
        )
      ) : gameStarted ? (
        <h1> El juego esta en progeso </h1>
      ) : table.length == 0 ? (
        <h1> El juego comenzara pronto.... </h1>
      ) : (
        <h1> El juego esta en espera a que se acepten Todos los cartones </h1>
      )}

      <div
        css={css`
          display: grid;
          grid-template-columns: 2fr 5fr;
        `}
      >
        <div>
          {announcedNumbers.length > 0 && (
            <h3>
              Ulimo numero anunciado :
              <span
                css={css`
                  color: #7d3c98;
                  font-size: 1.4rem;
                  margin-left: 0.5rem;
                `}
              >
                {announcedNumbers[announcedNumbers.length - 1]}
              </span>
            </h3>
          )}
          {mode && (
            <h3>
              Mode de juego :
              <span
                css={css`
                  color: #7d3c98;
                `}
              >
                {mode}
              </span>
            </h3>
          )}
          <h3> Jugador </h3>
          <p
            css={css`
              color: indigo;
              font-size: 1.5rem;
            `}
          >
            {state.player.name || []}
          </p>

          <div
            css={css`
              p {
                margin: 1rem 0;
              }
            `}
          >
            <h3> Otros Jugadores </h3>
            {players.length == 0 && <p> ningun jugador conectados </p>}
            {players.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </div>
        <div
          css={css`
            display: flex;
            align-items: center;
            flex-direction: column;
            p {
              font-size: 1.6rem;
              margin: 0.5rem 0;
              text-align: center;
            }
          `}
        >
          {winner && winner.id != state.player.id && <p> Tu Tabla </p>}
          <BingoCard announcedNumbers={announcedNumbers} table={table} />
          {winner && winner.id != state.player.id && (
            <>
              <p> Tabla del Ganador </p>
              <BingoCard
                announcedNumbers={announcedNumbers}
                table={winner.table}
              />
            </>
          )}
          {table.length > 0 && !gameStarted && !tableAccepted && (
            <div
              css={css`
                display: flex;
                column-gap: 1rem;
              `}
            >
              <button
                className="btn"
                onClick={() => {
                  setTableAccepted(true);
                  socket.emit("answer-table", { accept: true });
                }}
              >
                Aceptar
              </button>
              <button
                className="btn"
                onClick={() => {
                  socket.emit("answer-table", { accept: false });
                }}
              >
                Rechazar
              </button>
            </div>
          )}
          {winner && (
            <button
              css={css`
                width: auto;
              `}
              onClick={() => {
                setOnLobby(false);
              }}
              className="btn"
            >
              Volver a jugar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Game;
