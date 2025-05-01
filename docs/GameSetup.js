class GameSetup{

    //various params for layout of screen
    HEAD_TEXT = 75;
    REG_TEXT = 25;
    VERT_SP = 110;
    BELOW_TITLE = 230;
    HORZ1 = -100;
    HORZ2 = 50;
    HORZ3 = 300;
    HORZ4 = (this.HORZ2 + this.HORZ3)/2;

    //keeps track of which game setting user is on
    ON_MODE = 0;
    ON_DIFF = 1;
    ON_MAPGEN = 2;
    ON_START = 3;

    constructor(introImage, VT323Font){
        //start off on the one-vs-two player mode setting
        this.selector = this.ON_MODE;

        //create canvas
        let canvas = createCanvas(GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
        //displayMode('centered');
        canvas.style('display', 'flex');
        canvas.style('justify-content', 'center');
        canvas.style('align-items', 'center');
        canvas.style('width', '100%');
        canvas.style('height', '100%');
        canvas.style('position', 'absolute');
        canvas.style('max-width', '5000px');
        canvas.style('max-height', '2500px');
        // Define button areas for mouse interaction
        this.buttons = {
            mode: {
                onePlayer: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE, width: 200, height: this.REG_TEXT + 25 },
                twoPlayer: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE, width: 200, height: this.REG_TEXT + 25 }
            },
            diff: {
                easy: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE + this.VERT_SP, width: 100, height: this.REG_TEXT + 25 },
                hard: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE + this.VERT_SP, width: 100, height: this.REG_TEXT + 25 }
            },
            mapGen: {
                on: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP, width: 100, height: this.REG_TEXT + 25 },
                off: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP, width: 100, height: this.REG_TEXT + 25 }
            },
            start: { 
                x: GameState.CANVAS_WIDTH/2 + this.HORZ4, 
                y: this.BELOW_TITLE + this.ON_START*this.VERT_SP, 
                width: 500, 
                height: 100 
            }
        };

        this.tank1ColorPicker = createColorPicker(tank1Color);
        this.tank1ColorPicker.size(windowWidth/25, windowHeight/14);
        this.tank1ColorPicker.position(windowWidth - windowWidth/6, windowHeight/3 - windowHeight/20);
        this.tank2ColorPicker = createColorPicker(tank2Color);
        this.tank2ColorPicker.size(windowWidth/25, windowHeight/14);
        this.tank2ColorPicker.position(windowWidth - windowWidth/6, windowHeight/3+this.tank1ColorPicker.height - windowHeight/20);
    }

    draw(){
        background(introImage);

        tank1Color = this.tank1ColorPicker.color();
        tank2Color = this.tank2ColorPicker.color();

        //display the game title
        strokeWeight(0);
        textFont(BatmanForeverAlt);
        rectMode(CENTER);
        textSize(this.HEAD_TEXT);
        fill('#FFFFFF'); // changed
        text('HEX WARS', GameState.CANVAS_WIDTH/2 + this.HORZ4, 30);

        textFont(QargeoFont);

        //put in user selection box
        rectMode(CENTER);
        fill('#CCCCCC'); // changed
        rect(GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 500, 100);
        fill(55, 55, 55);
        rect(GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 490, 90);
        rect(GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 500, 50);
        rect(GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 400, 100);

        //put in mode selection
        fill('#CCCCCC'); // changed
        textSize(this.REG_TEXT);
        textAlign(RIGHT, TOP);
        //text('NUMBER OF PLAYERS:', GameState.CANVAS_WIDTH/2 + this.HORZ1, this.BELOW_TITLE);

        //put in difficulty selection
        textFont(BatmanForeverAlt);
        text('DIFFICULTY:', GameState.CANVAS_WIDTH/2 + this.HORZ1, this.BELOW_TITLE + this.VERT_SP);

        //put in Map Generation selection
        text('MAP GENERATION:', GameState.CANVAS_WIDTH/2 + this.HORZ1, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);

        //put in player mode boxes
        textAlign(CENTER, TOP);
        //rect(this.CANVAS_WIDTH/2 - 50, 225, 200, this.REG_TEXT);
        text('ONE PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE);
        text('TWO PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE);

        //put in difficulty boxes
        text('EASY', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.VERT_SP);
        text('HARD', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.VERT_SP);

        //put in map generation on/off
        text('ON', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);
        text('OFF', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);

        //put in "start game"
        textSize(1.5*this.REG_TEXT);
        text('START GAME', GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.ON_START*this.VERT_SP);
        textSize(this.REG_TEXT);

        //highlight player mode selection
        fill('#CCCCCC'); // changed
        if(!GameState.twoPlayerMode){
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.REG_TEXT/2, 200, this.REG_TEXT + 25);
            fill('black');
            text('ONE PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE);
            this.tank1ColorPicker.show();
            this.tank2ColorPicker.hide();
        }else{
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.REG_TEXT/2, 200, this.REG_TEXT + 25);
            fill('black');
            text('TWO PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE);
            this.tank1ColorPicker.show();
            this.tank2ColorPicker.show();
        }

        //highlight difficulty selection for player 1
        fill('#CCCCCC'); // changed
        if(GameState.difficulty === GameState.EASY){
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.VERT_SP + this.REG_TEXT/2, 100, this.REG_TEXT + 25);
            fill('black');
            text('EASY', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.VERT_SP);
        }else{
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.VERT_SP + this.REG_TEXT/2, 100, this.REG_TEXT + 25);
            fill('black');
            text('HARD', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.VERT_SP);
        }

        
        //highlight map generation selection
        fill('#CCCCCC'); // changed
        if(GameState.showMapGeneration){
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP + this.REG_TEXT/2, 100, this.REG_TEXT + 25);
            fill('black');
            text('ON', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);
        }
        else{
            rect(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP + this.REG_TEXT/2, 100, this.REG_TEXT + 25);
            fill('black');
            text('OFF', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);
        }

        //leave this back to default since it's used in drawing the tank sprites
        strokeWeight(1);
    }

    keyListening(){
        //move selector for game setting up and down
        if(keyCode === UP_ARROW && this.selector > this.ON_MODE){
            this.selector--;
        }else if(keyCode === DOWN_ARROW && this.selector < this.ON_START){
            this.selector++;
        }else if(keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW){
            //change appropriate settings
            if(this.selector === this.ON_MODE){
                GameState.twoPlayerMode = !GameState.twoPlayerMode;
            }else if(this.selector === this.ON_DIFF){
                GameState.difficulty = 1 - GameState.difficulty;
            }else if(this.selector === this.ON_MAPGEN){
                GameState.showMapGeneration = !GameState.showMapGeneration;
            }
        }
    }

    async mousePressed() {
        // Check if any button was clicked
        const mouseXVal = mouseX;
        const mouseYVal = mouseY;
        
        // Check mode selection
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.mode.onePlayer)) {
            GameState.twoPlayerMode = false;
            this.selector = this.ON_MODE;
            return;
        }
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.mode.twoPlayer)) {
            GameState.twoPlayerMode = true;
            this.selector = this.ON_MODE;
            return;
        }
        
        // Check for difficulty
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.diff.easy)) {
            GameState.difficulty = GameState.EASY;
            this.selector = this.ON_DIFF;
            return;
        }
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.diff.hard)) {
            GameState.difficulty = GameState.HARD;
            this.selector = this.ON_DIFF;
            return;
        }
        
        
        // Check map generation
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.mapGen.on)) {
            GameState.showMapGeneration = true;
            this.selector = this.ON_MAPGEN;
            return;
        }
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.mapGen.off)) {
            GameState.showMapGeneration = false;
            this.selector = this.ON_MAPGEN;
            return;
        }
        
        // Check start game button
        if (this.isMouseInButton(mouseXVal, mouseYVal, this.buttons.start)) {
            this.selector = this.ON_START;
            await delay(100);
            audioBackground.loop();
            this.startGame();
            
            return;
        }
    }

    isMouseInButton(mouseX, mouseY, button) {
        return mouseX > button.x - button.width/2 && 
               mouseX < button.x + button.width/2 && 
               mouseY > button.y - button.height/2 && 
               mouseY < button.y + button.height/2;
    }

    startGame() {
        tankGame = new GameState();
        gameMenu = new GameMenu();
        this.tank1ColorPicker.remove();
        this.tank2ColorPicker.remove();
        setupStage = false;
        startingScreen = null;
    }

}