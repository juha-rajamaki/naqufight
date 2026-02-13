const CHARACTER_DATA = {
    borre: {
        name: 'borre',
        displayName: 'BORRE',
        image: 'assets/borre.jpg',
        health: 100,
        speed: 5,
        jumpPower: 14,
        weight: 1.0,
        attackMultiplier: 1.5,
        specialName: 'B-Slam',
        specialDamage: 25,
        specialDescription: 'Powerful overhead strike',
        colors: {
            body: '#888',
            accent: '#CC0000',
            skin: '#F5CBA7',
            hair: '#5D4E37',
            outline: '#CC0000'
        },
        // Draw Borre: red "B" beanie, grey hoodie
        draw(ctx, x, y, w, h, facing, state) {
            const dir = facing === 'right' ? 1 : -1;
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') {
                ctx.scale(-1, 1);
            }

            // Legs
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            // Shoes
            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            // Body (grey hoodie)
            ctx.fillStyle = '#888';
            ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, h * 0.42);

            // Hoodie pocket
            ctx.fillStyle = '#777';
            ctx.fillRect(-w * 0.2, h * 0.2, w * 0.4, h * 0.1);

            // Arms
            ctx.fillStyle = '#888';
            if (state === 'highPunch' || state === 'uppercut') {
                // Punching arm extended
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Both arms raised overhead
                ctx.fillRect(-w * 0.1, -h * 0.35, w * 0.2, h * 0.12);
                ctx.fillRect(w * 0.0, -h * 0.35, w * 0.2, h * 0.12);
            } else {
                // Default arms at sides
                ctx.fillRect(-w * 0.38, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.26, -h * 0.02, w * 0.12, h * 0.28);
                // Hands
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.38, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.26, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#3498DB';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.035, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.035, 0, Math.PI * 2);
            ctx.fill();

            // Red beanie
            ctx.fillStyle = '#CC0000';
            ctx.beginPath();
            ctx.arc(0, -h * 0.25, w * 0.22, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(-w * 0.22, -h * 0.3, w * 0.44, h * 0.08);

            // Beanie fold
            ctx.fillStyle = '#AA0000';
            ctx.fillRect(-w * 0.22, -h * 0.22, w * 0.44, h * 0.04);

            // "B" on beanie
            ctx.fillStyle = '#FFF';
            ctx.font = `bold ${w * 0.18}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('B', 0, -h * 0.24);

            ctx.restore();
        }
    },

    idaho: {
        name: 'idaho',
        displayName: 'IDAHO',
        image: 'assets/idaho.png',
        health: 85,
        speed: 7,
        jumpPower: 15,
        weight: 0.85,
        attackMultiplier: 0.85,
        specialName: 'Viral Rush',
        specialDamage: 20,
        specialDescription: 'Rapid multi-hit dash',
        colors: {
            body: '#111',
            accent: '#00F2EA',
            accent2: '#FF0050',
            skin: '#F5CBA7',
            outline: '#00F2EA'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // TikTok glow effect
            ctx.shadowColor = '#00F2EA';
            ctx.shadowBlur = 8;

            // Legs
            ctx.fillStyle = '#111';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            // Shoes (glowing)
            ctx.fillStyle = '#00F2EA';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            ctx.shadowBlur = 0;

            // Body (black with neon accents)
            ctx.fillStyle = '#111';
            ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, h * 0.42);

            // Neon stripes on body
            ctx.fillStyle = '#00F2EA';
            ctx.fillRect(-w * 0.3, h * 0.0, w * 0.6, h * 0.02);
            ctx.fillStyle = '#FF0050';
            ctx.fillRect(-w * 0.3, h * 0.1, w * 0.6, h * 0.02);

            // Arms
            ctx.fillStyle = '#111';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Dashing pose
                ctx.fillRect(w * 0.2, -h * 0.05, w * 0.4, h * 0.1);
                ctx.shadowColor = '#FF0050';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#FF0050';
                ctx.fillRect(w * 0.55, -h * 0.05, w * 0.12, h * 0.1);
                ctx.shadowBlur = 0;
            } else {
                ctx.fillRect(-w * 0.38, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.26, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.38, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.26, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#333';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            // TikTok "note" on chest
            ctx.fillStyle = '#00F2EA';
            ctx.font = `bold ${w * 0.22}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('♪', 0, h * 0.08);

            ctx.restore();
        }
    },

    ruff: {
        name: 'ruff',
        displayName: 'RUFF',
        image: 'assets/ruff.jpg',
        health: 120,
        speed: 3,
        jumpPower: 12,
        weight: 1.3,
        attackMultiplier: 1.3,
        specialName: 'Bear Hug',
        specialDamage: 28,
        specialDescription: 'Grab with big damage',
        colors: {
            body: '#1a1a3a',
            accent: '#4a4a8a',
            skin: '#F5CBA7',
            hair: '#5D4E37',
            outline: '#1a1a3a'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs (wider stance for stocky build)
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.25, h * 0.35, w * 0.22, h * 0.35);
            ctx.fillRect(w * 0.03, h * 0.35, w * 0.22, h * 0.35);

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-w * 0.27, h * 0.65, w * 0.26, h * 0.08);
            ctx.fillRect(w * 0.01, h * 0.65, w * 0.26, h * 0.08);

            // Body (dark patterned shirt - wider/stockier)
            ctx.fillStyle = '#1a1a3a';
            ctx.fillRect(-w * 0.35, -h * 0.05, w * 0.7, h * 0.42);

            // Pattern dots on shirt
            ctx.fillStyle = '#4a4a8a';
            for (let px = -w * 0.3; px < w * 0.3; px += w * 0.1) {
                for (let py = 0; py < h * 0.3; py += h * 0.08) {
                    ctx.beginPath();
                    ctx.arc(px, py, w * 0.02, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // Arms (thicker)
            ctx.fillStyle = '#1a1a3a';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.3, -h * 0.02, w * 0.35, h * 0.14);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.6, -h * 0.02, w * 0.12, h * 0.14);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.3, h * 0.15, w * 0.35, h * 0.14);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.6, h * 0.15, w * 0.12, h * 0.14);
            } else if (state === 'special') {
                // Bear hug - both arms forward
                ctx.fillRect(w * 0.2, -h * 0.05, w * 0.35, h * 0.14);
                ctx.fillRect(w * 0.2, h * 0.12, w * 0.35, h * 0.14);
            } else {
                ctx.fillRect(-w * 0.44, -h * 0.02, w * 0.14, h * 0.3);
                ctx.fillRect(w * 0.3, -h * 0.02, w * 0.14, h * 0.3);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.44, h * 0.24, w * 0.14, h * 0.08);
                ctx.fillRect(w * 0.3, h * 0.24, w * 0.14, h * 0.08);
            }

            // Head
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.22, 0, Math.PI * 2);
            ctx.fill();

            // Short brown hair
            ctx.fillStyle = '#5D4E37';
            ctx.beginPath();
            ctx.arc(0, -h * 0.26, w * 0.22, Math.PI, 0);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#5B86A7';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },

    pelam: {
        name: 'pelam',
        displayName: 'PELAM',
        image: 'assets/pelam.jpg',
        health: 140,
        speed: 6,
        jumpPower: 14,
        weight: 0.95,
        attackMultiplier: 0.95,
        specialName: 'Stripe Combo',
        specialDamage: 22,
        specialDescription: '3-hit rapid chain',
        colors: {
            body: '#008B8B',
            accent: '#CC3333',
            skin: '#F5CBA7',
            hair: '#D4A44C',
            outline: '#008B8B'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            // Striped shirt
            ctx.fillStyle = '#FFF';
            ctx.fillRect(-w * 0.3, -h * 0.05, w * 0.6, h * 0.42);
            // Red stripes
            ctx.fillStyle = '#CC3333';
            for (let sy = -h * 0.03; sy < h * 0.35; sy += h * 0.06) {
                ctx.fillRect(-w * 0.3, sy, w * 0.6, h * 0.02);
            }

            // Arms
            ctx.fillStyle = '#FFF';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Rapid combo arms
                ctx.fillRect(w * 0.2, -h * 0.08, w * 0.3, h * 0.1);
                ctx.fillRect(w * 0.25, h * 0.05, w * 0.35, h * 0.1);
                ctx.fillRect(w * 0.2, h * 0.18, w * 0.3, h * 0.1);
            } else {
                ctx.fillRect(-w * 0.38, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.26, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.38, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.26, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Blonde hair
            ctx.fillStyle = '#D4A44C';
            ctx.beginPath();
            ctx.arc(0, -h * 0.26, w * 0.21, Math.PI * 1.1, -0.1);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#5B86A7';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },

    timo: {
        name: 'timo',
        displayName: 'TIMO',
        image: 'assets/timo.jpg',
        health: 90,
        speed: 8,
        jumpPower: 13,
        weight: 1.0,
        attackMultiplier: 1.1,
        specialName: 'Smirk Counter',
        specialDamage: 24,
        specialDescription: 'Counter-attack if hit during startup',
        colors: {
            body: '#1B2A4A',
            accent: '#222',
            skin: '#F5CBA7',
            hair: '#C4A74C',
            outline: '#1B2A4A'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            ctx.fillStyle = '#222';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            // Dark tee
            ctx.fillStyle = '#222';
            ctx.fillRect(-w * 0.28, -h * 0.03, w * 0.56, h * 0.4);

            // Navy blazer (open)
            ctx.fillStyle = '#1B2A4A';
            ctx.fillRect(-w * 0.32, -h * 0.05, w * 0.16, h * 0.42);
            ctx.fillRect(w * 0.16, -h * 0.05, w * 0.16, h * 0.42);

            // Arms
            ctx.fillStyle = '#1B2A4A';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Counter stance - arms crossed
                ctx.fillRect(-w * 0.15, h * 0.0, w * 0.3, h * 0.12);
            } else {
                ctx.fillRect(-w * 0.4, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.28, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.4, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.28, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Short blonde hair
            ctx.fillStyle = '#C4A74C';
            ctx.beginPath();
            ctx.arc(0, -h * 0.27, w * 0.18, Math.PI * 1.15, -0.15);
            ctx.fill();

            // Smirking mouth
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(w * 0.02, -h * 0.14, w * 0.06, 0.1, Math.PI * 0.6);
            ctx.stroke();

            // Eyes
            ctx.fillStyle = '#5B86A7';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },

    otosi: {
        name: 'otosi',
        displayName: 'OTOSI',
        image: 'assets/otosi.jpg',
        health: 85,
        speed: 4,
        jumpPower: 13,
        weight: 0.9,
        attackMultiplier: 1.15,
        specialName: 'Executive Reach',
        specialDamage: 23,
        specialDescription: 'Long-range elegant strike',
        colors: {
            body: '#222',
            accent: '#FFF',
            skin: '#F5CBA7',
            hair: '#555',
            outline: '#333'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs (suit trousers)
            ctx.fillStyle = '#222';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            // Dress shoes
            ctx.fillStyle = '#111';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            // White shirt
            ctx.fillStyle = '#F0F0F0';
            ctx.fillRect(-w * 0.25, -h * 0.03, w * 0.5, h * 0.4);

            // Dark suit jacket (sharp)
            ctx.fillStyle = '#222';
            ctx.fillRect(-w * 0.32, -h * 0.05, w * 0.14, h * 0.42);
            ctx.fillRect(w * 0.18, -h * 0.05, w * 0.14, h * 0.42);

            // Suit lapels
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.moveTo(-w * 0.18, -h * 0.05);
            ctx.lineTo(-w * 0.08, h * 0.1);
            ctx.lineTo(-w * 0.18, h * 0.1);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(w * 0.18, -h * 0.05);
            ctx.lineTo(w * 0.08, h * 0.1);
            ctx.lineTo(w * 0.18, h * 0.1);
            ctx.fill();

            // Watch on wrist
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(w * 0.26, h * 0.2, w * 0.06, h * 0.04);

            // Arms
            ctx.fillStyle = '#222';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.4, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.6, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.4, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.6, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Long reach arm
                ctx.fillRect(w * 0.2, -h * 0.02, w * 0.5, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.65, -h * 0.02, w * 0.1, h * 0.1);
            } else {
                ctx.fillRect(-w * 0.4, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.28, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.4, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.28, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head (taller, formal look)
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.19, 0, Math.PI * 2);
            ctx.fill();

            // Short grey/dark hair
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(0, -h * 0.27, w * 0.17, Math.PI * 1.1, -0.1);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#444';
            ctx.beginPath();
            ctx.arc(-w * 0.07, -h * 0.22, w * 0.025, 0, Math.PI * 2);
            ctx.arc(w * 0.07, -h * 0.22, w * 0.025, 0, Math.PI * 2);
            ctx.fill();

            // Confident smile
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -h * 0.15, w * 0.06, 0.2, Math.PI * 0.8);
            ctx.stroke();

            ctx.restore();
        }
    },

    matkum: {
        name: 'matkum',
        displayName: 'MATKUM',
        image: 'assets/matkum.jpg',
        health: 130,
        speed: 3,
        jumpPower: 11,
        weight: 1.4,
        attackMultiplier: 1.05,
        specialName: 'Iron Wall',
        specialDamage: 15,
        specialDescription: 'Temporary super-armor',
        colors: {
            body: '#333',
            accent: '#444',
            skin: '#F5CBA7',
            outline: '#333'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs (wider - bulky build)
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.26, h * 0.35, w * 0.22, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.22, h * 0.35);

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-w * 0.28, h * 0.65, w * 0.26, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.26, h * 0.08);

            // Dark sweater (bulky torso)
            ctx.fillStyle = '#333';
            ctx.fillRect(-w * 0.38, -h * 0.05, w * 0.76, h * 0.42);

            // Sweater ribbing at bottom
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(-w * 0.38, h * 0.3, w * 0.76, h * 0.05);

            // Arms (thick)
            ctx.fillStyle = '#333';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.32, -h * 0.04, w * 0.35, h * 0.15);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.62, -h * 0.04, w * 0.13, h * 0.15);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.32, h * 0.12, w * 0.35, h * 0.15);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.62, h * 0.12, w * 0.13, h * 0.15);
            } else if (state === 'special') {
                // Iron wall - arms crossed defense
                ctx.fillRect(-w * 0.2, -h * 0.02, w * 0.4, h * 0.15);
                // Glow effect for super armor
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(-w * 0.4, -h * 0.1, w * 0.8, h * 0.55);
            } else {
                ctx.fillRect(-w * 0.46, -h * 0.02, w * 0.14, h * 0.3);
                ctx.fillRect(w * 0.32, -h * 0.02, w * 0.14, h * 0.3);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.46, h * 0.24, w * 0.14, h * 0.08);
                ctx.fillRect(w * 0.32, h * 0.24, w * 0.14, h * 0.08);
            }

            // Head (round)
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.22, 0, Math.PI * 2);
            ctx.fill();

            // Balding - minimal hair on sides
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(-w * 0.22, -h * 0.22, w * 0.06, h * 0.08);
            ctx.fillRect(w * 0.16, -h * 0.22, w * 0.06, h * 0.08);

            // Eyes
            ctx.fillStyle = '#5B86A7';
            ctx.beginPath();
            ctx.arc(-w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.08, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    },

    thepanu: {
        name: 'thepanu',
        displayName: 'THEPANU',
        image: 'assets/thepanu.jpg',
        health: 110,
        speed: 4,
        jumpPower: 18,
        weight: 1.1,
        attackMultiplier: 0.95,
        specialName: 'Zen Block',
        specialDamage: 20,
        specialDescription: 'Perfect parry that stuns',
        colors: {
            body: '#1B3A2A',
            accent: '#D4C5A0',
            skin: '#F5CBA7',
            outline: '#1B3A2A'
        },
        draw(ctx, x, y, w, h, facing, state) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            // Legs
            ctx.fillStyle = '#2C3E50';
            ctx.fillRect(-w * 0.22, h * 0.35, w * 0.18, h * 0.35);
            ctx.fillRect(w * 0.04, h * 0.35, w * 0.18, h * 0.35);

            ctx.fillStyle = '#1a1a1a';
            ctx.fillRect(-w * 0.24, h * 0.65, w * 0.22, h * 0.08);
            ctx.fillRect(w * 0.02, h * 0.65, w * 0.22, h * 0.08);

            // Light shirt
            ctx.fillStyle = '#D4C5A0';
            ctx.fillRect(-w * 0.26, -h * 0.03, w * 0.52, h * 0.4);

            // Dark blazer
            ctx.fillStyle = '#1B3A2A';
            ctx.fillRect(-w * 0.32, -h * 0.05, w * 0.14, h * 0.42);
            ctx.fillRect(w * 0.18, -h * 0.05, w * 0.14, h * 0.42);

            // Arms
            ctx.fillStyle = '#1B3A2A';
            if (state === 'highPunch' || state === 'uppercut') {
                ctx.fillRect(w * 0.25, -h * 0.02, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, -h * 0.02, w * 0.1, h * 0.1);
            } else if (state === 'lowPunch') {
                ctx.fillRect(w * 0.25, h * 0.15, w * 0.35, h * 0.1);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(w * 0.55, h * 0.15, w * 0.1, h * 0.1);
            } else if (state === 'special') {
                // Zen pose - palms forward
                ctx.fillRect(w * 0.15, -h * 0.05, w * 0.25, h * 0.12);
                ctx.fillRect(w * 0.15, h * 0.1, w * 0.25, h * 0.12);
                // Zen energy glow
                ctx.strokeStyle = '#00FF88';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(w * 0.35, h * 0.04, w * 0.15, 0, Math.PI * 2);
                ctx.stroke();
            } else {
                ctx.fillRect(-w * 0.4, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillRect(w * 0.28, -h * 0.02, w * 0.12, h * 0.28);
                ctx.fillStyle = this.colors.skin;
                ctx.fillRect(-w * 0.4, h * 0.22, w * 0.12, h * 0.08);
                ctx.fillRect(w * 0.28, h * 0.22, w * 0.12, h * 0.08);
            }

            // Head (bald)
            ctx.fillStyle = this.colors.skin;
            ctx.beginPath();
            ctx.arc(0, -h * 0.2, w * 0.2, 0, Math.PI * 2);
            ctx.fill();

            // Beard
            ctx.fillStyle = '#6B4226';
            ctx.beginPath();
            ctx.arc(0, -h * 0.12, w * 0.14, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(-w * 0.14, -h * 0.18, w * 0.04, h * 0.08);
            ctx.fillRect(w * 0.1, -h * 0.18, w * 0.04, h * 0.08);

            // Warm eyes
            ctx.fillStyle = '#5B7744';
            ctx.beginPath();
            ctx.arc(-w * 0.07, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.arc(w * 0.07, -h * 0.22, w * 0.03, 0, Math.PI * 2);
            ctx.fill();

            // Smile
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(0, -h * 0.16, w * 0.07, 0.15, Math.PI * 0.85);
            ctx.stroke();

            ctx.restore();
        }
    }
};

const CHARACTER_LIST = ['borre', 'idaho', 'ruff', 'pelam', 'timo', 'otosi', 'matkum', 'thepanu'];
