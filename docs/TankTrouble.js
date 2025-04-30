//global declaration of GameState object
let tankGame;
let gameMenu;
let startingScreen;
let twoPlayerMode;
let setupStage;
let endOfGame;
let controllersImg;
let gameEndScreen;

//key codes for firing of tanks
let SPACE_CODE = 32;
let Q_CODE = 81;

let maxGames = 5;
let destroyAnimGreen = [];
let destroyAnimRed = [];

let isTouchScreen = hasTouchscreen();

function preload() {

    //audio file preloads
    audioBackground = loadSound('audio/background.wav');
    audioBombExplode = loadSound('audio/bombExplode.mp3');
    audioBombShot = loadSound('audio/bombShot.mp3');
    audioBulletShot = loadSound('audio/bulletShot.mp3');
    audioGenericPickup = loadSound('audio/genericPickup.mp3');
    audioHealthPickup = loadSound('audio/healthPickup.mp3');
    audioLaserShot = loadSound('audio/laserShot.mp3');
    audioMediumHit = loadSound('audio/mediumHit.mp3');
    audioP1MatchWin = loadSound('audio/playerOneMatch.mp3');
    audioP2MatchWin = loadSound('audio/playerTwoMatch.mp3');
    audioP1Wins = loadSound('audio/playerOneWins.mp3');
    audioP2Wins = loadSound('audio/playerTwoWins.mp3');
    audioProjectileBounce = loadSound('audio/projectileBounce.mp3');
    audioShieldPickup = loadSound('audio/shieldPickup.mp3');
    audioTankDestroy = loadSound('audio/tankDestroy.mp3');
    audioTankMovement = loadSound('audio/tankMovement.wav');

    //image file preloads
    imgAmmoIcon = loadImage('images/ammo-icon.webp');
    imgAmmoPickup = loadImage('images/ammo-pickup.webp');
    imgBombIcon = loadImage('images/bomb-icon.webp');
    imgBombPickup = loadImage('images/bomb-pickup.webp');
    imgHealthIcon = loadImage('images/health-icon.webp');
    imgHealthPickup = loadImage('images/health-pickup.webp');
    imgLaserIcon = loadImage('images/laser-icon.webp');
    imgLaserPickup = loadImage('images/laser-pickup.webp');
    imgSawIcon = loadImage('images/saw-icon.webp');
    imgSawPickup = loadImage('images/saw-pickup.webp');
    imgShieldPickup = loadImage('images/shield-pickup.webp');
    imgSpeedIcon = loadImage('images/speed-icon.webp');
    imgSpeedPickup = loadImage('images/speed-pickup.webp');
    imgMissileIcon = loadImage('images/missile-icon.webp');
    imgMissilePickup = loadImage('images/missile-pickup.webp');
    imgTankGreen = loadImage('images/tank-image-green.webp');
    imgTankRed = loadImage('images/tank-image-red.webp');
    introImage = loadImage('intro&endimages/introscreen-v2.png');
    endImage = loadImage('intro&endimages/endscreenbg.png');
    controllersTwoPlayersImg = loadImage('images/ControllersTwoPlayer.png');
    controllersOnePlayerImg = loadImage('images/ControllerSinglePlayer.png');

    //destroy animation image preloads
    for (let i = 1; i <= 10; i++) {
        animImage = loadImage(`destroyanim-green/${i}.png`);
        destroyAnimGreen.push(animImage);
    }
    for (let i = 1; i <= 10; i++) {
        animImage = loadImage(`destroyanim-red/${i}.png`);
        destroyAnimRed.push(animImage);
    }

    //font preload
    VT323Font = loadFont('fonts/VT323-Regular.ttf');
    QargeoFont = loadFont('fonts/Qargeo-Regular.otf');
    BatmanForever = loadFont('fonts/batmfo__.ttf');
    BatmanForeverAlt = loadFont('fonts/batmfa__.ttf');
}

function setup() {
    //standardise frame rate to ensure animations and speed consistent
    //accross different machines
    frameRate(30);
    setupStage = true;
    startingScreen = new GameSetup(introImage, VT323Font);
}

function draw() {
    if (setupStage) {
        startingScreen.draw();
    }
    else if (tankGame.getGameComplete()) {
        endOfGame = true; 
        gameEndScreen = new GameFinish(endImage, VT323Font);
        if (endOfGame) {
            gameEndScreen.draw();
        }
    }
    else {
        tankGame.draw();
        tankGame.update();
    }
}

function keyPressed() {

    //setup-stage control handling
    if (setupStage) {
        //check whether user is ready to begin game
        if (keyCode === ENTER) {
            tankGame = new GameState();
            gameMenu = new GameMenu();
            audioBackground.loop();
            setupStage = false;
            //startingScreen can be garbage collected
            startingScreen = null;
            //otherwise run the usual key listening method
        } else {
            startingScreen.keyListening();
        }

        //in-game control handling
    }
    else if (endOfGame) {
        if (keyCode === ENTER) {
            resetGame();
            allSprites.removeAll();
            audioBackground.stop();
            endOfGame = false;
            this.setup();
            gameEndScreen = null;
        }
    }
    else if (!GameState.menuMode) {
        //detect if tank 1 (human player) has fired
        if ((keyCode === SPACE_CODE) && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
            if (tankGame.tankList[0].canFire()) {
                tankGame.addProjectile(tankGame.tankList[0].fire(), tankGame.tankList[0]);
            }
        }

        //if the game in two player mode, detect if tank 2 fired
        if (GameState.twoPlayerMode) {
            if (keyCode === Q_CODE && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
                if (tankGame.tankList[1].canFire()) {
                    tankGame.addProjectile(tankGame.tankList[1].fire(), tankGame.tankList[1]);
                }
            }
        }
    }
}

function mousePressed() {
    if (setupStage) {
        startingScreen.mousePressed();
    } else if (endOfGame && gameEndScreen.isButtonPressed()) {
        resetGame();
        allSprites.removeAll();
        endOfGame = false;
        setup();
        gameEndScreen = null;
    } else if (!tankGame.getIsGameOver()) {
        if (isTouchScreen && !GameState.menuMode) {
            if ((shootButton.isPressed) && !GameState.showMapGeneration) {
                if (tankGame.tankList[0].canFire()) {
                    tankGame.addProjectile(tankGame.tankList[0].fire(), tankGame.tankList[0]);
                }
            }

            //if the game in two player mode, detect if tank 2 fired
            if (GameState.twoPlayerMode) {
                if (shootButton2.isPressed && !GameState.showMapGeneration) {
                    if (tankGame.tankList[1].canFire()) {
                        tankGame.addProjectile(tankGame.tankList[1].fire(), tankGame.tankList[1]);
                    }
                }
            }
        }

        //Menu button
        if (menuButton.isPressed) {
            tankGame.tankMoving = false;
            audioTankMovement.stop();
            GameState.menuMode = true;
        }
        if (gameMenu.resumeButton.isPressed) {
            GameState.menuMode = false;
            allSprites.sleeping = false;
        }
        if (gameMenu.restartButton.isPressed) {
            gameMenu.restartGame();
        }
        if (gameMenu.quitButton.isPressed) {
            gameMenu.quitToMenu();
        }
    }
}

function hasTouchscreen() {
    return 'TouchEvent' in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch) ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
}


function resetGame() {
    // Stop all sounds
    audioBackground.stop();
    audioBombExplode.stop();
    audioBombShot.stop();
    audioBulletShot.stop();
    audioGenericPickup.stop();
    audioHealthPickup.stop();
    audioLaserShot.stop();
    audioMediumHit.stop();
    audioP1MatchWin.stop();
    audioP2MatchWin.stop();
    audioP1Wins.stop();
    audioP2Wins.stop();
    audioProjectileBounce.stop();
    audioShieldPickup.stop();
    audioTankDestroy.stop();
    audioTankMovement.stop();

    // Reset game state
    GameState.projectileList = [];

    // Reset tanks
    for (let i = 0; i < tankGame.tankList.length; i++) {
        const tank = tankGame.tankList[i];
        tank.lifeRefresh();
        tank.tankWeapon = new Weapon(Weapon.BULLET_TYPE);
        tank.positionRefresh(); // Reset tank positions
        tank.tankSprite.speed = 0; // Stop any movement
        tankGame.regenerateTankPosition(tank);

        //remove saws if present
        if (tank.tankWeapon.weaponType == Weapon.SAW_TYPE) {
            tank.saw.remove();
        }
        // Deactivate shield if active
        if (tank.hasShield) {
            tank.deactivateShield(false);
        }

        tank.isDestroyed = false;

    }

    // Reset the map
    walls.removeAll();
    GameState.themeColorIndex = 0;
    tankGame.gameMap = new Grid(GameState.GRID_HEIGHT, GameState.GRID_WIDTH);
    tankGame.gameMap.initGrid();
    do {
        tankGame.gameMap.generateMap();
    } while (tankGame.gameMap.cellstack.length != 0);
    // Reset extra AI tanks for single player mode
    if (!GameState.twoPlayerMode) {
        tankGame.spawnAITanks();
    }

    // Reset scores and game over state
    tankGame.player1.score = 0;
    tankGame.player2.score = 0;
    tankGame.isGameOver = false;
    tankGame.gameOverCnt = 0;
    tankGame.nextPickupSpawn = millis() + tankGame.pickupSpawnInterval();

    //remove all current pickups
    while (tankGame.pickupList.length > 0) {
        tankGame.pickupList[0].sprite.remove();
        tankGame.pickupList.splice(0);
    }
}