//=============================================================================
// Tobie Plugins - Color Calculator
// ColorCalc.js
// Version: 1.0.0
//=============================================================================

/*:
*
* @plugindesc Calculate the colors between two hex color values. (To be used
* Terrax Lighting Plugin)
* @author asksuyo
*
* @help
* =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
* Information
* =~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~=~
* This script is used to help calculate the values between two hex color values.
*
* @param divisions
* @default 5
*/


var Imported = Imported || {};
Imported.Tobie_ColorCalc = true;

var Tobie = Tobie || {};
Tobie.ColorCalc = Tobie.ColorCalc || {};

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

  var parameters = PluginManager.parameters('ColorCalc');
  var divisions = Number(parameters['divisions']||5);


  /* Description: Separates the hex color into 3 numbers.
  * Arguments  : Hex color value
  * Returns    : Array of 3 numbers
  */
  Tobie.ColorCalc.separateNum = function(hexNum) {
    var hexArray = new Array(3);
    for(var i = 0; i < hexArray.length; i++) {
      hexArray[i] = hexNum.substr(i*2, 2);
    }
    return hexArray;
  }

  /* Description: Calculates the decimal value of a hex number.
  * Arguments  : Hex number (String)
  * Returns    : Converted decimal value (String/Number)
  */
  Tobie.ColorCalc.calcFromHex = function(num) {
    var val = 0;
    for (var i = 0; i < num.length ; i++) {
      var hexNum = 0;
      switch (num[i]) {
        case 'A': hexNum = 10;
        break;
        case 'B': hexNum = 11;
        break;
        case 'C': hexNum = 12;
        break;
        case 'D': hexNum = 13;
        break;
        case 'E': hexNum = 14;
        break;
        case 'F': hexNum = 15;
        break;
        default: hexNum = num[i];
      }
      val = Number(val + Number(hexNum * Math.pow(16, num.length-Number(i+1))));
    }
    return val;
  }

  /* Description: Calculates the hex value of a decimal number.
  * Arguments  : Decimal number (Number/String)
  * Returns    : Converted hex value (String)
  */
  Tobie.ColorCalc.calcToHex = function(num) {
    var hexNum = "";
    var currNum = num;
    while (currNum > 0) {
      switch (currNum % 16) {
        case 10: hexNum += 'A';
        break;
        case 11: hexNum += 'B';
        break;
        case 12: hexNum += 'C';
        break;
        case 13: hexNum += 'D';
        break;
        case 14: hexNum += 'E';
        break;
        case 15: hexNum += 'F';
        break;
        default: hexNum += currNum % 16;
      }
      currNum = parseInt(currNum/16);
    }
    return hexNum.split('').reverse().join('');
  }

  /* Description: Calculates the decimal value of a hex number.
  * Arguments  : Hex number (String)
  * Returns    : Converted decimal value (String/Number)
  */
  Tobie.ColorCalc.divide = function(num) {
    var frac = parseInt(num/divisions);
    var new_numbers = new Array(divisions);
    for (var i = 0; i < divisions; i++) {
      new_numbers[i] = frac*Number(i+1);
    }
    return new_numbers;
  }

  /* Description: Calculates the values inbetween two hex color values based on
  *               the number of divisions.
  * Arguments  : (color1) First hex number
  *              (color2) Second hex number
  * Returns    : (array) An array of all the values between the first hex number
  *              and the second hex number.
  */
  Tobie.ColorCalc.calcValue = function(color1, color2) {
    var c1 = this.separateNum(color1);
    var c2 = this.separateNum(color2);
    var c_add = new Array(3);
    var c_div = new Array(3);
    var c_join = new Array(divisions);
    for (var i = 0; i < c1.length; i++) {
      c1[i] = this.calcFromHex(c1[i]);
      c2[i] = this.calcFromHex(c2[i]);
      c_add[i] = Number(c1[i] + c2[i]);
      c_div[i] = this.divide(c_add[i]);
    }

    for (var i = 0; i < c_div.length; i++) {
      for (var j = 0; j < c_div[i].length; j++) {
        c_div[i][j] = this.calcToHex(c_div[i][j]);
      }
    }

    for (var i = 0; i < c_join.length; i++) {
      c_join[i] = "";
      for (var j = 0; j < 3; j++) {
        if (c_div[j][i].length < 2) {
          c_div[j][i] = '0'+ c_div[j][i].toString();
        }
        c_join[i] += c_div[j][i].toString();
      }
    }
    return c_join.reverse();
  }

  Tobie.ColorCalc.dist = function(eventId) {
    var x1 = $gamePlayer.x;
    var y1 = $gamePlayer.y;
    var x2 = $gameMap._events[eventId]._x;
    var y2 = $gameMap._events[eventId]._y;
    //console.log(Math.hypot(x2-x1, y2-y1));
    return Math.hypot(x2-x1, y2-y1);
  }

  // Tobie.ColorCalc.calcTime = function(distance) {
  //   var $gameInterp = new Game_Interpreter();
  //   $gameInterp.wait(Number(60 + distance*60));
  //   console.log(Number(60 + distance*60));
  // }

  Tobie.ColorCalc.calcDist = function(maxDist, eventId, colorArray) {
    var distances = this.divide(maxDist);
    var currDist = this.dist(eventId);
    if (currDist <= distances[0]) {
      //console.log("#" + colorArray[0]);
      return "#" + colorArray[0];
    } else {
      for (var i = 1; i < distances.length; i++) {
        if (currDist > distances[i-1] && currDist <= distances[i]) {
          //console.log("#"+colorArray[i]);
          return "#" + colorArray[i];
        }
      }
    }
    return "#000000";
  }

  Tobie.ColorCalc.tlFadeRegionLight = function(startColor, endColor, dist, eventId) {
    var colors = this.calcValue(startColor, endColor);
    var currColor = this.calcDist(dist, eventId, colors);

    var $gameInterp = new Game_Interpreter();
    var args = 'RegionLight 1 ON ' + currColor + ' 50';
    var args = args.split(" ");
    var command  = args.shift();
    $gameInterp.pluginCommand(command, args);
  }

  Tobie.ColorCalc.tlFadeMapLight = function(startColor, endColor, dist, eventId) {
    var colors = this.calcValue(startColor, endColor);
    var currColor = this.calcDist(dist, eventId, colors);

    var $gameInterp = new Game_Interpreter();
    var args = 'Tint fade ' + currColor + ' 5';
    var args = args.split(" ");
    var command  = args.shift();
    $gameInterp.pluginCommand(command, args);
  }

  })();
