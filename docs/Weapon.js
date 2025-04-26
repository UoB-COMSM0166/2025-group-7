class Weapon {
    numberOfRounds; // Number of projectiles which have been fired so far
    capacity; // Total number of projectiles which can be fired
    weaponType; // Takes different values depending upon weapon type

    // Enumeration of weapon types
    static BULLET_TYPE = 0;
    static LASER_TYPE = 1;
    static BOMB_TYPE = 2;
    static SAW_TYPE = 3;
    static MISSILE_TYPE = 4;

    // Capacity of weapon types
    static BULLET_CAPACITY = 10;
    static LASER_CAPACITY = 1;
    static BOMB_CAPACITY = 1;
    static MISSILE_CAPACITY = 1;

    // Time before weapon expires
    static BULLET_TIME = 10;
    static LASER_TIME = 8;
    static BOMB_TIME = 5;
    static SPLINTER_TIME = 2;
    static MISSILE_TIME  = 30;

    /**
     * Creates a Weapon instance based on the provided type.
     */
    constructor(weaponType) {
        this.weaponType = weaponType;
        this.numberOfRounds = 0;

        switch (weaponType) {
            case Weapon.BULLET_TYPE:
                this.capacity = Weapon.BULLET_CAPACITY;
                this.fireSound = audioBulletShot;
                this.icon = imgAmmoIcon;
                break;
            case Weapon.LASER_TYPE:
                this.capacity = Weapon.LASER_CAPACITY;
                this.fireSound = audioLaserShot;
                this.icon = imgLaserIcon;
                break;
            case Weapon.BOMB_TYPE:
                this.capacity = Weapon.BOMB_CAPACITY;
                this.fireSound = audioBombShot;
                this.icon = imgBombIcon;
                break;
            case Weapon.SAW_TYPE:
                this.capacity = null;
                this.numberOfRounds = null;
                this.fireSound = audioLaserShot;
                this.icon = imgSawIcon;
                break;
                case Weapon.MISSILE_TYPE:
                this.capacity  = Weapon.MISSILE_CAPACITY;
                this.fireSound = audioBulletShot;
                this.icon      = imgMissileIcon;
                break;
            default:
                throw new Error("Invalid weapon type");
        }
    }
    // Get remaining ammo
    getAmmo() {
        if (this.capacity === null || this.numberOfRounds === null) {
            return null; 
        }
        return Math.max(0, this.capacity - this.numberOfRounds);
    }
    // Reset ammo
    resetAmmo() {
        if (this.numberOfRounds !== null) {
            this.numberOfRounds = 0;
        }
    }
}
