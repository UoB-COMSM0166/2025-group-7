class GameFinish{

    gameWinnerX = 445;
    gameWinnerY = 350;
    drawX = 575;
    drawY = 350;
    gameCompleteX = 320;
    gameCompleteY = 200;
    newGameX = 564;
    newGameY = 494;
    newGameRectX = 690;
    newGameRectY = 515;
    newGameRectWidth = 300;
    newGameRectHeight = 60;
    scoreX = 600;
    scoreY = 410;
    
    constructor(endImage, VT323Font){
        createCanvas(GameState.CANVAS_WIDTH, GameState.CANVAS_HEIGHT);
        displayMode('centered');

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
                text("You Win!", this.gameWinnerX + 100
                    , this.gameWinnerY);
            }
        }

        fill('white');
        textSize(60);
        text(GameState.currentWinnerScore + " : " + GameState.currentLoserScore, this.scoreX, this.scoreY);

        strokeWeight(2);
        rect(this.newGameRectX, this.newGameRectY, this.newGameRectWidth, this.newGameRectHeight);
        fill('black');
        textFont(BatmanForeverAlt);
        strokeWeight(0);
        textSize(40);
        text("New Game", this.newGameX, this.newGameY);

        // add selector if more options added to screen 

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