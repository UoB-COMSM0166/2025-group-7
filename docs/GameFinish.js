class GameFinish{

    gameWinnerX = 445;
    gameWinnerY = 350;
    drawX = 575;
    drawY = 350;
    gameCompleteX = 320;
    gameCompleteY = 200;
    newGameX = 690;
    newGameY = 515;
    newGameRectX = 690;
    newGameRectY = 515;
    newGameRectWidth = 300;
    newGameRectHeight = 60;
    scoreX = 600;
    scoreY = 410;
    
    constructor(endImage, VT323Font){
        createCanvas(GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
        displayMode('maxed');

        this.button = {x: this.newGameRectX, y: this.newGameRectY,
            width: this.newGameRectWidth, height: this.newGameRectHeight
        };
    }

    draw(){
        textAlign(LEFT, TOP);
        background(endImage);
        
        strokeWeight(10);
        fill('white');
        textFont(BatmanForeverAlt);
        textSize(70);
        text("GAME COMPLETE", this.gameCompleteX, this.gameCompleteY);

        // display the winner
        if(GameState.twoPlayerMode){
            fill('white');
            strokeWeight(0);
            textFont(BatmanForever);
            textSize(50);
            if(GameState.currentWinner != "Draw") text(GameState.currentWinner + " wins!", this.gameWinnerX, this.gameWinnerY);
            else{
                text(GameState.currentWinner + "!", this.drawX, this.drawY);
            }
        }
        else{
            textFont(BatmanForever);
            textSize(50);
            if(GameState.currentWinner === "Player 2" || GameState.currentWinnerScore !== "4"){
                fill('white');
                text("You Lose!", this.gameWinnerX + 77, this.gameWinnerY);
            }
            else{
                fill('white');
                text("You Win!", this.gameWinnerX + 100, this.gameWinnerY);
            }
        }

        fill('white');
        textSize(60);
        text(GameState.currentWinnerScore + " : " + GameState.currentLoserScore, this.scoreX, this.scoreY);

        // Check if mouse is hovering over the button
        const isHovering = mouseX > this.newGameRectX - this.newGameRectWidth/2 && 
                          mouseX < this.newGameRectX + this.newGameRectWidth/2 && 
                          mouseY > this.newGameRectY - this.newGameRectHeight/2 && 
                          mouseY < this.newGameRectY + this.newGameRectHeight/2;

        // Draw glowing button for New Game
        this.drawGlowingButton(this.newGameRectX, this.newGameRectY, this.newGameRectWidth, this.newGameRectHeight, '#CCCCCC', '#FFFFFF');
        
        // Draw New Game text with glow effect when hovering
        textAlign(CENTER, CENTER);
        textFont(BatmanForeverAlt);
        textSize(40);
        strokeWeight(0);
        
        if (isHovering) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = color(219, 51, 105);
            fill(color(219, 51, 105));
        } else {
            drawingContext.shadowBlur = 0;
            drawingContext.shadowColor = 'transparent';
            fill(color(136, 128, 128));
        }
        
        text("New Game", this.newGameX, this.newGameY);
        textAlign(LEFT, TOP);

        // Reset shadow and stroke
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
        strokeWeight(1);
    }

    drawGlowingButton(x, y, width, height, fillColor, glowColor) {
        // Check if mouse is hovering over this button
        const isHovering = mouseX > x - width/2 && 
                          mouseX < x + width/2 && 
                          mouseY > y - height/2 && 
                          mouseY < y + height/2;
        
        // Draw glow effect using shadow
        if (isHovering) {
            drawingContext.shadowBlur = 20;
            drawingContext.shadowColor = color(219, 51, 105);
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
        if (isHovering) {
            stroke(color(219, 51, 105));
        } else {
            stroke(color(136, 128, 128));
        }
        strokeWeight(2);
        rect(x, y, width, height, 10);
        
        // Reset shadow and stroke
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
        strokeWeight(1);
    }

    isButtonPressed(){
        return mouseX > this.button.x - this.button.width/2 && 
               mouseX < this.button.x + this.button.width/2 && 
               mouseY > this.button.y - this.button.height/2 && 
               mouseY < this.button.y + this.button.height/2 &&
               mouseIsPressed;
    }
}