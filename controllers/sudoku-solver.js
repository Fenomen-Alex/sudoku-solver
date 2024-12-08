class SudokuSolver {
  validate(puzzleString) {}

  letterToNumber(row) {
    return row.toUpperCase().charCodeAt(0) - 64; // Converts 'A' to 1, 'B' to 2, ..., 'I' to 9
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const grid = this.transform(puzzleString);
    const numRow = this.letterToNumber(row) - 1;
    if (grid[numRow][column - 1] !== 0) return false;
    return !grid[numRow].includes(+value);
  }

  checkColPlacement(puzzleString, row, column, value) {
    const grid = this.transform(puzzleString);
    const numRow = this.letterToNumber(row) - 1;
    if (grid[numRow][column - 1] !== 0) return false;
    return !grid.some(r => r[column - 1] === +value);
  }

  checkRegionPlacement(puzzleString, row, col, value) {
    const grid = this.transform(puzzleString);
    const numRow = this.letterToNumber(row) - 1;
    if (grid[numRow][col - 1] !== 0) return false;

    const startRow = numRow - (numRow % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === +value) return false;
      }
    }
    return true;
  }

  solveSuduko(grid, row, col) {
    const N = 9;

    if (row === N - 1 && col === N) return grid;
    if (col === N) {
      row++;
      col = 0;
    }

    if (grid[row][col] !== 0) return this.solveSuduko(grid, row, col + 1);

    for (let num = 1; num <= 9; num++) {
      if (this.isSafe(grid, row, col, num)) {
        grid[row][col] = num;

        if (this.solveSuduko(grid, row, col + 1)) return grid;
      }
      grid[row][col] = 0; // Backtrack
    }
    return false;
  }

  isSafe(grid, row, col, num) {
    for (let x = 0; x < 9; x++) {
      if (grid[row][x] === num || grid[x][col] === num) return false;
    }
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  }

  transform(puzzleString) {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    for (let i = 0; i < puzzleString.length; i++) {
      grid[Math.floor(i / 9)][i % 9] = puzzleString[i] === "." ? 0 : +puzzleString[i];
    }
    return grid;
  }

  transformBack(grid) {
    return grid.flat().join("");
  }

  solve(puzzleString) {
    if (puzzleString.length !== 81 || /[^0-9.]/.test(puzzleString)) return false;

    const grid = this.transform(puzzleString);
    const solved = this.solveSuduko(grid, 0, 0);
    return solved ? this.transformBack(solved) : false;
  }
}

module.exports = SudokuSolver;
