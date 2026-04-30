const ROWS = 6;
const COLS = 7;
const PLAYERS = {
  RED: "red",
  YELLOW: "yellow",
};

let board = createEmptyBoard();
let currentPlayer = PLAYERS.RED;
let scores = {
  [PLAYERS.RED]: 0,
  [PLAYERS.YELLOW]: 0,
};

const boardEl = document.querySelector("#board");
const columnControlsEl = document.querySelector("#column-controls");
const currentPlayerEl = document.querySelector("#current-player");
const statusMessageEl = document.querySelector("#status-message");
const redScoreEl = document.querySelector("#red-score");
const yellowScoreEl = document.querySelector("#yellow-score");

renderControls();
renderBoard();
updateTurnDisplay();

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function renderControls() {
  columnControlsEl.innerHTML = "";

  for (let col = 0; col < COLS; col += 1) {
    const button = document.createElement("button");
    button.className = "drop-button";
    button.type = "button";
    button.textContent = "↓";
    button.setAttribute("aria-label", `Drop disc in column ${col + 1}`);
    button.addEventListener("click", () => handleColumnClick(col));
    columnControlsEl.appendChild(button);
  }
}

function renderBoard(winningCells = []) {
  const winningCellIds = new Set(winningCells.map(([row, col]) => `${row}-${col}`));
  boardEl.innerHTML = "";

  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const cell = document.createElement("div");
      const player = board[row][col];
      cell.className = ["cell", player, winningCellIds.has(`${row}-${col}`) ? "win" : ""]
        .filter(Boolean)
        .join(" ");
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", describeCell(row, col, player));
      boardEl.appendChild(cell);
    }
  }
}

function handleColumnClick(col) {
  const row = findOpenRow(col);

  if (row === -1) {
    statusMessageEl.textContent = `Column ${col + 1} is full. Pick another column.`;
    return;
  }

  board[row][col] = currentPlayer;
  const horizontalWin = findHorizontalWin(row, currentPlayer);

  if (horizontalWin) {
    scores[currentPlayer] += 1;
    updateScoreDisplay();
    renderBoard(horizontalWin);
    statusMessageEl.textContent = `${capitalize(currentPlayer)} has four in a row horizontally. Game-over and reset flow are still TODO.`;
    disableControls();
    return;
  }

  renderBoard();
  currentPlayer = currentPlayer === PLAYERS.RED ? PLAYERS.YELLOW : PLAYERS.RED;
  updateTurnDisplay();
  statusMessageEl.textContent = `${capitalize(currentPlayer)} to move. Vertical wins are intentionally not wired yet.`;
}

function findOpenRow(col) {
  for (let row = ROWS - 1; row >= 0; row -= 1) {
    if (!board[row][col]) {
      return row;
    }
  }

  return -1;
}

function findHorizontalWin(row, player) {
  let run = [];

  for (let col = 0; col < COLS; col += 1) {
    if (board[row][col] === player) {
      run.push([row, col]);

      if (run.length === 4) {
        return run;
      }
    } else {
      run = [];
    }
  }

  return null;
}

// TODO: Add vertical win detection.
// TODO: Add complete game-over state, new-game reset, and best-of-5 series logic.

function updateTurnDisplay() {
  currentPlayerEl.textContent = capitalize(currentPlayer);
  currentPlayerEl.className = `player-chip ${currentPlayer}`;
}

function updateScoreDisplay() {
  redScoreEl.textContent = scores[PLAYERS.RED];
  yellowScoreEl.textContent = scores[PLAYERS.YELLOW];
}

function disableControls() {
  document.querySelectorAll(".drop-button").forEach((button) => {
    button.disabled = true;
  });
}

function describeCell(row, col, player) {
  const occupant = player ? `${player} disc` : "empty";
  return `Row ${row + 1}, column ${col + 1}, ${occupant}`;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
