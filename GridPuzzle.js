/*:
 *
 * @plugindesc Create puzzles based on a grid system.
 *
 * @author asksuyo
 *
 *
 * @help
 *
 */

var Imported = Imported || {};
Imported.Tobie_GridPuzzle = true;

var Tobie = Tobie || {};
Tobie.GridPuzzle = Tobie.GridPuzzle || {};

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

 	/* Description: Create empty array to hold all puzzle piece events within the
 	 *			       	map and set the current selected piece to be unselected.
 	 */
 	Tobie.GridPuzzle.puzzle_piece_array = new Array([]);
  // [puzzle piece num][piece event number]
 	Tobie.GridPuzzle.current_piece = 0;
  Tobie.GridPuzzle.scriptactive = false;
  Tobie.GridPuzzle.hasWon = false;
  Tobie.GridPuzzle.activeMapId = -1;

 	/* Description: Returns the current active piece selected by the player
 	 * Arguments  : -
 	 * Returns    : Current active piece
 	 *              OR -1, when a piece has not yet been selected
 	 */
 	Tobie.GridPuzzle.currentPiece = function() {
 		if (this.current_piece > -1) {
 			return this.puzzle_piece_array[this.current_piece];
 		}
 		return -1;
 	}

  /* Description: Sorts events by map placement to avoid unwanted results
   * Arguments  : -
   * Returns    : -
   */
  Tobie.GridPuzzle.sortEvents = function() {

    for(var puzzleNum = 0; puzzleNum < this.puzzle_piece_array.length; puzzleNum++) {

      var puzzlePiece = this.puzzle_piece_array[puzzleNum];
      for (var i = 1; i <= puzzlePiece.length-1; i++) {

        for (var j = 1; j <= puzzlePiece.length-i; j++) {
          var p_xpos = $gameMap._events[puzzlePiece[j-1]]._x;
          var p_ypos = $gameMap._events[puzzlePiece[j-1]]._y;
          var xpos = $gameMap._events[puzzlePiece[j]]._x;
          var ypos = $gameMap._events[puzzlePiece[j]]._y;

          if(p_xpos < xpos && p_ypos == ypos || p_ypos < ypos) {
            var temp = this.puzzle_piece_array[puzzleNum][j-1];
            var change = this.puzzle_piece_array[puzzleNum][j];
            this.puzzle_piece_array[puzzleNum][j-1] = change;
            this.puzzle_piece_array[puzzleNum][j] = temp;
        }
      }
    }
  }
}

 	/* Description: Add an event, marked as a puzzle piece, to the puzzle piece
   *              array.
 	 * Arguments  : (puzzleNum) Number of the puzzle; place to be put in puzzle
   *                          array.
 	 *              (eventId)   Event ID to be later referenced
 	 * Returns    : -
 	 */
 	Tobie.GridPuzzle.addPiece = function(puzzleNum, eventId) {
 		if (this.puzzle_piece_array.length <= puzzleNum) {
      for(var i = 0; i <= puzzleNum; i++) {
        this.puzzle_piece_array.push([]);
      }
 		}
 		this.puzzle_piece_array[puzzleNum].push(eventId);
 	}

	/* Description: Set current_piece to the next piece in the puzzle piece array.
	 *              If the current_piece is the last piece in the array, set it
	 *              back to the first piece.
 	 * Arguments  : -
 	 * Returns    : -
 	 */
 	Tobie.GridPuzzle.cyclePieces = function() {
 		if (this.current_piece === this.puzzle_piece_array.length-2) {
 			this.current_piece = 1;
 		} else {
 			this.current_piece++;
 		}
 		//console.log(this.current_piece);
 	}

  /* Description: Checks to see if a piece is selected.
   * Arguments  : -
   * Returns    : (True)  If a piece is selected
   *              (False) If a piece has not been selected
   */
  Tobie.GridPuzzle.selected = function() {
    return (this.current_piece > 0);
  }

  /* Description: Moves the current piece based on a given direction.
   *              For loops go forward and backward to avoid collision with
   *              itself and create gaps.
   * Arguments  : (direction) RPG Maker based variable
   *              [4 = left][6 = right][8 = up][2 = down]
   * Returns    : -
   * Change that need to be made:
   *     move piece based on a sectioned off area
   */
  Tobie.GridPuzzle.movePiece = function(direction) {
    var eventIds = this.currentPiece();
    if (direction == 2 || direction == 6) {
      for (var i = 0; i < eventIds.length; i++) {
        var id = eventIds[i];
        $gameMap.event(id).moveStraight(direction);
      }
    } else {
      for (var i = eventIds.length; i > 0; i--) {
        var id = eventIds[i-1];
        $gameMap.event(id).moveStraight(direction);
      }
    }
  }

  /* Description: Checks if the puzzle piece can move without hitting another
   *              puzzle piece.
   * Arguments  : (direction) The direction that the puzzle piece is going
   *                towards
   * Returns    : (False) The current piece is going to hit another piece.
   *              (True)  The current piece's pathway is clear.
   * Change that need to be made:
   *     based the spot to check on a variable based on how the piece is going
   *     to be moved (i.e: move direction vs moving the piece by two spaces)
   */
  Tobie.GridPuzzle.canMove = function(direction) {
    var eventIds = this.currentPiece();
    for(var i = 0; i < eventIds.length; i++) {
      var xpos = $gameMap._events[eventIds[i]]._x;
      var ypos = $gameMap._events[eventIds[i]]._y;

      //LEFT
      if (direction == 4 && !this.emptySpot(xpos-1, ypos)) {
        return false;
      //RIGHT
      } else if (direction == 6 && !this.emptySpot(xpos+1, ypos)) {
        return false;
      //UP
      } else if (direction == 8 && !this.emptySpot(xpos, ypos-1)) {
        return false;
      //DOWN
      } else if (direction == 2 && !this.emptySpot(xpos, ypos+1)) {
        return false;
      }
    }
    return true;
  }


  /* Description: Checks if the specified spot is not occupied by another event.
   * Arguments  : (xpos) x position
   *              (ypos) y position
   * Returns    : (False) the spot is occupied
   *              (True)  the spot is not occupied
   */
  Tobie.GridPuzzle.emptySpot = function(xpos, ypos) {

    for (var i = 0; i < this.puzzle_piece_array.length; i++) {
      if (i != this.current_piece) {
        for (var j = 0; j < this.puzzle_piece_array[i].length; j++) {
          var currEvent = this.puzzle_piece_array[i][j];
          var c_xpos = $gameMap._events[currEvent]._x;
          var c_ypos = $gameMap._events[currEvent]._y;
          if(i != this.current_piece && xpos == c_xpos && ypos == c_ypos) {
            return false;
          }
        }
      }
    }
    return true;
  }


  /* Description: Resets puzzle pieces to original position.
   * Arguments  : -
   * Returns    : -
   */
  Tobie.GridPuzzle.resetPieces = function() {
    for(var i = 1; i < this.puzzle_piece_array.length; i++) {
      for(var j = 0; j < this.puzzle_piece_array[i].length; j++){
        var currEvent = this.puzzle_piece_array[i][j];
        var xpos = $dataMap.events[currEvent].x;
        var ypos = $dataMap.events[currEvent].y;
        //console.log("resetPieces: [" + xpos + "][" + ypos + "]");
        $gameMap.event(currEvent).locate(xpos, ypos);
      }
    }
  }

  /* Description: Checks if player has solved the puzzle, based on if the
   *              desired puzzle piece is in an area marked as region 1.
   * Arguments  : -
   * Returns    : (False) The puzzle piece is in region 1 and has solved the
   *                      puzzle.
   *              (True)  Player has solved the puzzle.
   * Change that need to be made:
   *     Need to check for other things other than just if the puzzle piece is
   *     the right place.
   */
  Tobie.GridPuzzle.winCondition = function() {
    if(this.current_piece == 1) {
      for(var i = 0; i < this.currentPiece().length; i++) {
        var currEvent = this.currentPiece()[i];
        var xpos = $gameMap._events[currEvent]._x;
        var ypos = $gameMap._events[currEvent]._y;
        //console.log("windCondition-regionId: " + $gameMap.regionId(xpos, ypos));
        if ($gameMap.regionId(xpos, ypos) == 1) {
          return true;
        }
      }
    }
    return false;
  }

  /* Description: Allows the player to toggle between pieces
 	 * Arguments  : -
 	 * Returns    : -
 	 */
  Tobie.GridPuzzle.changePiece = function() {
    var mapId = $gameMap.mapId();
    var previous = Tobie.GridPuzzle.current_piece;
    this.cyclePieces();

    //turns on self switch to show that the current piece is selected
    for(var i = 0; i < this.currentPiece().length; i++) {

      var currEvent = this.currentPiece()[i];
      var key = [mapId, currEvent, "A"];
      $gameSelfSwitches.setValue(key, 1);

    }

    //turns off self switch to show the previous piece is unselected
    if (previous > -1) {
      for(var j = 0; j < this.puzzle_piece_array[previous].length;
        j++) {
        var prevEvent = this.puzzle_piece_array[previous][j];
        var key = [mapId, prevEvent, "A"];
        $gameSelfSwitches.setValue(key, 0);
      }
    }
  }

//-----------------------------------------------------------------------------
//  FOR TESTING PURPOSES (DELETE LATER)
//-----------------------------------------------------------------------------

	Tobie.GridPuzzle.printArray = function() {
		if (Tobie.GridPuzzle.puzzle_piece_array.length === 0 ||
			Tobie.GridPuzzle.puzzle_piece_array === 'undefined') {
			console.log('array is empty');
			return;
		} else {
			for(var i = 0; i < this.puzzle_piece_array.length; i++) {
				console.log(i);
				for(var j = 0; j < this.puzzle_piece_array[i].length; j++) {
          var currEvent = this.puzzle_piece_array[i][j];
          var xpos = $gameMap._events[currEvent]._x;
          var ypos = $gameMap._events[currEvent]._y;
					console.log(currEvent + ":[" + xpos + "][" + ypos + "]" );
				}
			}
		}
	}

 	var alias_Game_Map_setup = Game_Map.prototype.setup;
 	Game_Map.prototype.setup = function(mapId) {
 		alias_Game_Map_setup.call(this, mapId);
    if ($dataMap.note == 'puzzleroom') {
      Tobie.GridPuzzle.activeMapId = mapId;
      console.log("setup: " + Tobie.GridPuzzle.activeMapId);
      Tobie.GridPuzzle.sortEvents();
    }
 		//Tobie.GridPuzzle.printArray();
 	}

//-----------------------------------------------------------------------------
//  GAME EVENT
//-----------------------------------------------------------------------------

	/* Description: Check the event's note to see if it is marked as a puzzle
	 *              piece, and if so adds that event ID to the puzzle piece
	 *              array.
 	 * Arguments  : Given RPG Maker Arguments
 	 * Returns    : -
 	 */
 	var alias_Game_Event_initalize = Game_Event.prototype.initialize;
 	Game_Event.prototype.initialize = function(mapId, eventId) {
 		alias_Game_Event_initalize.call(this, mapId, eventId);

 		var eventNote = $dataMap.events[eventId].note;

 		if (eventNote != 'undefined' || eventNote != "") {

 			var noteArgs = $dataMap.events[eventId].note.split(" ");
 			var command = noteArgs[0].toLowerCase();
 			var pieceNum = Number(noteArgs[1]);

 			if (command === 'piece') {
 				Tobie.GridPuzzle.addPiece(pieceNum, eventId);
 			}
 		}
 	}

//-----------------------------------------------------------------------------
//  GAME PLAYER
//-----------------------------------------------------------------------------

  /* Description: Allows the player to move pieces using directional arrow keys,
   *              reset pieces using 'control', and switch pieces using 'z'.
   * Arguments  : Given RPG Maker Arguments
   * Returns    : -
   */
	var alias_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
	Game_Player.prototype.moveByInput = function() {
		alias_Game_Player_moveByInput.call(this);
    var mapId = $gameMap.mapId();

    if (Tobie.GridPuzzle.selected() && Tobie.GridPuzzle.activeMapId == mapId) {

      if(Input.isTriggered('left') && Tobie.GridPuzzle.canMove(4)) {
        Tobie.GridPuzzle.movePiece(4);
        Tobie.GridPuzzle.winCondition();

  		} else if(Input.isTriggered('right') && Tobie.GridPuzzle.canMove(6)) {
        Tobie.GridPuzzle.movePiece(6);

  		} else if(Input.isTriggered('up') && Tobie.GridPuzzle.canMove(8)) {
        Tobie.GridPuzzle.movePiece(8);

  		} else if(Input.isTriggered('down') && Tobie.GridPuzzle.canMove(2)) {
        Tobie.GridPuzzle.movePiece(2);
        if (Tobie.GridPuzzle.winCondition()) {
          Tobie.GridPuzzle.hasWon = true;
        }

  		} else if(Input.isTriggered('control')) {
        Tobie.GridPuzzle.resetPieces();
      }

      else if(Input.isTriggered('ok')) {
        console.log("ok");
        Tobie.GridPuzzle.changePiece();
      }

    } else if (Tobie.GridPuzzle.activeMapId == mapId) {
      if(Input.isTriggered('ok')) {
        console.log("ok");
        Tobie.GridPuzzle.changePiece();
      }
    }
	}

})();