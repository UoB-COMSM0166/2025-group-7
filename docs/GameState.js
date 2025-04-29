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

class GameState{
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
    RAND1X = (GameState.twoPlayerMode)? floor(random(5, 9)): 5; 
    RAND1Y = (GameState.twoPlayerMode)? floor(random(0, 3)): 1; 
    RAND2X = floor(random(0, 4));
    RAND2Y = floor(random(0, 3));
    TANK1X = this.RAND1X*90.5 + 272;
    TANK1Y = this.RAND1Y*105 + 54 + (this.RAND1X%2 == 0? 0 : 52.5);
    TANK2X = this.RAND2X*90.5 + 272;
    TANK2Y = this.RAND2Y*105 + 54 + (this.RAND2X%2 == 0? 0 : 52.5);
    ANGLE1 = atan2(this.TANK2Y - this.TANK1Y, this.TANK2X - this.TANK1X);
    ANGLE2 = atan2(this.TANK1Y - this.TANK2Y, this.TANK1X - this.TANK2X);
    TANK1ROT = this.ANGLE1;
    TANK2ROT = this.ANGLE2;
    static HARD = 0;
    static EASY = 1;


    //initial values for the game settings
    static player1Difficulty = GameState.EASY;
    static player2Difficulty = GameState.EASY;
    static twoPlayerMode = true;
    static currentWinner;

    static showMapGeneration = false;
    static doneMapGeneration = false;
    static themeColor = /*red, blue, green, white*/ [[255, 0, 0], [0, 0, 255], [0, 255, 0], [255, 255, 255]];
    static themeColorIndex = 0;

    
    constructor(){ 
        this.isGameOver = false;
        this.gameOverCnt = 0;
        
        //create empty lists for projectiles and pickups
        GameState.projectileList = [];
        this.pickupList = [];
        
        //generate map
        this.gameMap = new Grid(GameState.GRID_HEIGHT, GameState.GRID_WIDTH);
        this.gameMap.initGrid();
        if(!GameState.showMapGeneration){
            do{
                this.gameMap.generateMap();
            }while(this.gameMap.cellstack.length != 0);
            GameState.doneMapGeneration = true;
        }
        
        
        //create two tanks
        this.tankList = [];
        let tank1 = new Tank(this.TANK1X, this.TANK1Y, this.TANK1ROT, GameState.player1Difficulty, 1, this);
        this.tankList.push(tank1);
        let tank2 = new Tank(this.TANK2X, this.TANK2Y, this.TANK2ROT, GameState.player2Difficulty, 2, this);
        this.tankList.push(tank2);
        
        //variables for control of tank movement sound
        this.tankMoving = false;

        //create new KeyListener object for the first tank
        let keyListener1, keyListener2;
        keyListener1 = new KeyListener(this.tankList[0], true);

        //create KeyListener for second tank if two player mode is true 
        this.extraAIControllers = [];
        if(GameState.twoPlayerMode){
            keyListener2 = new KeyListener(this.tankList[1], false);
        } else {
            keyListener2 = this.spawnAITanks();
        }
        
        //create two Player objects
        this.player1 = new Player(GameState.player1Difficulty, true, keyListener1);
        this.player2 = new Player(GameState.player2Difficulty, GameState.twoPlayerMode, keyListener2);

        //establishes initial time for first Pickup to spawn
        
        this.nextPickupSpawn = millis() + this.pickupSpawnInterval();

        if(isTouchScreen && !GameState.twoPlayerMode){
                //Create Gui insstance
            gui = createGui();
            joyStick = createJoystick("Player1_JoyStick", 10, 250, 180, 180);

            //Create a joystick
            joyStick.setStyle({
                rounding: 100,
                fillBgActive: color(20, 20, 20, 20),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20),
                handleRadius: 30
            });

            //Create shoot button
            shootButton = createButton("Player1_Shoot", 1185, 265, 150, 150);

            shootButton.setStyle({
                rounding: 100,
                fillBgActive: color(200, 200, 200, 50),
                fillLabelActive: color(200, 200, 200, 0),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20)
            });
        } else if(isTouchScreen && GameState.twoPlayerMode){
            //Create Gui insstance
            gui = createGui();
            joyStick = createJoystick("Player1_JoyStick", 1170, 425, 180, 180);
            joyStick.setStyle({
                rounding: 100,
                fillBgActive: color(20, 20, 20, 20),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20),
                handleRadius: 30
            });

            shootButton = createButton("Player1_Shoot", 1185, 100, 150, 150);
            shootButton.setStyle({
                rounding: 100,
                fillBgActive: color(200, 200, 200, 50),
                fillLabelActive: color(200, 200, 200, 0),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20)
            });

            joyStick2 = createJoystick("Player2_JoyStick", 10, 100, 180, 180);
            joyStick2.setStyle({
                rounding: 100,
                fillBgActive: color(20, 20, 20, 20),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20),
                handleRadius: 30
            });
            shootButton2 = createButton("Player2_Shoot", 25, 425, 150, 150);
            shootButton2.setStyle({
                rounding: 100,
                fillBgActive: color(200, 200, 200, 50),
                fillLabelActive: color(200, 200, 200, 0),
                strokeBg:  color(255, 255, 255),
                strokeBgActive: color(255, 255, 255, 20)
            });
        }
    }
    spawnAITanks() {
        for (let i = this.tankList.length - 1; i >= 1; i--) {
            this.tankList[i].tankSprite.remove();
            this.tankList.splice(i, 1);
        }
        this.extraAIControllers = [];
        let aiCtrlListner;

        CORNER_CELLS.forEach((cell, idx) => {
            const { x, y } = cellToXY(cell.col, cell.row);
            const rot = atan2(this.tankList[0].tankSprite.y - y, this.tankList[0].tankSprite.x - x);
            const aiTank = new Tank(x, y, rot, GameState.player2Difficulty, idx + 2, this);
            aiTank.spdFactor = 2;
            aiTank.counted = false;
            this.tankList.push(aiTank);

            const aiCtrl = new AIController(aiTank, this, this.tankList[0], GameState.player2Difficulty);
            this.extraAIControllers.push(aiCtrl);

            if (idx === 0) {
                aiCtrlListner = aiCtrl;
            }
        });

        //establishes initial time for first Pickup to spawn
        return aiCtrlListner;

    }
    
    draw(){
        background(0);

        if(isTouchScreen){
            //Draw joystick
            drawGui();
        }
        
        //draw the map
        if(GameState.showMapGeneration){
            this.gameMap.initMap();
        }
        this.gameMap.draw();
        if(GameState.showMapGeneration){
            return;
        }
        
        //draw projectiles
        for(let i = 0; i < GameState.projectileList.length; i++){
            if(GameState.projectileList[i].sprite.visible){
                GameState.projectileList[i].draw();
            }
        } 

        
    
        //draw tanks
        for(let i = 0; i < this.tankList.length; i++){
                this.tankList[i].draw();
        }
        
        //draw pickups
        for(let i = 0; i < this.pickupList.length; i++){
            this.pickupList[i].draw();
        }

        

        //draw scores of players
        this.drawHUD();
    
    }
    
    update(){
        //update map
        this.gameMap.update();
        if(GameState.showMapGeneration){
            return;
        }
        
        //update tanks
        for(let i = 0; i < this.tankList.length; i++){
            this.tankList[i].update();
        }
        this.controlTankSound();
        
        //update projectiles
        for(let i = 0; i < GameState.projectileList.length; i++){
            if (GameState.projectileList[i].despawnTime < millis()) {
                GameState.projectileList[i].remove();
                GameState.projectileList.splice(i, 1);
            }
            else {
                GameState.projectileList[i].update();
            }
        } 

        //No collision until projectile leaves turret
        for(let projectile of GameState.projectileList){
            if(!projectile.leftTurret){
                if(projectile.sprite.overlapped(projectile.tank.tankSprite) ||
                    projectile.sprite.colliding(walls)){
                    projectile.sprite.collides(projectile.tank.tankSprite);
                    projectile.sprite.collides(projectile.tank.tankSprite.wheels);
                    projectile.leftTurret = true;
                    if(projectile.sprite.overlapped(projectile.tank.tankSprite)){
                        projectile.sprite.visible = true;
                    }
                    
                }
            }
        }
        
        //update pickups
        if(millis() > this.nextPickupSpawn){
            if (this.pickupList.length < 5){
                let newPickup = new Pickup(this.GRID_WIDTH, this.GRID_HEIGHT, this.pickupList, this.tankList);
                this.pickupList.push(newPickup);
            }
            this.nextPickupSpawn = millis() + this.pickupSpawnInterval();
        }         
        for(let i = 0; i < this.pickupList.length; i++){
            this.pickupList[i].update();
        }
    
        //update tank movements based on user key presses
        this.player1.respondToPlayerInput();
        this.player2.respondToPlayerInput();

        for (const ai of this.extraAIControllers) {
            ai.update();
        }
        
        //collision checks
        this.checkProjectileTankOverlaps();
        this.checkPickupTankOverlaps();
        this.checkProjectileWallOverlaps();

        for(let i = 0; i < this.tankList.length; i++){
            if(this.tankList[i].tankWeapon.weaponType == Weapon.SAW_TYPE){
                this.checkSawTankOverlaps(this.tankList[i]);
            }
        }    

        //restart game if tank life is less than or equal to 0
        if (!this.isGameOver) {

            if (GameState.twoPlayerMode) {
                // 原双人：谁先死谁输
                for (let i = 0; i < this.tankList.length; i++) {
                    if (this.tankList[i].getLife() <= 0) {
                        (i === 0 ? this.player2 : this.player1).incScore();
			i == 0 ? audioP2Wins.play() : audioP1Wins.play();
                        this.endRound(this.tankList[i]);
                        break;
                    }
                }
            } else { // ----- 单人模式 -----
                // 1. 玩家击毁 AI → 立即加分一次
                for (let i = 1; i < this.tankList.length; i++) {
                    const t = this.tankList[i];
                    if (t.getLife() <= 0 && !t.counted) {
                        t.counted = true;
                        const aiIndex = this.tankList.indexOf(t);
                        if(aiIndex === 1 && this.tankList.length === 2){
                            continue;
                        }
                        //t.destroy();

                        
                        // 如果 destroy() 里已 remove() sprite，这里再 remove 也无妨
                        t.tankSprite.remove?.();     // 可安全调用，可省略
                        
                        if (aiIndex > -1) {
                            this.tankList.splice(aiIndex, 1);
                            this.extraAIControllers.splice(aiIndex - 1, 1); // -1 因为列表第 0 位是玩家
                        }
                    }
                }

                const playerDead = (this.tankList[0].getLife() <= 0);
                const aiAlive = this.tankList.slice(1).filter(t => t.getLife() > 0).length;

                if (playerDead) {                       // 玩家败
                    this.player2.incScore();
                    this.endRound(this.tankList[0]);
                } else if (aiAlive === 0) {  
                    this.player1.incScore();           // 四角 AI 全灭 → 玩家胜
                    this.endRound(this.tankList[0]);
                }
            }
        }

        this.setCurrentWinner();
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

    
    addProjectile(newProjectile, tank){
        newProjectile.tank = tank;
        newProjectile.sprite.overlaps(tank.tankSprite);
        newProjectile.sprite.overlaps(tank.tankSprite.wheels);
        GameState.projectileList.push(newProjectile);
    }

    getIsGameOver(){
        return this.isGameOver;
    }

    getGameOverCnt(){
        return this.gameOverCnt;
    }

    getGameComplete(){
        if(this.player1.getScore() === 3 || this.player2.getScore() === 3){
            return true;
        }

        return false;
    }

    setCurrentWinner(){
        if(this.player1.getScore() > this.player2.getScore()) GameState.currentWinner = "Player 1";
        else if(this.player1.getScore() < this.player2.getScore()){
            GameState.currentWinner = "Player 2";
        }
        else{
            GameState.currentWinner = "Draw";
        }
    }

    pickupSpawnInterval(){
        //ten seconds - ie 5,000 milliseconds - plus a random number of milliseconds up to another 5s
        return 5000 + Math.floor(Math.random() * 5000) + (GameState.showMapGeneration? 30000 : 0);
    }

    //restart game when tank dies
    restartGame(tankSprite){
        tankSprite.destroy();
    // wait 2 seconds before restart
        setTimeout (() => {
            //get rid of all current projectiles
            while(GameState.projectileList.length > 0){
                GameState.projectileList[0].remove();
                GameState.projectileList.splice(0);
            }
            //remove all saw sprites and shields
            for(let i = 0; i < this.tankList.length; i++){
                if(this.tankList[i].tankWeapon.weaponType == Weapon.SAW_TYPE){
                    this.tankList[i].saw.remove();
                }
                if(this.tankList[i].hasShield)
                    this.tankList[i].deactivateShield(false);
            }

            //only refresh map once
            if(this.isGameOver){
                walls.remove();
                GameState.themeColorIndex = (GameState.themeColorIndex + 1) % GameState.themeColor.length;
                this.gameMap = new Grid(GameState.GRID_HEIGHT, GameState.GRID_WIDTH);
                this.gameMap.initGrid();
                do{
                    this.gameMap.generateMap();
                }while(this.gameMap.cellstack.length != 0);
            }
            for(let i = 0; i < this.tankList.length; i++){
                //complete destroy method in tank class
                //change position refresh when tank spawn implemented
                //for now back to original positions
                this.regenerateTankPosition();
                this.tankList[i].numberOfRoundsRefresh();
                this.tankList[i].lifeRefresh();
                this.tankList[i].tankWeapon = new Weapon(Weapon.BULLET_TYPE);
            }

            if (!GameState.twoPlayerMode) this.spawnAITanks();
            
            //increment every time a game is won 
            this.gameOverCnt++;
            if (this.gameOverCnt >= maxGames) {
                //currently assumes one player always wins - ie odd number of rounds with always a clear winner
                if (GameState.currentWinner == "Player 1") {
                    audioP1MatchWin.play();
                } else audioP2MatchWin.play();
            }
            this.isGameOver = false;
        }, 2000);
      
    }
    
    checkProjectileTankOverlaps(){
        for (let i = 0; i < this.tankList.length; i++) {
            for (let j = 0; j < GameState.projectileList.length; j++) {
                if(GameState.projectileList[j].leftTurret){
                    if (GameState.projectileList[j].sprite.collides(this.tankList[i].tankSprite) || GameState.projectileList[j].sprite.collides(this.tankList[i].tankSprite.wheels)){

                        //first account for damage from projectile to tank
                        //only reduce tank lives if game still in play
                        if(!this.isGameOver){
                            //each projectile has a "damage"
                            let damage = GameState.projectileList[j].damage;
                            this.tankList[i].receiveDamage(damage);
                            if (this.tankList[i].getLife() > 0){
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

    checkSawTankOverlaps(sawTank){
        for(let i = 0; i < this.tankList.length; i++){
            if(sawTank.saw.sawSprite.overlapping(this.tankList[i].tankSprite) || sawTank.saw.sawSprite.overlapping(this.tankList[i].tankSprite.wheels)){
                if(this.tankList[i].tankSprite != sawTank.tankSprite){
                    this.tankList[i].receiveDamage(sawTank.saw.damage);
                }
            }
        }
    }
    
    checkPickupTankOverlaps(){
        for (let i = 0; i < this.tankList.length; i++) {
            for (let j = 0; j < this.pickupList.length; ) {
                if (this.pickupList[j].sprite.overlapping(this.tankList[i].tankSprite)) {
                    this.pickupList[j].sprite.remove();
                    if (this.pickupList[j].type == "HEALTH") {
                        this.tankList[i].lifeIncrement();
                        audioHealthPickup.play();
                    } else if (this.pickupList[j].type == "AMMO"){
                        // currently just resets ammo
                        this.tankList[i].tankWeapon.resetAmmo();
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "BOMB"){
                        // give tank the "bomb" weapon
                        this.removeSawIfNeeded(this.tankList[i]);
                        this.tankList[i].tankWeapon = new Weapon(Weapon.BOMB_TYPE);
                        audioGenericPickup.play();
                    } else if (this.pickupList[j].type == "SAW"){
                        if(this.tankList[i].tankWeapon.weaponType != Weapon.SAW_TYPE){
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

    removeSawIfNeeded(tank){
        if(tank.tankWeapon.weaponType == Weapon.SAW_TYPE){
            tank.saw.remove();
        }
    }
    
    //for now - empty
    checkProjectileWallOverlaps(){
        for (let wall of walls){
            for (let projectile of GameState.projectileList){
                if (wall.collides(projectile.sprite)){
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

    controlTankSound(){
        if (this.tankList[0].inMotion || this.tankList[1].inMotion) {
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

    drawHUD(){

        strokeWeight(5);
        textFont(BatmanForeverAlt);
        textAlign(CENTER);

        let offsetY = GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2);
        let offsetX = GameState.CANVAS_WIDTH / 2;
        let separator = -35;

        //P1 weapon hex
        stroke(this.tankList[1].tankSprite.color);
        beginShape();
        vertex((offsetX - 280) + separator, offsetY + 0);
        vertex((offsetX - 305) + separator, offsetY + 43.3);
        vertex((offsetX - 355) + separator, offsetY + 43.3);
        vertex((offsetX - 380) + separator, offsetY + 0);
        vertex((offsetX - 355) + separator, offsetY + -43.3);
        vertex((offsetX - 305) + separator, offsetY + -43.3);
        endShape(CLOSE);
        image(this.tankList[1].tankWeapon.icon, offsetX - 392, offsetY - 28.3, 55, 55);

        //P2 weapon hex
        stroke(this.tankList[0].tankSprite.color);
        beginShape();
        vertex((offsetX + 280) - separator, offsetY + 0);
        vertex((offsetX + 305) - separator, offsetY + 43.3);
        vertex((offsetX + 355) - separator, offsetY + 43.3);
        vertex((offsetX + 380) - separator, offsetY + 0);
        vertex((offsetX + 355) - separator, offsetY + -43.3);
        vertex((offsetX + 305) - separator, offsetY + -43.3);
        endShape(CLOSE);
        image(this.tankList[0].tankWeapon.icon, offsetX + 337, offsetY - 28.3, 55, 55);

        offsetY -= 30;

        //P1 score hex
        stroke(this.tankList[1].tankSprite.color);
        beginShape();
        vertex((offsetX - 375) + separator,  offsetY + 0);
        vertex((offsetX - 387.5) + separator, offsetY + 21.65);
        vertex((offsetX - 412.5) + separator, offsetY + 21.65);
        vertex((offsetX - 425) + separator,   offsetY + 0);
        vertex((offsetX - 412.5) + separator, offsetY + -21.65);
        vertex((offsetX - 387.5) + separator, offsetY + -21.65);
        endShape(CLOSE);
        //print score
        strokeWeight(0);
        fill(this.tankList[1].tankSprite.color);
        text(this.player2.getScore(), (offsetX - 400) + separator, offsetY - 12);
        strokeWeight(5);
        fill('black');

        //P2 score hex
        stroke(this.tankList[0].tankSprite.color);
        beginShape();
        vertex((offsetX + 375) - separator,  offsetY + 0);
        vertex((offsetX + 387.5) - separator, offsetY + 21.65);
        vertex((offsetX + 412.5) - separator, offsetY + 21.65);
        vertex((offsetX + 425) - separator,   offsetY + 0);
        vertex((offsetX + 412.5) - separator, offsetY + -21.65);
        vertex((offsetX + 387.5) - separator, offsetY + -21.65);
        endShape(CLOSE);
        //print score
        strokeWeight(0);
        fill(this.tankList[0].tankSprite.color);
        text(this.player1.getScore(), (offsetX + 400) - separator, offsetY - 12);
        strokeWeight(5);
        fill('black');

        offsetY =  GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2) - 5;
        textSize(20);

        //P1 life bar
        
        //bar outline
        stroke(this.tankList[1].tankSprite.color);
        beginShape();
        vertex((offsetX - 270) + separator,   offsetY + 0);
        vertex((offsetX - 282.5) + separator, offsetY + -21.65);
        vertex((offsetX - 82.5) + separator, offsetY + -21.65);
        vertex((offsetX - 70) + separator,   offsetY + 0);
        endShape(CLOSE);

        //bar fill
        let fillLevel = (this.tankList[1].getLife() / this.tankList[1].initialLife) * 200; 

        fill(this.tankList[1].tankSprite.color);
        beginShape();
        vertex((offsetX - 270) + separator,   offsetY + 0);
        vertex((offsetX - 282.5) + separator, offsetY + -21.65);
        vertex((offsetX - 282.5) + separator + fillLevel, offsetY + -21.65);
        vertex((offsetX - 270) + separator + fillLevel, offsetY + 0);
        endShape(CLOSE);
        fill('black');

        //describe health and ammo
        strokeWeight(0);
        fill(this.tankList[1].tankSprite.color);
        text("Health", (offsetX - 230) + separator, offsetY - 48);
        text("Ammo", (offsetX - 235) + separator, offsetY + 35);
        strokeWeight(5);
        fill('black');

        //P2 life bar
        //bar outline
        stroke(this.tankList[0].tankSprite.color);
        beginShape();
        vertex((offsetX + 270) - separator,   offsetY + 0);
        vertex((offsetX + 282.5) - separator, offsetY + -21.65);
        vertex((offsetX + 82.5) - separator, offsetY + -21.65);
        vertex((offsetX + 70) - separator,   offsetY + 0);
        endShape(CLOSE);
        
        //bar fill
        fillLevel = (this.tankList[0].getLife() / this.tankList[0].initialLife) * 200; 

        fill(this.tankList[0].tankSprite.color);
        beginShape();
        vertex((offsetX + 270) - separator,   offsetY + 0);
        vertex((offsetX + 282.5) - separator, offsetY + -21.65);
        vertex((offsetX + 282.5) - separator - fillLevel, offsetY + -21.65);
        vertex((offsetX + 270) - separator - fillLevel,   offsetY + 0);
        endShape(CLOSE);
        fill('black');

        //describe health and ammo
        strokeWeight(0);
        fill(this.tankList[0].tankSprite.color);
        text("Health", (offsetX + 230) - separator, offsetY - 48);
        text("Ammo", (offsetX + 235) - separator, offsetY + 35);
        strokeWeight(5);
        fill('black');

        offsetY =  GameState.GRID_HEIGHT + (GameState.LOWER_PANEL_HT / 2) + 5;
        strokeWeight(0);

        //P1 ammo
        fill(this.tankList[1].tankSprite.color);
        for (let i = 0; i < this.tankList[1].getAmmo(); i++){
            beginShape();
            let xoffset = (20 * i);
            vertex((offsetX - 270) + separator + xoffset,   offsetY + 0);
            vertex((offsetX - 282.5) + separator + xoffset, offsetY + 21.65);
            vertex((offsetX - 267.5) + separator + xoffset, offsetY + 21.65);
            vertex((offsetX - 255) + separator + xoffset,   offsetY + 0);
            endShape(CLOSE);
        }

        //P2 ammo
        fill(this.tankList[0].tankSprite.color);
        for (let i = 0; i < this.tankList[0].getAmmo(); i++){
            beginShape();
            let xoffset = (20 * i);
            vertex((offsetX + 270) - separator - xoffset,   offsetY + 0);
            vertex((offsetX + 282.5) - separator - xoffset, offsetY + 21.65);
            vertex((offsetX + 267.5) - separator - xoffset, offsetY + 21.65);
            vertex((offsetX + 255) - separator - xoffset,   offsetY + 0);
            endShape(CLOSE);
        }

        //reset global drawing parameters
        fill('black');
        
        // Display controller instructions at the bottom
        if (controllersTwoPlayersImg && GameState.twoPlayerMode) {
            const imgWidth = 200; // Adjust as needed
            const imgHeight = 200; // Adjust as needed
            const imgX = offsetX - imgWidth / 2;
            const imgY = GameState.GRID_HEIGHT + GameState.LOWER_PANEL_HT - imgHeight - 10;
            
            image(controllersTwoPlayersImg, imgX, imgY, imgWidth, imgHeight);
            
        } else if (controllersOnePlayerImg && !GameState.twoPlayerMode) {
            const imgWidth = 100; // Adjust as needed
            const imgHeight = 200; // Adjust as needed
            const imgX = offsetX - imgWidth / 2;
            const imgY = GameState.GRID_HEIGHT + GameState.LOWER_PANEL_HT - imgHeight - 10;
            image(controllersOnePlayerImg, imgX, imgY, imgWidth, imgHeight);
        }

        
    }

    regenerateTankPosition(tank){
        if (GameState.twoPlayerMode) {
            // Original two-player positioning logic
            this.RAND1X = floor(random(5, 9)); 
            this.RAND1Y = floor(random(0, 3)); 
            this.RAND2X = floor(random(0, 4));
            this.RAND2Y = floor(random(0, 3));
            this.TANK1X = this.RAND1X*90.5 + 272;
            this.TANK1Y = this.RAND1Y*105 + 54 + (this.RAND1X%2 == 0? 0 : 52.5);
            this.TANK2X = this.RAND2X*90.5 + 272;
            this.TANK2Y = this.RAND2Y*105 + 54 + (this.RAND2X%2 == 0? 0 : 52.5);
            this.ANGLE1 = atan2(this.TANK2Y - this.TANK1Y, this.TANK2X - this.TANK1X);
            this.ANGLE2 = atan2(this.TANK1Y - this.TANK2Y, this.TANK1X - this.TANK2X);
            this.TANK1ROT = this.ANGLE1;
            this.TANK2ROT = this.ANGLE2;
            
            // Update tank positions
            this.tankList[0].tankSprite.x = this.TANK1X;
            this.tankList[0].tankSprite.y = this.TANK1Y;
            this.tankList[0].tankSprite.rotation = this.TANK1ROT;
            this.tankList[1].tankSprite.x = this.TANK2X;
            this.tankList[1].tankSprite.y = this.TANK2Y;
            this.tankList[1].tankSprite.rotation = this.TANK2ROT;
            
            // Update wheel positions
            this.tankList[0].tankSprite.wheels.x = this.TANK1X;
            this.tankList[0].tankSprite.wheels.y = this.TANK1Y;
            this.tankList[0].tankSprite.wheels.rotation = this.TANK1ROT;
            this.tankList[1].tankSprite.wheels.x = this.TANK2X;
            this.tankList[1].tankSprite.wheels.y = this.TANK2Y;
            this.tankList[1].tankSprite.wheels.rotation = this.TANK2ROT;
        } else {
            // Single-player mode
            // Position player tank randomly
            this.RAND1X = 4;
            this.RAND1Y = 2;
            this.TANK1X = this.RAND1X*90.5 + 272;
            this.TANK1Y = this.RAND1Y*105 + 54 + (this.RAND1X%2 == 0? 0 : 52.5);
            
            // Update player tank position
            this.tankList[0].tankSprite.x = this.TANK1X;
            this.tankList[0].tankSprite.y = this.TANK1Y;
            this.tankList[0].tankSprite.wheels.x = this.TANK1X;
            this.tankList[0].tankSprite.wheels.y = this.TANK1Y;
            
            // Position AI tanks in corners
            for (let i = 1; i < this.tankList.length; i++) {
                const cornerIndex = (i - 1) % CORNER_CELLS.length;
                const cell = CORNER_CELLS[cornerIndex];
                const { x, y } = cellToXY(cell.col, cell.row);
                
                // Calculate rotation to face player
                const rot = atan2(this.tankList[0].tankSprite.y - y, this.tankList[0].tankSprite.x - x);
                
                // Update AI tank position
                this.tankList[i].tankSprite.x = x;
                this.tankList[i].tankSprite.y = y;
                this.tankList[i].tankSprite.rotation = rot;
                this.tankList[i].tankSprite.wheels.x = x;
                this.tankList[i].tankSprite.wheels.y = y;
                this.tankList[i].tankSprite.wheels.rotation = rot;
            }
        }
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