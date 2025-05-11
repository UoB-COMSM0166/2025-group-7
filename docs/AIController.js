class AIController {
  /**
   * @param {Tank}      tank        Controlled tank
   * @param {GameState} gameState   Used to get global information & call addProjectile
   * @param {Tank}      targetTank  Main tracking target (in this case, player 1)
   * @param {Number}    level       0 = HARD, 1 = EASY, corresponding to GameState.HARD/EASY
   */
  constructor(tank, gameState, targetTank, level = GameState.EASY) {
    this.tank = tank;
    this.gameState = gameState;
    this.targetTank = targetTank;
    this.level = level;
    this.fireCD = level === GameState.HARD ? 1000 : 2000;   // Difficulty affects firing rate
    this.turnStep = level === GameState.HARD ? 3 : 1.5;     // Difficulty affects turning speed
    this.safeDistSq = 150 * 150;
    this.currentPath = null;
    this.oldPath = null;
    this.pathReached = true;
    this.lastDecisionTime = 0;
    this.shouldSeekHealth = false;
    this.isSeekingHealth = false;
  }

  async update() {
    if (this.gameState.getIsGameOver()) return;

    // Randomize health pickup decision every 10 seconds
    const currentTime = millis();
    if (currentTime - this.lastDecisionTime > 10000) {
      this.shouldSeekHealth = random() < 0.10; // 10% chance to seek health
      this.lastDecisionTime = currentTime;
    }

    // Add properties to track position and detect if stuck
    if (!this.lastPosition) {
      this.lastPosition = { x: this.tank.tankSprite.x, y: this.tank.tankSprite.y };
      this.stuckCounter = 0;
      this.lastMoveTime = millis();
      this.isMoving = false; // Track if tank is actively trying to move
    }

    // Check if tank is stuck by comparing current position with last position
    // Only check if the tank is actively trying to move
    if (currentTime - this.lastMoveTime > 1000 && this.isMoving) { // Only check if tank is trying to move
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
        this.pathReached = true;
        this.stuckCounter = 0;

        // Optional: Add some randomness to help find a different path
        this.currentPath = null;
      }
    }

    // Check if tank's life is less than 2 and there are health pickups
    if (this.tank.getLife() < 2 && this.gameState.pickupList.some(pickup => pickup.type === "HEALTH") && this.shouldSeekHealth) {
      let bestHealthPickup = null;
      let minDistance = Infinity;

      for (const pickup of this.gameState.pickupList) {
        if (pickup.type === "HEALTH" && (!pickup.targetedByAI || pickup.targetedByAI === this.tank.id)) {
          const distance = dist(this.tank.tankSprite.x, this.tank.tankSprite.y, pickup.sprite.x, pickup.sprite.y);
          if (distance < minDistance) {
            minDistance = distance;
            bestHealthPickup = pickup;
          }
        }
      }

      if (bestHealthPickup) {
        // Claim this pickup
        if (!bestHealthPickup.targetedByAI) {
          this.gameState.pickupList.forEach(p => {
            if (p.targetedByAI === this.tank.id) p.targetedByAI = null;
          });
          bestHealthPickup.targetedByAI = this.tank.id;
        }
        this.currentPath = this.gameState.pathFinder(this.tank, bestHealthPickup.sprite);
        this.pathReached = false;
        this.isSeekingHealth = true;
      } else {
        this.isSeekingHealth = false;
      }
    } else if (this.isSeekingHealth) {
      // Unclaim the health pack if it was targeted
      this.gameState.pickupList.forEach(p => {
        if (p.targetedByAI === this.tank.id) p.targetedByAI = null;
      });
      this.isSeekingHealth = false;
      this.pathReached = true;
    }

    // Check if we need a new path
    if (this.pathReached || this.currentPath === null) {
      // Only calculate a new path when we've reached the current destination
      // or when we don't have a path yet
      this.currentPath = this.gameState.pathFinder(this.tank, this.targetTank.tankSprite);
      this.pathReached = false;
    }

    // Check if we've reached the current path destination
    if (this.tank.tankSprite.distanceTo(this.currentPath) < 35) {
      this.pathReached = true;
    }

    // Move toward player using pathfinding
    let targetDistance = 100; // Default distance
    if (this.tank.tankWeapon.weaponType === Weapon.SAW_TYPE) {
      targetDistance = 50; // Saw weapons get closer
    } else if (this.tank.tankWeapon.weaponType === Weapon.LASER_TYPE) {
      targetDistance = 500; // Laser weapons maintain distance
    }

    if (this.tank.tankSprite.distanceTo(this.targetTank.tankSprite) > targetDistance || 
        (this.tank.tankWeapon.weaponType === Weapon.MISSILE_TYPE && this.tank.canFire(this.fireCD))) {
      await this.tank.tankSprite.rotateTowards(this.currentPath);
      await delay(300);
      this.tank.move(Tank.UP_DIRECTION);
      this.isMoving = true; // Tank is actively trying to move
    } else {
      this.tank.tankSprite.speed = 0;
      this.tank.tankSprite.rotateTowards(this.targetTank.tankSprite);
      this.isMoving = false; // Tank is intentionally stationary
    }

    // === 3. Fire ===
    if (this.tank.canFire(this.fireCD)) {
      if (this.tank.tankWeapon.weaponType === Weapon.MISSILE_TYPE || 
          this.tank.tankSprite.distanceTo(this.targetTank.tankSprite) <= targetDistance) {
        this.gameState.addProjectile(this.tank.fire(), this.tank);
      }
    }
  }
}
