let destroyAnim;

class Tank {

    tankWeapon; //which particular type of weapon the tank has
    tankSprite; //sprite created with P5 Play
    saw;
    static TANK_HEIGHT = 15;
    static TANK_WIDTH = 15;
    static GUN_HEIGHT = 15;
    static GUN_WIDTH = 8;
    static WHEEL_HEIGHT = 9;
    static WHEEL_WIDTH = 15;
    static PROJECTILE_SPAWN_DIST = -4;
    static UP_DIRECTION = 0;
    static DOWN_DIRECTION = 1;
    static LEFT_DIRECTION = 2;
    static RIGHT_DIRECTION = 3;
    static NO_DIRECTION = 4;

    //locX and locY are the initial co-ordinates
    //initialDirection is the initial direction the tank is pointing in
    //initialDirection should be in degrees measured clockwise from x-axis
    constructor(locX, locY, initialDirection, difficultyLevel, index, gameState) {
        this.tankWeapon = new Weapon(Weapon.BULLET_TYPE);
        this.index = index;
        this.destroyed = false;
        this.INITIALX = locX;
        this.INITIALY = locY;
        this.tankSprite = new Sprite(locX, locY, Tank.TANK_WIDTH, "hexagon");
        this.tankSprite.addCollider((Tank.GUN_HEIGHT + Tank.TANK_HEIGHT) / 2, 0, Tank.GUN_HEIGHT, Tank.GUN_WIDTH);
        this.tankSprite.wheels = new Group();
        this.tankSprite.wheels.color = 'gray';
        this.tankSprite.wheels.autoDraw = false;
        this.tankSprite.wheels.autoUpdate = false;
        new this.tankSprite.wheels.Sprite(this.tankSprite.x, this.tankSprite.y + (Tank.WHEEL_HEIGHT + Tank.TANK_HEIGHT) / 2, Tank.WHEEL_WIDTH, Tank.WHEEL_HEIGHT);
        new this.tankSprite.wheels.Sprite(this.tankSprite.x, this.tankSprite.y - (Tank.WHEEL_HEIGHT + Tank.TANK_HEIGHT) / 2, Tank.WHEEL_WIDTH, Tank.WHEEL_HEIGHT);
        new GlueJoint(this.tankSprite, this.tankSprite.wheels[0]);
        new GlueJoint(this.tankSprite, this.tankSprite.wheels[1]);
        this.tankSprite.autoUpdate = false;
        this.tankSprite.autoDraw = false;
        this.tankSprite.rotationLock = true;
        this.tankSprite.speed = 0;
        this.tankSprite.rotation = initialDirection;
        this.INITIALROTATION = initialDirection;
        if (this.index === 1) {
            this.tankSprite.color = color(240, 0, 0);
        } else this.tankSprite.color = color(0, 240, 0);

        //set the tank's speed and life based on the difficulty level
        if (difficultyLevel == GameState.EASY) {
            this.initialLife = 3;
            this.tankLife = 3;
        } else if (difficultyLevel == GameState.HARD) {
            this.initialLife = 1;
            this.tankLife = 1;
        }
        this.spdFactor = 3;
        this.initialLife = this.tankLife;

        this.tankSprite.wheels[0].opacity = 0;
        this.tankSprite.wheels[1].opacity = 0;
        if (index === 1) {
            this.setTankAnimationColor(tankMovementAnimTank1, tank1Color);
            this.setTankAnimationColor(destroyAnimRed, tank1Color);
            this.tankSprite.addAni('move', ...tankMovementAnimTank1);
        } else {
            this.setTankAnimationColor(tankMovementAnimTank2, tank2Color);
            this.setTankAnimationColor(destroyAnimGreen, tank2Color);
            this.tankSprite.addAni('move', ...tankMovementAnimTank2);
        }
        this.tankSprite.anis.scale = 0.08;
        this.tankSprite.anis.offset.x = 45;

        this.bulletRoundCount = 0;
        this.scaleAniFrameCount = 0;
        this.inMotion = false;
        this.gameState = gameState;
    }

    setTankAnimationColor(animation, color) {
        for (let i = 0; i < animation.length; i++) {
            animation[i].loadPixels();
            for (let j = 0; j < animation[i].pixels.length; j += 4) {
                animation[i].pixels[j] = color.levels[0];
                animation[i].pixels[j + 1] = color.levels[1];
                animation[i].pixels[j + 2] = color.levels[2];
            }
            animation[i].updatePixels();
        }
    }



    draw() {
        this.drawTankSprite();
        this.drawShield();
        this.drawSaw();
        this.drawDestroyAnimation();
    }

    drawTankSprite() {
        if (!this.isDestroyed) {
            this.tankSprite.draw();
        }
    }

    drawShield() {
        if (this.hasShield && this.shieldSprite) {
            this.shieldSprite.draw();
        }
    }

    drawSaw() {
        if (this.tankWeapon.weaponType == Weapon.SAW_TYPE) {
            this.saw.draw();
        }
    }

    drawDestroyAnimation() {
        if (this.isDestroyed) {
            destroyAnim.play();
            destroyAnim.looping = false;
            animation(destroyAnim, this.tankSprite.x, this.tankSprite.y);
        }
    }

    canFire() {
        return (this.tankWeapon.numberOfRounds < this.tankWeapon.capacity);
    }

    fire() {
        //Create new projectile according to appropriate weapon type
        this.tankWeapon.fireSound.play();
        let projDist = Tank.TANK_HEIGHT / 2 + Tank.GUN_HEIGHT + Tank.PROJECTILE_SPAWN_DIST;
        let projX = this.tankSprite.x + projDist * cos(this.tankSprite.rotation);
        let projY = this.tankSprite.y + projDist * sin(this.tankSprite.rotation);

        //visual indication of firing through "scale" animation
        this.tankSprite.anis.scale = 0.09;
        this.scaleAniFrameCount = 1;

        if (this.tankWeapon.weaponType == Weapon.BULLET_TYPE) {
            this.tankWeapon.numberOfRounds++;
            this.bulletRoundCount++;
            return new Bullet(projX, projY, this.tankSprite.rotation);
        }
        else if (this.tankWeapon.weaponType == Weapon.LASER_TYPE) {
            this.tankWeapon.numberOfRounds++;
            this.checkWeaponReset();
            return new Laser(projX, projY, this.tankSprite.rotation);
        }
        else if (this.tankWeapon.weaponType == Weapon.BOMB_TYPE) {
            this.tankWeapon.numberOfRounds++;
            this.checkWeaponReset();
            return new SplinterBomb(projX, projY, this.tankSprite.rotation, this);
        }
        else if (this.tankWeapon.weaponType == Weapon.MISSILE_TYPE) {
            this.tankWeapon.numberOfRounds++;
            this.checkWeaponReset();
            return new Missile(projX, projY, this.tankSprite.rotation, this, this.gameState);
        }
    }

    checkWeaponReset() {
        //if you have used up all of a special weapon, reset to bullet with half capacity
        if (!this.canFire() && !(this.tankWeapon.weaponType == Weapon.BULLET_TYPE)) {
            this.tankWeapon = new Weapon(Weapon.BULLET_TYPE);
            this.tankWeapon.numberOfRounds = this.bulletRoundCount;
        }
    }

    lifeDecrement() {
        if (this.tankLife > 0)
            this.tankLife--;
    }

    lifeDecrease(damage) {
        //visual indication of firing through "scale" animation
        this.tankSprite.anis.scale = 0.09;
        this.scaleAniFrameCount = 1;

        if (this.tankLife - damage > 0) {
            this.tankLife -= damage;
        } else {
            this.tankLife = 0;
        }
    }
    receiveDamage(amount) {
        if (this.hasShield) {
            this.deactivateShield();
        } else {
            this.lifeDecrease(amount);
            if (this.tankLife <= 0) {
                this.destroy();
            }
        }
    }
    activateShield() {
        this.hasShield = true;

        if (!this.shieldSprite) {
            this.shieldSprite = new Sprite();
            this.shieldSprite.x = this.tankSprite.x;
            this.shieldSprite.y = this.tankSprite.y;
            this.shieldSprite.draw = function () {
                fill(color(0, 200, 255, 50));
                stroke(color(0, 200, 255));
                strokeWeight(2);
                ellipse(5, 0, 50, 40);
            };
            this.shieldSprite.collider = 'none';
            this.shieldSprite.autoUpdate = false;
            this.shieldSprite.autoDraw = false;
        }
    }

    deactivateShield(showAnimation = true) {
        this.hasShield = false;

        if (this.shieldSprite) {
            this.shieldSprite.remove();
            this.shieldSprite = null;
        }

        if (showAnimation)
            this.showShieldBreakEffect();
    }

    showShieldBreakEffect() {
        for (let i = 0; i < 20; i++) {
            const particle = new Sprite();
            particle.collider = 'none';
            particle.x = this.tankSprite.x;
            particle.y = this.tankSprite.y;
            particle.width = 4;
            particle.height = 4;
            particle.color = color(0, 200, 255);
            particle.stroke = color(0, 100, 255);
            particle.velocity.x = random(-4, 4);
            particle.velocity.y = random(-4, 4);
            particle.life = 20;
            particle.autoUpdate = true;
            particle.autoDraw = true;
        }
    }

    lifeIncrement() {
        if (this.tankLife < this.initialLife) {
            this.tankLife++;
        }

        if (this.tankLife > this.initialLife) {
            this.tankLife = this.initialLife;
        }
    }

    // life refresh when game restarts
    lifeRefresh() {
        this.tankLife = this.initialLife;
    }

    getLife() {
        return this.tankLife;
    }

    getAmmo() {
        return this.tankWeapon.getAmmo();
    }

    numberOfRoundsRefresh() {
        this.tankWeapon.numberOfRounds = 0;
    }

    //refresh positions when game restarts
    positionRefresh() {
        this.tankSprite.x = this.INITIALX;
        this.tankSprite.y = this.INITIALY;
        this.tankSprite.rotation = this.INITIALROTATION;
        this.tankSprite.wheels[0].x = this.tankSprite.x;
        this.tankSprite.wheels[0].y = this.tankSprite.y + Tank.TANK_HEIGHT / 2;
        this.tankSprite.wheels[1].x = this.tankSprite.x;
        this.tankSprite.wheels[1].y = this.tankSprite.y - Tank.TANK_HEIGHT / 2;
    }

    //animates tank destruction
    destroy() {
        if (this.index === 1) {
            destroyAnim = loadAnimation(...destroyAnimRed);
        }
        else {
            destroyAnim = loadAnimation(...destroyAnimGreen);
        }
        destroyAnim.frameDelay = 1;
        destroyAnim.rotation = this.tankSprite.rotation;
        this.isDestroyed = true;
        this.inMotion = false;
        audioTankDestroy.play();
        setTimeout(() => {
            this.isDestroyed = false;
        }, 2000);

    }

    update() {
        this.handleTouchInput();
        this.updateSprites();
        this.updateScaleAnimation();
        this.updateShield();
    }

    handleTouchInput() {
        if (isTouchScreen) {
            this.joyStickInput();
        }
    }

    updateSprites() {
        this.tankSprite.wheels.update();
        this.tankSprite.update();
        if (this.tankWeapon.weaponType == Weapon.SAW_TYPE) {
            this.saw.update();
        }
    }

    updateScaleAnimation() {
        if (this.scaleAniFrameCount == 1) {
            this.tankSprite.anis.scale = 0.08;
        }
        if (this.scaleAniFrameCount > 0) {
            this.scaleAniFrameCount--;
        }
    }

    updateShield() {
        if (this.hasShield && this.shieldSprite) {
            this.shieldSprite.x = this.tankSprite.x;
            this.shieldSprite.y = this.tankSprite.y;
            this.shieldSprite.rotation = this.tankSprite.rotation;
        }
    }

    //updates the rotation and speed attributes of the tank sprite
    //directionOfMove corresponds to either UP, DOWN, LEFT or RIGHT
    move(directionOfMove) {
        switch (directionOfMove) {
            case Tank.RIGHT_DIRECTION:
                this.handleRightMovement();
                break;
            case Tank.LEFT_DIRECTION:
                this.handleLeftMovement();
                break;
            case Tank.UP_DIRECTION:
                this.handleUpMovement();
                break;
            case Tank.DOWN_DIRECTION:
                this.handleDownMovement();
                break;
            case Tank.NO_DIRECTION:
                if (!isTouchScreen) {
                    this.stopMovement();
                }
                break;
        }
    }

    handleRightMovement() {
        const rotationSpeed = this.tankSprite.speed === 0 ? 1 : 2;
        this.tankSprite.rotation += rotationSpeed * this.spdFactor;
        this.inMotion = true;
    }

    handleLeftMovement() {
        const rotationSpeed = this.tankSprite.speed === 0 ? 1 : 2;
        this.tankSprite.rotation -= rotationSpeed * this.spdFactor;
        this.inMotion = true;
    }

    handleUpMovement() {
        this.tankSprite.direction = this.tankSprite.rotation;
        this.tankSprite.speed = 1 * this.spdFactor;
        this.tankSprite.ani.play();
        this.inMotion = true;
    }

    handleDownMovement() {
        this.tankSprite.direction = this.tankSprite.rotation;
        this.tankSprite.speed = -0.5 * this.spdFactor;
        this.tankSprite.ani.pause();
        this.inMotion = true;
    }

    stopMovement() {
        this.tankSprite.speed = 0;
        this.tankSprite.ani.pause();
        this.inMotion = false;
    }

    //returns APPROXIMATE co-ordinates of the tank, in terms of grid cells,
    //to exclude it from new Pickup placement - currently hardcodes values
    //for grid and cell size
    getCurrentCell() {
        let column = floor(this.tankSprite.x / 90.5);
        let row;
        let columnIsOdd = (column % 2 == 1);

        if (columnIsOdd) {
            row = floor((this.tankSprite.y - 52.5) / 105);
        } else row = floor(this.tankSprite.y / 105);

        if (column < 0) {
            columnn = 0;
        }
        if (row < 0) {
            row = 0;
        }
        if (column > 9) {
            column = 9;
        }
        if (row > 3) {
            row = 3;
        }

        return [row, column];
    }

    joyStickInput() {
        if (GameState.twoPlayerMode) {
            this.handleTwoPlayerJoystick();
        } else if (this.index === 1) {
            this.handleSinglePlayerJoystick();
        }
    }

    handleTwoPlayerJoystick() {
        this.moveX = (this.index === 1) ? joyStick.val.x : -joyStick2.val.x;
        this.moveY = (this.index === 1) ? joyStick.val.y : -joyStick2.val.y;
        this.updateMovementFromJoystick();
    }

    handleSinglePlayerJoystick() {
        this.moveX = joyStick.val.x;
        this.moveY = joyStick.val.y;
        this.updateMovementFromJoystick();
    }
    updateMovementFromJoystick() {
        if (abs(this.moveX) > 0.1 || abs(this.moveY) > 0.1) {
            // Calculate angle from joystick x,y coordinates
            let angle = atan2(this.index === 1 ? -this.moveY : this.moveY, this.index === 1 ? this.moveX : -this.moveX);


            // Calculate speed based on joystick distance from center
            let joystickMagnitude = sqrt(this.moveX * this.moveX + this.moveY * this.moveY);
            // Clamp magnitude between 0 and 1
            joystickMagnitude = constrain(joystickMagnitude, 0, 1);

            this.tankSprite.rotation = angle * joystickMagnitude;


            // Scale speed by joystick magnitude
            this.tankSprite.direction = this.tankSprite.rotation;
            this.tankSprite.speed = this.spdFactor * joystickMagnitude;
            this.inMotion = true;
        } else {
            this.stopMovement();
        }
    }
}
