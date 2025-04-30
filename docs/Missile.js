// Missile.js – Locks enemy position at fire time, flies through walls, explodes on impact
// or when it reaches the locked‑in point. Never damages the owner tank.
// -----------------------------------------------------------------------------

class Missile extends Projectile {
  /* Constants -------------------------------------------------------------- */
  static SIZE             = 12;   // sprite diameter (px)
  static SPEED            = 3;    // px per frame @30 FPS
  static DAMAGE           = 3;    // explosion damage
  static EXPLOSION_RADIUS = 40;   // explosion radius (px)
  static FLIGHT_TIME      = 10;   // max lifetime (s)
  static LAUNCH_GRACE     = 10;   // grace frames after launch to avoid self‑hit

  constructor (x, y, angleDeg, ownerTank, gs) {
    super(x, y, angleDeg, Missile.FLIGHT_TIME);

    this.owner = ownerTank;
    this.gs    = gs;
    this.grace = Missile.LAUNCH_GRACE;           // launch grace counter

    /* Capture target coordinates ----------------------------------------- */
    const enemy = this._nearestEnemy();
    this.targetX = enemy ? enemy.tankSprite.x
                         : x + 2000 * Math.cos(angleDeg * Math.PI/180);
    this.targetY = enemy ? enemy.tankSprite.y
                         : y + 2000 * Math.sin(angleDeg * Math.PI/180);

    /* Sprite setup -------------------------------------------------------- */
    // Passing only size => circular collider; circles may use collider = 'none'
    this.sprite            = new Sprite(x, y, Missile.SIZE);
    this.sprite.color      = color(255, 150, 0);
    this.sprite.direction  = degrees(Math.atan2(this.targetY - y,
                                                this.targetX - x));
    this.sprite.speed      = Missile.SPEED;
    this.sprite.collider   = 'none';     // circle collider disabled
    this.sprite.overlaps(walls);         // ignore maze walls
    this.sprite.autoDraw   = true;       // let p5play render automatically
    this.sprite.autoUpdate = false;      // movement handled in update()
    this.sprite.visible    = true;       // visible immediately
    this.leftTurret        = true;       // skip GameState turret‑exit check
  }

  /* Main loop ------------------------------------------------------------- */
  update () {
    this.sprite.update();

    if (this.grace-- > 0) return;        // launch grace period

    // 1) explode at target location
    if (dist(this.sprite.x, this.sprite.y,
             this.targetX, this.targetY) <= Missile.SPEED) {
      this._explode();
      return;
    }

    // 2) explode on enemy collision
    for (const t of this.gs.tankList) {
      if (t === this.owner || t.getLife() <= 0) continue;
      if (dist(this.sprite.x, this.sprite.y,
               t.tankSprite.x, t.tankSprite.y) <= Missile.SIZE) {
        this._explode();
        return;
      }
    }
  }

  draw   () { this.sprite.draw();   }
  remove () { this.sprite.remove(); }

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
    // Apply damage
    for (const t of this.gs.tankList) {
      if (t === this.owner) continue;                     // never hurt owner
      if (dist(t.tankSprite.x, t.tankSprite.y,
               this.sprite.x,  this.sprite.y) <= Missile.EXPLOSION_RADIUS) {
        t.receiveDamage(Missile.DAMAGE);
      }
    }
    audioBombExplode.play();
    this._particles();
    this.remove();
    this.despawnTime = 0;         // let GameState clear reference immediately
  }

  _particles () {
    for (let i = 0; i < 25; i++) {
      const p = new Sprite();
      p.collider = 'none';
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
}

window.Missile = Missile;