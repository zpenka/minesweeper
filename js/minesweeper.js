// Minesweeper module
var minesweeper = (function($, undefined) {
  // Definitions
  var element = {
    game: $('#game'),
    squares: $('.square')
  };
  var options = {
    gameSize: 9
  };
  var mines = [];

  options.flags = options.gameSize;

  // Methods for game implementation
  // Create game board
  function createBoard() {
    var i;
    var j;

    // Clear the board
    element.game.html('');

    // Create board squares
    for (i = 0; i < options.gameSize; i++) {
      for (j = 0; j < options.gameSize; j++) {
        createSquare(i, j);
      }
    }
  }

  // Create board squares
  function createSquare(y, x) {
    // Create a square and give it the square class
    var square = document.createElement('div');
    $(square).addClass('square hidden');

    // Adjust the square's properties
    $(square).attr('data-x', x);
    $(square).attr('data-y', y);

    // Add the square to the board
    element.game.append($(square));
  }

  // Mine constructor
  function Mine() {
    this.x = Math.floor(Math.random() * options.gameSize);
    this.y = Math.floor(Math.random() * options.gameSize);
  }

  // Create mines and randomly place them on the board
  function addMines() {
    var i;
    var mine;
    mines = [];

    // Create an array of mine objects
    for (i = 0; i < options.gameSize; i++) {
      mine = new Mine();
      mines.push(mine);
    }

    // Clear any leftover mines from the board
    element.squares.removeClass('mines');

    // Place the new mines on the board
    for (i = 0; i < mines.length; i++) {
      element.game.find("[data-x=" + mines[i].x + "]" + "[data-y=" + mines[i].y + "]").addClass('mine');
    }
  }

  // Get current location of square
  function getSquareLocation(square) {
    var x = square.data('x');
    var y = square.data('y');

    return [x, y];
  }

  // Get the eight adjacent squares
  function getAdjacentSquares(coords) {
    var i;
    var x = coords[0];
    var y = coords[1];
    var possibles = [
      [x - 1, y], [x + 1, y],
      [x, y - 1], [x, y + 1],
      [x + 1, y + 1], [x - 1, y - 1],
      [x + 1, y - 1], [x - 1, y + 1]
    ];
    var adjacents = [];

    // Remove impossible squares
    for (i = 0; i < possibles.length; i++) {
      if (possibles[i][0] >= 0 && possibles[i][0] <= 8 && possibles[i][1] >= 0 && possibles[i][1] <= 8) {
        adjacents.push(possibles[i]);
      }
    }

    return adjacents;
  }

  // Get number of adjacent mines
  function getAdjacentMines(adjacents) {
    var i;
    var number = 0;

    // Count up the number of adjacent mines
    for (i = 0; i < adjacents.length; i++) {
      if (element.game.find("[data-x=" + adjacents[i][0] + "]" + "[data-y=" + adjacents[i][1] + "]").hasClass('mine')) {
        number++;
      }
    }

    // Return that number
    return number;
  }

  // Get adjacent blank squares and reveal them
  function revealAdjacentBlanks(current, adjacents) {
    var i;

    // Don't continue if current square is a hint
    if (current.is('.one, .two, .three, .four, .five, .six, .seven, .eight')) {
      return;
    }

    // Go through each adjacent square and check if it's blank
    for (i = 0; i < adjacents.length; i++) {
      var square = element.game.find("[data-x=" + adjacents[i][0] + "]" + "[data-y=" + adjacents[i][1] + "]");
      // If it is not a mine, reveal it
      if (!square.hasClass('mine') && square.hasClass('hidden')) {
        revealSquare(square);
        revealAdjacentBlanks(square, getAdjacentSquares(getSquareLocation(square)));
      }
    }
  }

  // Add number hints to non-mine squares
  function addHints() {
    $('.square').each(function() {
      var number = getAdjacentMines(getAdjacentSquares(getSquareLocation($(this))));

      // Add appropriate number class
      switch (number) {
        case 0:
          $(this).addClass('blank');
          break;
        case 1:
          $(this).addClass('one');
          break;
        case 2:
          $(this).addClass('two');
          break;
        case 3:
          $(this).addClass('three');
          break;
        case 4:
          $(this).addClass('four');
          break;
        case 5:
          $(this).addClass('five');
          break;
        case 6:
          $(this).addClass('six');
          break;
        case 7:
          $(this).addClass('seven');
          break;
        case 8:
          $(this).addClass('eight');
          break;
      }

      // Remove hints that are on mine squares
      $('.mine').removeClass('one two three four five six seven eight');
    });
  }

  // Reveal square
  function revealSquare(square) {
    square.removeClass('hidden');
  }

  // Reveal all
  function revealAll() {
    $('.square').removeClass('hidden');
  }

  // Check for victory
  function checkWin() {
    // See how many squares are hidden
    var length = $('.hidden').length;
    var i = 0;

    // Check if all mines are flagged
    $('.mine').each(function() {
      if ($(this).hasClass('flagged')) {
        i++;
      }
    });

    if (i === $('.mine').length) {
      return true;
    }

    // If the only hidden squares are mines, declare victory
    return length - mines.length === 0;
  }

  // New game function
  function init() {
    createBoard();
    addMines();
    addHints();
    options.flags = options.gameSize;
  }

  // Return minesweeper object
  return {
    newGame: init,
    getAdjacents: getAdjacentSquares,
    reveal: revealSquare,
    coords: getSquareLocation,
    revealBlanks: revealAdjacentBlanks,
    revealAll: revealAll,
    victory: checkWin,
    flags: options.flags
  };
})(jQuery);

// Actions to perform upon page load
$(function() {
  // New game button handler
  $('#new-game').click(function() {
    minesweeper.newGame();
    clickHandler();
  });

  // Click handler for game
  function clickHandler() {
    $('#game').on('mousedown', '.hidden', function() {
      var square = $(this);

      switch (event.which) {
        case 1:
          // Left Click
          // Reveal clicked square
          minesweeper.reveal(square);

          // Check to see what kind of square it is
          if (square.hasClass('mine')) {
            // Game over
            alert('Sorry, you have hit a mine. Play again?');
            minesweeper.revealAll();
            $('#game').off();
          } else if (square.hasClass('blank')) {
            minesweeper.revealBlanks(square, minesweeper.getAdjacents(minesweeper.coords(square)));
          }
          break;
        case 3:
          // Right Click
          if (square.hasClass('flagged')) {
            square.removeClass('flagged');
            minesweeper.flags++;
          } else {
            if (square.hasClass('hidden') && minesweeper.flags > 0) {
              square.addClass('flagged');
              minesweeper.flags--;
            }
          }
          break;
      }

      // Check for victory
      if (minesweeper.victory()) {
        alert('Congratulations! You have won!');
        minesweeper.revealAll();
        $('#game').off();
      }
    });
  }

  // Initialize page load with new game
  minesweeper.newGame();
  clickHandler();
});
