class Splinter extends Projectile {
    static SIZE = 3;
    static SPEED = 4;

    constructor(x, y, angle) {
        super(x, y, angle, Weapon.SPLINTER_TIME);
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.color = color(150, 150, 150);
        this.sprite.stroke = color(150, 0, 0);
        this.sprite.direction = Math.random() * 360;
        this.sprite.speed = Splinter.SPEED;
        let splinterSize = Splinter.SIZE;
        this.sprite.diameter = splinterSize;
        this.sprite.duration = Weapon.SPLINTER_TIME;
        this.sprite.bounciness = 1;
        this.sprite.friction = 0;
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.leftTurret = true;

        //each splinter inflicts this damage
        this.damage = 0.5;
    }

    draw() {
        
        drawingContext.shadowBlur = 10;
        drawingContext.shadowColor = color(255, 0, 0);

        this.sprite.draw();
        drawingContext.shadowBlur = 0;
        drawingContext.shadowColor = 'transparent';
    }

    update() {
        this.sprite.update();
    }

    remove() {
        this.sprite.remove();
    }
}