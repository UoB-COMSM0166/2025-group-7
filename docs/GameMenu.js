class GameMenu {
    constructor() {
        this.menuWidth = 600;
        this.menuHeight = 480;
        this.menuX = (GameState.CANVAS_WIDTH - this.menuWidth) / 2 + this.menuWidth / 2;
        this.menuY = (GameState.CANVAS_HEIGHT - this.menuHeight) / 2 + this.menuHeight / 2;

        //Need to load font from path into system to style the buttons
        const batForAlt = new FontFace('batForAlt', 'url(fonts/batmfa__.ttf)');
        batForAlt.load().then(function (loadedFont) {
            document.fonts.add(loadedFont);
        });

        // Create menu buttons
        this.menuButton = createButton("Menu", 1250, 10, 100, 30);
        this.menuButton.setStyle({
            font: 'batForAlt',
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });
        this.resumeButton = createButton('Resume', this.menuX - this.menuWidth / 2 + 100, this.menuY - this.menuHeight / 2 + 100, 400, 50);
        this.resumeButton.setStyle({
            font: 'batForAlt',
            textSize: 30,
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });
        this.restartButton = createButton('Restart', this.menuX - this.menuWidth / 2 + 100, this.menuY - this.menuHeight / 2 + 180, 400, 50);
        this.restartButton.setStyle({
            font: 'batForAlt',
            textSize: 30,
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });
        this.quitButton = createButton('Quit to Main Menu', this.menuX - this.menuWidth / 2 + 100, this.menuY - this.menuHeight / 2 + 260, 400, 50);
        this.quitButton.setStyle({
            font: 'batForAlt',
            textSize: 30,
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });
        this.instrButton = createButton('Instructions', this.menuX - this.menuWidth / 2 + 100, this.menuY - this.menuHeight / 2 + 340, 400, 50);
        this.instrButton.setStyle({
            font: 'batForAlt',
            textSize: 30,
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });

        //from the instructions screen - enables you to go back
        this.backButton = createButton('Back', this.menuX - this.menuWidth / 2 + 200, this.menuY - this.menuHeight / 2 + 400, 200, 50);
        this.backButton.setStyle({
            font: 'batForAlt',
            textSize: 30,
            fillBg: color(0, 0, 0, 0),
            fillBgHover: color(0, 0, 0, 0),
            fillBgActive: color(0, 0, 0, 0),
            fillLabel: color(136, 128, 128),
            fillLabelHover: color(219, 51, 105),
            fillLabelActive: color(219, 51, 105),
            strokeBg: color(136, 128, 128),
            strokeBgHover: color(219, 51, 105),
            strokeBgActive: color(219, 51, 105),
            strokeWeight: 2,
            rounding: 10
        });

        //hide back button for now
        this.backButton.visible = false;

        //Boolean whether to show instructions or pause menu
        this.onInstructions = false;

        // Hide buttons initially
        this.hideMenu();
    }

    draw() {
        if (GameState.menuMode && !this.onInstructions) {
            // Draw semi-transparent background
            fill(0, 0, 0, 180);
            rect(this.menuX, this.menuY, GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);

            // Draw menu background with glow effect
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = color(219, 51, 105);
            stroke(0, 0, 0);
            fill(0);
            rect(this.menuX, this.menuY, this.menuWidth, this.menuHeight, 20);
            drawingContext.shadowBlur = 0;

            // Draw menu title
            textAlign(CENTER);
            textSize(36);
            fill(219, 51, 105);
            text('GAME MENU', this.menuX, this.menuY - 200);

            // Show buttons after drawing the background
            this.showMenu();
        } else if (GameState.menuMode && this.onInstructions) {
            this.drawInstructions();
        } else {
            this.hideMenu();
        }
    }

    drawInstructions() {
        if (GameState.menuMode && this.onInstructions) {
            // Draw semi-transparent background
            fill(0, 0, 0, 180);
            rect(this.menuX, this.menuY, GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);

            // Draw instructions background with glow effect
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = color(219, 51, 105);
            stroke(0, 0, 0);
            fill(0);
            rect(this.menuX, this.menuY, this.menuWidth, this.menuHeight, 20);
            drawingContext.shadowBlur = 0;

            // Draw instructions title
            textAlign(CENTER);
            textSize(36);
            fill(219, 51, 105);
            text('INSTRUCTIONS', this.menuX, this.menuY - 200);   

            // Add the instructions image
            image(instructionsImg, 0.5*this.menuX + 50, 0.5*this.menuY + 25, 575, 300);         
        }
    }

    switchToInstructions() {
        this.hideMenu();
        this.onInstructions = true;
        this.backButton.visible = true;
    }

    switchToMenu() {
        this.showMenu();
        this.onInstructions = false;
        this.backButton.visible = false;
    }

    showMenu() {
        this.resumeButton.visible = true;
        this.restartButton.visible = true;
        this.quitButton.visible = true;
        this.instrButton.visible = true;
        this.menuButton.visible = false;
    }

    hideMenu() {
        this.resumeButton.visible = false;
        this.restartButton.visible = false;
        this.quitButton.visible = false;
        this.instrButton.visible = false;
        this.menuButton.visible = true;
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
/*Game Modes:

Single-Player Mode: Battle against AI, up to 4 levels, with increasing number of AI in each level.

Two-Player Mode: Players battle against each other, the first to get 3 points wins.

Game Rules:

Maps are randomly generated and different for each game.

Score points by defeating the opponent's tank.

Two Difficulties:

Simple Mode: The tank has 3 health and moves fast.

Hard Mode: The tank has only 1 health, moves slowly, and is more challenging.

Battle Mechanics:

Firing bullets and hitting the tank can cause 1 point of damage.

Walls can bounce bullets, be careful not to be hit by yourself!

Walls can be destroyed to change the terrain.

Item System (Random Drop):

Health: Restore 1 point of health, up to the upper limit.

Ammo: Restore all bullets.

Saw: Melee weapon, destroys the enemy on contact, and bullets cannot be fired.

Laser: Fires a laser that penetrates up to two walls and can destroy tanks (only one shot).

Shield: Gain an invincible shield that can block any damage.

Missile: Automatically tracks missiles, destroys on hit, disappears when time runs out (only one shot).

Bomb: Throws a bomb that releases a large number of small bullets after the explosion (each deals 0.5 damage).

*/

