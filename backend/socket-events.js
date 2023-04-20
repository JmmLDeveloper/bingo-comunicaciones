const { generateTable, checkWin, randomNumber } = require("./utils");

const assignEvents = (io) => {
  let game = null;
  let mode = "NORMAL";
  let players = [];

  const lobbyTick = () => {
    if (players.length > 1) {
      game = {
        started: false,
        mode,
        players,
      };
      for (const player of players) {
        player.table = generateTable();
        player.accepted = false;
        io.to(player.id).emit("table-assigned", {
          table: player.table,
        });
        io.to(player.id).emit("lobby-closed", {
          mode: game.mode,
        });
      }
    } else {
      setTimeout(() => lobbyTick(), 10 * 1000); // 10 seg
    }
  };

  setTimeout(lobbyTick, 10 * 1000); // 30 seg

  const emitToAllPlayers = (...args) => {
    for (const player of players) {
      io.to(player.id).emit(...args);
    }
  };

  const startGame = () => {
    game.started = true;
    game.numbersLeft = [...Array(75).keys()].map((_, i) => i + 1);
    game.numbersSelected = [];
    const tick = () => {
      if (game.numbersLeft.length == 0) {
        return;
      }
      const idx = randomNumber({
        min: 0,
        max: game.numbersLeft.length - 1,
      });

      const num = game.numbersLeft[idx];
      game.numbersLeft.splice(idx, 1);
      game.numbersSelected.push(num);

      emitToAllPlayers("num-announced", { number: num });
    };
    emitToAllPlayers("game-has-started");
    game.interval = setInterval(tick, 100);
  };

  io.on("connection", (socket) => {
    const clientIds = Array.from(io.sockets.sockets.keys());



    io.emit("clients-connected", clientIds);

    console.log("client connected with id : " + socket.id);

    const getSocketPlayer = () => {
      return players.find((p) => p.id == socket.id);
    };

    const requestGameHandler = (data) => {
      if (game === null) {
        let playerIdx = players.findIndex((p) => p.id === socket.id);
        if (playerIdx == -1) {
          players.push({
            name: data.playerName,
            id: socket.id,
            online: true,
          });
        } else {
          players[playerIdx].name = data.playerName;
        }
        socket.emit("joined-game", {
          otherPlayers: players
            .filter((p) => p.id != socket.id)
            .map((p) => ({ id: p.id, name: p.name })),
          player: {
            id: getSocketPlayer().id,
            name: getSocketPlayer().name,
          },
        });

        for (const player of players) {
          if (player.id != socket.id) {
            io.to(player.id).emit("player-connected", {
              player: {
                id: getSocketPlayer().id,
                name: getSocketPlayer().name,
              },
            });
          }
        }
      } else {
        socket.emit("game-already-on");
      }
    };

    const answerTableHandler = ({ accept }) => {
      const player = getSocketPlayer();
      if (accept) {
        player.accepted = true;
        if (players.every((p) => p.accepted)) {
          startGame();
        }
      } else {
        player.table = generateTable();
        socket.emit("table-assigned", { table: player.table });
      }
    };

    const disconnectHandler = () => {
      console.log(`the connection with id ${socket.id} has been lost`);

      const playerIdx = players.findIndex((p) => p.id == socket.id);
      if (playerIdx != -1) {
        players[playerIdx].online = false;
        for (const player of players) {
          io.to(player.id).emit("player-disconnected", {
            player: {
              id: players[playerIdx].id,
              name: players[playerIdx].name,
            },
          });
        }
      }
    };

    const clainWinHandler = () => {
      if (game !== null) {
        if (
          checkWin(getSocketPlayer().table, game.numbersSelected, game.mode)
        ) {
          setTimeout(lobbyTick, 10 * 1000);
          clearInterval(game.interval);
          emitToAllPlayers("win-announced", {
            winner: {
              name: getSocketPlayer().name,
              id: getSocketPlayer().id,
              table: getSocketPlayer().table,
            },
          });
          game = null;
          players = [];
        }
      }
    };

    const setModeHandler = (payload) => {
      mode = payload.mode;
    };

    socket.on("request-game", requestGameHandler);
    socket.on("answer-table", answerTableHandler);
    socket.on("disconnect", disconnectHandler);
    socket.on("claim-win", clainWinHandler);
    socket.on("set-mode", setModeHandler);
  });
};

module.exports = {
  assignEvents,
};
