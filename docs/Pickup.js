class Pickup {

    // Initialize pickup counters and properties
    constructor(gridWidth, gridHeight, pickups, tanks) {

        this.numHealth = 0;
        this.numAmmo = 0;
        this.numSaw = 0;
        this.numLaser = 0;
        this.numShield = 0;
        this.numMissile = 0;
        this.numBomb = 0;

        this.numPickups = pickups.length;

        // Find empty cells on the grid
        let availableCells = [];
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 4; j++) {
                let cell = tankGame.gameMap.grid[i][j];
                let isOccupied = false;

                // Check if cell is occupied by existing pickups
                for (let pickup of pickups) {
                    if (pickup.x === i && pickup.y === j) {
                        isOccupied = true;
                        break;
                    }
                }

                // Check if cell is occupied by tanks
                for (let tank of tanks) {
                    let tankCell = tankGame.gameMap.getCell(tank.tankSprite.x, tank.tankSprite.y);
                    if (tankCell.i === i && tankCell.j === j) {
                        isOccupied = true;
                        break;
                    }
                }

                if (!isOccupied) {
                    availableCells.push({ x: i, y: j });
                }
            }
        }

        // Place pickup in random empty cell
        let selectedCell = availableCells[floor(random(availableCells.length))];

        this.sprite = new Sprite();
        this.sprite.x = tankGame.gameMap.grid[selectedCell.x][selectedCell.y].centerX;
        this.sprite.y = tankGame.gameMap.grid[selectedCell.x][selectedCell.y].centerY;
        this.sprite.width = 30;
        this.sprite.height = 30;
        this.sprite.collider = "static";
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.sprite.overlaps(allSprites);

        // store cell co-ordinates for look-up by later constructors
        this.x = selectedCell.x;
        this.y = selectedCell.y;

        // Randomly select pickup type
        let randomiser = Math.floor(Math.random() * 7);

        if (randomiser == 0) {
            this.setHealth();
        }
        else if (randomiser == 1) {
            this.setAmmo();
        }
        else if (randomiser == 2) {
            this.setSaw();
        }
        else if (randomiser == 3) {
            this.setLaser();
        }
        else if (randomiser == 4) {
            this.setShield();
        }
        else if (randomiser == 5) {
            this.setMissile();
        }
        else {
            this.setBomb();
        }
        this.sprite.image.scale = 0.1;
    }

    // Draw and update pickup sprite
    draw() {
        this.sprite.draw();
    }

    update() {
        this.sprite.update();
    }

    countCurrentPickups(pickup) {
        switch (pickup.type) {
            case "HEALTH":
                this.numHealth++;
                break;
            case "AMMO":
                this.numAmmo++;
                break;
            case "SAW":
                this.numSaw++;
                break;
            case "LASER":
                this.numLaser++;
                break;
            case "SHIELD":
                this.numShield++;
                break;
            case "MISSILE":
                this.numMissile++;
                break;
            case "BOMB":
                this.numBomb++;
                break;
        }
    }

    // Set pickup type methods with fallback logic
    setHealth() {
        if ((this.numPickups < 3 && this.numHealth == 1) || (this.numHealth > 1)) {
            this.setAmmo();
        } else {
            this.type = "HEALTH";
            this.sprite.image = imgHealthPickup;
            this.targetedByAI = null; 
        }
    }

    setAmmo() {
        if ((this.numPickups < 3 && this.numAmmo == 1) || (this.numAmmo > 1)) {
            this.setSaw();
        } else {
            this.type = "AMMO";
            this.sprite.image = imgAmmoPickup;
        }
    }

    setSaw() {
        if ((this.numPickups < 3 && this.numSaw == 1) || (this.numSaw > 1)) {
            this.setLaser();
        } else {
            this.type = "SAW"
            this.sprite.image = imgSawPickup;
        }
    }

    setLaser() {
        if ((this.numPickups < 3 && this.numLaser == 1) || (this.numLaser > 1)) {
            this.setShield();
        } else {
            this.type = "LASER";
            this.sprite.image = imgLaserPickup;
        }
    }

    setShield() {
        if ((this.numPickups < 3 && this.numShield == 1) || (this.numShield > 1)) {
            this.setMissile();
        } else {
            this.type = "SHIELD";
            this.sprite.image = imgShieldPickup;
        }
    }

    setMissile() {
        if ((this.numPickups < 3 && this.numMissile == 1) || (this.numMissile > 1)) {
            this.setBomb();
        } else {
            this.type = "MISSILE";
            this.sprite.image = imgMissilePickup;
        }
    }

    setBomb() {
        if ((this.numPickups < 3 && this.numBomb == 1) || (this.numBomb > 1)) {
            this.setHealth();
        } else {
            this.type = "BOMB";
            this.sprite.image = imgBombPickup;
        }
    }
}
