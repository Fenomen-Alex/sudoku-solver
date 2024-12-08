"use strict";

const SudokuSolver = require('../controllers/sudoku-solver.js');
module.exports = function (app) {
  const solver = new SudokuSolver();

  app.post("/api/check", (req, res) => {
    const { puzzle, coordinate, value } = req.body;

    if (!puzzle || !coordinate || !value) {
      return res.json({ error: "Required field(s) missing" });
    }

    // Validating the coordinate
    const row = coordinate[0];
    const column = +coordinate[1]; // Convert to a number
    if (coordinate.length !== 2 || !/[A-I]/i.test(row) || column < 1 || column > 9) {
      return res.json({ error: "Invalid coordinate" });
    }

    // Validating the value
    if (!/^[1-9]$/.test(value)) { // Use regex to ensure value is a single digit between 1 and 9
      return res.json({ error: "Invalid value" });
    }

    if (puzzle.length !== 81) {
      return res.json({ error: "Expected puzzle to be 81 characters long" });
    }

    if (/[^0-9.]/.test(puzzle)) {
      return res.json({ error: "Invalid characters in puzzle" });
    }

    // Check if the current cell already contains a value
    const grid = solver.transform(puzzle);
    const numRow = solver.letterToNumber(row) - 1;
    const numCol = column - 1;

    if (grid[numRow][numCol] !== 0) {
      const placedValue = grid[numRow][numCol];
      if (placedValue === +value) {
        return res.json({ valid: true });
      } else {
        const conflicts = [];
        if (!solver.checkRowPlacement(puzzle, row, column, value)) conflicts.push("row");
        if (!solver.checkColPlacement(puzzle, row, column, value)) conflicts.push("column");
        if (!solver.checkRegionPlacement(puzzle, row, column, value)) conflicts.push("region");
        return res.json({ valid: false, conflict: conflicts });
      }
    }

    const validCol = solver.checkColPlacement(puzzle, row, column, value);
    const validReg = solver.checkRegionPlacement(puzzle, row, column, value);
    const validRow = solver.checkRowPlacement(puzzle, row, column, value);
    const conflicts = [];

    if (validCol && validReg && validRow) {
      res.json({ valid: true });
    } else {
      if (!validRow) conflicts.push("row");
      if (!validCol) conflicts.push("column");
      if (!validReg) conflicts.push("region");
      res.json({ valid: false, conflict: conflicts });
    }
  });

  app.route('/api/solve').post((req, res) => {
    const { puzzle } = req.body;
    if (!puzzle) {
      return res.json({ error: 'Required field missing' });
    }

    if (puzzle.length !== 81) {
      return res.json({ error: 'Expected puzzle to be 81 characters long' });
    }

    if (/[^0-9.]/.test(puzzle)) {
      return res.json({ error: 'Invalid characters in puzzle' });
    }

    const solvedString = solver.solve(puzzle);
    return solvedString ? res.json({ solution: solvedString }) : res.json({ error: 'Puzzle cannot be solved' });
  });
};
