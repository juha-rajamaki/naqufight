// ========================
// 3D GIB & PARTICLE SYSTEM
// ========================
const Gibs3D = {
    gibs: [],
    particles: [],
    maxParticles: 150,

    _parseColor(c) {
        if (typeof c === 'number') return c;
        if (typeof c === 'string') {
            const parsed = parseInt(c.replace('#', ''), 16);
            return isNaN(parsed) ? 0x888888 : parsed;
        }
        return 0x888888;
    },

    spawnGibs(gameX, gameY, colors, fatalityType, dir) {
        this.clearGibs();
        const pos = Scene3D.mapGameTo3D(gameX, gameY);
        const bodyC = this._parseColor(colors.body);
        const skinC = this._parseColor(colors.skin);
        const accentC = this._parseColor(colors.accent);

        const partDefs = [
            { label: 'head',  color: skinC,   size: [0.44, 0.44, 0.44], oy: 1.9 },
            { label: 'torso', color: bodyC,    size: [0.65, 0.70, 0.35], oy: 1.1 },
            { label: 'larm',  color: bodyC,    size: [0.16, 0.70, 0.16], oy: 1.3 },
            { label: 'rarm',  color: bodyC,    size: [0.16, 0.70, 0.16], oy: 1.3 },
            { label: 'lleg',  color: 0x2C3E50, size: [0.20, 0.85, 0.20], oy: 0.42 },
            { label: 'rleg',  color: 0x2C3E50, size: [0.20, 0.85, 0.20], oy: 0.42 },
            { label: 'acc',   color: accentC,  size: [0.30, 0.14, 0.14], oy: 2.2 },
        ];

        const addGib = (part, vx, vy, vz) => {
            const geo = new THREE.BoxGeometry(...part.size);
            const mat = new THREE.MeshPhongMaterial({ color: part.color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            mesh.position.set(pos.x, part.oy, (Math.random() - 0.5) * 0.3);
            Scene3D.scene.add(mesh);
            this.gibs.push({
                mesh,
                vx: vx * 0.06,
                vy: vy * 0.04,
                vz: vz * 0.03,
                rotX: (Math.random() - 0.5) * 0.2,
                rotY: (Math.random() - 0.5) * 0.2,
                rotZ: (Math.random() - 0.5) * 0.2,
                grounded: false,
                groundedTime: 0
            });
        };

        const addBlood = (x3d, y3d) => {
            const geo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
            const mat = new THREE.MeshBasicMaterial({ color: Math.random() > 0.5 ? 0xAA0000 : 0x880000 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(x3d + (Math.random() - 0.5) * 0.3, y3d, (Math.random() - 0.5) * 0.3);
            Scene3D.scene.add(mesh);
            this.gibs.push({
                mesh,
                vx: (Math.random() - 0.5) * 0.12,
                vy: Math.random() * 0.15 + 0.05,
                vz: (Math.random() - 0.5) * 0.08,
                rotX: 0, rotY: 0, rotZ: 0,
                grounded: false,
                groundedTime: 0
            });
        };

        if (fatalityType === 'decapitate') {
            for (const part of partDefs) {
                if (part.label === 'head') {
                    addGib(part, dir * (8 + Math.random() * 6), 8 + Math.random() * 4, (Math.random() - 0.5) * 4);
                } else {
                    addGib(part, (Math.random() - 0.5) * 2, Math.random() * 2, (Math.random() - 0.5) * 2);
                }
            }
            for (let i = 0; i < 10; i++) addBlood(pos.x, 1.8);
        } else if (fatalityType === 'kickdown') {
            for (const part of partDefs) {
                addGib(part, -dir * (5 + Math.random() * 8), 2 + Math.random() * 3, (Math.random() - 0.5) * 3);
            }
            for (let i = 0; i < 8; i++) addBlood(pos.x, 1.0);
        } else if (fatalityType === 'cuthalf') {
            for (const part of partDefs) {
                if (part.label === 'lleg' || part.label === 'rleg') {
                    addGib(part, (Math.random() - 0.5) * 1, -0.5, (Math.random() - 0.5) * 1);
                } else {
                    addGib(part, dir * (2 + Math.random() * 3), 5 + Math.random() * 4, (Math.random() - 0.5) * 2);
                }
            }
            for (let i = 0; i < 12; i++) addBlood(pos.x, 0.8);
        } else if (fatalityType === 'loseleg') {
            for (const part of partDefs) {
                if (part.label === 'rleg') {
                    addGib(part, dir * (6 + Math.random() * 4), 3 + Math.random() * 3, (Math.random() - 0.5) * 3);
                } else {
                    addGib(part, (Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 1);
                }
            }
            for (let i = 0; i < 8; i++) addBlood(pos.x, 0.4);
        } else {
            // explode
            for (const part of partDefs) {
                addGib(part,
                    (Math.random() - 0.5) * 16,
                    4 + Math.random() * 8,
                    (Math.random() - 0.5) * 8
                );
            }
            for (let i = 0; i < 15; i++) addBlood(pos.x, 1.0);
        }
    },

    spawnHitParticles(gameX, gameY, count, color) {
        const pos = Scene3D.mapGameTo3D(gameX, gameY);
        const c = this._parseColor(color || '#FFD700');
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const geo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
            const mat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 1.0 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(
                pos.x + (Math.random() - 0.5) * 0.3,
                pos.y + (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.4
            );
            Scene3D.scene.add(mesh);
            this.particles.push({
                mesh,
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15 + 0.05,
                vz: (Math.random() - 0.5) * 0.10,
                life: 15 + Math.random() * 10,
                maxLife: 25
            });
        }
    },

    update() {
        // Update gibs
        let writeIdx = 0;
        for (let i = 0; i < this.gibs.length; i++) {
            const g = this.gibs[i];
            if (g.grounded) {
                g.groundedTime++;
                if (g.groundedTime > 300) {
                    Scene3D.scene.remove(g.mesh);
                    if (g.mesh.geometry) g.mesh.geometry.dispose();
                    if (g.mesh.material) g.mesh.material.dispose();
                    continue;
                }
                this.gibs[writeIdx++] = g;
                continue;
            }

            g.vy -= 0.008; // gravity
            g.mesh.position.x += g.vx;
            g.mesh.position.y += g.vy;
            g.mesh.position.z += g.vz;
            g.mesh.rotation.x += g.rotX;
            g.mesh.rotation.y += g.rotY;
            g.mesh.rotation.z += g.rotZ;

            // Ground collision
            if (g.mesh.position.y <= 0.05) {
                g.mesh.position.y = 0.05;
                if (Math.abs(g.vy) < 0.01) {
                    g.grounded = true;
                } else {
                    g.vy *= -0.3;
                    g.vx *= 0.6;
                    g.vz *= 0.6;
                    g.rotX *= 0.5;
                    g.rotY *= 0.5;
                    g.rotZ *= 0.5;
                }
            }

            // Stage boundaries
            if (g.mesh.position.x < -9 || g.mesh.position.x > 9) {
                g.vx *= -0.5;
                g.mesh.position.x = Math.max(-9, Math.min(9, g.mesh.position.x));
            }

            g.vx *= 0.99;
            g.vz *= 0.99;

            this.gibs[writeIdx++] = g;
        }
        this.gibs.length = writeIdx;

        // Update particles
        writeIdx = 0;
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.life--;
            if (p.life <= 0) {
                Scene3D.scene.remove(p.mesh);
                if (p.mesh.geometry) p.mesh.geometry.dispose();
                if (p.mesh.material) p.mesh.material.dispose();
                continue;
            }
            p.vy -= 0.003;
            p.mesh.position.x += p.vx;
            p.mesh.position.y += p.vy;
            p.mesh.position.z += p.vz;
            p.mesh.material.opacity = p.life / p.maxLife;
            this.particles[writeIdx++] = p;
        }
        this.particles.length = writeIdx;
    },

    clearGibs() {
        for (const g of this.gibs) {
            Scene3D.scene.remove(g.mesh);
            if (g.mesh.geometry) g.mesh.geometry.dispose();
            if (g.mesh.material) g.mesh.material.dispose();
        }
        this.gibs = [];
    },

    clearAll() {
        this.clearGibs();
        for (const p of this.particles) {
            Scene3D.scene.remove(p.mesh);
            if (p.mesh.geometry) p.mesh.geometry.dispose();
            if (p.mesh.material) p.mesh.material.dispose();
        }
        this.particles = [];
    }
};
