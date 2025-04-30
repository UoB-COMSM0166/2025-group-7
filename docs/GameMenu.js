class GameMenu {
    constructor() {
        this.menuWidth = 600;
        this.menuHeight = 400;
        this.menuX = (GameState.CANVAS_WIDTH - this.menuWidth) / 2 + this.menuWidth/2;
        this.menuY = (GameState.CANVAS_HEIGHT - this.menuHeight) / 2 + this.menuHeight/2;
        
        // Create menu buttons
        this.menuButton = createButton("Menu", 1250, 10, 100, 30);
        this.menuButton.setStyle({
            fillBgActive: color(200, 200, 200, 50),
            fillLabelActive: color(200, 200, 200),
        });
        this.resumeButton = createButton('Resume', this.menuX - this.menuWidth/2 + 200, this.menuY - this.menuHeight/2 + 100, 200, 50);

        this.restartButton = createButton('Restart',this.menuX - this.menuWidth/2 + 200, this.menuY - this.menuHeight/2 + 180, 200, 50);

        this.quitButton = createButton('Quit to Main Menu', this.menuX - this.menuWidth/2 + 200, this.menuY - this.menuHeight/2 + 260, 200, 50);

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
            text('GAME MENU', this.menuX, this.menuY - 150);
            
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
    }

    hideMenu() {
        this.resumeButton.visible = false;
        this.restartButton.visible = false;
        this.quitButton.visible = false;
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

