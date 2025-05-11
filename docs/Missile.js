// Missile.js – Locks enemy position at fire time, flies through walls, explodes on impact
// or when it reaches the locked‑in point. Never damages the owner tank.
// -----------------------------------------------------------------------------

class Missile extends Projectile {
  /* Constants -------------------------------------------------------------- */
  static SIZE = 12;   // sprite diameter (px)
  static SPEED = 3;    // px per frame @30 FPS
  static DAMAGE = 3;    // explosion damage
  static EXPLOSION_RADIUS = 40;   // explosion radius (px)
  static FLIGHT_TIME = 12;   // max lifetime (s)
  static LAUNCH_GRACE = 10;   // grace frames after launch to avoid self‑hit
  static TRACKING_DELAY = 5;   // frames before starting to track (1s @30FPS)

  constructor(x, y, angleDeg, ownerTank, gs) {
    super(x, y, angleDeg, Missile.FLIGHT_TIME);

    this.owner = ownerTank;
    this.gs = gs;
    this.grace = Missile.LAUNCH_GRACE;           // launch grace counter
    this.trackingDelay = Missile.TRACKING_DELAY; // tracking delay counter

    /* Capture target coordinates ----------------------------------------- */
    this.enemy = this._nearestEnemy();
    this.targetX = this.enemy ? this.enemy.tankSprite.x
      : x + 2000 * Math.cos(angleDeg * Math.PI / 180);
    this.targetY = this.enemy ? this.enemy.tankSprite.y
      : y + 2000 * Math.sin(angleDeg * Math.PI / 180);

    /* Sprite setup -------------------------------------------------------- */
    // Passing only size => circular collider; circles may use collider = 'none'
    this.sprite = new Sprite(x, y, Missile.SIZE * 4, Missile.SIZE);
    this.sprite.color = color(255, 150, 0);
    this.sprite.direction = angleDeg;  // Start with tank's angle
    this.sprite.rotation = angleDeg;
    this.sprite.speed = Missile.SPEED;
    this.sprite.collider = 'none';     // circle collider disabled
    this.sprite.overlaps(walls);         // ignore maze walls
    this.sprite.autoDraw = true;       // let p5play render automatically
    this.sprite.autoUpdate = false;      // movement handled in update()
    this.sprite.visible = true;       // visible immediately
    this.leftTurret = true;       // skip GameState turret‑exit check
    this.sprite.addAni('move', ...missileAnim);
    this.sprite.anis.scale = 0.2;
    this.sprite.ani.frameDelay = 1;
  }

  /* Main loop ------------------------------------------------------------- */
  update() {
    this.sprite.update();

    if (this.grace-- > 0) return;        // launch grace period

    // Update target position if enemy exists and is alive, and tracking delay has passed
    if (this.enemy && this.enemy.getLife() > 0 && this.trackingDelay-- <= 0) {
      this.targetX = this.enemy.tankSprite.x;
      this.targetY = this.enemy.tankSprite.y;
      this.sprite.rotateTowards(this.enemy.tankSprite, 0.1, 0);
      this.sprite.direction = this.sprite.rotation;
    }

    // 1) explode on enemy collision
    if (this.enemy && this.enemy.getLife() > 0) {
      if (dist(this.sprite.x, this.sprite.y,
        this.enemy.tankSprite.x, this.enemy.tankSprite.y) <= Missile.SIZE) {
        this._explode();
        return;
      }
    }

    // 2) explode after flight time
    if (this.despawnTime <= 0) {
      this._explode();
      return;
    }
  }

  draw() { this.sprite.draw(); }
  remove() { this.sprite.remove(); }

  /* Helpers --------------------------------------------------------------- */
  _nearestEnemy() {
    let best = null, bestD = Infinity;
    for (const t of this.gs.tankList) {
      if (t === this.owner || t.getLife() <= 0) continue;
      if (this.gs.extraAIControllers.includes(this.owner) && this.gs.extraAIControllers.includes(t)) continue;
      const d = dist(t.tankSprite.x, t.tankSprite.y, this.x, this.y);
      if (d < bestD) { best = t; bestD = d; }
    }
    return best;
  }

  _explode() {
    // Apply damage
    for (const t of this.gs.tankList) {
      if (t === this.owner) continue;                     // never hurt owner
      if (dist(t.tankSprite.x, t.tankSprite.y,
        this.sprite.x, this.sprite.y) <= Missile.EXPLOSION_RADIUS) {
        t.receiveDamage(Missile.DAMAGE);
      }
    }
    audioBombExplode.play();
    this._particles();
    this.remove();
    this.despawnTime = 0;         // let GameState clear reference immediately
  }

  _particles() {
    for (let i = 0; i < 25; i++) {
      const p = new Sprite();
      p.collider = 'none';
      p.x = this.sprite.x;
      p.y = this.sprite.y;
      p.diameter = 4;
      p.color = color(255, 180, 0);
      p.stroke = color(255, 100, 0);
      p.velocity.x = random(-6, 6);
      p.velocity.y = random(-6, 6);
      p.life = 20;
      p.autoDraw = true;
      p.autoUpdate = true;
    }
  }
}

window.Missile = Missile;