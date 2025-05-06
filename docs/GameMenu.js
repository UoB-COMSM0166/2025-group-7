class GameMenu {
    constructor() {
        this.menuWidth = 600;
        this.menuHeight = 480;
        this.menuX = (GameState.CANVAS_WIDTH - this.menuWidth) / 2 + this.menuWidth/2;
        this.menuY = (GameState.CANVAS_HEIGHT - this.menuHeight) / 2 + this.menuHeight/2;
        
        //Need to load font from path into system to style the buttons
        const batForAlt = new FontFace('batForAlt', 'url(fonts/batmfa__.ttf)');
        batForAlt.load().then(function(loadedFont){
            document.fonts.add(loadedFont);
        });

        // Create menu buttons
        this.menuButton = createButton("Menu", 1250, 10, 100, 30);
        this.menuButton.setStyle({
            fillBg: color(20, 20, 20),
            fillBgHover: color(40, 40, 40),
            fillBgActive: color(60, 60, 60),
            fillLabel: color(200, 200, 200),
            fillLabelHover: color(255, 255, 255),
            fillLabelActive: color(255, 255, 255),
            strokeBg: color(200, 200, 200),
            strokeBgHover: color(255, 255, 255),
            strokeBgActive: color(255, 255, 255),
            strokeWeight: 2,
            rounding: 10,
            font: 'batForAlt',
        });
        this.resumeButton = createButton('Resume', this.menuX - this.menuWidth/2 + 100, this.menuY - this.menuHeight/2 + 100, 400, 50);
        this.resumeButton.setStyle({
            font: 'batForAlt',
            textSize: 30
        });
        this.restartButton = createButton('Restart',this.menuX - this.menuWidth/2 + 100, this.menuY - this.menuHeight/2 + 180, 400, 50);
        this.restartButton.setStyle({
            font: 'batForAlt',
            textSize: 30
        });
        this.quitButton = createButton('Quit to Main Menu', this.menuX - this.menuWidth/2 + 100, this.menuY - this.menuHeight/2 + 260, 400, 50);
        this.quitButton.setStyle({
            font: 'batForAlt',
            textSize: 30
        });
        this.instrButton = createButton('Instructions', this.menuX - this.menuWidth/2 + 100, this.menuY - this.menuHeight/2 + 340, 400, 50);
        this.instrButton.setStyle({
            font: 'batForAlt',
            textSize: 30
        });


        // Hide buttons initially
        this.hideMenu();
    }

    draw() {
        if (GameState.menuMode) {
            // Draw semi-transparent background
            fill(0, 0, 0, 180);
            rect(this.menuX, this.menuY, GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
            
            // Draw menu background
            fill(50);
            rect(this.menuX, this.menuY, this.menuWidth, this.menuHeight, 20);
            
            // Draw menu title
            textAlign(CENTER);
            textSize(36);
            fill(255);
            text('GAME MENU', this.menuX, this.menuY - 200);
            
            // Show buttons after drawing the background
            this.showMenu();
        } else {
            this.hideMenu();
        }
    }

    showMenu() {
        this.resumeButton.visible = true;
        this.restartButton.visible = true;
        this.quitButton.visible = true;
        this.instrButton.visible = true;
    }

    hideMenu() {
        this.resumeButton.visible = false;
        this.restartButton.visible = false;
        this.quitButton.visible = false;
        this.instrButton.visible = false;
    }


    restartGame() {
        // Reset game state
        resetGame();

        allSprites.sleeping = false;
        GameState.menuMode = false;
    }

    quitToMenu() {
        // Return to starting screen
        resetGame();
        allSprites.removeAll();
        setup();
        gameEndScreen = null;
        GameState.menuMode = false;
    }
}

