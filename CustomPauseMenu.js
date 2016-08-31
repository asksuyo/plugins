/*:
 *
 * @plugindesc Custom pause menu; more changes ontop of YEP_MainMenuManager
 *
 * @author asksuyo
 *
 *
 * @help
 *
 */

var Imported = Imported || {};
Imported.Tobie_CustomPauseMenu = true;

var Tobie = Tobie || {};
Tobie.CustomPauseMenu = Tobie.CustomPauseMenu || {};

//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {
  //-----------------------------------------------------------------------------
  //  CUSTOM CLASS FUNCTIONS
  //-----------------------------------------------------------------------------

  /* Description: Change the background on the main menu screen based on
   *              characters in the party.
   * Returns:     DAVE AND MARGARET if $gameParty size is greater than 1
   *              DAVE              if the player is just Dave
   *              MARGARET          if the player is just Margaret
   */
  Tobie.CustomPauseMenu.menuPic = function() {
    if($gameParty.size() < 2) {
      if ($gameParty.name() == "Dave") {
        return "UI_d";
      } else {
        return "UI_m";
      }
    }
    return "UI_dm";
  }

  //-----------------------------------------------------------------------------
  //  EDITED RPG MAKER FUNCTIONS
  //-----------------------------------------------------------------------------


  /* Description: Change the background on the main menu screen.
   *
   */
   var alias_Scene_Menu_createBackground = Scene_Menu.prototype.createBackground;
   Scene_Menu.prototype.createBackground = function() {
       alias_Scene_Menu_createBackground.call(this);
       var background = Tobie.CustomPauseMenu.menuPic();
       this._backgroundSprite.bitmap = ImageManager.loadPicture(background);
       //console.log($gameParty.members()._name);
   };

   /* Description: Change the background on the item screen.
    *
    */
   var alias_Scene_ItemBase_createBackground = Scene_ItemBase.prototype.createBackground;
   Scene_ItemBase.prototype.createBackground = function() {
       alias_Scene_ItemBase_createBackground.call(this);
       var background = Tobie.CustomPauseMenu.menuPic();
       this._backgroundSprite.bitmap = ImageManager.loadPicture(background);
   };

   /* Description: Change the width and placement of the item screen menu items.
    *
    */
   var alias_Scene_Item_create = Scene_Item.prototype.create;
   Scene_Item.prototype.create = function() {
       alias_Scene_Item_create.call(this);
       var width = 400;
       var x_pos = Graphics.boxWidth - width;

       this._helpWindow.x = width;
       this._categoryWindow.x = width;
       this._itemWindow.x = width;

       this._helpWindow.width = width;
       this._categoryWindow.width = width;
       this._itemWindow.width = width;

   };

   /* Description: Remove the weapons and armor tab on the item screen
    *
    */
   Window_ItemCategory.prototype.makeCommandList = function() {
       this.addCommand(TextManager.item,    'item');
       //this.addCommand(TextManager.weapon,  'weapon');
       //this.addCommand(TextManager.armor,   'armor');
       this.addCommand(TextManager.keyItem, 'key item');
   };

   /* Description: Change the number of columns to two, since there are no
    *              longer a 'weapon' and 'armor' column.
    */
   Window_ItemCategory.prototype.maxCols = function() {
       return 2;
   };

   /* Description: Change the number of columns for the itemWindow, to one to
    *              comfortably fit the items in the box.
    */
   Window_ItemList.prototype.maxCols = function() {
       return 1;
   };

   /* Description: Prevent the draw error, by manually setting the width to
    *              358.
    */
   Window_ItemList.prototype.drawItemNumber = function(item, x, y, width) {
       if (this.needsNumber()) {
           this.drawText(':', x, y, 358 - this.textWidth('00'), 'right');
           this.drawText($gameParty.numItems(item), x, y, 358, 'right');
       }
   };

   /* Description: Set the ItemCategory menubox to the width to fill the
    *              remaining rightside of the screen.
    */
   Window_ItemCategory.prototype.initialize = function() {
     var width = Graphics.boxWidth - 400;
       Window_HorzCommand.prototype.initialize.call(this, width, 0);
   };

   /* Description: Set the windowWidth to be 400.
    */
   Window_ItemCategory.prototype.windowWidth = function() {
       return 400;
   };

})();
