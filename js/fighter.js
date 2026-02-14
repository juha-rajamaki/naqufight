// Attack frame data: [startup, active, recovery] in frames (60fps)
const ATTACKS = {
    highPunch:  { startup: 3,  active: 4,  recovery: 8,  damage: 8,  knockback: 3,  hitstun: 12, hitboxY: -0.1, hitboxH: 0.15, range: 0.6, type: 'high' },
    lowPunch:   { startup: 2,  active: 4,  recovery: 7,  damage: 6,  knockback: 2,  hitstun: 10, hitboxY: 0.15, hitboxH: 0.15, range: 0.55, type: 'low' },
    highKick:   { startup: 6,  active: 5,  recovery: 12, damage: 12, knockback: 5,  hitstun: 16, hitboxY: -0.05, hitboxH: 0.2, range: 0.7, type: 'high' },
    lowKick:    { startup: 5,  active: 5,  recovery: 10, damage: 9,  knockback: 4,  hitstun: 14, hitboxY: 0.35, hitboxH: 0.15, range: 0.65, type: 'low', sweep: true },
    uppercut:   { startup: 5,  active: 4,  recovery: 18, damage: 14, knockback: 6,  hitstun: 22, hitboxY: -0.2, hitboxH: 0.3, range: 0.5, type: 'high', launcher: true },
    jumpPunch:  { startup: 3,  active: 6,  recovery: 5,  damage: 10, knockback: 3,  hitstun: 14, hitboxY: 0.0, hitboxH: 0.2, range: 0.5, type: 'mid' },
    jumpKick:   { startup: 4,  active: 7,  recovery: 5,  damage: 11, knockback: 4,  hitstun: 15, hitboxY: 0.0, hitboxH: 0.25, range: 0.55, type: 'mid' },
    special:    { startup: 10, active: 8,  recovery: 20, damage: 0,  knockback: 8,  hitstun: 25, hitboxY: -0.1, hitboxH: 0.3, range: 0.7, type: 'mid' },
    fatalityBlow: { startup: 4, active: 6, recovery: 15, damage: 20, knockback: 10, hitstun: 30, hitboxY: -0.15, hitboxH: 0.4, range: 0.65, type: 'mid', launcher: true }
};

const GRAVITY = 0.6;
const GROUND_Y = 460;
const STAGE_LEFT = 30;
const STAGE_RIGHT = 770;
const FIGHTER_WIDTH = 60;
const FIGHTER_HEIGHT = 120;

class Fighter {
    constructor(charName, x, facing, isAI = false) {
        this.charName = charName;
        this.data = CHARACTER_DATA[charName];
        this.x = x;
        this.y = GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.isAI = isAI;
        this.width = FIGHTER_WIDTH;
        this.height = FIGHTER_HEIGHT;

        // Stats
        this.maxHealth = this.data.health;
        this.health = this.maxHealth;
        this.speed = this.data.speed;
        this.jumpPower = this.data.jumpPower;
        this.attackMult = this.data.attackMultiplier;
        this.weight = this.data.weight;

        // State
        this.state = 'idle';
        this.stateTimer = 0;
        this.attackFrame = 0;
        this.currentAttack = null;
        this.hasHitThisAttack = false;
        this.isGrounded = true;
        this.isCrouching = false;
        this.isBlocking = false;
        this.blockStun = 0;
        this.hitstunTimer = 0;
        this.knockdownTimer = 0;
        this.superArmor = false;
        this.superArmorTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;

        // Special move input buffer
        this.inputBuffer = [];
        this.specialCooldown = 0;

        // AI state
        this.aiDecisionTimer = 0;
        this.aiAction = 'idle';
        this.aiDifficulty = 0.3;
        this.aiReactionFrames = 30;

        // Visual
        this.flashTimer = 0;
        this.shakeX = 0;

        // Round wins
        this.roundWins = 0;
    }

    reset(x, facing) {
        this.x = x;
        this.y = GROUND_Y;
        this.vx = 0;
        this.vy = 0;
        this.facing = facing;
        this.health = this.maxHealth;
        this.state = 'idle';
        this.stateTimer = 0;
        this.attackFrame = 0;
        this.currentAttack = null;
        this.hasHitThisAttack = false;
        this.isGrounded = true;
        this.isCrouching = false;
        this.isBlocking = false;
        this.blockStun = 0;
        this.hitstunTimer = 0;
        this.knockdownTimer = 0;
        this.superArmor = false;
        this.superArmorTimer = 0;
        this.comboCount = 0;
        this.comboTimer = 0;
        this.inputBuffer = [];
        this.specialCooldown = 0;
        this.flashTimer = 0;
        this.shakeX = 0;
    }

    canAct() {
        return this.hitstunTimer <= 0 &&
               this.knockdownTimer <= 0 &&
               this.blockStun <= 0 &&
               (this.state === 'idle' || this.state === 'walk' || this.state === 'crouch');
    }

    canAttack() {
        return this.canAct() && this.isGrounded;
    }

    canJumpAttack() {
        return !this.isGrounded &&
               this.hitstunTimer <= 0 &&
               this.currentAttack === null;
    }

    startAttack(attackName) {
        if (attackName === 'special' && this.specialCooldown > 0) return;

        this.currentAttack = attackName;
        this.attackFrame = 0;
        this.hasHitThisAttack = false;
        this.state = attackName;
        this.stateTimer = 0;

        if (attackName === 'special') {
            this.specialCooldown = 120; // 2 seconds cooldown
        }
    }

    updateFacing(opponent) {
        if (this.hitstunTimer > 0 || this.knockdownTimer > 0) return;
        if (this.currentAttack) return;
        this.facing = opponent.x > this.x ? 'right' : 'left';
    }

    moveLeft() {
        if (!this.canAct()) return;
        this.vx = -this.speed;
        this.state = 'walk';
        // Check if blocking (moving away from opponent = blocking)
        this.isBlocking = (this.facing === 'right');
    }

    moveRight() {
        if (!this.canAct()) return;
        this.vx = this.speed;
        this.state = 'walk';
        this.isBlocking = (this.facing === 'left');
    }

    stopMoving() {
        if (this.state === 'walk') {
            this.vx = 0;
            this.state = this.isCrouching ? 'crouch' : 'idle';
        }
        this.isBlocking = false;
    }

    crouch() {
        if (!this.canAct() && this.state !== 'crouch') return;
        this.isCrouching = true;
        this.state = 'crouch';
        this.vx = 0;
    }

    standUp() {
        this.isCrouching = false;
        if (this.state === 'crouch') {
            this.state = 'idle';
        }
    }

    jump(direction = 0) {
        if (!this.canAct() || !this.isGrounded) return;
        this.vy = -this.jumpPower;
        this.isGrounded = false;
        this.state = 'jump';
        this.vx = direction * this.speed;
        this.isCrouching = false;
    }

    tryHighPunch() {
        if (this.isCrouching && this.canAct()) {
            // Uppercut: crouch + high punch
            this.isCrouching = false;
            this.startAttack('uppercut');
        } else if (this.canJumpAttack()) {
            this.startAttack('jumpPunch');
        } else if (this.canAttack()) {
            this.startAttack('highPunch');
        }
    }

    tryLowPunch() {
        if (this.canJumpAttack()) {
            this.startAttack('jumpPunch');
        } else if (this.canAttack()) {
            this.startAttack('lowPunch');
        }
    }

    tryHighKick() {
        if (this.canJumpAttack()) {
            this.startAttack('jumpKick');
        } else if (this.canAttack()) {
            this.startAttack('highKick');
        }
    }

    tryLowKick() {
        if (this.canJumpAttack()) {
            this.startAttack('jumpKick');
        } else if (this.canAttack()) {
            this.startAttack('lowKick');
        }
    }

    trySpecial() {
        if (this.canAttack()) {
            this.startAttack('special');
        }
    }

    getHitbox() {
        if (!this.currentAttack) return null;
        const atk = ATTACKS[this.currentAttack];
        if (this.attackFrame < atk.startup || this.attackFrame >= atk.startup + atk.active) return null;

        const dir = this.facing === 'right' ? 1 : -1;
        const range = this.width * atk.range;
        return {
            x: this.x + (dir > 0 ? this.width * 0.3 : -this.width * 0.3 - range),
            y: this.y - this.height + this.height * (0.5 + atk.hitboxY),
            w: range,
            h: this.height * atk.hitboxH,
            damage: Math.round(atk.damage * this.attackMult),
            knockback: atk.knockback,
            hitstun: atk.hitstun,
            type: atk.type,
            launcher: atk.launcher || false,
            sweep: atk.sweep || false,
            attackName: this.currentAttack
        };
    }

    getHurtbox() {
        const h = this.isCrouching ? this.height * 0.6 : this.height;
        const yOffset = this.isCrouching ? this.height * 0.4 : 0;
        return {
            x: this.x - this.width * 0.3,
            y: this.y - this.height + yOffset,
            w: this.width * 0.6,
            h: h
        };
    }

    takeHit(hitbox, attackerX) {
        const dir = attackerX < this.x ? 1 : -1;

        // Check blocking
        if (this.isBlocking || (this.isCrouching && this.state === 'crouch')) {
            const standBlocking = this.isBlocking && !this.isCrouching;
            const crouchBlocking = this.isCrouching && (this.isBlocking || this.state === 'crouch');

            // Stand block stops high/mid, crouch block stops low/mid
            if ((standBlocking && hitbox.type !== 'low') ||
                (crouchBlocking && hitbox.type !== 'high' && !hitbox.launcher)) {
                // Blocked!
                const chipDamage = Math.round(hitbox.damage * 0.15);
                this.health = Math.max(0, this.health - chipDamage);
                this.blockStun = 10;
                this.vx = dir * hitbox.knockback * 0.5;
                this.flashTimer = 5;
                return 'blocked';
            }
        }

        // Timo's counter special
        if (this.charName === 'timo' && this.currentAttack === 'special' &&
            this.attackFrame < ATTACKS.special.startup) {
            // Counter triggered!
            this.attackFrame = ATTACKS.special.startup; // Skip to active
            return 'countered';
        }

        // Matkum's super armor
        if (this.superArmor) {
            this.health = Math.max(0, this.health - Math.round(hitbox.damage * 0.5));
            this.flashTimer = 5;
            return 'armored';
        }

        // Take damage
        this.health = Math.max(0, this.health - hitbox.damage);
        this.hitstunTimer = hitbox.hitstun;
        this.vx = dir * hitbox.knockback;
        this.flashTimer = 8;
        this.currentAttack = null;
        this.attackFrame = 0;

        if (hitbox.launcher) {
            this.vy = -10;
            this.isGrounded = false;
            this.state = 'hit';
        } else if (hitbox.sweep) {
            this.knockdownTimer = 40;
            this.state = 'knockdown';
        } else {
            this.state = 'hit';
        }

        // Combo tracking
        this.comboCount++;
        this.comboTimer = 60;

        return 'hit';
    }

    update() {
        // Timers
        if (this.hitstunTimer > 0) this.hitstunTimer--;
        if (this.knockdownTimer > 0) {
            this.knockdownTimer--;
            if (this.knockdownTimer <= 0) {
                this.state = 'idle';
                this.isCrouching = false;
            }
        }
        if (this.blockStun > 0) {
            this.blockStun--;
            if (this.blockStun <= 0 && this.state !== 'walk') {
                this.state = this.isCrouching ? 'crouch' : 'idle';
            }
        }
        if (this.flashTimer > 0) this.flashTimer--;
        if (this.specialCooldown > 0) this.specialCooldown--;
        if (this.comboTimer > 0) {
            this.comboTimer--;
            if (this.comboTimer <= 0) this.comboCount = 0;
        }
        if (this.superArmorTimer > 0) {
            this.superArmorTimer--;
            if (this.superArmorTimer <= 0) this.superArmor = false;
        }

        // Update attack
        if (this.currentAttack) {
            this.attackFrame++;
            const atk = ATTACKS[this.currentAttack];
            const totalFrames = atk.startup + atk.active + atk.recovery;

            // Handle special moves unique effects
            if (this.currentAttack === 'special') {
                this.handleSpecialEffect();
            }

            if (this.attackFrame >= totalFrames) {
                this.currentAttack = null;
                this.attackFrame = 0;
                this.state = this.isGrounded ? (this.isCrouching ? 'crouch' : 'idle') : 'jump';
            }
        }

        // Return to idle after hitstun
        if (this.hitstunTimer <= 0 && this.state === 'hit') {
            this.state = this.isGrounded ? 'idle' : 'jump';
        }

        // Gravity
        if (!this.isGrounded) {
            this.vy += GRAVITY;
            this.y += this.vy;

            if (this.y >= GROUND_Y) {
                this.y = GROUND_Y;
                this.vy = 0;
                this.isGrounded = true;
                if (this.state === 'jump') {
                    this.state = 'idle';
                }
                // Landing recovery from jump attacks
                if (this.currentAttack && (this.currentAttack === 'jumpPunch' || this.currentAttack === 'jumpKick')) {
                    this.currentAttack = null;
                    this.attackFrame = 0;
                    this.state = 'idle';
                }
            }
        }

        // Apply velocity
        this.x += this.vx;

        // Friction
        if (this.isGrounded && this.state !== 'walk') {
            this.vx *= 0.7;
            if (Math.abs(this.vx) < 0.5) this.vx = 0;
        }
        if (!this.isGrounded) {
            this.vx *= 0.98;
        }

        // Stage boundaries
        this.x = Math.max(STAGE_LEFT + this.width / 2, Math.min(STAGE_RIGHT - this.width / 2, this.x));

        // Shake effect
        this.shakeX = this.flashTimer > 0 ? (Math.random() - 0.5) * 4 : 0;
    }

    handleSpecialEffect() {
        const atk = ATTACKS.special;
        if (this.attackFrame < atk.startup) return;

        switch (this.charName) {
            case 'idaho':
                // Viral Rush - dash forward
                if (this.attackFrame === atk.startup) {
                    const dir = this.facing === 'right' ? 1 : -1;
                    this.vx = dir * 12;
                }
                break;
            case 'matkum':
                // Iron Wall - super armor
                if (this.attackFrame === atk.startup) {
                    this.superArmor = true;
                    this.superArmorTimer = 90; // 1.5 seconds
                }
                break;
            case 'thepanu':
                // Zen Block - handled in takeHit via parry window
                break;
            case 'timo':
                // Smirk Counter - handled in takeHit
                break;
        }
    }

    // AI Logic
    updateAI(opponent) {
        if (!this.isAI) return;

        this.aiDecisionTimer--;
        if (this.aiDecisionTimer > 0) return;
        this.aiDecisionTimer = this.aiReactionFrames;

        const dist = Math.abs(this.x - opponent.x);
        const hpRatio = this.health / this.maxHealth;
        const oppHpRatio = opponent.health / opponent.maxHealth;

        // Can't act during hitstun/knockdown
        if (!this.canAct() && !this.canJumpAttack()) return;

        // Random factor
        const rand = Math.random();

        // Close range behavior
        if (dist < 100) {
            if (rand < this.aiDifficulty * 0.4) {
                // Block if opponent is attacking
                if (opponent.currentAttack) {
                    this.isBlocking = true;
                    const awayDir = opponent.x > this.x ? -1 : 1;
                    this.vx = awayDir * this.speed * 0.5;
                    return;
                }
            }

            if (rand < 0.3) {
                this.tryHighPunch();
            } else if (rand < 0.5) {
                this.tryLowKick();
            } else if (rand < 0.65) {
                this.tryHighKick();
            } else if (rand < 0.75) {
                this.tryLowPunch();
            } else if (rand < 0.82 && this.isCrouching) {
                this.tryHighPunch(); // Uppercut
            } else if (rand < 0.88 && this.specialCooldown <= 0) {
                this.trySpecial();
            } else {
                // Back off
                const awayDir = opponent.x > this.x ? -1 : 1;
                this.vx = awayDir * this.speed;
                this.state = 'walk';
            }
        }
        // Medium range
        else if (dist < 200) {
            if (rand < 0.35) {
                // Approach
                const towardDir = opponent.x > this.x ? 1 : -1;
                this.vx = towardDir * this.speed;
                this.state = 'walk';
                this.isBlocking = false;
            } else if (rand < 0.55) {
                // Jump in
                const towardDir = opponent.x > this.x ? 1 : -1;
                this.jump(towardDir);
            } else if (rand < 0.7) {
                this.tryHighKick(); // Long range kick
            } else if (rand < 0.8 && this.specialCooldown <= 0) {
                this.trySpecial();
            } else {
                // Crouch block
                this.crouch();
                this.isBlocking = true;
            }
        }
        // Far range
        else {
            if (rand < 0.6) {
                const towardDir = opponent.x > this.x ? 1 : -1;
                this.vx = towardDir * this.speed;
                this.state = 'walk';
                this.isBlocking = false;
            } else if (rand < 0.8) {
                const towardDir = opponent.x > this.x ? 1 : -1;
                this.jump(towardDir);
            } else {
                this.stopMoving();
            }
        }

        // Difficulty-based aggression adjustments
        if (hpRatio < 0.3 && rand < this.aiDifficulty) {
            // Desperate - more aggressive
            if (this.specialCooldown <= 0) this.trySpecial();
        }
    }

    draw(ctx) {
        ctx.save();
        const drawX = this.x + this.shakeX;
        const drawY = this.y;
        const atk = this.currentAttack;

        // Drop shadow on ground
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(drawX, GROUND_Y + 2, this.width * 0.4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Flash white when hit
        if (this.flashTimer > 0 && this.flashTimer % 2 === 0) {
            ctx.globalAlpha = 0.6;
        }

        // Knockdown visual
        if (this.knockdownTimer > 0) {
            ctx.save();
            ctx.translate(drawX, drawY);
            ctx.rotate(Math.PI / 2 * (this.facing === 'right' ? 1 : -1));
            ctx.translate(-drawX, -drawY);
            this.data.draw(ctx, drawX, drawY - this.height * 0.5, this.width, this.height, this.facing, this.state, atk);
            ctx.restore();
        } else if (this.isCrouching) {
            this.data.draw(ctx, drawX, drawY + this.height * 0.2, this.width, this.height * 0.7, this.facing, this.state, atk);
        } else {
            this.data.draw(ctx, drawX, drawY, this.width, this.height, this.facing, this.state, atk);
        }

        // Super armor glow
        if (this.superArmor) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 10;
            ctx.strokeRect(drawX - this.width * 0.4, drawY - this.height, this.width * 0.8, this.height);
        }

        ctx.restore();
    }

    // ========================
    // 3D MODEL METHODS
    // ========================
    initModel3D() {
        this.removeModel3D();
        this.model3d = Models3D.createModel(this.charName);
        if (this.model3d) {
            Scene3D.scene.add(this.model3d.root);
        }
    }

    removeModel3D() {
        if (this.model3d) {
            Scene3D.scene.remove(this.model3d.root);
            // Dispose all geometries and materials to prevent GPU memory leak
            this.model3d.root.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
            this.model3d = null;
        }
    }

    draw3D(frameCount) {
        if (!this.model3d) return;

        const pos = Scene3D.mapGameTo3D(this.x + this.shakeX, this.y);
        this.model3d.root.position.set(pos.x, 0, pos.z);

        // Facing: right = PI/2 (face +X), left = -PI/2 (face -X)
        const targetRotY = this.facing === 'left' ? -Math.PI / 2 : Math.PI / 2;
        const bodyRot = this.model3d.bodyGroup.rotation;
        bodyRot.y += (targetRotY - bodyRot.y) * 0.3;

        // Apply pose
        Poses3D.applyPose(this.model3d.parts, this, frameCount);

        // Flash white when hit
        if (this.flashTimer > 0 && this.flashTimer % 2 === 0) {
            Models3D.setEmissive(this.model3d.parts, 0xFFFFFF, 0.6);
        } else if (this.superArmor) {
            Models3D.setEmissive(this.model3d.parts, 0xFFD700, 0.3);
        } else {
            Models3D.setEmissive(this.model3d.parts, 0x000000, 0);
        }

        // Show/hide model (for loser moved offscreen during fatality)
        this.model3d.root.visible = (this.x > -100 && this.x < 900);
    }
}
