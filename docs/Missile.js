// Missile.js – Locks enemy position at fire time, flies through walls, explodes on impact
// or when it reaches the locked‑in point. Never damages the owner tank.
// -----------------------------------------------------------------------------

class Missile extends Projectile {
  /* Constants -------------------------------------------------------------- */
  static SIZE             = 12;   // sprite diameter (px)
  static SPEED            = 3;    // px per frame @30 FPS
  static EXPLOSION_RADIUS = 40;   // explosion radius (px)

  constructor (x, y, angleDeg, ownerTank, gs) {
    super(x, y, angleDeg, Weapon.MISSILE_TIME);

    this.owner  = ownerTank;
    this.gs     = gs;
    this.damage = 3;

    /* Capture target coordinates ----------------------------------------- */
    this.enemy = this._nearestEnemy();
    this._getTargetCoords();

    /* Sprite setup -------------------------------------------------------- */
    // Passing only size => circular collider; circles may use collider = 'none'
    this.sprite            = new Sprite(x, y, Missile.SIZE);
    this.sprite.color      = color(255, 150, 0);
    this.sprite.direction  = degrees(Math.atan2(this.targetY - y,
                                                this.targetX - x));
    this.sprite.speed      = Missile.SPEED;
    //this.sprite.collider   = 'none';     // circle collider disabled
    this.sprite.overlaps(walls);         // ignore maze walls
    this.sprite.autoDraw   = true;       // let p5play render automatically
    this.sprite.autoUpdate = false;      // movement handled in update()
    this.sprite.visible    = true;       // visible immediately
    this.leftTurret = true;
  }

  /* Main loop ------------------------------------------------------------- */
  update () {
    //update direction of travel
    this._getTargetCoords();
    this.sprite.direction  = degrees(Math.atan2(this.targetY - this.sprite.y,
    this.targetX - this.sprite.x));

    //update the sprite
    this.sprite.update();
  }

  draw   () { this.sprite.draw();   }

  remove () {
    this._explode();
    this.sprite.remove(); 
  }

  /* Helpers --------------------------------------------------------------- */
  _nearestEnemy () {
    let best = null, bestD = Infinity;
    for (const t of this.gs.tankList) {
      if (t === this.owner || t.getLife() <= 0) continue;
      const d = dist(t.tankSprite.x, t.tankSprite.y, this.x, this.y);
      if (d < bestD) { best = t; bestD = d; }
    }
    return best;
  }

  _explode () {
    audioBombExplode.play();
    this._particles();
  }

  _particles () {
    for (let i = 0; i < 25; i++) {
      const p = new Sprite();
      p.x = this.sprite.x;
      p.y = this.sprite.y;
      p.diameter   = 4;
      p.color      = color(255, 180, 0);
      p.stroke     = color(255, 100, 0);
      p.velocity.x = random(-6, 6);
      p.velocity.y = random(-6, 6);
      p.life       = 20;
      p.autoDraw   = true;
      p.autoUpdate = true;
    }
  }

  _getTargetCoords(){
    this.targetX = this.enemy ? this.enemy.tankSprite.x
                         : this.x + 2000 * Math.cos(angleDeg * Math.PI/180);
    this.targetY = this.enemy ? this.enemy.tankSprite.y
                         : this.y + 2000 * Math.sin(angleDeg * Math.PI/180);
  }
}

window.Missile = Missile;