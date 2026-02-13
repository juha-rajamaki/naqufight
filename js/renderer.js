const Renderer = {
    // Preloaded images
    characterImages: {},
    imagesLoaded: false,

    loadImages(callback) {
        let loaded = 0;
        const total = CHARACTER_LIST.length;

        CHARACTER_LIST.forEach(name => {
            const img = new Image();
            img.onload = () => {
                this.characterImages[name] = img;
                loaded++;
                if (loaded >= total) {
                    this.imagesLoaded = true;
                    if (callback) callback();
                }
            };
            img.onerror = () => {
                // Fallback: create a colored square if image fails
                const canvas = document.createElement('canvas');
                canvas.width = 128;
                canvas.height = 128;
                const c = canvas.getContext('2d');
                c.fillStyle = CHARACTER_DATA[name].colors.accent || '#666';
                c.fillRect(0, 0, 128, 128);
                c.fillStyle = '#FFF';
                c.font = 'bold 20px Arial';
                c.textAlign = 'center';
                c.fillText(name.toUpperCase(), 64, 70);
                this.characterImages[name] = canvas;
                loaded++;
                if (loaded >= total) {
                    this.imagesLoaded = true;
                    if (callback) callback();
                }
            };
            img.src = CHARACTER_DATA[name].image;
        });
    },

    // ========================
    // TITLE SCREEN
    // ========================
    drawTitle(ctx, frameCount) {
        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 800, 600);

        // Animated dark gradient bars
        for (let i = 0; i < 20; i++) {
            const y = (i * 35 + frameCount * 0.3) % 620 - 20;
            ctx.fillStyle = `rgba(150, 0, 0, ${0.03 + Math.sin(i + frameCount * 0.02) * 0.02})`;
            ctx.fillRect(0, y, 800, 15);
        }

        // Title glow
        const glowIntensity = Math.sin(frameCount * 0.05) * 0.3 + 0.7;
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20 * glowIntensity;

        // Title text
        ctx.fillStyle = '#CC0000';
        ctx.font = 'bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('NAQU FIGHT', 400, 200);

        ctx.shadowBlur = 0;

        // Subtitle
        ctx.fillStyle = '#888';
        ctx.font = '20px Arial';
        ctx.fillText('CHOOSE YOUR FIGHTER', 400, 250);

        // Flashing "Press Enter"
        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#FFF';
            ctx.font = '24px Arial';
            ctx.fillText('PRESS ENTER TO START', 400, 450);
        }

        // Footer
        ctx.fillStyle = '#444';
        ctx.font = '14px Arial';
        ctx.fillText('8 WARRIORS  //  MORTAL KOMBAT STYLE', 400, 550);
    },

    // ========================
    // CHARACTER SELECT SCREEN
    // ========================
    drawCharacterSelect(ctx, selectedIndex, frameCount) {
        // Background
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 800, 600);

        // Title
        ctx.fillStyle = '#CC0000';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CHOOSE YOUR FIGHTER', 400, 50);

        // Character grid (4x2)
        const gridX = 80;
        const gridY = 80;
        const cellW = 160;
        const cellH = 180;
        const padding = 8;

        CHARACTER_LIST.forEach((name, i) => {
            const col = i % 4;
            const row = Math.floor(i / 4);
            const cx = gridX + col * cellW;
            const cy = gridY + row * cellH;

            const isSelected = i === selectedIndex;

            // Cell background
            if (isSelected) {
                // Animated selection border
                ctx.strokeStyle = '#FF0000';
                ctx.lineWidth = 3;
                const pulse = Math.sin(frameCount * 0.1) * 2;
                ctx.strokeRect(cx - pulse, cy - pulse, cellW - padding + pulse * 2, cellH - padding + pulse * 2);
                ctx.fillStyle = 'rgba(200, 0, 0, 0.15)';
            } else {
                ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
            }
            ctx.fillRect(cx, cy, cellW - padding, cellH - padding);

            // Character photo
            const img = this.characterImages[name];
            if (img) {
                const imgSize = cellW - padding - 20;
                const imgX = cx + 10;
                const imgY = cy + 8;
                // Draw image as square, cropped to center
                ctx.save();
                ctx.beginPath();
                ctx.rect(imgX, imgY, imgSize, imgSize - 20);
                ctx.clip();
                if (img instanceof HTMLCanvasElement) {
                    ctx.drawImage(img, imgX, imgY, imgSize, imgSize - 20);
                } else {
                    // Center-crop the image
                    const aspect = img.width / img.height;
                    let sx = 0, sy = 0, sw = img.width, sh = img.height;
                    if (aspect > 1) {
                        sx = (img.width - img.height) / 2;
                        sw = img.height;
                    } else {
                        sy = (img.height - img.width) / 2;
                        sh = img.width;
                    }
                    ctx.drawImage(img, sx, sy, sw, sh, imgX, imgY, imgSize, imgSize - 20);
                }
                ctx.restore();
            }

            // Character name
            ctx.fillStyle = isSelected ? '#FF4444' : '#CCC';
            ctx.font = isSelected ? 'bold 16px Arial' : '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(CHARACTER_DATA[name].displayName, cx + (cellW - padding) / 2, cy + cellH - padding - 8);
        });

        // Selected character stats preview
        const selChar = CHARACTER_DATA[CHARACTER_LIST[selectedIndex]];
        const statsX = 80;
        const statsY = 460;

        ctx.fillStyle = 'rgba(30, 30, 30, 0.9)';
        ctx.fillRect(statsX, statsY, 640, 120);
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 1;
        ctx.strokeRect(statsX, statsY, 640, 120);

        // Character name
        ctx.fillStyle = selChar.colors.accent || '#FFF';
        ctx.font = 'bold 22px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(selChar.displayName, statsX + 15, statsY + 28);

        // Special move
        ctx.fillStyle = '#FFD700';
        ctx.font = '14px Arial';
        ctx.fillText(`Special: ${selChar.specialName} - ${selChar.specialDescription}`, statsX + 15, statsY + 50);

        // Stat bars
        const stats = [
            { label: 'HEALTH', value: selChar.health / 130, color: '#44CC44' },
            { label: 'SPEED', value: selChar.speed / 7, color: '#44AACC' },
            { label: 'POWER', value: selChar.attackMultiplier / 1.3, color: '#CC4444' },
            { label: 'JUMP', value: selChar.jumpPower / 15, color: '#CCCC44' }
        ];

        stats.forEach((stat, i) => {
            const sx = statsX + 15 + i * 155;
            const sy = statsY + 70;

            ctx.fillStyle = '#888';
            ctx.font = '11px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(stat.label, sx, sy);

            // Bar background
            ctx.fillStyle = '#333';
            ctx.fillRect(sx, sy + 5, 130, 12);

            // Bar fill
            ctx.fillStyle = stat.color;
            ctx.fillRect(sx, sy + 5, 130 * stat.value, 12);
        });

        // Controls hint
        ctx.fillStyle = '#666';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Arrow Keys / WASD to select  |  ENTER to confirm', 400, 595);
    },

    // ========================
    // FIGHT SCREEN
    // ========================
    drawArena(ctx, frameCount) {
        // Sky gradient
        const grad = ctx.createLinearGradient(0, 0, 0, 600);
        grad.addColorStop(0, '#1a0a2e');
        grad.addColorStop(0.5, '#2d1b4e');
        grad.addColorStop(1, '#0d0d0d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 800, 600);

        // Ground
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, GROUND_Y, 800, 200);

        // Ground line
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, GROUND_Y);
        ctx.lineTo(800, GROUND_Y);
        ctx.stroke();

        // Ground details
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        for (let i = 0; i < 800; i += 40) {
            ctx.beginPath();
            ctx.moveTo(i, GROUND_Y);
            ctx.lineTo(i + 20, GROUND_Y + 140);
            ctx.stroke();
        }

        // Ambient particles
        ctx.fillStyle = 'rgba(255, 50, 50, 0.1)';
        for (let i = 0; i < 8; i++) {
            const px = (i * 137 + frameCount * 0.5) % 800;
            const py = (i * 89 + frameCount * 0.3) % GROUND_Y;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    },

    drawHealthBar(ctx, fighter, x, isPlayer) {
        const barWidth = 300;
        const barHeight = 25;
        const y = 20;
        const healthRatio = fighter.health / fighter.maxHealth;

        // Background
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, barWidth, barHeight);

        // Health fill
        let healthColor;
        if (healthRatio > 0.5) healthColor = '#44CC44';
        else if (healthRatio > 0.25) healthColor = '#CCCC44';
        else healthColor = '#CC4444';

        if (isPlayer) {
            // Player bar fills from left
            ctx.fillStyle = healthColor;
            ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
        } else {
            // Opponent bar fills from right
            ctx.fillStyle = healthColor;
            ctx.fillRect(x + barWidth * (1 - healthRatio), y, barWidth * healthRatio, barHeight);
        }

        // Border
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        // Name
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = isPlayer ? 'left' : 'right';
        ctx.fillText(fighter.data.displayName, isPlayer ? x + 5 : x + barWidth - 5, y - 5);

        // Health numbers
        ctx.fillStyle = '#CCC';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${fighter.health}/${fighter.maxHealth}`, x + barWidth / 2, y + barHeight / 2 + 4);
    },

    drawRoundIndicators(ctx, fighter, x, isPlayer) {
        const y = 52;
        for (let i = 0; i < 2; i++) {
            const dotX = isPlayer ? x + i * 20 : x + 300 - i * 20;
            ctx.beginPath();
            ctx.arc(dotX, y, 6, 0, Math.PI * 2);
            if (i < fighter.roundWins) {
                ctx.fillStyle = '#FFD700';
                ctx.fill();
            } else {
                ctx.strokeStyle = '#666';
                ctx.lineWidth = 1.5;
                ctx.stroke();
            }
        }
    },

    drawTimer(ctx, timer) {
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.ceil(timer / 60).toString(), 400, 45);
    },

    drawCombo(ctx, fighter, isPlayer) {
        if (fighter.comboCount <= 1) return;

        const x = isPlayer ? 100 : 700;
        const y = 100;

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${fighter.comboCount} HITS!`, x, y);
    },

    drawFightUI(ctx, player, opponent, timer, frameCount) {
        // Health bars
        this.drawHealthBar(ctx, player, 30, true);
        this.drawHealthBar(ctx, opponent, 470, false);

        // VS
        ctx.fillStyle = '#CC0000';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VS', 400, 18);

        // Round indicators
        this.drawRoundIndicators(ctx, player, 30, true);
        this.drawRoundIndicators(ctx, opponent, 470, false);

        // Timer
        this.drawTimer(ctx, timer);

        // Combo counters
        this.drawCombo(ctx, opponent, true); // Opponent's combo count shown on player side
        this.drawCombo(ctx, player, false);

        // Special cooldown indicator for player
        if (player.specialCooldown > 0) {
            ctx.fillStyle = '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`Special: ${Math.ceil(player.specialCooldown / 60)}s`, 30, 80);
        } else {
            ctx.fillStyle = '#FFD700';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('Special: READY', 30, 80);
        }
    },

    // ========================
    // FIGHT ANNOUNCEMENTS
    // ========================
    drawAnnouncement(ctx, text, subtext, frameCount) {
        // Dark overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 200, 800, 200);

        // Main text
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#CC0000';
        ctx.shadowBlur = 15;
        ctx.fillText(text, 400, 290);
        ctx.shadowBlur = 0;

        if (subtext) {
            ctx.fillStyle = '#CCC';
            ctx.font = '24px Arial';
            ctx.fillText(subtext, 400, 340);
        }
    },

    drawFinishHim(ctx, frameCount) {
        const scale = 1 + Math.sin(frameCount * 0.15) * 0.05;
        ctx.save();
        ctx.translate(400, 300);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#FF0000';
        ctx.font = 'bold 64px Arial';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#FF0000';
        ctx.shadowBlur = 20;
        ctx.fillText('FINISH HIM!', 0, 0);
        ctx.shadowBlur = 0;
        ctx.restore();
    },

    // ========================
    // GIBS (body pieces for FINISH HIM)
    // ========================
    gibs: [],

    spawnGibs(x, y, colors) {
        this.gibs = [];
        const bodyColor = colors.body || '#888';
        const skinColor = colors.skin || '#F5CBA7';
        const accentColor = colors.accent || '#CC0000';

        // Body parts: head, torso, left arm, right arm, left leg, right leg
        const parts = [
            { label: 'head',     color: skinColor,   w: 20, h: 20, ox: 0,   oy: -100, rot: 0 },
            { label: 'torso',    color: bodyColor,    w: 36, h: 40, ox: 0,   oy: -60,  rot: 0 },
            { label: 'larm',     color: bodyColor,    w: 10, h: 28, ox: -25, oy: -60,  rot: 0 },
            { label: 'rarm',     color: bodyColor,    w: 10, h: 28, ox: 25,  oy: -60,  rot: 0 },
            { label: 'lleg',     color: '#2C3E50',    w: 14, h: 35, ox: -12, oy: -20,  rot: 0 },
            { label: 'rleg',     color: '#2C3E50',    w: 14, h: 35, ox: 12,  oy: -20,  rot: 0 },
            { label: 'accessory', color: accentColor, w: 16, h: 10, ox: 0,   oy: -110, rot: 0 },
        ];

        parts.forEach(part => {
            this.gibs.push({
                x: x + part.ox,
                y: y + part.oy,
                w: part.w,
                h: part.h,
                color: part.color,
                vx: (Math.random() - 0.5) * 14 + part.ox * 0.1,
                vy: -Math.random() * 12 - 5,
                rot: (Math.random() - 0.5) * 0.3,
                rotSpeed: (Math.random() - 0.5) * 0.4,
                grounded: false
            });
        });
    },

    updateGibs() {
        this.gibs.forEach(g => {
            if (g.grounded) return;
            g.vy += 0.5;
            g.x += g.vx;
            g.y += g.vy;
            g.rot += g.rotSpeed;
            g.vx *= 0.99;

            // Hit the ground
            if (g.y > GROUND_Y) {
                g.y = GROUND_Y;
                g.vy *= -0.3;
                g.vx *= 0.6;
                g.rotSpeed *= 0.5;
                if (Math.abs(g.vy) < 1) {
                    g.grounded = true;
                    g.vy = 0;
                }
            }
            // Stage walls
            if (g.x < STAGE_LEFT) { g.x = STAGE_LEFT; g.vx *= -0.5; }
            if (g.x > STAGE_RIGHT) { g.x = STAGE_RIGHT; g.vx *= -0.5; }
        });
    },

    drawGibs(ctx) {
        this.gibs.forEach(g => {
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.rotate(g.rot);
            ctx.fillStyle = g.color;
            ctx.fillRect(-g.w / 2, -g.h / 2, g.w, g.h);
            // Blood splatter on each piece
            ctx.fillStyle = '#880000';
            ctx.fillRect(-g.w / 2 + 2, -g.h / 2 + 2, g.w * 0.3, g.h * 0.3);
            ctx.restore();
        });
    },

    // ========================
    // HIT EFFECTS
    // ========================
    particles: [],

    maxParticles: 150,

    spawnHitParticles(x, y, count, color) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8 - 3,
                life: 15 + Math.random() * 10,
                color: color || '#FFD700',
                size: 2 + Math.random() * 3
            });
        }
    },

    updateAndDrawParticles(ctx) {
        ctx.save();
        let writeIdx = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life--;

            if (p.life > 0) {
                ctx.globalAlpha = p.life / 25;
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                this.particles[writeIdx++] = p;
            }
        }
        this.particles.length = writeIdx;
        ctx.restore();
    },

    // ========================
    // VICTORY / GAME OVER
    // ========================
    drawVictoryScreen(ctx, winner, isGameComplete, frameCount) {
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, 800, 600);

        // Winner portrait
        const img = this.characterImages[winner.charName];
        if (img) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            const aspect = img.width / img.height;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (aspect > 1) { sx = (img.width - img.height) / 2; sw = img.height; }
            else { sy = (img.height - img.width) / 2; sh = img.width; }
            ctx.drawImage(img, sx, sy, sw, sh, 250, 100, 300, 300);
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        if (isGameComplete) {
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FFD700';
            ctx.shadowBlur = 15;
            ctx.fillText('CHAMPION!', 400, 200);
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#FFF';
            ctx.font = '28px Arial';
            ctx.fillText(`${winner.data.displayName} IS THE CHAMPION`, 400, 260);
        } else {
            ctx.fillStyle = '#FF4444';
            ctx.font = 'bold 60px Arial';
            ctx.textAlign = 'center';
            ctx.shadowColor = '#FF0000';
            ctx.shadowBlur = 15;
            ctx.fillText('GAME OVER', 400, 200);
            ctx.shadowBlur = 0;
        }

        // Flashing continue text
        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#CCC';
            ctx.font = '22px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PRESS ENTER TO CONTINUE', 400, 500);
        }
    },

    drawMatchVictory(ctx, winner, loser, frameCount) {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, 800, 600);

        // Winner photo
        const img = this.characterImages[winner.charName];
        if (img) {
            ctx.save();
            const aspect = img.width / img.height;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (aspect > 1) { sx = (img.width - img.height) / 2; sw = img.height; }
            else { sy = (img.height - img.width) / 2; sh = img.width; }
            ctx.drawImage(img, sx, sy, sw, sh, 275, 150, 250, 250);
            ctx.restore();
        }

        ctx.fillStyle = '#FFD700';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${winner.data.displayName} WINS!`, 400, 130);

        if (Math.floor(frameCount / 30) % 2 === 0) {
            ctx.fillStyle = '#CCC';
            ctx.font = '20px Arial';
            ctx.fillText('PRESS ENTER FOR NEXT FIGHT', 400, 470);
        }
    },

    drawOpponentIntro(ctx, opponent, opponentNumber, totalOpponents, frameCount) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, 800, 600);

        ctx.fillStyle = '#CC0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`FIGHT ${opponentNumber} OF ${totalOpponents}`, 400, 150);

        // Opponent portrait
        const img = this.characterImages[opponent.charName];
        if (img) {
            const aspect = img.width / img.height;
            let sx = 0, sy = 0, sw = img.width, sh = img.height;
            if (aspect > 1) { sx = (img.width - img.height) / 2; sw = img.height; }
            else { sy = (img.height - img.width) / 2; sh = img.width; }
            ctx.drawImage(img, sx, sy, sw, sh, 300, 200, 200, 200);
        }

        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(opponent.data.displayName, 400, 450);

        ctx.fillStyle = '#FFD700';
        ctx.font = '18px Arial';
        ctx.fillText(`Special: ${opponent.data.specialName}`, 400, 485);

        if (Math.floor(frameCount / 25) % 2 === 0) {
            ctx.fillStyle = '#888';
            ctx.font = '16px Arial';
            ctx.fillText('PRESS ENTER', 400, 550);
        }
    },

    drawControls(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(100, 100, 600, 400);
        ctx.strokeStyle = '#CC0000';
        ctx.lineWidth = 2;
        ctx.strokeRect(100, 100, 600, 400);

        ctx.fillStyle = '#CC0000';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('CONTROLS', 400, 140);

        const controls = [
            ['MOVE LEFT / RIGHT', 'A / D  or  LEFT / RIGHT'],
            ['JUMP', 'W  or  UP'],
            ['CROUCH', 'S  or  DOWN'],
            ['HIGH PUNCH', 'J'],
            ['LOW PUNCH', 'K'],
            ['HIGH KICK', 'L'],
            ['LOW KICK', '; (semicolon)'],
            ['UPPERCUT', 'CROUCH + J'],
            ['SPECIAL MOVE', 'SPACE'],
            ['BLOCK', 'Hold BACK (away from opponent)']
        ];

        ctx.font = '15px Arial';
        controls.forEach((c, i) => {
            const y = 175 + i * 28;
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'right';
            ctx.fillText(c[0], 370, y);
            ctx.fillStyle = '#CCC';
            ctx.textAlign = 'left';
            ctx.fillText(c[1], 390, y);
        });

        ctx.fillStyle = '#888';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Press ESC to close  |  Press TAB during fight to view', 400, 475);
    }
};
