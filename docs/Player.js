class Player {

    //"humanPlayer" should be false if the player is an AI
    //"keyListener" should be null if the player is an AI
    constructor(difficultyLevel, humanPlayer, keyListener) {
        this.score = 0;
        this.difficultyLevel = difficultyLevel;
        this.humanPlayer = humanPlayer;
        this.keyListener = keyListener;
    }

    incScore() {
        this.score += 1;
    }

    getScore() {
        return this.score;
    }

    respondToPlayerInput() {
        if (this.humanPlayer) {
            this.keyListener.listenForKeys();
        }
    }
}

