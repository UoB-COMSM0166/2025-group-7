class GameSetup{

    //various params for layout of screen
    HEAD_TEXT = 75;
    REG_TEXT = 20;
    VERT_SP = 120;
    BELOW_TITLE = 230;
    HORZ1 = -100;
    HORZ2 = -120;
    HORZ3 = 120;
    HORZ4 = (this.HORZ2 + this.HORZ3)/2;

    //keeps track of which game setting user is on
    ON_MODE = 0;
    ON_DIFF = 1;
    ON_MAPGEN = 2;
    ON_START = 3;

    // Add these properties to the class
    lastMouseX = null;
    lastMouseY = null;

    constructor(introImage, VT323Font){
        //start off on the one-vs-two player mode setting
        this.selector = this.ON_MODE;

        //create canvas
        this.canvas = createCanvas(GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
        displayMode('maxed');
        // Define button areas for mouse interaction
        this.buttons = {
            mode: {
                onePlayer: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE, width: 200, height: this.REG_TEXT + 25 },
                twoPlayer: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE, width: 200, height: this.REG_TEXT + 25 }
            },
            diff: {
                easy: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE + this.VERT_SP, width: 220, height: this.REG_TEXT + 25 },
                hard: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE + this.VERT_SP, width: 220, height: this.REG_TEXT + 25 }
            },
            mapGen: {
                on: { x: GameState.CANVAS_WIDTH/2 + this.HORZ2, y: this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP, width: 220, height: this.REG_TEXT + 25 },
                off: { x: GameState.CANVAS_WIDTH/2 + this.HORZ3, y: this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP, width: 220, height: this.REG_TEXT + 25 }
            },
            start: { 
                x: GameState.CANVAS_WIDTH/2 + this.HORZ4, 
                y: this.BELOW_TITLE + this.ON_START*this.VERT_SP, 
                width: 500, 
                height: 100 
            }
        };
        
        this.tank1ColorPicker = createColorPicker(tank1Color);
        this.tank1ColorPicker.size(this.canvas.size().width/25, this.canvas.size().height/14);
        this.tank1ColorPicker.position(this.canvas.position().x + this.canvas.size().width - this.canvas.size().width/3.5, this.canvas.position().y + this.canvas.size().height/3.5);
        this.tank2ColorPicker = createColorPicker(tank2Color);
        this.tank2ColorPicker.size(this.canvas.size().width/25, this.canvas.size().height/14);
        this.tank2ColorPicker.position(this.canvas.position().x + this.canvas.size().width - this.canvas.size().width/3.5, this.canvas.position().y + this.canvas.size().height/3.5 + this.tank1ColorPicker.size().height);
    }

    draw(){
        background(introImage);

        tank1Color = this.tank1ColorPicker.color();
        if(!GameState.twoPlayerMode){
            this.tank2ColorPicker.value('#E9AB17');
        }
        tank2Color = this.tank2ColorPicker.color();

        //add rect behind all text and their respective boxes. make it white with full opacity
        strokeWeight(0);
        drawingContext.shadowBlur = 30;
        drawingContext.shadowColor = color(10,10,10);
        fill(color(0,0,0,120));
        const boxX = GameState.CANVAS_WIDTH/2;
        const boxY = this.BELOW_TITLE + 165;
        const boxWidth = 550;
        const boxHeight = 500;
        rect(boxX, boxY, boxWidth, boxHeight, 10);
        rect(GameState.CANVAS_WIDTH/2, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 500, 80, 10);
        drawingContext.shadowBlur = 0;

        // Track mouse movement
        let mouseMoved = false;
        if (this.lastMouseX !== null && this.lastMouseY !== null) {
            mouseMoved = (mouseX !== this.lastMouseX || mouseY !== this.lastMouseY);
        }
        this.lastMouseX = mouseX;
        this.lastMouseY = mouseY;

        // Check mouse hover for selector position only if inside the box and mouse moved
        const mouseXVal = mouseX;
        const mouseYVal = mouseY;
        const isMouseInBox = mouseXVal > boxX - boxWidth/2 && 
                           mouseXVal < boxX + boxWidth/2 && 
                           mouseYVal > boxY - boxHeight/2 && 
                           mouseYVal < boxY + boxHeight/2;

        if (isMouseInBox && mouseMoved) {
            const buttonYPositions = [
                this.BELOW_TITLE,
                this.BELOW_TITLE + this.VERT_SP,
                this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP,
                this.BELOW_TITLE + this.ON_START*this.VERT_SP
            ];

            // Find the closest button to mouse Y position
            let closestIndex = 0;
            let minDistance = Infinity;
            for (let i = 0; i < buttonYPositions.length; i++) {
                const distance = Math.abs(mouseYVal - buttonYPositions[i]);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestIndex = i;
                }
            }

            // Update selector if mouse is within reasonable distance
            if (minDistance < 50) {
                this.selector = closestIndex;
            }
        }

        //display the game title
        strokeWeight(0);
        textFont(BatmanForeverAlt);
        rectMode(CENTER);

        //put in game mode text
        drawingContext.shadowBlur = 5;
        drawingContext.shadowColor = color(41,193,244);
        fill(color(41,193,244));
        text('GAME MODE', GameState.CANVAS_WIDTH/2, this.BELOW_TITLE - 60);

        //put in difficulty selection
        textFont(BatmanForeverAlt);
        text('DIFFICULTY', GameState.CANVAS_WIDTH/2, this.BELOW_TITLE - 60 + this.VERT_SP);

        //put in Map Generation selection
        text('MAP GENERATION', GameState.CANVAS_WIDTH/2, this.BELOW_TITLE - 60 + this.ON_MAPGEN*this.VERT_SP);

        //put in user selection box with glowing effect
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2, this.BELOW_TITLE + this.selector*this.VERT_SP + this.REG_TEXT/2, 500, 80, '#CCCCCC', '#FFFFFF');

        //put in mode selection
        strokeWeight(2);
        stroke(!GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));
        fill(!GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));

        //put in player mode boxes with glowing effect
        textAlign(CENTER);
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.REG_TEXT/2, 220, this.REG_TEXT + 25, !GameState.twoPlayerMode ? '#CCCCCC' : '#333333', '#FFFFFF');
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.REG_TEXT/2, 220, this.REG_TEXT + 25, GameState.twoPlayerMode ? '#CCCCCC' : '#333333', '#FFFFFF');
        stroke(!GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));
        fill(!GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));
        text('ONE PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE);
        stroke(GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));
        fill(GameState.twoPlayerMode ? color(219, 51, 105) : color(41,193,244));
        text('TWO PLAYER', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE);

        //put in difficulty boxes with glowing effect
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.VERT_SP + this.REG_TEXT/2, 220, this.REG_TEXT + 25, GameState.difficulty === GameState.EASY ? '#CCCCCC' : '#333333', '#FFFFFF');
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.VERT_SP + this.REG_TEXT/2, 220, this.REG_TEXT + 25, GameState.difficulty === GameState.HARD ? '#CCCCCC' : '#333333', '#FFFFFF');
        stroke(GameState.difficulty === GameState.EASY ? color(219, 51, 105) : color(41,193,244));
        fill(GameState.difficulty === GameState.EASY ? color(219, 51, 105) : color(41,193,244));
        text('EASY', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.VERT_SP);
        stroke(GameState.difficulty === GameState.HARD ? color(219, 51, 105) : color(41,193,244));
        fill(GameState.difficulty === GameState.HARD ? color(219, 51, 105) : color(41,193,244));
        text('HARD', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.VERT_SP);

        //put in map generation on/off with glowing effect
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP + this.REG_TEXT/2, 220, this.REG_TEXT + 25, GameState.showMapGeneration ? '#CCCCCC' : '#333333', '#FFFFFF');
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP + this.REG_TEXT/2, 220, this.REG_TEXT + 25, !GameState.showMapGeneration ? '#CCCCCC' : '#333333', '#FFFFFF');
        stroke(GameState.showMapGeneration ? color(219, 51, 105) : color(41,193,244));
        fill(GameState.showMapGeneration ? color(219, 51, 105) : color(41,193,244));
        text('ON', GameState.CANVAS_WIDTH/2 + this.HORZ2, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);
        stroke(!GameState.showMapGeneration ? color(219, 51, 105) : color(41,193,244));
        fill(!GameState.showMapGeneration ? color(219, 51, 105) : color(41,193,244));
        text('OFF', GameState.CANVAS_WIDTH/2 + this.HORZ3, this.BELOW_TITLE + this.ON_MAPGEN*this.VERT_SP);

        //put in "start game" with glowing effect
        this.drawGlowingButton(GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.ON_START*this.VERT_SP + 10, 500, 80, '#CCCCCC', '#FFFFFF');
        textSize(1.5*this.REG_TEXT);
        stroke(color(219, 51, 105));
        fill(color(219, 51, 105));
        textAlign(CENTER, CENTER);
        text('START GAME', GameState.CANVAS_WIDTH/2 + this.HORZ4, this.BELOW_TITLE + this.ON_START*this.VERT_SP + 10);
        textAlign(CENTER, TOP);
        textSize(this.REG_TEXT);

        // Reset shadow and stroke
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
        strokeWeight(0);

        //show/hide color pickers
        if(!GameState.twoPlayerMode){
            this.tank1ColorPicker.show();
            this.tank2ColorPicker.hide();
        }else{
            this.tank1ColorPicker.show();
            this.tank2ColorPicker.show();
        }

        //leave this back to default since it's used in drawing the tank sprites
        strokeWeight(1);
    }

    drawGlowingButton(x, y, width, height, fillColor, glowColor) {
        // Determine if button is active based on fillColor
        const isActive = fillColor === '#CCCCCC';
        
        // Check if mouse is hovering over this button
        const isHovering = mouseX > x - width/2 && 
                          mouseX < x + width/2 && 
                          mouseY > y - height/2 && 
                          mouseY < y + height/2;
        
        // Draw glow effect using shadow
        if (isActive) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = color(219, 51, 105);
        } else if (isHovering) {
            drawingContext.shadowBlur = 15;
            drawingContext.shadowColor = color(41,193,244);
        } else {
            drawingContext.shadowBlur = 0;
            drawingContext.shadowColor = 'transparent';
        }
        
        // Draw main button with rounded corners
        noStroke();
        fill(color(0, 50)); // Translucent black
        rect(x, y, width, height, 10); // Rounded corners with 10px radius
        
        // Draw outline
        noFill();
        if (isActive) {
            stroke(color(219, 51, 105));
        } else if (isHovering) {
            stroke(color(41,193,244));
        } else {
            stroke(color(41,193,244));
        }
        strokeWeight(2);
        rect(x, y, width, height, 10);
        
        // Reset shadow and stroke
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
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