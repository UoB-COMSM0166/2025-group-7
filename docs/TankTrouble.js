//global declaration of GameState object
let tankGame;
let startingScreen;
let twoPlayerMode;
let setupStage;
let endOfGame;
let controllersImg;

//key codes for firing of tanks
let SPACE_CODE = 32;
let Q_CODE = 81;

let maxGames = 5;
let destroyAnimGreen = [];
let destroyAnimRed = [];

let isTouchScreen = hasTouchscreen();

function preload() {

    //audio file preloads
    audioBackground       = loadSound('audio/background.wav');
    audioBombExplode      = loadSound('audio/bombExplode.mp3');
    audioBombShot         = loadSound('audio/bombShot.mp3');
    audioBulletShot       = loadSound('audio/bulletShot.mp3');
    audioGenericPickup    = loadSound('audio/genericPickup.mp3');
    audioHealthPickup     = loadSound('audio/healthPickup.mp3');
    audioLaserShot        = loadSound('audio/laserShot.mp3');
    audioMediumHit        = loadSound('audio/mediumHit.mp3');
    audioP1MatchWin       = loadSound('audio/playerOneMatch.mp3');
    audioP2MatchWin       = loadSound('audio/playerTwoMatch.mp3');
    audioP1Wins           = loadSound('audio/playerOneWins.mp3');
    audioP2Wins           = loadSound('audio/playerTwoWins.mp3');
    audioProjectileBounce = loadSound('audio/projectileBounce.mp3');
    audioShieldPickup     = loadSound('audio/shieldPickup.mp3');
    audioTankDestroy      = loadSound('audio/tankDestroy.mp3');
    audioTankMovement     = loadSound('audio/tankMovement.wav');

    //image file preloads
    imgAmmoIcon     = loadImage('images/ammo-icon.webp');
    imgAmmoPickup   = loadImage('images/ammo-pickup.webp');
    imgBombIcon     = loadImage('images/bomb-icon.webp');
    imgBombPickup   = loadImage('images/bomb-pickup.webp');
    imgHealthIcon   = loadImage('images/health-icon.webp');
    imgHealthPickup = loadImage('images/health-pickup.webp');
    imgLaserIcon    = loadImage('images/laser-icon.webp');
    imgLaserPickup  = loadImage('images/laser-pickup.webp');
    imgSawIcon      = loadImage('images/saw-icon.webp');
    imgSawPickup    = loadImage('images/saw-pickup.webp');
    imgShieldPickup = loadImage('images/shield-pickup.webp');
    imgSpeedIcon    = loadImage('images/speed-icon.webp');
    imgSpeedPickup  = loadImage('images/speed-pickup.webp');
    imgMissileIcon  = loadImage('images/missile-icon.webp');
    imgMissilePickup= loadImage('images/missile-pickup.webp');
    imgTankGreen    = loadImage('images/tank-image-green.webp');
    imgTankRed      = loadImage('images/tank-image-red.webp');
    introImage      = loadImage('intro&endimages/introscreen-v2.png');
    endImage        = loadImage('intro&endimages/endscreenbg.png');
    controllersImg  = loadImage('Controllers.png');

    //destroy animation image preloads
    for(let i = 1; i <= 10; i++){
        animImage = loadImage(`destroyanim-green/${i}.png`);
        destroyAnimGreen.push(animImage);
    }
    for(let i = 1; i <= 10; i++){
        animImage = loadImage(`destroyanim-red/${i}.png`);
        destroyAnimRed.push(animImage);
    }

    //font preload
    VT323Font       = loadFont('fonts/VT323-Regular.ttf');
    QargeoFont      = loadFont('fonts/Qargeo-Regular.otf');
    BatmanForever   = loadFont('fonts/batmfo__.ttf');
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
    if(setupStage){
        startingScreen.draw();
    }
    else if(tankGame.getGameComplete()){
        endOfGame = true;
        gameEndScreen = new GameFinish(endImage, VT323Font);
        if(endOfGame){    
            gameEndScreen.draw();
        }
    }
    else{
        tankGame.draw();
        tankGame.update();
    }
}

function keyPressed() {
    
    //setup-stage control handling
    if(setupStage){
        //check whether user is ready to begin game
        if(keyCode === ENTER){
            tankGame = new GameState();
            audioBackground.loop();
            setupStage = false;
            //startingScreen can be garbage collected
            startingScreen = null;
        //otherwise run the usual key listening method
        }else{
            startingScreen.keyListening();
        }

    //in-game control handling
    }
    else if(endOfGame){
        if(keyCode === ENTER){
            for(let i = 0; i < allSprites.length; i++){
                i.remove();
                i = null;
            }
            //allSprites.remove();
            audioBackground.stop();
            endOfGame = false;
            this.setup();
            gameEndScreen = null;
        }
    }
    else{
        //detect if tank 1 (human player) has fired
        if ((keyCode === SPACE_CODE) && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
                if(tankGame.tankList[0].canFire()){
                    tankGame.addProjectile(tankGame.tankList[0].fire(), tankGame.tankList[0]);
                }
        }

        //if the game in two player mode, detect if tank 2 fired
        if(GameState.twoPlayerMode){
            if (keyCode === Q_CODE && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
                    if(tankGame.tankList[1].canFire()){    
                        tankGame.addProjectile(tankGame.tankList[1].fire(), tankGame.tankList[1]);
                    }
            }
        }
    }
}

function mousePressed() {
    if (setupStage) {
        startingScreen.mousePressed();
    } else if (endOfGame && keyCode === ENTER) {
        allSprites.remove();
        endOfGame = false;
        setup();
        gameEndScreen = null;
    } else if (!tankGame.getIsGameOver()) {
        if ((shootButton.isPressed) && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
            if(tankGame.tankList[0].canFire()){
                tankGame.addProjectile(tankGame.tankList[0].fire(), tankGame.tankList[0]);
            }
        }

        //if the game in two player mode, detect if tank 2 fired
        if(GameState.twoPlayerMode){
            if (shootButton2.isPressed && !tankGame.getIsGameOver() && !GameState.showMapGeneration) {
                if(tankGame.tankList[1].canFire()){    
                    tankGame.addProjectile(tankGame.tankList[1].fire(), tankGame.tankList[1]);
                }
            }
        }
    }
}

function hasTouchscreen() {
    return 'TouchEvent' in window ||
        (window.DocumentTouch && document instanceof window.DocumentTouch) ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0;
}
  

