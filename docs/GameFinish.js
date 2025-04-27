class GameFinish{

    gameWinnerX = 445;
    gameWinnerY = 350;
    drawX = 575;
    drawY = 350;
    gameCompleteX = 320;
    gameCompleteY = 200;
    newGameX = 505;
    newGameY = 500;
    newGameRectX = 690;
    newGameRectY = 515;
    newGameRectWidth = 450;
    newGameRectHeight = 60;
    
    constructor(endImage, VT323Font){
        createCanvas(GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
        displayMode('centered');
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
        strokeWeight(0);
        textFont(BatmanForever);
        textSize(50);
        if(GameState.currentWinner != "Draw") text(GameState.currentWinner + " wins!", this.gameWinnerX, this.gameWinnerY);
        else{
            text(GameState.currentWinner + "!", this.drawX, this.drawY);
        }

        strokeWeight(2);
        rect(this.newGameRectX, this.newGameRectY, this.newGameRectWidth, this.newGameRectHeight);
        fill('black');
        textFont(BatmanForeverAlt);
        strokeWeight(0);
        textSize(20);
        text("Press Enter for New Game", this.newGameX, this.newGameY);

        // add selector if more options added to screen 

        strokeWeight(1);

    }


}