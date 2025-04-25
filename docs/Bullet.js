class Bullet extends Projectile{
    static BULLET_SIZE = 10;

    constructor(x, y, angle) {
        super(x, y, angle, Weapon.BULLET_TIME);
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.duration = Weapon.BULLET_TIME;
        this.sprite.diameter = Bullet.BULLET_SIZE;
        this.sprite.color = color(255, 255, 255);
        this.sprite.direction = angle;
        this.sprite.speed = 6;
        this.sprite.bounciness = 1;
        this.sprite.friction = 0;
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.sprite.visible = false;

        //how much to decrement tank life by
        this.damage = 1;
    }
    
    draw(){
        this.sprite.draw();
    }
  
    update(){
        this.sprite.update();

        //after half the life of bullet, shrink the bullet
        if(this.despawnTime - millis() < 0.5*1000*Weapon.BULLET_TIME){
            this.sprite.diameter -= 0.025;
        }
    }

    remove(){
        this.sprite.remove();
    }
}
