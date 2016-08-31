//NoMouseMovement.js
/*:it 
* @plugindesc Simply disables movement by mouse 
* @author Daemond *  
* @help *  
* Plug and play */

/*:it * @plugindesc Semplicemente blocca il movimento tramite mouse 
* @author Daemond *  
* @help *  
* Plug and play */

Game_Player.prototype.moveByInput = function(){	
	if (!this.isMoving() && this.canMove()) {
	    var direction = this.getInputDirection();
	    if (direction > 0) {
	        $gameTemp.clearDestination();
	        this.executeMove(direction);
	    }
    }
};