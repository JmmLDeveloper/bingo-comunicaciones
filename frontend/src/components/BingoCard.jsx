import { css } from "@emotion/react";
import React from "react";

function BingoCard({ table, announcedNumbers }) {




  return (
    <div className="bingo-card">
      <div className="letter">B</div>
      <div className="letter">I</div>
      <div className="letter">N</div>
      <div className="letter">G</div>
      <div className="letter">O</div>
      {[...Array(25).keys()].map((_, idx) => {
        const num = (table.flat()[idx] !== undefined && table.flat()[idx] !== -1) ? table.flat()[idx] : ''
        return (
          <div
            key={idx}
            css={css`
              background-color: salmon;
              color: white;
              font-size: 1.2rem;
              display: flex;
              justify-content: center;
              align-items: center;
              border:solid 1px black;

              div {
                width: 30px;
                height: 30px;
                border-radius: 100px;
                display: flex;
                justify-content: center;
                align-items: center;
                ${table.flat()[idx] &&
                announcedNumbers.includes(table.flat()[idx])
                  ? "background:indigo"
                  : ""};
              }
            `}
          >
            <div> { num } </div>
          </div>
        );
      })}
    </div>
  );
}

export default BingoCard;
