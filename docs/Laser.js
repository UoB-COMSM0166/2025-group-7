class Laser extends Projectile {
    constructor(x, y, angle) {
        super(x, y, angle, 1);
        this.startX = x;
        this.startY = y;
        const angleInRadians = angle * Math.PI / 180;
        this.angle = angleInRadians;
        this.sprite = new Sprite();
        this.sprite.x = x;
        this.sprite.y = y;
        this.sprite.width = 1;
        this.sprite.height = 1;
        this.sprite.color = color(255, 0, 0);
        this.sprite.autoUpdate = false;
        this.sprite.autoDraw = false;
        this.damage = 3;
        this.maxDistance = 5000;
        this.thickness = 4;
        this.performRaycast();
        this.damageApplied = false;
        this.beamOpacity = 255;
        this.fadeRate = 255;
        this.applyDamage();
    }

    performRaycast() {
        // Cast ray from start position in given angle
        let rayX = this.startX;
        let rayY = this.startY;
        let dirX = Math.cos(this.angle);
        let dirY = Math.sin(this.angle);
        this.endX = rayX + dirX * this.maxDistance;
        this.endY = rayY + dirY * this.maxDistance;
        const step = 0.5;
        let hitSomething = false;
        let distanceTraveled = 0;
        this.hitTarget = null;
        const wallsArray = Array.isArray(walls) ? walls : [];
        let tankList = [];

        this.wallsDestroyed = 0;

        try {
            if (typeof tankGame !== 'undefined' && tankGame && tankGame.tankList) {
                tankList = tankGame.tankList;
            }
        } catch (e) { }

        while (distanceTraveled < this.maxDistance && !hitSomething) {
            const currentX = rayX + dirX * distanceTraveled;
            const currentY = rayY + dirY * distanceTraveled;

            for (let wall of wallsArray) {
                if (wall && this.pointInWall(currentX, currentY, wall)) {
                    if (wall.outerWall) {
                        this.endX = currentX;
                        this.endY = currentY;
                        hitSomething = true;
                        break;
                    }
                    if (this.wallsDestroyed < 2) {
                        try {
                            wall.remove();
                            this.wallsDestroyed++;
                        } catch (e) {
                            console.warn("cannot break:", e);
                        }
                    } else {
                        this.endX = currentX;
                        this.endY = currentY;
                        hitSomething = true;
                    }
                    break;
                }
            }

            if (hitSomething) break;

            for (let tank of tankList) {
                if (tank && tank.tankSprite && !this.tank) {
                    if (this.pointInTank(currentX, currentY, tank)) {
                        this.endX = currentX;
                        this.endY = currentY;
                        hitSomething = true;
                        this.hitTarget = tank;
                        break;
                    }
                }
            }

            distanceTraveled += step;
        }
    }

    pointInWall(x, y, wall) {
        // Check if point is inside wall bounds
        const dx = x - wall.x;
        const dy = y - wall.y;
        const angle = -wall.rotation * Math.PI / 180;

        const localX = dx * Math.cos(angle) - dy * Math.sin(angle);
        const localY = dx * Math.sin(angle) + dy * Math.cos(angle);

        return (
            localX >= -wall.width / 2 &&
            localX <= wall.width / 2 &&
            localY >= -wall.height / 2 &&
            localY <= wall.height / 2
        );
    }

    pointInTank(x, y, tank) {
        // Check if point is inside tank bounds
        const tankSprite = tank.tankSprite;
        const tankX = tankSprite.x;
        const tankY = tankSprite.y;
        const tankWidth = tankSprite.width;
        const tankHeight = tankSprite.height;
        const tankRotation = tankSprite.rotation * Math.PI / 180;

        const cosRot = Math.cos(-tankRotation);
        const sinRot = Math.sin(-tankRotation);
        const localX = (x - tankX) * cosRot - (y - tankY) * sinRot;
        const localY = (x - tankX) * sinRot + (y - tankY) * cosRot;

        return (
            localX >= -tankWidth / 2 &&
            localX <= tankWidth / 2 &&
            localY >= -tankHeight / 2 &&
            localY <= tankHeight / 2
        );
    }

    isFiringTank(tank, startX, startY) {
        // Check if tank is close enough to firing point
        const dx = tank.tankSprite.x - startX;
        const dy = tank.tankSprite.y - startY;
        const distSquared = dx * dx + dy * dy;

        return distSquared < 6 * (Tank.TANK_HEIGHT * Tank.TANK_HEIGHT);
    }

    applyDamage() {
        // Apply damage to hit target if not already done
        if (this.hitTarget && !this.damageApplied) {
            try {
                if (typeof this.hitTarget.receiveDamage === 'function') {
                    this.hitTarget.receiveDamage(this.damage);
                    this.damageApplied = true;
                }
            } catch (e) { }
        }
    }

    draw() {
        // Draw laser beam with fade effect
        const timePassed = millis() - (this.despawnTime - 1000);
        const opacity = Math.max(0, this.beamOpacity - timePassed * this.fadeRate / 1000);

        push();
        stroke(255, 0, 0, opacity);
        strokeWeight(this.thickness);
        line(this.startX, this.startY, this.endX, this.endY);

        stroke(255, 100, 100, opacity * 0.8);
        strokeWeight(this.thickness + 6);
        line(this.startX, this.startY, this.endX, this.endY);

        stroke(255, 255, 255, opacity);
        strokeWeight(this.thickness / 2);
        line(this.startX, this.startY, this.endX, this.endY);

        if (opacity > 20) {
            fill(255, 100, 100, opacity);
            noStroke();
            ellipse(this.endX, this.endY, this.thickness * 3);

            fill(255, 200, 200, opacity * 0.7);
            ellipse(this.endX, this.endY, this.thickness * 2);

            fill(255, 255, 255, opacity * 0.9);
            ellipse(this.endX, this.endY, this.thickness);
        }

        pop();
    }

    update() { }

    remove() {
        // Clean up sprite when removing laser
        if (this.sprite) {
            this.sprite.remove();
        }
    }
}
