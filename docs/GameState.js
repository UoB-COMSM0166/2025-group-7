const CORNER_CELLS = [
    { col: 0, row: 0 },  // 左上
    { col: 9, row: 0 },  // 右上
    { col: 0, row: 3 },  // 左下
    { col: 9, row: 3 }   // 右下
];

let gui
let joyStick;
let joyStick2;
let shootButton;
let shootButton2;

function cellToXY(col, row) {
    const x = col * 90.5 + 272;
    const y = row * 105 + 54 + (col % 2 === 0 ? 0 : 52.5);
    return { x, y };
}

class GameState {
    static projectileList;
    tankList;
    pickupList;
    isGameOver;
    gameOverCnt;
    nextPickupSpawn;
    static CANVAS_WIDTH = 1360;
    static GRID_HEIGHT = 480;
    static GRID_WIDTH = 960;
    static LOWER_PANEL_HT = 200;
    static CANVAS_HEIGHT = GameState.GRID_HEIGHT + GameState.LOWER_PANEL_HT;
    gameMap;
    RAND1X = (GameState.twoPlayerMode) ? floor(random(5, 9)) : 5;
    RAND1Y = (GameState.twoPlayerMode) ? floor(random(0, 3)) : 1;
    RAND2X = floor(random(0, 4));
    RAND2Y = floor(random(0, 3));
    TANK1X = this.RAND1X * 90.5 + 272;
    TANK1Y = this.RAND1Y * 105 + 54 + (this.RAND1X % 2 == 0 ? 0 : 52.5);
    TANK2X = this.RAND2X * 90.5 + 272;
    TANK2Y = this.RAND2Y * 105 + 54 + (this.RAND2X % 2 == 0 ? 0 : 52.5);
    ANGLE1 = atan2(this.TANK2Y - this.TANK1Y, this.TANK2X - this.TANK1X);
    ANGLE2 = atan2(this.TANK1Y - this.TANK2Y, this.TANK1X - this.TANK2X);
    TANK1ROT = this.ANGLE1;
    TANK2ROT = this.ANGLE2;
    static HARD = 0;
    static EASY = 1;


    //initial values for the game settings
    static difficulty = GameState.EASY;
    static twoPlayerMode = true;
    static currentWinner;
    static currentWinnerScore;
    static currentLoserScore;

    static showMapGeneration = false;
    static doneMapGeneration = false;
    static themeColor = /*red, blue, green, white*/[[255, 0, 0], [0, 0, 255], [0, 255, 0], [255, 255, 255]];
    static themeColorIndex = 0;
    static menuMode = false;

    constructor() {
        this.isGameOver = false;
        this.gameOverCnt = 0;

        //create empty lists for projectiles and pickups
        GameState.projectileList = [];
        this.pickupList = [];

        //generate map
        this.gameMap = new Grid(GameState.GRID_HEIGHT, GameState.GRID_WIDTH);
        this.gameMap.initGrid();
        if (!GameState.showMapGeneration) {
            do {
                this.gameMap.generateMap();
            } while (this.gameMap.cellstack.length != 0);
            GameState.doneMapGeneration = true;
        }


        //create two tanks
        this.tankList = [];
        let tank1 = new Tank(this.TANK1X, this.TANK1Y, this.TANK1ROT, GameState.difficulty, 1, this);
        this.tankList.push(tank1);
        let tank2 = new Tank(this.TANK2X, this.TANK2Y, this.TANK2ROT, GameState.difficulty, 2, this);
        this.tankList.push(tank2);

        //variables for control of tank movement sound
        this.tankMoving = false;

        //create new KeyListener object for the first tank
        let keyListener1, keyListener2;
        keyListener1 = new KeyListener(this.tankList[0], true);

        //create KeyListener for second tank if two player mode is true 
        this.extraAIControllers = [];
        if (GameState.twoPlayerMode) {
            keyListener2 = new KeyListener(this.tankList[1], false);
        } else {
            keyListener2 = this.spawnAITanks();
        }

        //create two Player objects
        this.player1 = new Player(GameState.difficulty, true, keyListener1);
        this.player2 = new Player(GameState.difficulty, GameState.twoPlayerMode, keyListener2);

        //establishes initial time for first Pickup to spawn

        this.nextPickupSpawn = millis() + this.pickupSpawnInterval();

        //Create Gui insstance 
        gui = createGui();
        this.createGUIElements();
    }
    spawnAITanks() {
        for (let i = this.tankList.length - 1; i >= 1; i--) {
            this.tankList[i].tankSprite.wheels?.remove();
            this.tankList[i].tankSprite.remove();
            this.tankList.splice(i, 1);
        }
        this.extraAIControllers = [];
        let aiCtrlListner;

        // Calculate number of AI tanks based on round number (gameOverCnt)
        // Start with 1 tank, increase by 1 every round up to 4
        const numAITanks = min(4, max(1, this.gameOverCnt + 1));
        console.log(numAITanks);

        // Only spawn the calculated number of AI tanks
        for (let idx = 0; idx < numAITanks; idx++) {
            const cell = CORNER_CELLS[idx];
            const { x, y } = cellToXY(cell.col, cell.row);
            const rot = atan2(this.tankList[0].tankSprite.y - y, this.tankList[0].tankSprite.x - x);
            const aiTank = new Tank(x, y, rot, GameState.EASY, idx + 2, this);
            aiTank.spdFactor = 2;
            aiTank.counted = false;
            this.tankList.push(aiTank);

            const aiCtrl = new AIController(aiTank, this, this.tankList[0], GameState.EASY);
            this.extraAIControllers.push(aiCtrl);

            if (idx === 0) {
                aiCtrlListner = aiCtrl;
            }
        }

        return aiCtrlListner;
    }

    createGUIElements() {
        if (isTouchScreen) {
            const joystickStyle = {
                rounding: 100,
                fillBgActive: color(20, 20, 20, 20),
                strokeBg: color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20),
                handleRadius: 30,
            };

            const buttonStyle = {
                rounding: 100,
                fillBgActive: color(200, 200, 200, 50),
                fillLabelActive: color(200, 200, 200, 0),
                strokeBg: color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20),
            };

            if (!GameState.twoPlayerMode) {
                joyStick = createJoystick("Player1_JoyStick", 10, 250, 180, 180);
                joyStick.setStyle(joystickStyle);

                shootButton = createButton("Player1_Shoot", 1185, 265, 150, 150);
                shootButton.setStyle(buttonStyle);
            } else {
                joyStick = createJoystick("Player1_JoyStick", 1170, 425, 180, 180);
                joyStick.setStyle(joystickStyle);

                shootButton = createButton("Player1_Shoot", 1185, 100, 150, 150);
                shootButton.setStyle(buttonStyle);

                joyStick2 = createJoystick("Player2_JoyStick", 10, 100, 180, 180);
                joyStick2.setStyle(joystickStyle);

                shootButton2 = createButton("Player2_Shoot", 25, 425, 150, 150);
                shootButton2.setStyle(buttonStyle);
            }
        }
    }

    draw() {
        this.drawBackground();
        this.drawMap();
        if (GameState.showMapGeneration) {
            return;
        }
        this.drawGameObjects();
        this.drawHUD();
        this.drawMenu();
    }

    drawBackground() {
        background(10, 10, 15);
        noStroke();
        for (let r = 600; r > 0; r -= 10) {
            fill(40, 40, 40, map(r, 600, 0, 0, 20));  // medium grey, slightly more visible
            ellipse(width / 2, height / 2, r * 2);
        }
    }

    drawMap() {
        if (GameState.showMapGeneration) {
            this.gameMap.initMap();
        }
        this.gameMap.draw();
    }

    drawGameObjects() {
        this.drawProjectiles();
        this.drawTanks();
        this.drawPickups();
    }

    drawProjectiles() {
        for (let i = 0; i < GameState.projectileList.length; i++) {
            if (GameState.projectileList[i].sprite.visible) {
                GameState.projectileList[i].draw();
            }
        }
    }

    drawTanks() {
        for (let i = 0; i < this.tankList.length; i++) {
            this.tankList[i].draw();
        }
    }

    drawPickups() {
        for (let i = 0; i < this.pickupList.length; i++) {
            this.pickupList[i].draw();
        }
    }

    drawMenu() {
        if (gameMenu) {
            gameMenu.draw();
        }
        drawGui();
    }

    update() {
        if (GameState.menuMode) {
            allSprites.sleeping = true;
            return;
        }

        this.updateMap();
        if (GameState.showMapGeneration) {
            return;
        }

        this.updateTanks();
        this.updateProjectiles();
        this.updatePickups();
        this.updatePlayerInput();
        this.updateCollisions();
        this.checkGameOver();
    }

    updateMap() {
        this.gameMap.update();
    }

    updateTanks() {
        for (let i = 0; i < this.tankList.length; i++) {
            this.tankList[i].update();
        }
        this.controlTankSound();
    }

    updateProjectiles() {
        for (let i = 0; i < GameState.projectileList.length; i++) {
            if (GameState.projectileList[i].despawnTime < millis()) {
                GameState.projectileList[i].remove();
                GameState.projectileList.splice(i, 1);
            } else {
                GameState.projectileList[i].update();
            }
        }
        this.checkProjectileCollisions();
    }

    checkProjectileCollisions() {
        for (let projectile of GameState.projectileList) {
            if (!projectile.leftTurret) {
                if (projectile.sprite.overlapped(projectile.tank.tankSprite) ||
                    projectile.sprite.colliding(walls)) {
                    projectile.sprite.collides(projectile.tank.tankSprite);
                    projectile.sprite.collides(projectile.tank.tankSprite.wheels);
                    projectile.leftTurret = true;
                    if (projectile.sprite.overlapped(projectile.tank.tankSprite)) {
                        projectile.sprite.visible = true;
                    }
                }
            }
        }
    }

    updatePickups() {
        if (millis() > this.nextPickupSpawn) {
            this.spawnNewPickup();
        }
        for (let i = 0; i < this.pickupList.length; i++) {
            this.pickupList[i].update();
        }
    }

    spawnNewPickup() {
        if (this.pickupList.length < 5) {
            let newPickup = new Pickup(this.GRID_WIDTH, this.GRID_HEIGHT, this.pickupList, this.tankList);
            this.pickupList.push(newPickup);
        }
        this.nextPickupSpawn = millis() + this.pickupSpawnInterval();
    }

    updatePlayerInput() {
        this.player1.respondToPlayerInput();
        this.player2.respondToPlayerInput();
        for (const ai of this.extraAIControllers) {
            ai.update();
        }
    }

    updateCollisions() {
        this.checkProjectileTankOverlaps();
        this.checkPickupTankOverlaps();
        this.checkProjectileWallOverlaps();
        this.checkSawCollisions();
    }

    checkSawCollisions() {
        for (let i = 0; i < this.tankList.length; i++) {
            if (this.tankList[i].tankWeapon.weaponType == Weapon.SAW_TYPE) {
                this.checkSawTankOverlaps(this.tankList[i]);
            }
        }
    }

    checkGameOver() {
        if (!this.isGameOver) {
            if (GameState.twoPlayerMode) {
                this.checkTwoPlayerGameOver();
            } else {
                this.checkSinglePlayerGameOver();
            }
        }
        this.setCurrentWinner();
    }

    checkTwoPlayerGameOver() {
        for (let i = 0; i < this.tankList.length; i++) {
            if (this.tankList[i].getLife() <= 0) {
                (i === 0 ? this.player2 : this.player1).incScore();
                i == 0 ? audioP2Wins.play() : audioP1Wins.play();
                audioTankMovement.stop();
                this.endRound(this.tankList[i]);
                break;
            }
        }
    }

    checkSinglePlayerGameOver() {
        // Check AI tanks
        for (let i = 1; i < this.tankList.length; i++) {
            const t = this.tankList[i];
            if (t.getLife() <= 0 && !t.counted) {
                t.counted = true;
                const aiIndex = this.tankList.indexOf(t);
                if (aiIndex === 1 && this.tankList.length === 2) {
                    continue;
                }
                // Properly clean up tank sprites and wheels
                if (t.tankSprite) {
                    t.tankSprite.wheels?.remove();
                    t.tankSprite.remove();
                }
                // Clean up shield if present
                if (t.shieldSprite) {
                    t.shieldSprite.remove();
                }
                if (aiIndex > -1) {
                    this.tankList.splice(aiIndex, 1);
                    this.extraAIControllers.splice(aiIndex - 1, 1);
                }
            }
        }

        const playerDead = (this.tankList[0].getLife() <= 0);
        const aiAlive = this.tankList.slice(1).filter(t => t.getLife() > 0).length;

        if (playerDead) {
            this.player2.incScore();
            audioP2Wins.play();
            audioTankMovement.stop();
            this.endRound(this.tankList[0]);
        } else if (aiAlive === 0) {
            // Player won - increment score
            this.player1.incScore();
            audioP1Wins.play();
            audioTankMovement.stop();
            this.endRound(this.tankList[0]);
        }
    }

    endRound(deadTankSprite) {
        this.isGameOver = true;

        // 清理所有拾取
        while (this.pickupList.length) {
            this.pickupList[0].sprite.remove();
            this.pickupList.splice(0, 1);
        }
        this.nextPickupSpawn = millis() + this.pickupSpawnInterval();

        // 2 秒后重启，并在其中重新生成 AI
        this.restartGame(deadTankSprite);
    }


    addProjectile(newProjectile, tank) {
        newProjectile.tank = tank;
        newProjectile.sprite.overlaps(tank.tankSprite);
        newProjectile.sprite.overlaps(tank.tankSprite.wheels);
        GameState.projectileList.push(newProjectile);
    }

    getIsGameOver() {
        return this.isGameOver;
    }

    getGameOverCnt() {
        return this.gameOverCnt;
    }

    getGameComplete() {
        if (GameState.twoPlayerMode) {
            // Two player mode remains unchanged
            if (this.player1.getScore() === 3 || this.player2.getScore() === 3) {
                return true;
            }
        } else {
            // Single player mode - need 4 consecutive wins
            if (this.player1.getScore() === 4 || this.player2.getScore() === 1) {
                return true;
            }
        }
        return false;
    }

    setCurrentWinner() {
        if (this.player1.getScore() > this.player2.getScore()) {
            GameState.currentWinner = "Player 1";
            GameState.currentWinnerScore = this.player1.getScore().toString();
            GameState.currentLoserScore = this.player2.getScore().toString();
        }
        else if (this.player1.getScore() < this.player2.getScore()) {
            GameState.currentWinner = "Player 2";
            GameState.currentWinnerScore = this.player2.getScore().toString();
            GameState.currentLoserScore = this.player1.getScore().toString();
        }
        else {
            GameState.currentWinner = "Draw";
        }
    }

    pickupSpawnInterval() {
        //ten seconds - ie 5,000 milliseconds - plus a random number of milliseconds up to another 5s
        return 5000 + Math.floor(Math.random() * 5000) + (GameState.showMapGeneration ? 30000 : 0);
    }

    //restart game when tank dies
    restartGame(tankSprite) {
        tankSprite.destroy();
        // wait 2 seconds before restart
        setTimeout(() => {
            //get rid of all current projectiles
            while (GameState.projectileList.length > 0) {
                GameState.projectileList[0].remove();
                GameState.projectileList.splice(0);
            }
            //remove all saw sprites and shields
            for (let i = 0; i < this.tankList.length; i++) {
                if (this.tankList[i].tankWeapon.weaponType == Weapon.SAW_TYPE) {
                    this.tankList[i].saw.remove();
                }
                if (this.tankList[i].hasShield)
                    this.tankList[i].deactivateShield(false);
            }

            //only refresh map once
            if (this.isGameOver) {
                walls.removeAll();
                GameState.themeColorIndex = (GameState.themeColorIndex + 1) % GameState.themeColor.length;
                this.gameMap = new Grid(GameState.GRID_HEIGHT, GameState.GRID_WIDTH);
                this.gameMap.initGrid();
                do {
                    this.gameMap.generateMap();
                } while (this.gameMap.cellstack.length != 0);
            }
            for (let i = 0; i < this.tankList.length; i++) {
                //complete destroy method in tank class
                //change position refresh when tank spawn implemented
                //for now back to original positions
                this.regenerateTankPosition();
                this.tankList[i].numberOfRoundsRefresh();
                this.tankList[i].lifeRefresh();
                this.tankList[i].tankWeapon = new Weapon(Weapon.BULLET_TYPE);
            }

            //increment every time a game is won 
            this.gameOverCnt++;

            if (!GameState.twoPlayerMode) this.spawnAITanks();

            if (this.gameOverCnt >= maxGames) {
                //currently assumes one player always wins - ie odd number of rounds with always a clear winner
                if (GameState.currentWinner == "Player 1") {
                    audioP1MatchWin.play();
                } else audioP2MatchWin.play();
            }
            this.isGameOver = false;
        }, 2000);
    }

    checkProjectileTankOverlaps() {
        for (let i = 0; i < this.tankList.length; i++) {
            for (let j = 0; j < GameState.projectileList.length; j++) {
                if (GameState.projectileList[j].leftTurret) {
                    if (GameState.projectileList[j].sprite.collides(this.tankList[i].tankSprite) || GameState.projectileList[j].sprite.collides(this.tankList[i].tankSprite.wheels)) {

                        //first account for damage from projectile to tank
                        //only reduce tank lives if game still in play
                        if (!this.isGameOver) {
                            //each projectile has a "damage"
                            let damage = GameState.projectileList[j].damage;
                            this.tankList[i].receiveDamage(damage);
                            if (this.tankList[i].getLife() > 0) {
                                audioMediumHit.play();
                            }
                        }

                        //next remove the projectile
                        GameState.projectileList[j].remove();
                        GameState.projectileList.splice(j, 1);
                    }
                }
            }
        }
    }

    checkSawTankOverlaps(sawTank) {
        for (let i = 0; i < this.tankList.length; i++) {
            if (sawTank.saw.sawSprite.overlapping(this.tankList[i].tankSprite) || sawTank.saw.sawSprite.overlapping(this.tankList[i].tankSprite.wheels)) {
                if (this.tankList[i].tankSprite != sawTank.tankSprite) {
                    this.tankList[i].receiveDamage(sawTank.saw.damage);
                }
            }
        }
    }

    checkPickupTankOverlaps() {
        for (let i = 0; i < this.tankList.length; i++) {
            for (let j = 0; j < this.pickupList.length;) {
                if (this.pickupList[j].sprite.overlapping(this.tankList[i].tankSprite)) {
                    this.pickupList[j].sprite.remove();
                    if (this.pickupList[j].type == "HEALTH") {
                        this.tankList[i].lifeIncrement();
                        audioHealthPickup.play();
                    } else if (this.pickupList[j].type == "AMMO") {
                        // currently just resets ammo
                        this.tankList[i].tankWeapon.resetAmmo();
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "BOMB") {
                        // give tank the "bomb" weapon
                        this.removeSawIfNeeded(this.tankList[i]);
                        this.tankList[i].tankWeapon = new Weapon(Weapon.BOMB_TYPE);
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "SAW") {
                        if (this.tankList[i].tankWeapon.weaponType != Weapon.SAW_TYPE) {
                            this.tankList[i].saw = new Saw(this.tankList[i].tankSprite, this.tankList[i].index);
                        }
                        this.tankList[i].tankWeapon = new Weapon(Weapon.SAW_TYPE);
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "LASER") {
                        this.removeSawIfNeeded(this.tankList[i]);
                        this.tankList[i].tankWeapon = new Weapon(Weapon.LASER_TYPE);
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "MISSILE") {
                        this.removeSawIfNeeded(this.tankList[i]);
                        this.tankList[i].tankWeapon = new Weapon(Weapon.MISSILE_TYPE);
                    }
                    else if (this.pickupList[j].type == "SHIELD") {
                        this.tankList[i].activateShield();
                        audioShieldPickup.play();
                    }
                    this.pickupList.splice(j, 1);
                } else j++;
            }
        }
    }

    removeSawIfNeeded(tank) {
        if (tank.tankWeapon.weaponType == Weapon.SAW_TYPE) {
            tank.saw.remove();
        }
    }

    //for now - empty
    checkProjectileWallOverlaps() {
        for (let wall of walls) {
            for (let projectile of GameState.projectileList) {
                if (wall.collides(projectile.sprite)) {
                    audioProjectileBounce.play();
                    if (!wall.outerWall) {
                        let cell = wall.cell;
                        let wallName = wall.wallName;
                        if (cell) {
                            cell.wallState[wallName] = false;
                        }
                        wall.remove();
                    }
                }
            }
        }
    }

    controlTankSound() {
        if ((this.tankList[0].inMotion || this.tankList[1].inMotion)) {
            if (!this.tankMoving) {
                this.tankMoving = true;
                audioTankMovement.loop();
            }
        }
        else {
            if (this.tankMoving) {
                this.tankMoving = false;
                audioTankMovement.stop();
            }
        }
    }

    drawHUD() {

        strokeWeight(5);
        textFont(BatmanForeverAlt);
        textAlign(CENTER);

        let offsetY = GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2);
        let offsetX = GameState.CANVAS_WIDTH / 2;
        let separator = -60;

        // Draw glowing boxes around each tank HUD
        stroke(tank2Color);
        strokeWeight(1);
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color(tank2Color);
        rect(offsetX - 190 + separator, offsetY + 10, 490, 150, 20);
        drawingContext.shadowBlur = 15;
        drawingContext.shadowColor = color(tank1Color);
        stroke(tank1Color);
        rect(offsetX + 190 - separator, offsetY + 10, 490, 150, 20);
        drawingContext.shadowBlur = 0;

        //P1 weapon hex
        //stroke(this.tankList[1].tankSprite.color);
        stroke(tank2Color);
        beginShape();
        vertex((offsetX - 280) + separator, offsetY + 0);
        vertex((offsetX - 305) + separator, offsetY + 43.3);
        vertex((offsetX - 355) + separator, offsetY + 43.3);
        vertex((offsetX - 380) + separator, offsetY + 0);
        vertex((offsetX - 355) + separator, offsetY + -43.3);
        vertex((offsetX - 305) + separator, offsetY + -43.3);
        endShape(CLOSE);
        image(this.tankList[1].tankWeapon.icon, offsetX - 357 + separator, offsetY - 28.3, 55, 55);

        //P2 weapon hex
        //stroke(this.tankList[0].tankSprite.color);
        stroke(tank1Color);
        beginShape();
        vertex((offsetX + 280) - separator, offsetY + 0);
        vertex((offsetX + 305) - separator, offsetY + 43.3);
        vertex((offsetX + 355) - separator, offsetY + 43.3);
        vertex((offsetX + 380) - separator, offsetY + 0);
        vertex((offsetX + 355) - separator, offsetY + -43.3);
        vertex((offsetX + 305) - separator, offsetY + -43.3);
        endShape(CLOSE);
        image(this.tankList[0].tankWeapon.icon, offsetX + 303 - separator, offsetY - 28.3, 55, 55);

        offsetY -= 30;

        //P1 score hex
        //stroke(this.tankList[1].tankSprite.color);
        stroke(tank2Color);
        beginShape();
        vertex((offsetX - 375) + separator, offsetY + 0);
        vertex((offsetX - 387.5) + separator, offsetY + 21.65);
        vertex((offsetX - 412.5) + separator, offsetY + 21.65);
        vertex((offsetX - 425) + separator, offsetY + 0);
        vertex((offsetX - 412.5) + separator, offsetY + -21.65);
        vertex((offsetX - 387.5) + separator, offsetY + -21.65);
        endShape(CLOSE);
        //print score
        strokeWeight(0);
        //fill(this.tankList[1].tankSprite.color);
        fill(tank2Color);
        text(this.player2.getScore(), (offsetX - 400) + separator, offsetY - 12);
        strokeWeight(1);
        noFill();

        //P2 score hex
        //stroke(this.tankList[0].tankSprite.color);
        stroke(tank1Color);
        beginShape();
        vertex((offsetX + 375) - separator, offsetY + 0);
        vertex((offsetX + 387.5) - separator, offsetY + 21.65);
        vertex((offsetX + 412.5) - separator, offsetY + 21.65);
        vertex((offsetX + 425) - separator, offsetY + 0);
        vertex((offsetX + 412.5) - separator, offsetY + -21.65);
        vertex((offsetX + 387.5) - separator, offsetY + -21.65);
        endShape(CLOSE);
        //print score
        strokeWeight(0);
        //fill(this.tankList[0].tankSprite.color);
        fill(tank1Color);
        text(this.player1.getScore(), (offsetX + 400) - separator, offsetY - 12);
        strokeWeight(5);
        noFill();

        offsetY = GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2) - 5;
        textSize(20);

        //P1 life bar

        //bar outline
        //stroke(this.tankList[1].tankSprite.color);
        stroke(tank2Color);
        beginShape();
        vertex((offsetX - 270) + separator, offsetY + 0);
        vertex((offsetX - 282.5) + separator, offsetY + -21.65);
        vertex((offsetX - 82.5) + separator, offsetY + -21.65);
        vertex((offsetX - 70) + separator, offsetY + 0);
        endShape(CLOSE);

        //bar fill
        let fillLevel = (this.tankList[1].getLife() / this.tankList[1].initialLife) * 200;

        //fill(this.tankList[1].tankSprite.color);
        fill(tank2Color);
        beginShape();
        vertex((offsetX - 270) + separator, offsetY + 0);
        vertex((offsetX - 282.5) + separator, offsetY + -21.65);
        vertex((offsetX - 282.5) + separator + fillLevel, offsetY + -21.65);
        vertex((offsetX - 270) + separator + fillLevel, offsetY + 0);
        endShape(CLOSE);
        noFill();

        //describe health and ammo
        strokeWeight(0);
        //fill(this.tankList[1].tankSprite.color);
        fill(tank2Color);
        text("Health", (offsetX - 230) + separator, offsetY - 48);
        text("Ammo", (offsetX - 235) + separator, offsetY + 35);
        strokeWeight(5);
        noFill();

        //P2 life bar
        //bar outline
        //stroke(this.tankList[0].tankSprite.color);
        stroke(tank1Color);
        beginShape();
        vertex((offsetX + 270) - separator, offsetY + 0);
        vertex((offsetX + 282.5) - separator, offsetY + -21.65);
        vertex((offsetX + 82.5) - separator, offsetY + -21.65);
        vertex((offsetX + 70) - separator, offsetY + 0);
        endShape(CLOSE);

        //bar fill
        fillLevel = (this.tankList[0].getLife() / this.tankList[0].initialLife) * 200;

        //fill(this.tankList[0].tankSprite.color);
        fill(tank1Color);
        beginShape();
        vertex((offsetX + 270) - separator, offsetY + 0);
        vertex((offsetX + 282.5) - separator, offsetY + -21.65);
        vertex((offsetX + 282.5) - separator - fillLevel, offsetY + -21.65);
        vertex((offsetX + 270) - separator - fillLevel, offsetY + 0);
        endShape(CLOSE);
        noFill();

        //describe health and ammo
        strokeWeight(0);
        //fill(this.tankList[0].tankSprite.color);
        fill(tank1Color);
        text("Health", (offsetX + 230) - separator, offsetY - 48);
        text("Ammo", (offsetX + 235) - separator, offsetY + 35);
        strokeWeight(5);
        noFill();

        offsetY = GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2) + 5;
        strokeWeight(0);

        //P1 ammo
        //fill(this.tankList[1].tankSprite.color);
        fill(tank2Color);
        for (let i = 0; i < this.tankList[1].getAmmo(); i++) {
            beginShape();
            let xoffset = (20 * i);
            vertex((offsetX - 270) + separator + xoffset, offsetY + 0);
            vertex((offsetX - 282.5) + separator + xoffset, offsetY + 21.65);
            vertex((offsetX - 267.5) + separator + xoffset, offsetY + 21.65);
            vertex((offsetX - 255) + separator + xoffset, offsetY + 0);
            endShape(CLOSE);
        }

        //P2 ammo
        //fill(this.tankList[0].tankSprite.color);
        fill(tank1Color);
        for (let i = 0; i < this.tankList[0].getAmmo(); i++) {
            beginShape();
            let xoffset = (20 * i);
            vertex((offsetX + 270) - separator - xoffset, offsetY + 0);
            vertex((offsetX + 282.5) - separator - xoffset, offsetY + 21.65);
            vertex((offsetX + 267.5) - separator - xoffset, offsetY + 21.65);
            vertex((offsetX + 255) - separator - xoffset, offsetY + 0);
            endShape(CLOSE);
        }
        if (GameState.twoPlayerMode) {
            //Draw instructions for player 2
            fill(tank2Color);
            textSize(15);
            text("Player 2", offsetX - 10 + separator, offsetY - 60);
            noFill();
            strokeWeight(1);
            stroke(tank2Color);
            // make small boxes around each letter, one on top, under the text and three next to each other under the first box
            rect(offsetX - 10 + separator, offsetY - 20, 25, 25, 5);
            rect(offsetX - 40 + separator, offsetY + 10, 25, 25, 5);
            rect(offsetX - 10 + separator, offsetY + 10, 25, 25, 5);
            rect(offsetX + 20 + separator, offsetY + 10, 25, 25, 5);
            fill(tank2Color);
            text("W", offsetX - 10 + separator, offsetY - 27);
            text("A", offsetX - 40 + separator, offsetY + 2);
            text("S", offsetX - 10 + separator, offsetY + 2);
            text("D", offsetX + 20 + separator, offsetY + 2);
            noFill();
            rect(offsetX - 10 + separator, offsetY + 43, 25, 25, 5);
            fill(tank2Color);
            text("Q", offsetX - 10 + separator, offsetY + 36);
            text("Shoot", offsetX - 10 + separator, offsetY + 60);
        }
        //player 1 instructions are arrow keys
        fill(tank1Color);
        textSize(15);
        strokeWeight(1);
        stroke(tank1Color);
        text("Player 1", offsetX + 10 - separator, offsetY - 60);
        noFill();
        // make small boxes around each letter, one on top, under the text and three next to each other under the first box
        rect(offsetX + 10 - separator, offsetY - 20, 25, 25, 5);
        rect(offsetX + 40 - separator, offsetY + 10, 25, 25, 5);
        rect(offsetX + 10 - separator, offsetY + 10, 25, 25, 5);
        rect(offsetX - 20 - separator, offsetY + 10, 25, 25, 5);
        fill(tank1Color);
        textFont('Arial');
        text("⬆", offsetX + 10 - separator, offsetY - 27);
        text("➡", offsetX + 40 - separator, offsetY + 2);
        text("⬇", offsetX + 10 - separator, offsetY + 2);
        text("⬅", offsetX - 20 - separator, offsetY + 2);
        textFont(BatmanForeverAlt);
        noFill();
        rect(offsetX + 10 - separator, offsetY + 43, 110, 25, 5);
        fill(tank1Color);
        text("Spacebar", offsetX + 10 - separator, offsetY + 36);
        text("Shoot", offsetX + 10 - separator, offsetY + 60);

        //reset global drawing parameters
        fill('black');


    }

    regenerateTankPosition(tank) {
        if (GameState.twoPlayerMode) {
            // Generate random positions for two players
            this.RAND1X = floor(random(5, 9));
            this.RAND1Y = floor(random(0, 3));
            this.RAND2X = floor(random(0, 4));
            this.RAND2Y = floor(random(0, 3));

            // Calculate tank positions
            this.TANK1X = this.RAND1X * 90.5 + 272;
            this.TANK1Y = this.RAND1Y * 105 + 54 + (this.RAND1X % 2 == 0 ? 0 : 52.5);
            this.TANK2X = this.RAND2X * 90.5 + 272;
            this.TANK2Y = this.RAND2Y * 105 + 54 + (this.RAND2X % 2 == 0 ? 0 : 52.5);

            // Calculate angles between tanks
            this.TANK1ROT = atan2(this.TANK2Y - this.TANK1Y, this.TANK2X - this.TANK1X);
            this.TANK2ROT = atan2(this.TANK1Y - this.TANK2Y, this.TANK1X - this.TANK2X);

            // Update tank and wheel positions for both tanks
            this.updateTankPosition(this.tankList[0], this.TANK1X, this.TANK1Y, this.TANK1ROT);
            this.updateTankPosition(this.tankList[1], this.TANK2X, this.TANK2Y, this.TANK2ROT);

        } else {
            // Position player tank in center
            this.TANK1X = 4 * 90.5 + 272;
            this.TANK1Y = 2 * 105 + 54;
            this.updateTankPosition(this.tankList[0], this.TANK1X, this.TANK1Y, 0);

            // Position AI tanks in corners
            for (let i = 1; i < this.tankList.length; i++) {
                const cornerIndex = (i - 1) % CORNER_CELLS.length;
                const cell = CORNER_CELLS[cornerIndex];
                const { x, y } = cellToXY(cell.col, cell.row);

                const rot = atan2(this.tankList[0].tankSprite.y - y,
                    this.tankList[0].tankSprite.x - x);

                this.updateTankPosition(this.tankList[i], x, y, rot);
            }
        }
    }

    updateTankPosition(tank, x, y, rot) {
        tank.tankSprite.x = x;
        tank.tankSprite.y = y;
        tank.tankSprite.rotation = rot;
        tank.tankSprite.wheels.x = x;
        tank.tankSprite.wheels.y = y;
        tank.tankSprite.wheels.rotation = rot;
    }
    pathFinder(tank, opponentTank) {
        // find next cell to target
        let targetCell = this.gameMap.getCell(opponentTank.tankSprite.x, opponentTank.tankSprite.y);
        let currentCell = this.gameMap.getCell(tank.tankSprite.x, tank.tankSprite.y);
        let path = currentCell.findClosestPath(targetCell);
        if (path.length > 1) {
            // move tank to next cell
            let nextCell = path[1];
            let nextX = nextCell.centerX;
            let nextY = nextCell.centerY;
            return { x: nextX, y: nextY };
        } else {
            return { x: tank.tankSprite.x, y: tank.tankSprite.y };
        }
    }
}

function touchMoved() {
    // do some stuff
    return false;
}

