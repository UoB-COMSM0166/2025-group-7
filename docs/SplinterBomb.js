class SplinterBomb extends Projectile {
    static BOMB_SIZE = 8;
    static NUM_SPLINTERS = 40;

    constructor(x, y, angle) {
        // Call the parent constructor
        super(x, y, angle, Weapon.BOMB_TIME);
        // Initialize the sprite
        this.sprite = new Sprite(x, y, SplinterBomb.BOMB_SIZE, 'hexagon');
        this.sprite.duration = Weapon.BOMB_TIME;
        this.sprite.color = color(255, 255, 255);
        this.sprite.direction = angle;
        this.sprite.speed = 10;
        this.sprite.rotationSpeed = 25;
        this.sprite.bounciness = 1;
        this.sprite.friction = 0;
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.sprite.visible = false;

        //bomb has no damage - but its splinters do
        this.damage = 0;
    }
    //Draw the bomb
    draw() {
        this.sprite.draw();
    }
    //Update the bomb
    update() {
        this.sprite.update();
    }
    //Remove the bomb when it explodes
    remove() {
        this.splinter();
        this.sprite.remove();
    }
    //Create splinters when the bomb explodes
    splinter() {
        let x = this.sprite.x;
        let y = this.sprite.y;

        for (let i = 0; i < SplinterBomb.NUM_SPLINTERS; i++) {
            GameState.projectileList.push(new Splinter(x, y, 0));
        }

        audioBombExplode.play();
    }
}