const randomNumber = ({ min, max }) => {
  return Math.round(Math.random() * (max - min)) + min;
};

function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

const generateTable = () => {
  const ranges = [
    shuffle(
      Array(15)
        .fill(null)
        .map((_, idx) => idx + 1)
    ).slice(0, 5),
    shuffle(
      Array(15)
        .fill(null)
        .map((_, idx) => idx + 16)
    ).slice(0, 5),
    shuffle(
      Array(15)
        .fill(null)
        .map((_, idx) => idx + 31)
    ).slice(0, 5),
    shuffle(
      Array(15)
        .fill(null)
        .map((_, idx) => idx + 46)
    ).slice(0, 5),
    shuffle(
      Array(15)
        .fill(null)
        .map((_, idx) => idx + 61)
    ).slice(0, 5),
  ];

  const table = [];

  for (let i = 0; i < 5; i++) {
    const row = [];
    for (let j = 0; j < 5; j++) {
      row.push(ranges[j][i]);
    }
    table.push(row);
  }

  table[2][2] = -1;

  return table;
};

function checkWin(table, numbers, mode) {
  const validDigit = (digit) => digit == -1 || numbers.includes(digit);
  const indices = [0, 1, 2, 3, 4];
  if ( mode === 'FULL') {
    return table.flat().every( d => validDigit(d) )
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

module.exports = {
  generateTable,
  checkWin,
  randomNumber,
};
