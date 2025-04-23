class Pickup {

    constructor(gridWidth, gridHeight, pickups, tanks){

        this.numHealth  = 0;
        this.numAmmo    = 0;
        this.numSaw     = 0;
        this.numLaser   = 0;
        this.numShield  = 0;
        this.numMissile = 0;
        this.numBomb    = 0;
        
        this.numPickups = pickups.length;
        
        let cells = [
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        ]

        for (let i = 0; i < pickups.length; i++){
            cells[pickups[i].y][pickups[i].x] = 1;
            this.countCurrentPickups(pickups[i]);
        }

        for (let i = 0; i < tanks.length; i++){
            let tankCell = tanks[i].getCurrentCell();
            cells[tankCell[0]][tankCell[1]] = 1;
        }

        let spawnCell = floor(random(0, 39 - pickups.length - tanks.length));
        let cellCount = 0;
        let cellX, cellY;
        let cellFound = false;
        for (let j = 0; j < 4 && cellFound == false; j++){
            for (let i = 0; i < 10 && cellFound == false; i++){
                if (cellCount == spawnCell && cells[j][i] == 0){
                    cellFound = true;
                    cellX = i;
                    cellY = j;
                    break;
                }
                if (cells[j][i] == 0){
                    cellCount++;
                }
            }
        }

        this.sprite = new Sprite();
        this.sprite.x = cellX * 90.5 + 72;
        this.sprite.y = cellY * 105 + 54 + (cellX % 2 == 0 ? 0 : 52.5);
        this.sprite.width = 30;
        this.sprite.height = 30;
        this.sprite.collider = "static";
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.sprite.overlaps(allSprites);

        // store cell co-ordinates for look-up by later constructors
        this.x = cellX;
        this.y = cellY;

        // selects pick-up by using millis as a pseudo-random number
        let randomiser = Math.floor(Math.random() * 7);
        
        if(randomiser == 0){
            this.setHealth();
        }
        else if(randomiser == 1){
            this.setAmmo();
        }
        else if(randomiser == 2){
            this.setSaw();
        }
        else if(randomiser == 3){
            this.setLaser();
        }
        else if (randomiser == 4) {
            this.setShield();
        }
        else if (randomiser == 5){
            this.setMissile();
        }
        else{
            this.setBomb();
        }
        this.sprite.image.scale = 0.1;
    }

    draw(){
        this.sprite.draw();
    }

    update(){
        this.sprite.update();
    }

    countCurrentPickups(pickup){
        switch(pickup.type){
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

    setHealth(){
        if ((this.numPickups < 3 && this.numHealth == 1) || (this.numHealth > 1)) {
            this.setAmmo();
        } else {
            this.type = "HEALTH";
            this.sprite.image = imgHealthPickup;
        }
    }

    setAmmo(){
        if ((this.numPickups < 3 && this.numAmmo == 1) || (this.numAmmo > 1)) {
            this.setSaw();
        } else {
            this.type = "AMMO";
            this.sprite.image = imgAmmoPickup;
        }
    }

    setSaw(){
        if ((this.numPickups < 3 && this.numSaw == 1) || (this.numSaw > 1)) {
            this.setLaser();
        } else {
            this.type = "SAW"
            this.sprite.image = imgSawPickup;
        }
    }

    setLaser(){
        if ((this.numPickups < 3 && this.numLaser == 1) || (this.numLaser > 1)) {
            this.setShield();
        } else {
            this.type = "LASER";
            this.sprite.image = imgLaserPickup;
        }
    }

    setShield(){
        if ((this.numPickups < 3 && this.numShield == 1) || (this.numShield > 1)) {
            this.setMissile();
        } else {
            this.type = "SHIELD"; 
            this.sprite.image = imgShieldPickup; 
        }
    }

    setMissile(){
        if ((this.numPickups < 3 && this.numMissile == 1) || (this.numMissile > 1)) {
            this.setBomb();
        } else {
            this.type = "MISSILE";
            this.sprite.image = imgAmmoPickup; // to be replaced with bespoke image
        }
    }

    setBomb(){
        if ((this.numPickups < 3 && this.numBomb == 1) || (this.numBomb > 1)) {
            this.setHealth();
        } else {
            this.type = "BOMB";
            this.sprite.image = imgBombPickup;
        }
    }
}
