// ========================
// GAME STATE
// ========================
const GameState = {
    LOADING: 'loading',
    TITLE: 'title',
    SELECT: 'select',
    OPPONENT_INTRO: 'opponent_intro',
    ROUND_START: 'round_start',
    FIGHT: 'fight',
    FINISH_HIM: 'finish_him',
    ROUND_END: 'round_end',
    MATCH_END: 'match_end',
    GAME_OVER: 'game_over',
    VICTORY: 'victory',
    CONTROLS: 'controls'
};

// ========================
// GAME
// ========================
const Game = {
    canvas: null,
    ctx: null,
    state: GameState.LOADING,
    previousState: null,
    frameCount: 0,
    screenShake: 0,

    // Selection
    selectedCharIndex: 0,

    // Fight state
    player: null,
    opponent: null,
    roundTimer: 0,
    roundTimerMax: 60 * 60, // 60 seconds at 60fps
    currentRound: 1,
    stateTimer: 0,

    // Arcade ladder
    opponentOrder: [],
    currentOpponentIndex: 0,

    // Input
    keys: {},
    prevKeys: {},

    // Sound tracking (to avoid duplicate triggers per frame)
    _soundsThisFrame: [],

    // Hitbox collision check
    boxOverlap(a, b) {
        return a.x < b.x + b.w && a.x + a.w > b.x &&
               a.y < b.y + b.h && a.y + a.h > b.y;
    },

    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Input listeners (only prevent default for game keys)
        const GAME_KEYS = new Set([
            'KeyA', 'KeyD', 'KeyW', 'KeyS', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon',
            'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
            'Space', 'Enter', 'Tab', 'Escape'
        ]);
        window.addEventListener('keydown', e => {
            if (GAME_KEYS.has(e.code)) {
                e.preventDefault();
                this.keys[e.code] = true;
            }
        });
        window.addEventListener('keyup', e => {
            if (GAME_KEYS.has(e.code)) {
                e.preventDefault();
                this.keys[e.code] = false;
            }
        });

        // Load images then start
        Renderer.loadImages(() => {
            this.state = GameState.TITLE;
            this.loop();
        });
    },

    justPressed(code) {
        return this.keys[code] && !this.prevKeys[code];
    },

    // ========================
    // GAME LOOP
    // ========================
    loop() {
        this._soundsThisFrame = [];
        this.update();
        this.draw();
        this.prevKeys = { ...this.keys };
        this.frameCount++;
        requestAnimationFrame(() => this.loop());
    },

    // ========================
    // UPDATE
    // ========================
    update() {
        switch (this.state) {
            case GameState.TITLE:
                this.updateTitle();
                break;
            case GameState.SELECT:
                this.updateSelect();
                break;
            case GameState.OPPONENT_INTRO:
                this.updateOpponentIntro();
                break;
            case GameState.ROUND_START:
                this.updateRoundStart();
                break;
            case GameState.FIGHT:
                this.updateFight();
                break;
            case GameState.FINISH_HIM:
                this.updateFinishHim();
                break;
            case GameState.ROUND_END:
                this.updateRoundEnd();
                break;
            case GameState.MATCH_END:
                this.updateMatchEnd();
                break;
            case GameState.GAME_OVER:
            case GameState.VICTORY:
                this.updateEndScreen();
                break;
            case GameState.CONTROLS:
                this.updateControls();
                break;
        }
    },

    updateTitle() {
        // Start menu music
        SFX.ensure();
        Music.playMenu();

        if (this.justPressed('Enter')) {
            SFX.menuConfirm();
            this.state = GameState.SELECT;
            this.selectedCharIndex = 0;
        }
    },

    updateSelect() {
        // Navigation
        let moved = false;
        if (this.justPressed('ArrowRight') || this.justPressed('KeyD')) {
            this.selectedCharIndex = (this.selectedCharIndex + 1) % 8;
            moved = true;
        }
        if (this.justPressed('ArrowLeft') || this.justPressed('KeyA')) {
            this.selectedCharIndex = (this.selectedCharIndex + 7) % 8;
            moved = true;
        }
        if (this.justPressed('ArrowDown') || this.justPressed('KeyS')) {
            this.selectedCharIndex = (this.selectedCharIndex + 4) % 8;
            moved = true;
        }
        if (this.justPressed('ArrowUp') || this.justPressed('KeyW')) {
            this.selectedCharIndex = (this.selectedCharIndex + 4) % 8;
            moved = true;
        }
        if (moved) SFX.menuMove();

        // Confirm
        if (this.justPressed('Enter')) {
            SFX.menuConfirm();
            TTS.speak('Good choice');
            this.startArcade(CHARACTER_LIST[this.selectedCharIndex]);
        }

        // Controls help
        if (this.justPressed('Tab')) {
            this.previousState = GameState.SELECT;
            this.state = GameState.CONTROLS;
        }
    },

    startArcade(playerChar) {
        // Create opponent order (all except player, shuffled)
        this.opponentOrder = CHARACTER_LIST.filter(c => c !== playerChar);
        // Shuffle
        for (let i = this.opponentOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.opponentOrder[i], this.opponentOrder[j]] = [this.opponentOrder[j], this.opponentOrder[i]];
        }

        this.currentOpponentIndex = 0;
        this.player = new Fighter(playerChar, 200, 'right', false);

        this.startNewMatch();
    },

    startNewMatch() {
        const oppChar = this.opponentOrder[this.currentOpponentIndex];
        this.opponent = new Fighter(oppChar, 600, 'left', true);

        // Scale AI difficulty based on opponent number
        const progress = this.currentOpponentIndex / (this.opponentOrder.length - 1);
        this.opponent.aiDifficulty = 0.2 + progress * 0.6;
        this.opponent.aiReactionFrames = Math.round(35 - progress * 20);

        this.player.roundWins = 0;
        this.opponent.roundWins = 0;
        this.currentRound = 1;

        // Switch to fight music
        Music.playFight();

        this.state = GameState.OPPONENT_INTRO;
        this.stateTimer = 0;
    },

    startRound() {
        const pWins = this.player.roundWins;
        const oWins = this.opponent.roundWins;
        this.player.reset(200, 'right');
        this.opponent.reset(600, 'left');
        this.player.roundWins = pWins;
        this.opponent.roundWins = oWins;
        this.roundTimer = this.roundTimerMax;
        this.state = GameState.ROUND_START;
        this.stateTimer = 0;
        this.screenShake = 0; // Reset screen shake
        Renderer.particles = [];
        Renderer.gibs = [];
    },

    updateOpponentIntro() {
        this.stateTimer++;
        if (this.justPressed('Enter') || this.stateTimer > 180) {
            SFX.menuSelect();
            this.startRound();
        }
    },

    updateRoundStart() {
        this.stateTimer++;
        if (this.stateTimer === 1) {
            SFX.roundStart();
            TTS.speak(`Round ${this.currentRound}`);
        }
        if (this.stateTimer === 50) {
            SFX.fight();
            TTS.speak('Fight!', 1.2);
        }
        if (this.stateTimer > 90) {
            this.state = GameState.FIGHT;
        }
    },

    updateFight() {
        // Controls help
        if (this.justPressed('Tab')) {
            this.previousState = GameState.FIGHT;
            this.state = GameState.CONTROLS;
            return;
        }

        // Handle player input
        this.handlePlayerInput();

        // Update AI
        this.opponent.updateAI(this.player);

        // Update facing
        this.player.updateFacing(this.opponent);
        this.opponent.updateFacing(this.player);

        // Update fighters
        this.player.update();
        this.opponent.update();

        // Push apart if overlapping
        this.pushApart();

        // Collision detection
        this.checkHits();

        // Timer
        this.roundTimer--;

        // Screen shake decay
        if (this.screenShake > 0) this.screenShake *= 0.85;
        if (this.screenShake < 0.5) this.screenShake = 0;

        // Check round end conditions
        if (this.player.health <= 0 || this.opponent.health <= 0) {
            SFX.ko();
            const winner = this.player.health > 0 ? this.player : this.opponent;
            // FINISH HIM only on match-deciding round (winner about to get 2nd win)
            if (winner.roundWins >= 1) {
                this.finishHimWinner = winner;
                this.finishHimLoser = winner === this.player ? this.opponent : this.player;
                this.finishHimLoser.health = 0;
                this.finishHimLoser.hitstunTimer = 0;
                this.finishHimLoser.knockdownTimer = 0;
                this.finishHimLoser.state = 'idle'; // standing stunned
                this.finishHimDone = false;
                this.state = GameState.FINISH_HIM;
                this.stateTimer = 0;
            } else {
                this.endRound(winner);
            }
        } else if (this.roundTimer <= 0) {
            this.endRound(this.player.health >= this.opponent.health ? this.player : this.opponent);
        }
    },

    handlePlayerInput() {
        const p = this.player;

        // Movement
        let moving = false;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            p.moveLeft();
            moving = true;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            p.moveRight();
            moving = true;
        }
        if (!moving && p.state === 'walk') {
            p.stopMoving();
        }

        // Crouch
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            if (p.isGrounded) p.crouch();
        } else {
            p.standUp();
        }

        // Jump
        if (this.justPressed('KeyW') || this.justPressed('ArrowUp')) {
            let jumpDir = 0;
            if (this.keys['KeyA'] || this.keys['ArrowLeft']) jumpDir = -1;
            if (this.keys['KeyD'] || this.keys['ArrowRight']) jumpDir = 1;
            if (p.canAct() && p.isGrounded) SFX.whoosh();
            p.jump(jumpDir);
        }

        // Attacks (with sound on attack start)
        if (this.justPressed('KeyJ')) {
            const wasCrouching = p.isCrouching;
            p.tryHighPunch();
            if (p.currentAttack) {
                if (p.currentAttack === 'uppercut') SFX.whoosh();
                else SFX.whoosh();
            }
        }
        if (this.justPressed('KeyK')) {
            p.tryLowPunch();
            if (p.currentAttack) SFX.whoosh();
        }
        if (this.justPressed('KeyL')) {
            p.tryHighKick();
            if (p.currentAttack) SFX.whoosh();
        }
        if (this.justPressed('Semicolon')) {
            p.tryLowKick();
            if (p.currentAttack) SFX.whoosh();
        }

        // Special (Space)
        if (this.justPressed('Space')) {
            p.trySpecial();
            if (p.currentAttack === 'special') SFX.whoosh();
        }
    },

    pushApart() {
        const minDist = 50;
        const dx = this.player.x - this.opponent.x;
        const dist = Math.abs(dx);

        if (dist < minDist) {
            const push = (minDist - dist) / 2;
            if (dx > 0) {
                this.player.x += push;
                this.opponent.x -= push;
            } else {
                this.player.x -= push;
                this.opponent.x += push;
            }
            this.player.x = Math.max(STAGE_LEFT + this.player.width / 2, Math.min(STAGE_RIGHT - this.player.width / 2, this.player.x));
            this.opponent.x = Math.max(STAGE_LEFT + this.opponent.width / 2, Math.min(STAGE_RIGHT - this.opponent.width / 2, this.opponent.x));
        }
    },

    playHitSound(attackName) {
        switch (attackName) {
            case 'highPunch': SFX.highPunch(); break;
            case 'lowPunch': SFX.lowPunch(); break;
            case 'highKick': SFX.highKick(); break;
            case 'lowKick': SFX.lowKick(); break;
            case 'uppercut': SFX.uppercut(); break;
            case 'jumpPunch': SFX.jumpPunch(); break;
            case 'jumpKick': SFX.jumpKick(); break;
            case 'special': SFX.special(); break;
            default: SFX.highPunch(); break;
        }
    },

    checkHits() {
        // Player hitting opponent
        const pHitbox = this.player.getHitbox();
        if (pHitbox && !this.player.hasHitThisAttack) {
            const oHurtbox = this.opponent.getHurtbox();
            if (this.boxOverlap(pHitbox, oHurtbox)) {
                let damage = pHitbox.damage;
                if (pHitbox.attackName === 'special') {
                    damage = this.player.data.specialDamage;
                }
                pHitbox.damage = damage;

                const result = this.opponent.takeHit(pHitbox, this.player.x);
                this.player.hasHitThisAttack = true;

                if (result === 'hit') {
                    this.playHitSound(pHitbox.attackName);
                    if (pHitbox.sweep) SFX.sweep();
                    if (pHitbox.launcher) SFX.knockdown();
                    Renderer.spawnHitParticles(
                        (this.player.x + this.opponent.x) / 2,
                        pHitbox.y + pHitbox.h / 2,
                        8,
                        '#FFD700'
                    );
                    this.screenShake = pHitbox.launcher ? 8 : 4;
                } else if (result === 'blocked') {
                    SFX.blocked();
                    Renderer.spawnHitParticles(
                        (this.player.x + this.opponent.x) / 2,
                        pHitbox.y + pHitbox.h / 2,
                        4,
                        '#8888FF'
                    );
                    this.screenShake = 2;
                }
            }
        }

        // Opponent hitting player
        const oHitbox = this.opponent.getHitbox();
        if (oHitbox && !this.opponent.hasHitThisAttack) {
            const pHurtbox = this.player.getHurtbox();
            if (this.boxOverlap(oHitbox, pHurtbox)) {
                let damage = oHitbox.damage;
                if (oHitbox.attackName === 'special') {
                    damage = this.opponent.data.specialDamage;
                }
                oHitbox.damage = damage;

                const result = this.player.takeHit(oHitbox, this.opponent.x);
                this.opponent.hasHitThisAttack = true;

                if (result === 'hit') {
                    this.playHitSound(oHitbox.attackName);
                    if (oHitbox.sweep) SFX.sweep();
                    if (oHitbox.launcher) SFX.knockdown();
                    Renderer.spawnHitParticles(
                        (this.player.x + this.opponent.x) / 2,
                        oHitbox.y + oHitbox.h / 2,
                        8,
                        '#FF4444'
                    );
                    this.screenShake = oHitbox.launcher ? 8 : 4;
                } else if (result === 'blocked') {
                    SFX.blocked();
                    Renderer.spawnHitParticles(
                        (this.player.x + this.opponent.x) / 2,
                        oHitbox.y + oHitbox.h / 2,
                        4,
                        '#8888FF'
                    );
                    this.screenShake = 2;
                }
            }
        }
    },

    updateFinishHim() {
        this.stateTimer++;

        if (this.stateTimer === 1) {
            SFX.finishHim();
            TTS.speak('Finish him!', 0.9);
        }

        const winner = this.finishHimWinner;
        const loser = this.finishHimLoser;

        // If already exploded, wait then end round
        if (this.finishHimDone) {
            Renderer.updateGibs();
            if (this.stateTimer > this.finishHimDoneAt + 120) {
                this.endRound(winner);
            }
            return;
        }

        // Winner can still move and attack
        if (winner === this.player) {
            this.handlePlayerInput();
        } else {
            // AI finishes the player after a brief pause
            if (this.stateTimer > 60) {
                winner.updateAI(loser);
            }
        }

        winner.updateFacing(loser);
        winner.update();
        loser.update();
        this.pushApart();

        // Screen shake decay
        if (this.screenShake > 0) this.screenShake *= 0.85;
        if (this.screenShake < 0.5) this.screenShake = 0;

        // Check if winner hits the loser → explode into pieces
        const hitbox = winner.getHitbox();
        if (hitbox && !winner.hasHitThisAttack) {
            const hurtbox = loser.getHurtbox();
            if (this.boxOverlap(hitbox, hurtbox)) {
                winner.hasHitThisAttack = true;
                this.playHitSound(hitbox.attackName);
                SFX.knockdown();

                // Explode the loser into pieces!
                Renderer.spawnGibs(loser.x, loser.y, loser.data.colors);
                Renderer.spawnHitParticles(loser.x, loser.y - loser.height * 0.5, 20, '#FF0000');
                this.screenShake = 12;
                this.finishHimDone = true;
                this.finishHimDoneAt = this.stateTimer;
                loser.x = -200; // move loser off screen (replaced by gibs)
            }
        }

        // Timeout: if winner doesn't finish in 8 seconds, end round anyway
        if (this.stateTimer > 480) {
            this.endRound(winner);
        }
    },

    endRound(winner) {
        winner.roundWins++;
        this.state = GameState.ROUND_END;
        this.stateTimer = 0;
        this.screenShake = 0; // Clear shake for round end

        SFX.roundWin();
        TTS.speak(`${winner.data.displayName} wins`);

        if (winner.roundWins >= 2) {
            this.stateTimer = -60;
        }
    },

    updateRoundEnd() {
        this.stateTimer++;

        if (this.stateTimer > 90) {
            const matchWinner = this.player.roundWins >= 2 ? this.player :
                               this.opponent.roundWins >= 2 ? this.opponent : null;

            if (matchWinner) {
                if (matchWinner === this.player) {
                    this.currentOpponentIndex++;
                    if (this.currentOpponentIndex >= this.opponentOrder.length) {
                        this.state = GameState.VICTORY;
                        SFX.victory();
                        Music.stop();
                        TTS.speak(`${this.player.data.displayName} is the champion!`);
                    } else {
                        this.state = GameState.MATCH_END;
                    }
                } else {
                    this.state = GameState.GAME_OVER;
                    SFX.gameOver();
                    Music.stop();
                    TTS.speak('Game over');
                }
                this.stateTimer = 0;
            } else {
                this.currentRound++;
                this.startRound();
            }
        }
    },

    updateMatchEnd() {
        this.stateTimer++;
        if (this.justPressed('Enter') || this.stateTimer > 240) {
            SFX.menuConfirm();
            this.startNewMatch();
        }
    },

    updateEndScreen() {
        if (this.justPressed('Enter')) {
            SFX.menuConfirm();
            this.state = GameState.TITLE;
            this.screenShake = 0; // Reset shake when going back to title
        }
    },

    updateControls() {
        if (this.justPressed('Tab') || this.justPressed('Escape')) {
            this.state = this.previousState || GameState.TITLE;
        }
    },

    // ========================
    // DRAW
    // ========================
    draw() {
        const ctx = this.ctx;

        // Screen shake only during fight states
        ctx.save();
        const isFightState = this.state === GameState.FIGHT ||
                             this.state === GameState.FINISH_HIM ||
                             this.state === GameState.ROUND_START;
        if (this.screenShake > 0 && isFightState) {
            ctx.translate(
                (Math.random() - 0.5) * this.screenShake * 2,
                (Math.random() - 0.5) * this.screenShake * 2
            );
        }

        switch (this.state) {
            case GameState.LOADING:
                ctx.fillStyle = '#000';
                ctx.fillRect(0, 0, 800, 600);
                ctx.fillStyle = '#666';
                ctx.font = '24px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('LOADING...', 400, 300);
                break;

            case GameState.TITLE:
                Renderer.drawTitle(ctx, this.frameCount);
                break;

            case GameState.SELECT:
                Renderer.drawCharacterSelect(ctx, this.selectedCharIndex, this.frameCount);
                break;

            case GameState.OPPONENT_INTRO:
                Renderer.drawOpponentIntro(ctx, this.opponent, this.currentOpponentIndex + 1, this.opponentOrder.length, this.frameCount);
                break;

            case GameState.ROUND_START:
                Renderer.drawArena(ctx, this.frameCount);
                this.player.draw(ctx);
                this.opponent.draw(ctx);
                Renderer.drawFightUI(ctx, this.player, this.opponent, this.roundTimer, this.frameCount);

                if (this.stateTimer < 50) {
                    Renderer.drawAnnouncement(ctx, `ROUND ${this.currentRound}`, null, this.frameCount);
                } else {
                    Renderer.drawAnnouncement(ctx, 'FIGHT!', null, this.frameCount);
                }
                break;

            case GameState.FIGHT:
                Renderer.drawArena(ctx, this.frameCount);
                this.player.draw(ctx);
                this.opponent.draw(ctx);
                Renderer.updateAndDrawParticles(ctx);
                Renderer.drawFightUI(ctx, this.player, this.opponent, this.roundTimer, this.frameCount);
                break;

            case GameState.FINISH_HIM:
                Renderer.drawArena(ctx, this.frameCount);
                this.player.draw(ctx);
                this.opponent.draw(ctx);
                Renderer.drawGibs(ctx);
                Renderer.updateAndDrawParticles(ctx);
                Renderer.drawFightUI(ctx, this.player, this.opponent, this.roundTimer, this.frameCount);
                if (!this.finishHimDone) {
                    Renderer.drawFinishHim(ctx, this.frameCount);
                }
                break;

            case GameState.ROUND_END: {
                Renderer.drawArena(ctx, this.frameCount);
                this.player.draw(ctx);
                this.opponent.draw(ctx);
                Renderer.updateAndDrawParticles(ctx);
                Renderer.drawFightUI(ctx, this.player, this.opponent, this.roundTimer, this.frameCount);
                const roundWinner = this.player.health > this.opponent.health ? this.player : this.opponent;
                Renderer.drawAnnouncement(ctx, `${roundWinner.data.displayName} WINS`, `Round ${this.currentRound}`, this.frameCount);
                break;
            }

            case GameState.MATCH_END:
                Renderer.drawMatchVictory(ctx, this.player, this.opponent, this.frameCount);
                break;

            case GameState.GAME_OVER:
                Renderer.drawVictoryScreen(ctx, this.opponent, false, this.frameCount);
                break;

            case GameState.VICTORY:
                Renderer.drawVictoryScreen(ctx, this.player, true, this.frameCount);
                break;

            case GameState.CONTROLS:
                if (this.previousState === GameState.FIGHT) {
                    Renderer.drawArena(ctx, this.frameCount);
                    this.player.draw(ctx);
                    this.opponent.draw(ctx);
                    Renderer.drawFightUI(ctx, this.player, this.opponent, this.roundTimer, this.frameCount);
                } else {
                    Renderer.drawCharacterSelect(ctx, this.selectedCharIndex, this.frameCount);
                }
                Renderer.drawControls(ctx);
                break;
        }

        ctx.restore();
    }
};

// ========================
// START
// ========================
window.addEventListener('load', () => Game.init());
