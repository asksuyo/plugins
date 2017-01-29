//=============================================================================
// Tobie Plugins - Grid Puzzle
// GridPuzzle.js
// Version: 1.0.1
//=============================================================================

/*:
*
* @plugindesc Create puzzles based on a rpg maker's grid system.
* @author asksuyo
*
* @help
* =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
* Information
* =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
* The GridPuzzle plugin uses the map note and the event note to create a puzzle
* map and puzzle events.
*
* Create a puzzle room by writing 'puzzleroom' in the note section of the map.
* You can create different types of puzzles by specifying what kind of puzzle
* after writing 'puzzleroom'
*
* 'puzzleroom slide' : will move the pieces like a slide puzzle, and checks to
*                      see if the desired puzzle piece is in a specified region
*                      of the map.
* 'puzzleroom match' : will move the pieces based on the width of the pieces
*                      in the left or right direction. It will check to see if
*                      the puzzle pieces are in the correct place.
* 'puzzleroom fit'   : will move the pieces anywhere, but will check if the
*                      pieces fill the entire specifed area.
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
  Tobie.GridPuzzle.shifted_puzzlePiece = new Array();
  Tobie.GridPuzzle.scriptactive = false;
  Tobie.GridPuzzle.hasWon = false;
  Tobie.GridPuzzle.activeMapId = -1;
  Tobie.GridPuzzle.slide = false;
  Tobie.GridPuzzle.match = false;
  Tobie.GridPuzzle.fit = false;
  Tobie.GridPuzzle.maxY = -1;
  Tobie.GridPuzzle.minY = -1;
  Tobie.GridPuzzle.maxX = -1;
  Tobie.GridPuzzle.minX = -1;
  Tobie.GridPuzzle.spawnX = -1;
  Tobie.GridPuzzle.spawnY = -1;

  Tobie.GridPuzzle.resetVal = function() {
    this.puzzle_piece_array = new Array([]);
    // [puzzle piece num][piece event number]
    this.current_piece = 0;
    this.shifted_puzzlePiece = new Array();
    this.scriptactive = false;
    this.hasWon = false;
    this.activeMapId = -1;
    this.slide = false;
    this.match = false;
    this.fit = false;
    this.maxY = -1;
    this.minY = -1;
    this.maxX = -1;
    this.minX = -1;
    this.spawnX = -1;
    this.spawnY = -1;
  }


  /* Description: Check to see is any puzzle setting is true.
  * Arguments  : -
  * Returns    : True  - slide, match, or fit is true.
  *              False - slide, match, and fit are all false.
  */
  Tobie.GridPuzzle.checkSetting = function() {
    if (this.slide || this.match || this.fit) {
      return true;
    }
    return false;
  }

  /* Description: Assigns a value to spawnX and spawnY for a fit puzzle.
  * Arguments  : (int, int) - x, y coordinates on a rpg maker map.
  * Returns    : -
  */
  Tobie.GridPuzzle.setSpawn = function(spawnX, spawnY) {
    this.spawnX = spawnX;
    this.spawnY = spawnY;
  }

  /* Description: Find out what kind of puzzle is being used and sets the
  *              appropriate boolean to be true.
  * Arguments  : String
  * Returns    : -
  */
  Tobie.GridPuzzle.puzzleType = function(type) {
    console.log(type);
    if (type == "slide") {
      this.slide = true;
    } else if (type == "match") {
      this.match = true;
    } else if (type == "fit") {
      this.fit = true;
    } else {
      this.slide = true;
    }
    // console.log("slide: " + this.slide);
    // console.log("match: " + this.match);
    // console.log("fit  : " + this.fit);
  }

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

    //Tobie.GridPuzzle.printArray();

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

        if(xpos > this.maxX) {
          this.maxX = xpos;
        } else if (xpos < this.minX || this.minX == -1) {
          this.minX = xpos;
        }

        if(ypos > this.maxY) {
          this.maxY = ypos;
        } else if (ypos < this.minY || this.minY == -1) {
          this.minY = ypos;
        }

      }
    }
    // console.log("maxX: " + this.maxX);
    // console.log("minX: " + this.minX);
    // console.log("maxY: " + this.maxY);
    // console.log("minY: " + this.minY);
  }

  /* Description: Add an event, marked as a puzzle piece, to the puzzle piece
  *              array.
  * Arguments  : (puzzleNum) Number of the puzzle; place to be put in puzzle
  *                          array.
  *              (eventId)   Event ID to be later referenced
  * Returns    : -
  */
  Tobie.GridPuzzle.addPiece = function(puzzleNum, eventId, mapId) {

    if (this.activeMapId == -1 || this.activeMapId == mapId) {
      console.log(-1);
      this.activeMapId = mapId;
    } else {
      console.log(mapId);
      Tobie.GridPuzzle.resetVal();
      Tobie.GridPuzzle.activeMapId = mapId;
    }

    if (this.puzzle_piece_array.length <= puzzleNum) {
      this.puzzle_piece_array.push([]);
    }
    this.puzzle_piece_array[puzzleNum].push(eventId);
  }

  Tobie.GridPuzzle.addBool = function() {
    if (this.fit) {
      for(var i = 0; i < this.puzzle_piece_array.length; i++) {
        this.shifted_puzzlePiece.push(false);
      }
    }
  }

  /* Description: Set current_piece to the next piece in the puzzle piece array.
  *              If the current_piece is the last piece in the array, set it
  *              back to the first piece.
  * Arguments  : -
  * Returns    : -
  */
  Tobie.GridPuzzle.cyclePieces = function() {
    if (this.current_piece === this.puzzle_piece_array.length-1) {
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
  */
  Tobie.GridPuzzle.movePiece = function(direction) {
    var eventIds = this.currentPiece();
    if (direction == 2 || direction == 6) {
      for (var i = 0; i < eventIds.length; i++) {
        var id = eventIds[i];
        if (this.match === true) {
          var xpos = $gameMap.event(id)._x;
          var ypos = $gameMap.event(id)._y;
          if (direction == 2) {
            $gameMap.event(id).setPosition(xpos,ypos+3);
          } else {
            $gameMap.event(id).setPosition(xpos+2,ypos);
            //console.log(xpos);
          }
        } else {
          $gameMap.event(id).moveStraight(direction);
        }
      }
    } else {
      for (var i = eventIds.length; i > 0; i--) {
        var id = eventIds[i-1];
        if (this.match === true) {
          var xpos = $gameMap.event(id)._x;
          var ypos = $gameMap.event(id)._y;
          if (direction == 8) {
            $gameMap.event(id).setPosition(xpos,ypos-3);
          } else {
            $gameMap.event(id).setPosition(xpos-2,ypos);
          }
        } else {
          $gameMap.event(id).moveStraight(direction);
        }
      }
    }
  }

  //spawns fit piece onto the a place on the map
  Tobie.GridPuzzle.fitSpawnPiece = function() {
    var eventIds = this.currentPiece();
    var minX = $gameMap.event(eventIds[0])._x;
    var minY = $gameMap.event(eventIds[0])._y;

    if (!this.shifted_puzzlePiece[eventIds]) {
      this.shifted_puzzlePiece[eventIds] = true;
      for (var i = 1; i < eventIds.length; i++) {
        var x = $gameMap.event(eventIds[i])._x;
        var y = $gameMap.event(eventIds[i])._y;
        if ( x < minX) {
          minX = x;
        }
        if (y < minY) {
          minY = y;
        }
      }
      for (var i = 0; i < eventIds.length; i++) {
        var newX = this.spawnX;
        var newY = this.spawnY;
        var x = $gameMap.event(eventIds[i])._x;
        var y = $gameMap.event(eventIds[i])._y;
        if (x > minX) {
          //console.log(newX + " " + x + " " + minX);
          newX = Number(newX) + Number(x) - Number(minX);
        }
        if (y > minY) {
          newY = Number(newY) + Number(y) - Number(minY);
        }
        // console.log("x: " + this.spawnX + "\nnewX: " + Number(newX));
        // console.log("y: " + this.spawnY + "\nnewY: " + Number(newY));
        $gameMap.event(eventIds[i]).setPosition(newX, newY);
        //eventY = y - minY + newY
      }
    } else {
      this.shifted_puzzlePiece[eventIds] = false;
      for(var j = 0; j < eventIds.length; j++){
        var currEvent = eventIds[j];
        var xpos = $dataMap.events[currEvent].x;
        var ypos = $dataMap.events[currEvent].y;
        //console.log("resetPieces: [" + xpos + "][" + ypos + "]");
        $gameMap.event(currEvent).locate(xpos, ypos);
      }
    }

    //$gameMap.event(id).setPosition(xpos,ypos+3);
    //this.printArrayBool();
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
      if (direction == 4) {
        if(this.match == true && !this.emptySpot(xpos-2, ypos)) {
          return false;
        } else if (this.fit == true && !this.fit_emptySpot(xpos-1, ypos)) {
          return false;
        } else if (this.slide || !this.checkSetting()){
          if(!this.emptySpot(xpos-1, ypos)) {
            return false;
          }

        }
        //RIGHT
      } else if (direction == 6) {
        if(this.match == true && !this.emptySpot(xpos+2, ypos)) {
          return false;
        } else if (this.fit == true && !this.fit_emptySpot(xpos+1, ypos)) {
          return false;
        } else if (this.slide || !this.checkSetting()) {
          if (!this.emptySpot(xpos+1, ypos)) {
            return false;
          }
        }
        //UP
      } else if (direction == 8) {
        if(this.match == true && !this.emptySpot(xpos, ypos-3)) {
          return false;
        } else if (this.fit == true && !this.fit_emptySpot(xpos, ypos-1)) {
          return false;
        } else if (this.slide || !this.checkSetting()) {
          if (!this.emptySpot(xpos, ypos-1)) {
            return false;
          }
        }
        //DOWN
      } else if (direction == 2) {
        if(this.match == true && !this.emptySpot(xpos, ypos+3)) {
          return false;
        } else if (this.fit == true && !this.fit_emptySpot(xpos, ypos+1)) {
          return false;
        } else if (this.slide || !this.checkSetting()){
          if (!this.emptySpot(xpos, ypos+1)) {
            return false;
          }
        }
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

  Tobie.GridPuzzle.fit_emptySpot = function(xpos, ypos) {

    var pieceZero = this.puzzle_piece_array[0];

    for (var i = 0; i < pieceZero.length; i++) {
      var currEvent = pieceZero[i];
      var c_xpos = $gameMap._events[currEvent]._x;
      var c_ypos = $gameMap._events[currEvent]._y;
      if(xpos == c_xpos && ypos == c_ypos) {
        return false;
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
    if (this.slide === true) {
      return this.slideWin();
    } else if (this.match === true || this.fit === true) {
      return this.matchWin(); //not tested
    }
    return false;
  }

  /* Description: Checks if player has solved the slide puzzle, based on if the
  *              desired puzzle piece is in an area marked as region 1.
  * Arguments  : -
  * Returns    : (False) The puzzle piece is in region 1 and has solved the
  *                      puzzle.
  *              (True)  Player has solved the puzzle.
  */
  Tobie.GridPuzzle.slideWin = function() {
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

  /* Description: Checks if player has solved the match puzzle, based on if the
  *               desired puzzle pieces are in an area where the marked region
  *               number matches the puzzle piece number.
  * Arguments  : -
  * Returns    : (False) The puzzle pieces are not in the correct places.
  *              (True)  Player has solved the puzzle.
  */
  Tobie.GridPuzzle.matchWin = function() { //not tested
    for(var i = 1; i < this.puzzle_piece_array.length; i++) {
      for(var j = 0; j < this.puzzle_piece_array[i].length; j++) {
        var currEvent = this.puzzle_piece_array[i][j];
        var xpos = $gameMap._events[currEvent]._x;
        var ypos = $gameMap._events[currEvent]._y;
        //console.log("i+1: " + Number(i) + " regionId: " + $gameMap.regionId(xpos, ypos));
        if($gameMap.regionId(xpos, ypos) != i) {
          return false;
        }
      }
    }
    return true;
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

      Tobie.GridPuzzle.printArrayBool = function() {
        if (this.shifted_puzzlePiece.length === 0 ||
          this.shifted_puzzlePiece === 'undefined') {
            console.log("array is empty");
            return;
          } else {
            for (var i = 0; i < this.shifted_puzzlePiece.length; i++) {
              console.log(this.shifted_puzzlePiece[i]);
            }
          }
        }

        var alias_Game_Map_setup = Game_Map.prototype.setup;
        Game_Map.prototype.setup = function(mapId) {
          alias_Game_Map_setup.call(this, mapId);
          var mapNote = $dataMap.note.split(" ");

          if (mapNote[0] == 'puzzleroom') {
            //console.log(mapNote[1]);
            Tobie.GridPuzzle.puzzleType(mapNote[1]);
            //console.log("setup: " + Tobie.GridPuzzle.activeMapId);
            Tobie.GridPuzzle.sortEvents();
            Tobie.GridPuzzle.addBool();
          }
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
          //Tobie.GridPuzzle.resetVal();

          var eventNote = $dataMap.events[eventId].note;

          if (eventNote != 'undefined' || eventNote != "") {

            var noteArgs = $dataMap.events[eventId].note.split(" ");
            var command = noteArgs[0].toLowerCase();
            var pieceNum = Number(noteArgs[1]);

            if (command === 'piece') {
              Tobie.GridPuzzle.addPiece(pieceNum, eventId, mapId);
            }
          }
        }

        //-----------------------------------------------------------------------------
        //  GAME PLAYER
        //-----------------------------------------------------------------------------

        /* Description: Allows the player to toggle between pieces when pressing shift
        * Arguments  : Given RPG Maker Arguments
        * Returns    : -
        */
        //var _Game_Player_isDashButtonPressed = Game_Player.prototype.isDashButtonPressed;
        Game_Player.prototype.isDashButtonPressed = function() {
          //_Game_Player_isDashButtonPressed.call(this);
          var mapId = $gameMap.mapId();
          var shift = Input.isPressed('shift');

          if(Input.isTriggered('shift') && Tobie.GridPuzzle.activeMapId == mapId &&
          Tobie.GridPuzzle.fit) {
            Tobie.GridPuzzle.fitSpawnPiece();

          } else {
            if (ConfigManager.alwaysDash) {
              return !shift;
            } else {
              return shift;
            }
          }
        }

        /* Description: Allows the player to move pieces using directional arrow keys,
        *              reset pieces using 'control', and switch pieces using 'z',
        *              'enter', or 'space'.
        * Arguments  : Given RPG Maker Arguments
        * Returns    : -
        */
        var alias_Game_Player_moveByInput = Game_Player.prototype.moveByInput;
        Game_Player.prototype.moveByInput = function() {
          alias_Game_Player_moveByInput.call(this);
          var mapId = $gameMap.mapId();

          if (Tobie.GridPuzzle.selected() && Tobie.GridPuzzle.activeMapId == mapId) {

            if(Input.isTriggered('left') && Tobie.GridPuzzle.canMove(4)) {
              Tobie.GridPuzzle.movePiece(4)
              if (Tobie.GridPuzzle.winCondition()) {
                Tobie.GridPuzzle.hasWon = true;
              }

            } else if(Input.isTriggered('right') && Tobie.GridPuzzle.canMove(6)) {
              Tobie.GridPuzzle.movePiece(6)
              if (Tobie.GridPuzzle.winCondition()) {
                Tobie.GridPuzzle.hasWon = true;
              }

            } else if(Input.isTriggered('up') && Tobie.GridPuzzle.canMove(8)) {
              Tobie.GridPuzzle.movePiece(8);
              if (Tobie.GridPuzzle.winCondition()) {
                Tobie.GridPuzzle.hasWon = true;
              }

            } else if(Input.isTriggered('down') && Tobie.GridPuzzle.canMove(2)) {
              Tobie.GridPuzzle.movePiece(2);
              if (Tobie.GridPuzzle.winCondition()) {
                Tobie.GridPuzzle.hasWon = true;
              }

            } else if(Input.isTriggered('control')) {
              Tobie.GridPuzzle.resetPieces();

            } else if(Input.isTriggered('ok')) {
              Tobie.GridPuzzle.changePiece();
            }
            // } else if (Input.isTriggered('shift') && Tobie.GridPuzzle.fit) {
            //   console.log("hi");
            //   Tobie.GridPuzzle.fitSpawnPiece();
            // }

          } else if (Tobie.GridPuzzle.activeMapId == mapId) {
            if(Input.isTriggered('ok')) {
              Tobie.GridPuzzle.changePiece();
            }
          }
        }

      })();

      var alias_Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
      Game_Interpreter.prototype.pluginCommand = function(command, args) {
        alias_Game_Interpreter_pluginCommand.call(this, command, args);
        if(command == 'spawnpoint') {
          Tobie.GridPuzzle.setSpawn(args[0], args[1]);
        }
        // console.log(Tobie.GridPuzzle.spawnX);
        // console.log(Tobie.GridPuzzle.spawnY);
      };
