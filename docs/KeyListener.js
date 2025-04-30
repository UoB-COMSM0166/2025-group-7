let D_CODE = 68;
let A_CODE = 65;
let S_CODE = 83;
let W_CODE = 87;
let tanks;

class KeyListener {
   
    //"arrKeyControls" should be false if the KeyListener uses WASD controls
    constructor (tank, arrKeyControls) {
        this.tank = tank;
        this.arrKeyControls = arrKeyControls;
    }

    listenForKeys () { 

        if(this.arrKeyControls){
            if(keyIsDown(RIGHT_ARROW)){
                this.tank.move(Tank.RIGHT_DIRECTION);
            }

            if(keyIsDown(LEFT_ARROW)){
                this.tank.move(Tank.LEFT_DIRECTION);
            }

            if(keyIsDown(DOWN_ARROW)){
                this.tank.move(Tank.DOWN_DIRECTION);
            }

            else if(keyIsDown(UP_ARROW)){
                this.tank.move(Tank.UP_DIRECTION);
            }

            else {
              this.tank.move(Tank.NO_DIRECTION);
            }
        } else{
            if(keyIsDown(D_CODE)){ 
                this.tank.move(Tank.RIGHT_DIRECTION);
            }

            if(keyIsDown(A_CODE)){  
                this.tank.move(Tank.LEFT_DIRECTION);
            }

            if(keyIsDown(S_CODE)){  
                this.tank.move(Tank.DOWN_DIRECTION);
            }

            else if(keyIsDown(W_CODE)){  
                this.tank.move(Tank.UP_DIRECTION);
            }

            else {
                this.tank.move(Tank.NO_DIRECTION);
            }
        }
    }

    touchListener() {}
}
