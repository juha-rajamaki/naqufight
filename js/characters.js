// ========================
// 3D SHADING HELPERS
// ========================
const CharFX = {
    // Gradient-filled rectangle (lighter top, darker bottom) — used for jacket panels etc.
    bodyRect(ctx, x, y, w, h, color) {
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, CharFX.lighten(color, 25));
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, CharFX.darken(color, 30));
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = CharFX.darken(color, 50);
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
    },

    // Trapezoid torso — wider shoulders, narrower waist
    trapezoidBody(ctx, cx, y, topW, botW, h, color) {
        const grad = ctx.createLinearGradient(cx, y, cx, y + h);
        grad.addColorStop(0, CharFX.lighten(color, 25));
        grad.addColorStop(0.4, color);
        grad.addColorStop(1, CharFX.darken(color, 30));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(cx - topW / 2, y);
        ctx.lineTo(cx + topW / 2, y);
        ctx.lineTo(cx + botW / 2, y + h);
        ctx.lineTo(cx - botW / 2, y + h);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = CharFX.darken(color, 50);
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    // Neck cylinder between head and torso
    neck(ctx, cx, topY, botY, neckW, skinColor) {
        const grad = ctx.createLinearGradient(cx - neckW / 2, topY, cx + neckW / 2, topY);
        grad.addColorStop(0, CharFX.darken(skinColor, 15));
        grad.addColorStop(0.4, CharFX.lighten(skinColor, 10));
        grad.addColorStop(1, CharFX.darken(skinColor, 30));
        ctx.fillStyle = grad;
        ctx.fillRect(cx - neckW / 2, topY, neckW, botY - topY);
    },

    // Joint circle (shoulder, elbow, knee, hip)
    jointCircle(ctx, cx, cy, r, color) {
        const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
        grad.addColorStop(0, CharFX.lighten(color, 20));
        grad.addColorStop(0.7, color);
        grad.addColorStop(1, CharFX.darken(color, 25));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    },

    // Belt / waist separator
    belt(ctx, cx, y, beltW, beltH, color) {
        const grad = ctx.createLinearGradient(cx - beltW / 2, y, cx - beltW / 2, y + beltH);
        grad.addColorStop(0, CharFX.lighten(color, 10));
        grad.addColorStop(1, CharFX.darken(color, 15));
        ctx.fillStyle = grad;
        ctx.fillRect(cx - beltW / 2, y, beltW, beltH);
        ctx.fillStyle = CharFX.lighten(color, 30);
        ctx.fillRect(cx - beltH * 0.6, y, beltH * 1.2, beltH);
    },

    // Single rotated limb segment with cross-gradient
    _drawSegment(ctx, x1, y1, x2, y2, thickness, color) {
        const dx = x2 - x1, dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 0.5) return;
        const angle = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(x1, y1);
        ctx.rotate(angle);
        const grad = ctx.createLinearGradient(0, -thickness / 2, 0, thickness / 2);
        grad.addColorStop(0, CharFX.lighten(color, 15));
        grad.addColorStop(0.45, color);
        grad.addColorStop(1, CharFX.darken(color, 20));
        ctx.fillStyle = grad;
        ctx.fillRect(0, -thickness / 2, len, thickness);
        ctx.strokeStyle = CharFX.darken(color, 40);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(0, -thickness / 2, len, thickness);
        ctx.restore();
    },

    // Two-segment limb with joint at midpoint
    segLimb(ctx, x1, y1, x2, y2, x3, y3, upperW, lowerW, color, jointR) {
        this._drawSegment(ctx, x1, y1, x2, y2, upperW, color);
        this._drawSegment(ctx, x2, y2, x3, y3, lowerW, color);
        this.jointCircle(ctx, x2, y2, jointR, color);
    },

    // Gradient limb with shadow edge (kept for simple uses)
    limb(ctx, x, y, w, h, color) {
        const grad = ctx.createLinearGradient(x, y, x + w, y);
        grad.addColorStop(0, CharFX.darken(color, 20));
        grad.addColorStop(0.3, CharFX.lighten(color, 15));
        grad.addColorStop(1, CharFX.darken(color, 35));
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = CharFX.darken(color, 50);
        ctx.lineWidth = 0.8;
        ctx.strokeRect(x, y, w, h);
    },

    // 3D head with radial gradient
    head(ctx, cx, cy, radius, skinColor) {
        const grad = ctx.createRadialGradient(
            cx - radius * 0.25, cy - radius * 0.25, radius * 0.1,
            cx, cy, radius
        );
        grad.addColorStop(0, CharFX.lighten(skinColor, 30));
        grad.addColorStop(0.6, skinColor);
        grad.addColorStop(1, CharFX.darken(skinColor, 25));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = CharFX.darken(skinColor, 40);
        ctx.lineWidth = 1;
        ctx.stroke();
    },

    // Face: eyebrows, detailed eyes, nose shadow, mouth
    face(ctx, cx, cy, r, eyeColor, opts) {
        opts = opts || {};
        const skin = opts.skinColor || '#F5CBA7';
        // Eyebrows
        if (!opts.noEyebrows) {
            ctx.strokeStyle = opts.browColor || '#5D4E37';
            ctx.lineWidth = Math.max(1.5, r * 0.12);
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(cx - r * 0.55, cy - r * 0.22);
            ctx.lineTo(cx - r * 0.18, cy - r * 0.32);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx + r * 0.18, cy - r * 0.32);
            ctx.lineTo(cx + r * 0.55, cy - r * 0.22);
            ctx.stroke();
        }
        // Eye whites
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.08, r * 0.20, r * 0.14, 0, 0, Math.PI * 2);
        ctx.ellipse(cx + r * 0.35, cy - r * 0.08, r * 0.20, r * 0.14, 0, 0, Math.PI * 2);
        ctx.fill();
        // Iris
        ctx.fillStyle = eyeColor;
        ctx.beginPath();
        ctx.arc(cx - r * 0.35, cy - r * 0.05, r * 0.13, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.35, cy - r * 0.05, r * 0.13, 0, Math.PI * 2);
        ctx.fill();
        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(cx - r * 0.40, cy - r * 0.10, r * 0.05, 0, Math.PI * 2);
        ctx.arc(cx + r * 0.40, cy - r * 0.10, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        // Nose shadow
        if (!opts.noNose) {
            ctx.fillStyle = CharFX.darken(skin, 18);
            ctx.beginPath();
            ctx.moveTo(cx, cy + r * 0.05);
            ctx.lineTo(cx - r * 0.07, cy + r * 0.25);
            ctx.lineTo(cx + r * 0.07, cy + r * 0.25);
            ctx.closePath();
            ctx.fill();
        }
        // Mouth
        if (!opts.noMouth) {
            ctx.strokeStyle = opts.mouthColor || '#A0522D';
            ctx.lineWidth = 1.2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(cx, cy + r * 0.5, r * 0.18, 0.15, Math.PI * 0.85);
            ctx.stroke();
        }
    },

    // Shoe with 3D shading
    shoe(ctx, x, y, w, h, color) {
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, CharFX.lighten(color, 20));
        grad.addColorStop(1, color);
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = CharFX.lighten(color, 10);
        ctx.fillRect(x, y + h - 2, w, 2);
    },

    // Hand with radial gradient
    hand(ctx, cx, cy, r, skinColor) {
        const grad = ctx.createRadialGradient(cx - r * 0.2, cy - r * 0.2, r * 0.1, cx, cy, r);
        grad.addColorStop(0, CharFX.lighten(skinColor, 15));
        grad.addColorStop(1, CharFX.darken(skinColor, 15));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    },

    // Color utilities with cache
    _colorCache: {},
    _rgb(hex) {
        if (this._colorCache[hex]) return this._colorCache[hex];
        let r = 128, g = 128, b = 128;
        if (hex && hex.startsWith('rgb')) {
            const m = hex.match(/(\d+)/g);
            if (m && m.length >= 3) { r = +m[0]; g = +m[1]; b = +m[2]; }
        } else if (hex && hex.startsWith('#')) {
            const n = parseInt(hex.replace('#', ''), 16);
            if (!isNaN(n)) { r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255; }
        }
        const result = { r, g, b };
        this._colorCache[hex] = result;
        return result;
    },
    lighten(hex, amt) {
        const c = this._rgb(hex);
        return `rgb(${Math.min(255, c.r + amt)},${Math.min(255, c.g + amt)},${Math.min(255, c.b + amt)})`;
    },
    darken(hex, amt) {
        const c = this._rgb(hex);
        return `rgb(${Math.max(0, c.r - amt)},${Math.max(0, c.g - amt)},${Math.max(0, c.b - amt)})`;
    }
};

// ========================
// SHARED SEGMENTED LEG DRAWING
// ========================
// layer: 'under' = planted leg only (draw before body), 'over' = kicking leg only (draw after body), undefined = both
function drawLegs(ctx, w, h, attackState, legColor, shoeColor, legW, legGap, layer) {
    const lw = legW || 0.18;
    const lg = legGap || 0.22;
    const jr = w * 0.035;
    const thighW = w * lw * 0.85;
    const calfW = w * lw * 0.7;
    const shW = w * (lw + 0.02);
    const shH = h * 0.07;
    const isKick = attackState === 'highKick' || attackState === 'jumpKick' || attackState === 'lowKick';
    let lh, lk, la, rh, rk, ra;

    // Skip drawing based on layer
    if (layer === 'over' && !isKick) return;

    if (attackState === 'fatalityBlow') {
        lh = { x: -w * (lg + 0.06), y: h * 0.35 };
        lk = { x: -w * (lg + 0.08), y: h * 0.50 };
        la = { x: -w * (lg + 0.06), y: h * 0.63 };
        rh = { x: w * 0.10, y: h * 0.35 };
        rk = { x: w * 0.14, y: h * 0.50 };
        ra = { x: w * 0.12, y: h * 0.63 };
    } else if (attackState === 'highKick' || attackState === 'jumpKick') {
        // Back leg planted, slightly bent for support
        lh = { x: -w * (lg + 0.02), y: h * 0.35 };
        lk = { x: -w * (lg + 0.06), y: h * 0.50 };
        la = { x: -w * (lg + 0.03), y: h * 0.63 };
        // Kicking leg — knee drives up, foot extends to head height
        rh = { x: w * 0.02, y: h * 0.34 };
        rk = { x: w * 0.16, y: h * 0.08 };
        ra = { x: w * 0.40, y: -h * 0.08 };
    } else if (attackState === 'lowKick') {
        lh = { x: -w * lg, y: h * 0.35 };
        lk = { x: -w * (lg + 0.02), y: h * 0.50 };
        la = { x: -w * lg, y: h * 0.63 };
        rh = { x: w * 0.02, y: h * 0.42 };
        rk = { x: w * 0.18, y: h * 0.48 };
        ra = { x: w * 0.38, y: h * 0.55 };
    } else if (attackState === 'uppercut') {
        lh = { x: -w * (lg + 0.04), y: h * 0.35 };
        lk = { x: -w * (lg + 0.06), y: h * 0.50 };
        la = { x: -w * (lg + 0.04), y: h * 0.63 };
        rh = { x: w * 0.10, y: h * 0.35 };
        rk = { x: w * 0.12, y: h * 0.50 };
        ra = { x: w * 0.10, y: h * 0.63 };
    } else {
        lh = { x: -w * lg, y: h * 0.35 };
        lk = { x: -w * (lg + 0.03), y: h * 0.49 };
        la = { x: -w * (lg + 0.01), y: h * 0.63 };
        rh = { x: w * 0.04, y: h * 0.35 };
        rk = { x: w * 0.07, y: h * 0.49 };
        ra = { x: w * 0.05, y: h * 0.63 };
    }

    // Left (planted/back) leg — draw in 'under' pass or when no layer specified
    if (layer !== 'over') {
        CharFX.jointCircle(ctx, lh.x, lh.y, jr, legColor);
        CharFX.segLimb(ctx, lh.x, lh.y, lk.x, lk.y, la.x, la.y, thighW, calfW, legColor, jr * 0.8);
        CharFX.shoe(ctx, la.x - shW / 2, la.y, shW, shH, shoeColor);
    }

    // Right (kicking/front) leg — draw in 'over' pass for kicks, or when no layer specified
    if (layer !== 'under' || !isKick) {
        CharFX.jointCircle(ctx, rh.x, rh.y, jr, legColor);
        CharFX.segLimb(ctx, rh.x, rh.y, rk.x, rk.y, ra.x, ra.y, thighW, calfW, legColor, jr * 0.8);
        CharFX.shoe(ctx, ra.x - shW / 2, ra.y, shW, shH, shoeColor);
    }
}

// ========================
// SHARED SEGMENTED ARM DRAWING
// ========================
function drawBackArm(ctx, w, h, armColor, skinColor, thick) {
    const t = thick || 1.0;
    const jr = w * 0.028 * t;
    const uW = w * 0.09 * t;
    const fW = w * 0.075 * t;
    CharFX.jointCircle(ctx, -w * 0.30, -h * 0.02, jr, armColor);
    CharFX.segLimb(ctx, -w * 0.30, -h * 0.02, -w * 0.34, h * 0.12, -w * 0.30, h * 0.24,
        uW, fW, armColor, jr * 0.8);
    CharFX.hand(ctx, -w * 0.30, h * 0.28, w * 0.04 * t, skinColor);
}

function drawFrontArm(ctx, w, h, armColor, skinColor, thick) {
    const t = thick || 1.0;
    const jr = w * 0.028 * t;
    const uW = w * 0.09 * t;
    const fW = w * 0.075 * t;
    CharFX.jointCircle(ctx, w * 0.28, -h * 0.02, jr, armColor);
    CharFX.segLimb(ctx, w * 0.28, -h * 0.02, w * 0.32, h * 0.12, w * 0.28, h * 0.24,
        uW, fW, armColor, jr * 0.8);
    CharFX.hand(ctx, w * 0.28, h * 0.28, w * 0.04 * t, skinColor);
}

// Shared attack arm drawing (front arm only, returns false if not handled)
function drawArms(ctx, w, h, attackState, armColor, skinColor, armW) {
    const aw = armW || 0.12;
    const jr = w * 0.03;
    const uW = w * aw * 0.85;
    const fW = w * aw * 0.7;
    const handR = w * 0.05;

    if (attackState === 'fatalityBlow') {
        CharFX.jointCircle(ctx, w * 0.26, -h * 0.03, jr, armColor);
        CharFX.segLimb(ctx, w * 0.26, -h * 0.04, w * 0.40, -h * 0.02, w * 0.56, h * 0.00,
            uW, fW, armColor, jr * 0.8);
        CharFX.hand(ctx, w * 0.60, h * 0.00, handR, skinColor);
        CharFX.segLimb(ctx, w * 0.26, h * 0.08, w * 0.40, h * 0.10, w * 0.56, h * 0.12,
            uW, fW, armColor, jr * 0.8);
        CharFX.hand(ctx, w * 0.60, h * 0.12, handR, skinColor);
    } else if (attackState === 'highPunch' || attackState === 'uppercut') {
        CharFX.jointCircle(ctx, w * 0.26, -h * 0.02, jr, armColor);
        CharFX.segLimb(ctx, w * 0.26, -h * 0.02, w * 0.40, h * 0.00, w * 0.56, h * 0.02,
            uW, fW, armColor, jr * 0.8);
        CharFX.hand(ctx, w * 0.60, h * 0.02, handR, skinColor);
    } else if (attackState === 'lowPunch') {
        CharFX.jointCircle(ctx, w * 0.26, h * 0.04, jr, armColor);
        CharFX.segLimb(ctx, w * 0.26, h * 0.04, w * 0.40, h * 0.12, w * 0.56, h * 0.18,
            uW, fW, armColor, jr * 0.8);
        CharFX.hand(ctx, w * 0.60, h * 0.18, handR, skinColor);
    } else if (attackState === 'jumpPunch') {
        CharFX.jointCircle(ctx, w * 0.22, -h * 0.08, jr, armColor);
        CharFX.segLimb(ctx, w * 0.22, -h * 0.08, w * 0.36, -h * 0.06, w * 0.52, -h * 0.04,
            uW, fW, armColor, jr * 0.8);
        CharFX.hand(ctx, w * 0.56, -h * 0.04, handR, skinColor);
    } else {
        return false;
    }
    return true;
}

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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, '#888', this.colors.skin);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#555');
            CharFX.trapezoidBody(ctx, 0, -h * 0.05, w * 0.64, w * 0.50, h * 0.40, '#888');

            // Hoodie pocket
            ctx.fillStyle = '#777';
            ctx.fillRect(-w * 0.18, h * 0.18, w * 0.36, h * 0.1);
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(-w * 0.18, h * 0.18, w * 0.36, h * 0.1);

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, -w * 0.05, -h * 0.15, jr, '#888');
                CharFX.segLimb(ctx, -w * 0.05, -h * 0.15, -w * 0.02, -h * 0.28, 0, -h * 0.38,
                    w * 0.09, w * 0.075, '#888', jr * 0.8);
                CharFX.jointCircle(ctx, w * 0.05, -h * 0.15, jr, '#888');
                CharFX.segLimb(ctx, w * 0.05, -h * 0.15, w * 0.02, -h * 0.28, 0, -h * 0.38,
                    w * 0.09, w * 0.075, '#888', jr * 0.8);
                CharFX.hand(ctx, 0, -h * 0.42, w * 0.05, this.colors.skin);
            } else if (!drawArms(ctx, w, h, attackState, '#888', this.colors.skin)) {
                drawFrontArm(ctx, w, h, '#888', this.colors.skin);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.20, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.20, '#3498DB', { browColor: '#5D4E37', skinColor: this.colors.skin });

            // Red beanie with gradient
            const beanieGrad = ctx.createLinearGradient(0, -h * 0.35, 0, -h * 0.2);
            beanieGrad.addColorStop(0, '#EE2222');
            beanieGrad.addColorStop(1, '#AA0000');
            ctx.fillStyle = beanieGrad;
            ctx.beginPath();
            ctx.arc(0, -h * 0.25, w * 0.22, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(-w * 0.22, -h * 0.3, w * 0.44, h * 0.08);
            ctx.fillStyle = '#990000';
            ctx.fillRect(-w * 0.22, -h * 0.22, w * 0.44, h * 0.04);
            ctx.fillStyle = '#FFF';
            ctx.font = `bold ${w * 0.18}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('B', 0, -h * 0.24);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, '#111', this.colors.skin);

            ctx.shadowColor = '#00F2EA';
            ctx.shadowBlur = 8;
            drawLegs(ctx, w, h, attackState, '#111', '#00F2EA', undefined, undefined, 'under');
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';

            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#00F2EA');
            CharFX.trapezoidBody(ctx, 0, -h * 0.05, w * 0.64, w * 0.50, h * 0.40, '#111');

            // Neon stripes
            ctx.fillStyle = '#00F2EA';
            ctx.fillRect(-w * 0.28, h * 0.0, w * 0.56, h * 0.02);
            ctx.fillStyle = '#FF0050';
            ctx.fillRect(-w * 0.26, h * 0.1, w * 0.52, h * 0.02);

            // TikTok note
            ctx.fillStyle = '#00F2EA';
            ctx.font = `bold ${w * 0.22}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText('♪', 0, h * 0.08);

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, w * 0.24, -h * 0.04, jr, '#111');
                CharFX.segLimb(ctx, w * 0.24, -h * 0.04, w * 0.38, -h * 0.02, w * 0.54, -h * 0.02,
                    w * 0.09, w * 0.075, '#111', jr * 0.8);
                ctx.shadowColor = '#FF0050';
                ctx.shadowBlur = 15;
                CharFX.hand(ctx, w * 0.58, -h * 0.02, w * 0.06, '#FF0050');
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
            } else if (!drawArms(ctx, w, h, attackState, '#111', this.colors.skin)) {
                drawFrontArm(ctx, w, h, '#111', this.colors.skin);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.20, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.20, '#333', { browColor: '#333', skinColor: this.colors.skin });

            ctx.shadowColor = '#00F2EA';
            ctx.shadowBlur = 8;
            drawLegs(ctx, w, h, attackState, '#111', '#00F2EA', undefined, undefined, 'over');
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            const ac = '#1a1a3a', sk = this.colors.skin, t = 1.2;
            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, ac, sk, t);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', 0.22, 0.25, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.62, h * 0.035, '#333');
            CharFX.trapezoidBody(ctx, 0, -h * 0.05, w * 0.76, w * 0.62, h * 0.40, ac);

            // Pattern dots
            ctx.fillStyle = '#4a4a8a';
            for (let px = -w * 0.28; px < w * 0.28; px += w * 0.1) {
                for (let py = 0; py < h * 0.3; py += h * 0.08) {
                    ctx.beginPath();
                    ctx.arc(px, py, w * 0.02, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.14, sk);

            // Thick segmented arms
            const jr = w * 0.035, uW = w * 0.12, fW = w * 0.10, hR = w * 0.06;
            if (attackState === 'special') {
                CharFX.jointCircle(ctx, w * 0.30, -h * 0.04, jr, ac);
                CharFX.segLimb(ctx, w * 0.30, -h * 0.04, w * 0.42, h * 0.0, w * 0.56, h * 0.04, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.60, h * 0.04, hR, sk);
                CharFX.segLimb(ctx, w * 0.30, h * 0.08, w * 0.42, h * 0.14, w * 0.56, h * 0.18, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.60, h * 0.18, hR, sk);
            } else if (attackState === 'fatalityBlow') {
                CharFX.jointCircle(ctx, w * 0.30, -h * 0.03, jr, ac);
                CharFX.segLimb(ctx, w * 0.30, -h * 0.04, w * 0.44, -h * 0.02, w * 0.58, h * 0.00, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.62, h * 0.00, hR, sk);
                CharFX.segLimb(ctx, w * 0.30, h * 0.08, w * 0.44, h * 0.10, w * 0.58, h * 0.12, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.62, h * 0.12, hR, sk);
            } else if (attackState === 'highPunch' || attackState === 'uppercut') {
                CharFX.jointCircle(ctx, w * 0.30, -h * 0.02, jr, ac);
                CharFX.segLimb(ctx, w * 0.30, -h * 0.02, w * 0.44, h * 0.0, w * 0.60, h * 0.04, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.64, h * 0.04, hR, sk);
            } else if (attackState === 'lowPunch') {
                CharFX.jointCircle(ctx, w * 0.30, h * 0.06, jr, ac);
                CharFX.segLimb(ctx, w * 0.30, h * 0.06, w * 0.44, h * 0.14, w * 0.60, h * 0.20, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.64, h * 0.20, hR, sk);
            } else if (attackState === 'jumpPunch') {
                CharFX.jointCircle(ctx, w * 0.28, -h * 0.10, jr, ac);
                CharFX.segLimb(ctx, w * 0.28, -h * 0.10, w * 0.42, -h * 0.06, w * 0.58, -h * 0.02, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.62, -h * 0.02, hR, sk);
            } else {
                drawFrontArm(ctx, w, h, ac, sk, t);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.22, sk);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.22, '#5B86A7', { browColor: '#5D4E37', skinColor: sk });

            // Short brown hair
            ctx.fillStyle = '#5D4E37';
            ctx.beginPath();
            ctx.arc(0, -h * 0.26, w * 0.22, Math.PI, 0);
            ctx.fill();

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', 0.22, 0.25, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, '#FFF', this.colors.skin);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#333');

            // Striped shirt — draw trapezoid then clip stripes
            CharFX.trapezoidBody(ctx, 0, -h * 0.05, w * 0.64, w * 0.50, h * 0.40, '#FFF');
            ctx.save();
            try {
                ctx.beginPath();
                ctx.moveTo(-w * 0.32, -h * 0.05);
                ctx.lineTo(w * 0.32, -h * 0.05);
                ctx.lineTo(w * 0.25, h * 0.35);
                ctx.lineTo(-w * 0.25, h * 0.35);
                ctx.closePath();
                ctx.clip();
                ctx.fillStyle = '#CC3333';
                for (let sy = -h * 0.03; sy < h * 0.35; sy += h * 0.06) {
                    ctx.fillRect(-w * 0.35, sy, w * 0.70, h * 0.02);
                }
            } finally {
                ctx.restore();
            }

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, w * 0.24, -h * 0.06, jr, '#FFF');
                CharFX.segLimb(ctx, w * 0.24, -h * 0.06, w * 0.36, -h * 0.04, w * 0.50, -h * 0.06, w * 0.09, w * 0.075, '#FFF', jr * 0.8);
                CharFX.hand(ctx, w * 0.54, -h * 0.06, w * 0.045, this.colors.skin);
                CharFX.segLimb(ctx, w * 0.24, h * 0.02, w * 0.38, h * 0.04, w * 0.52, h * 0.06, w * 0.09, w * 0.075, '#FFF', jr * 0.8);
                CharFX.hand(ctx, w * 0.56, h * 0.06, w * 0.045, this.colors.skin);
                CharFX.segLimb(ctx, w * 0.24, h * 0.12, w * 0.36, h * 0.16, w * 0.50, h * 0.20, w * 0.09, w * 0.075, '#FFF', jr * 0.8);
                CharFX.hand(ctx, w * 0.54, h * 0.20, w * 0.045, this.colors.skin);
            } else if (!drawArms(ctx, w, h, attackState, '#FFF', this.colors.skin)) {
                drawFrontArm(ctx, w, h, '#FFF', this.colors.skin);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.20, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.20, '#5B86A7', { browColor: '#D4A44C', skinColor: this.colors.skin });

            // Blonde hair
            ctx.fillStyle = '#D4A44C';
            ctx.beginPath();
            ctx.arc(0, -h * 0.26, w * 0.21, Math.PI * 1.1, -0.1);
            ctx.fill();

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            const ac = '#1B2A4A';
            if (attackState !== 'fatalityBlow')
                drawBackArm(ctx, w, h, ac, this.colors.skin);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#222', undefined, undefined, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#333');

            // Dark tee
            CharFX.trapezoidBody(ctx, 0, -h * 0.03, w * 0.56, w * 0.46, h * 0.38, '#222');
            // Navy blazer panels
            CharFX.bodyRect(ctx, -w * 0.32, -h * 0.05, w * 0.15, h * 0.42, ac);
            CharFX.bodyRect(ctx, w * 0.17, -h * 0.05, w * 0.15, h * 0.42, ac);

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, -w * 0.10, -h * 0.02, jr, ac);
                CharFX.segLimb(ctx, -w * 0.10, -h * 0.02, w * 0.02, h * 0.02, w * 0.15, h * 0.0,
                    w * 0.09, w * 0.075, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.19, h * 0.0, w * 0.045, this.colors.skin);
            } else if (!drawArms(ctx, w, h, attackState, ac, this.colors.skin)) {
                drawFrontArm(ctx, w, h, ac, this.colors.skin);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.20, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.20, '#5B86A7', { browColor: '#C4A74C', skinColor: this.colors.skin, noMouth: true });

            // Custom smirk
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(w * 0.02, -h * 0.14, w * 0.06, 0.1, Math.PI * 0.6);
            ctx.stroke();

            // Short blonde hair
            ctx.fillStyle = '#C4A74C';
            ctx.beginPath();
            ctx.arc(0, -h * 0.27, w * 0.18, Math.PI * 1.15, -0.15);
            ctx.fill();

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#222', undefined, undefined, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            const ac = '#222';
            if (attackState !== 'fatalityBlow')
                drawBackArm(ctx, w, h, ac, this.colors.skin);

            drawLegs(ctx, w, h, attackState, '#222', '#111', undefined, undefined, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#333');

            // White shirt
            CharFX.trapezoidBody(ctx, 0, -h * 0.03, w * 0.54, w * 0.44, h * 0.38, '#F0F0F0');
            // Suit jacket panels
            CharFX.bodyRect(ctx, -w * 0.32, -h * 0.05, w * 0.13, h * 0.42, ac);
            CharFX.bodyRect(ctx, w * 0.19, -h * 0.05, w * 0.13, h * 0.42, ac);

            // Lapels
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

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, w * 0.24, -h * 0.02, jr, ac);
                CharFX.segLimb(ctx, w * 0.24, -h * 0.02, w * 0.42, h * 0.0, w * 0.62, h * 0.02,
                    w * 0.09, w * 0.075, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.66, h * 0.02, w * 0.05, this.colors.skin);
            } else if (!drawArms(ctx, w, h, attackState, ac, this.colors.skin)) {
                drawFrontArm(ctx, w, h, ac, this.colors.skin);
            }

            // Watch
            ctx.fillStyle = '#C0C0C0';
            ctx.fillRect(w * 0.24, h * 0.20, w * 0.06, h * 0.04);

            CharFX.head(ctx, 0, -h * 0.20, w * 0.19, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.19, '#444', { browColor: '#555', skinColor: this.colors.skin, noMouth: true });

            // Custom smile
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, -h * 0.15, w * 0.06, 0.2, Math.PI * 0.8);
            ctx.stroke();

            // Short grey hair
            ctx.fillStyle = '#555';
            ctx.beginPath();
            ctx.arc(0, -h * 0.27, w * 0.17, Math.PI * 1.1, -0.1);
            ctx.fill();

            drawLegs(ctx, w, h, attackState, '#222', '#111', undefined, undefined, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            const ac = '#333', sk = this.colors.skin, t = 1.3;
            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, ac, sk, t);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', 0.22, 0.26, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.66, h * 0.035, '#2a2a2a');
            CharFX.trapezoidBody(ctx, 0, -h * 0.05, w * 0.80, w * 0.66, h * 0.40, ac);

            // Sweater ribbing
            ctx.fillStyle = '#2a2a2a';
            ctx.fillRect(-w * 0.33, h * 0.28, w * 0.66, h * 0.05);

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.14, sk);

            // Very thick segmented arms
            const jr = w * 0.038, uW = w * 0.14, fW = w * 0.12, hR = w * 0.065;
            if (attackState === 'special') {
                CharFX.jointCircle(ctx, -w * 0.15, -h * 0.02, jr, ac);
                CharFX.segLimb(ctx, -w * 0.15, -h * 0.02, w * 0.02, h * 0.0, w * 0.20, h * 0.0,
                    uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.24, h * 0.0, hR, sk);
                ctx.strokeStyle = '#FFD700';
                ctx.lineWidth = 3;
                ctx.strokeRect(-w * 0.4, -h * 0.1, w * 0.8, h * 0.55);
            } else if (attackState === 'fatalityBlow') {
                CharFX.jointCircle(ctx, w * 0.34, -h * 0.03, jr, ac);
                CharFX.segLimb(ctx, w * 0.34, -h * 0.04, w * 0.48, -h * 0.02, w * 0.62, h * 0.00, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.66, h * 0.00, hR, sk);
                CharFX.segLimb(ctx, w * 0.34, h * 0.08, w * 0.48, h * 0.10, w * 0.62, h * 0.12, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.66, h * 0.12, hR, sk);
            } else if (attackState === 'highPunch' || attackState === 'uppercut') {
                CharFX.jointCircle(ctx, w * 0.34, -h * 0.03, jr, ac);
                CharFX.segLimb(ctx, w * 0.34, -h * 0.03, w * 0.48, h * 0.0, w * 0.64, h * 0.03, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.68, h * 0.03, hR, sk);
            } else if (attackState === 'lowPunch') {
                CharFX.jointCircle(ctx, w * 0.34, h * 0.06, jr, ac);
                CharFX.segLimb(ctx, w * 0.34, h * 0.06, w * 0.48, h * 0.14, w * 0.64, h * 0.20, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.68, h * 0.20, hR, sk);
            } else if (attackState === 'jumpPunch') {
                CharFX.jointCircle(ctx, w * 0.30, -h * 0.10, jr, ac);
                CharFX.segLimb(ctx, w * 0.30, -h * 0.10, w * 0.44, -h * 0.06, w * 0.60, -h * 0.02, uW, fW, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.64, -h * 0.02, hR, sk);
            } else {
                drawFrontArm(ctx, w, h, ac, sk, t);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.22, sk);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.22, '#5B86A7', { browColor: '#8B7355', skinColor: sk, noMouth: true });

            // Balding hair
            ctx.fillStyle = '#8B7355';
            ctx.fillRect(-w * 0.22, -h * 0.22, w * 0.06, h * 0.08);
            ctx.fillRect(w * 0.16, -h * 0.22, w * 0.06, h * 0.08);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', 0.22, 0.26, 'over');
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
        draw(ctx, x, y, w, h, facing, state, attackState) {
            ctx.save();
            ctx.translate(x, y);
            if (facing === 'left') ctx.scale(-1, 1);

            const ac = '#1B3A2A';
            if (attackState !== 'fatalityBlow' && attackState !== 'special')
                drawBackArm(ctx, w, h, ac, this.colors.skin);

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'under');
            CharFX.belt(ctx, 0, h * 0.33, w * 0.52, h * 0.035, '#333');

            // Light shirt
            CharFX.trapezoidBody(ctx, 0, -h * 0.03, w * 0.56, w * 0.46, h * 0.38, '#D4C5A0');
            // Dark blazer panels
            CharFX.bodyRect(ctx, -w * 0.32, -h * 0.05, w * 0.14, h * 0.42, ac);
            CharFX.bodyRect(ctx, w * 0.18, -h * 0.05, w * 0.14, h * 0.42, ac);

            CharFX.neck(ctx, 0, -h * 0.10, -h * 0.05, w * 0.12, this.colors.skin);

            if (attackState === 'special') {
                const jr = w * 0.028;
                CharFX.jointCircle(ctx, w * 0.20, -h * 0.04, jr, ac);
                CharFX.segLimb(ctx, w * 0.20, -h * 0.04, w * 0.32, -h * 0.02, w * 0.44, -h * 0.04,
                    w * 0.09, w * 0.075, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.48, -h * 0.04, w * 0.045, this.colors.skin);
                CharFX.segLimb(ctx, w * 0.20, h * 0.06, w * 0.32, h * 0.08, w * 0.44, h * 0.10,
                    w * 0.09, w * 0.075, ac, jr * 0.8);
                CharFX.hand(ctx, w * 0.48, h * 0.10, w * 0.045, this.colors.skin);
                // Zen energy glow
                ctx.strokeStyle = '#00FF88';
                ctx.shadowColor = '#00FF88';
                ctx.shadowBlur = 10;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(w * 0.38, h * 0.04, w * 0.15, 0, Math.PI * 2);
                ctx.stroke();
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
            } else if (!drawArms(ctx, w, h, attackState, ac, this.colors.skin)) {
                drawFrontArm(ctx, w, h, ac, this.colors.skin);
            }

            CharFX.head(ctx, 0, -h * 0.20, w * 0.20, this.colors.skin);
            CharFX.face(ctx, 0, -h * 0.20, w * 0.20, '#5B7744', { browColor: '#6B4226', skinColor: this.colors.skin, noMouth: true, noNose: true });

            // Beard (covers lower face)
            ctx.fillStyle = '#6B4226';
            ctx.beginPath();
            ctx.arc(0, -h * 0.12, w * 0.14, 0, Math.PI);
            ctx.fill();
            ctx.fillRect(-w * 0.14, -h * 0.18, w * 0.04, h * 0.08);
            ctx.fillRect(w * 0.1, -h * 0.18, w * 0.04, h * 0.08);

            // Smile under beard
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 1.5;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.arc(0, -h * 0.16, w * 0.07, 0.15, Math.PI * 0.85);
            ctx.stroke();

            drawLegs(ctx, w, h, attackState, '#2C3E50', '#1a1a1a', undefined, undefined, 'over');
            ctx.restore();
        }
    }
};

const CHARACTER_LIST = ['borre', 'idaho', 'ruff', 'pelam', 'timo', 'otosi', 'matkum', 'thepanu'];
