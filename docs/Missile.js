// Missile.js – 3 s 自动制导 + 继续直飞
// -------------------------------------------------
class Missile extends Projectile {
    static SIZE        = 12;
    static SPEED       = 3;       // 比子弹略慢
    static HOMING_TIME = 3000;    // ms
    static TURN_RATE   = 4;       // ° 每帧最大转向
    static DAMAGE      = 2;
    
  
    constructor(x, y, angle, ownerTank, gs) {
      super(x, y, angle, Weapon.MISSILE_TIME);
      this.spawnTime = millis();
      this.owner     = ownerTank;
      this.gs        = gs;
  
      // 精灵参数
      this.sprite            = new Sprite(x, y, Missile.SIZE, 'hexagon');
      this.sprite.color      = color(255, 150, 0);
      this.sprite.direction  = angle;
      this.sprite.speed      = Missile.SPEED;
      this.sprite.bounciness = 1;
      this.sprite.friction   = 0;
      this.sprite.autoUpdate = false;
      this.sprite.autoDraw   = false;
      this.sprite.visible    = false;
  
      this.damage = Missile.DAMAGE;
    }
  
    //───────── behaviour ────────────────────────────
    update() {
      const now = millis();
      // 1)  制导阶段：寻找最近的敌方坦克（非自己的、仍存活）
      if (now - this.spawnTime < Missile.HOMING_TIME) {
        const target = this._nearestEnemy();
        if (target) {
          const desired = atan2(
            target.tankSprite.y - this.sprite.y,
            target.tankSprite.x - this.sprite.x
          ) * 180 / PI;
  
          // 每帧最多转 TURN_RATE°
          let diff = (desired - this.sprite.direction + 540) % 360 - 180;
          diff = constrain(diff, -Missile.TURN_RATE, Missile.TURN_RATE);
          this.sprite.direction += diff;
        }
      }
      // 2) 更新位置
      this.sprite.update();
    }
  
    draw() { this.sprite.draw(); }
  
    remove() { this.sprite.remove(); }
  
    //───────── helpers ──────────────────────────────
    _nearestEnemy() {
      let best = null, bestD = Infinity;
      for (const t of this.gs.tankList) {
        if (t === this.owner || t.getLife() <= 0) continue;
        const d = dist(t.tankSprite.x, t.tankSprite.y, this.sprite.x, this.sprite.y);
        if (d < bestD) { best = t; bestD = d; }
      }
      return best;
    }
  }
  window.Missile = Missile;   // 供其它脚本直接 new
  