import { css } from "@emotion/react";
import React from "react";

function PlayerCard({ player }) {
  return (
    <div
      css={css`
        font-size: 1.1rem;
        padding: 0.4rem 1rem;
        background-color: indigo;
        border:2px solid black;
        color: white;

        display: flex;
        justify-content: space-between;
        align-items: center;

        .circle {
          width: 25px;
          height: 25px;
          border-radius: 20px;
          background-color: ${player.online ? "green" : "red"};
        }
      `}
    >
      <p> {player.name} </p>

    </div>
  );
}

export default PlayerCard;
