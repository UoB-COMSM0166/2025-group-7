/**
 * Abstract base class for all projectiles.
 * Defines common properties like position, angle, and lifespan.
 * Subclasses must implement draw(), update(), and remove() methods.
 */

class Projectile {

	constructor(x, y, angle, duration) {
		this.x = x;
		this.y = y;
		this.angle = angle;
		this.duration = duration;
		this.despawnTime = millis() + (this.duration * 1000);
		this.leftTurret = false;
	}
	draw() { }
	update() { }
}
