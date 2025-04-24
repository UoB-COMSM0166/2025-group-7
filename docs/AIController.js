class AIController {
    /**
     * @param {Tank}      tank        Controlled tank
     * @param {GameState} gameState   Used to get global information & call addProjectile
     * @param {Tank}      targetTank  Main tracking target (in this case, player 1)
     * @param {Number}    level       0 = HARD, 1 = EASY, corresponding to GameState.HARD/EASY
     */
    constructor(tank, gameState, targetTank, level = GameState.EASY) {
      this.tank        = tank;
      this.gameState   = gameState;
      this.targetTank  = targetTank;
      this.level       = level;
      this.lastFireMS  = 0;
      this.fireCD      = level === GameState.HARD ? 1000 : 2000;   // Difficulty affects firing rate
      this.turnStep    = level === GameState.HARD ? 3   : 1.5;     // Difficulty affects turning speed
      this.safeDistSq  = 150 * 150;
      this.currentPath = null;
      this.pathReached = true;
    }
  
    async update () {
      if (this.gameState.getIsGameOver()) return;
      
      // Add properties to track position and detect if stuck
  if (!this.lastPosition) {
    this.lastPosition = { x: this.tank.tankSprite.x, y: this.tank.tankSprite.y };
    this.stuckCounter = 0;
    this.lastMoveTime = millis();
  }
  
  // Check if tank is stuck by comparing current position with last position
  const currentTime = millis();
  if (currentTime - this.lastMoveTime > 1000) { // Check every second
    const currentPosition = { x: this.tank.tankSprite.x, y: this.tank.tankSprite.y };
    const distance = Math.sqrt(
      Math.pow(currentPosition.x - this.lastPosition.x, 2) + 
      Math.pow(currentPosition.y - this.lastPosition.y, 2)
    );
    
    if (distance < 5) { // If tank hasn't moved significantly
      this.stuckCounter++;
    } else {
      this.stuckCounter = 0;
    }
    
    this.lastPosition = currentPosition;
    this.lastMoveTime = currentTime;
    
    // If stuck for several checks, force a new path
    if (this.stuckCounter >= 3) {
      console.log("Tank is stuck, finding alternative path");
      this.pathReached = true;
      this.stuckCounter = 0;
      
      // Optional: Add some randomness to help find a different path
      this.currentPath = null;
    }
  }
  
  // Check if we need a new path
  if (this.pathReached || this.currentPath === null) {
    // Only calculate a new path when we've reached the current destination
    // or when we don't have a path yet
    this.currentPath = this.gameState.pathFinder(this.tank, this.targetTank);
    this.pathReached = false;
  }
  
  // Check if we've reached the current path destination
  if (this.tank.tankSprite.distanceTo(this.currentPath) < 20) {
    this.pathReached = true;
  }
  
  // Move toward player using pathfinding
  if (this.tank.tankSprite.distanceTo(this.targetTank.tankSprite) > 100) {
    await this.tank.tankSprite.rotateTowards(this.currentPath);
    await delay(300);
    this.tank.move(Tank.UP_DIRECTION);
  } else {
    this.tank.tankSprite.speed = 0;
    this.tank.tankSprite.rotateTowards(this.targetTank.tankSprite);
  }
      
      /*
      // === 1. Turn toward player ===
      const ang = atan2(
        this.targetTank.tankSprite.y - this.tank.tankSprite.y,
        this.targetTank.tankSprite.x - this.tank.tankSprite.x
      );
      const diff = (((ang - this.tank.tankSprite.rotation + 540) % 360) - 180);
  
      if (abs(diff) > this.turnStep) {
        this.tank.move(diff > 0 ? Tank.RIGHT_DIRECTION : Tank.LEFT_DIRECTION);
        return;                        // First aim the gun barrel
      }
  
      // === 2. Maneuver ===
      const dx = this.targetTank.tankSprite.x - this.tank.tankSprite.x;
      const dy = this.targetTank.tankSprite.y - this.tank.tankSprite.y;
      const distSq = dx * dx + dy * dy;
  
      if (distSq > this.safeDistSq) {
        this.tank.move(Tank.UP_DIRECTION);       // Chase after target
      } else if (distSq < this.safeDistSq / 4) {
        this.tank.move(Tank.DOWN_DIRECTION);     // Back up if too close
      } else {
        this.tank.move(Tank.NO_DIRECTION);
      }
      */
      // === 3. Fire ===
      if (this.tank.canFire() && millis() - this.lastFireMS > this.fireCD && this.tank.tankSprite.distanceTo(this.targetTank.tankSprite) <= 100) {
        this.gameState.addProjectile(this.tank.fire(), this.tank);
        this.lastFireMS = millis();
      }
    }
  }
