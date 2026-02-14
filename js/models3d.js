// ========================
// 3D CHARACTER MODELS
// ========================
const Models3D = {
    cache: {},

    createModel(charName) {
        const data = CHARACTER_DATA[charName];
        if (!data) return null;
        const colors = data.colors;

        const UNIT = 2.16; // total character height in 3D units

        // Scale multiplier for heavy characters
        const isHeavy = charName === 'ruff' || charName === 'matkum';
        const wScale = isHeavy ? (charName === 'matkum' ? 1.3 : 1.2) : 1.0;

        const root = new THREE.Group();
        const bodyGroup = new THREE.Group();
        root.add(bodyGroup);

        const parts = {};

        // Helper: create a mesh and set shadow properties
        function box(w, h, d, color) {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshPhongMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            return mesh;
        }

        function sphere(radius, color) {
            const geo = new THREE.SphereGeometry(radius, 10, 8);
            const mat = new THREE.MeshPhongMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            return mesh;
        }

        // ---- HIPS (root of lower body) ----
        parts.hips = new THREE.Group();
        parts.hips.position.y = UNIT * 0.37;
        bodyGroup.add(parts.hips);

        // ---- LEFT LEG ----
        parts.leftThigh = new THREE.Group();
        parts.leftThigh.position.set(-0.18 * wScale, 0, 0);
        parts.hips.add(parts.leftThigh);

        const lThighMesh = box(0.22 * wScale, 0.45, 0.22, 0x2C3E50);
        lThighMesh.position.y = -0.225;
        parts.leftThigh.add(lThighMesh);

        parts.leftKnee = new THREE.Group();
        parts.leftKnee.position.y = -0.45;
        parts.leftThigh.add(parts.leftKnee);

        const lShinMesh = box(0.20 * wScale, 0.42, 0.20, 0x2C3E50);
        lShinMesh.position.y = -0.21;
        parts.leftKnee.add(lShinMesh);

        const lFootMesh = box(0.22, 0.10, 0.32, 0x1a1a1a);
        lFootMesh.position.set(0, -0.47, 0.05);
        parts.leftKnee.add(lFootMesh);

        // ---- RIGHT LEG ----
        parts.rightThigh = new THREE.Group();
        parts.rightThigh.position.set(0.18 * wScale, 0, 0);
        parts.hips.add(parts.rightThigh);

        const rThighMesh = box(0.22 * wScale, 0.45, 0.22, 0x2C3E50);
        rThighMesh.position.y = -0.225;
        parts.rightThigh.add(rThighMesh);

        parts.rightKnee = new THREE.Group();
        parts.rightKnee.position.y = -0.45;
        parts.rightThigh.add(parts.rightKnee);

        const rShinMesh = box(0.20 * wScale, 0.42, 0.20, 0x2C3E50);
        rShinMesh.position.y = -0.21;
        parts.rightKnee.add(rShinMesh);

        const rFootMesh = box(0.22, 0.10, 0.32, 0x1a1a1a);
        rFootMesh.position.set(0, -0.47, 0.05);
        parts.rightKnee.add(rFootMesh);

        // ---- SPINE (torso + arms + head) ----
        parts.spine = new THREE.Group();
        parts.spine.position.y = UNIT * 0.37;
        bodyGroup.add(parts.spine);

        // Torso
        const bodyColor = typeof colors.body === 'string' ? parseInt(colors.body.replace('#', ''), 16) : 0x888888;
        const torsoMesh = box(0.70 * wScale, 0.72, 0.35, bodyColor);
        torsoMesh.position.y = 0.36;
        parts.spine.add(torsoMesh);
        parts.torsoMesh = torsoMesh;

        // Belt
        const beltMesh = box(0.65 * wScale, 0.07, 0.34, 0x333333);
        beltMesh.position.y = 0.0;
        parts.spine.add(beltMesh);

        // ---- SHOULDERS + ARMS ----
        const armColor = bodyColor;
        const skinColor = typeof colors.skin === 'string' ? parseInt(colors.skin.replace('#', ''), 16) : 0xF5CBA7;

        // Left shoulder
        parts.leftShoulder = new THREE.Group();
        parts.leftShoulder.position.set(-0.38 * wScale, 0.65, 0);
        parts.spine.add(parts.leftShoulder);

        const lUpperArm = box(0.18 * wScale, 0.40, 0.18, armColor);
        lUpperArm.position.y = -0.20;
        parts.leftShoulder.add(lUpperArm);

        parts.leftElbow = new THREE.Group();
        parts.leftElbow.position.y = -0.40;
        parts.leftShoulder.add(parts.leftElbow);

        const lForearm = box(0.16 * wScale, 0.36, 0.16, armColor);
        lForearm.position.y = -0.18;
        parts.leftElbow.add(lForearm);

        const lHand = sphere(0.08, skinColor);
        lHand.position.y = -0.40;
        parts.leftElbow.add(lHand);

        // Right shoulder
        parts.rightShoulder = new THREE.Group();
        parts.rightShoulder.position.set(0.38 * wScale, 0.65, 0);
        parts.spine.add(parts.rightShoulder);

        const rUpperArm = box(0.18 * wScale, 0.40, 0.18, armColor);
        rUpperArm.position.y = -0.20;
        parts.rightShoulder.add(rUpperArm);

        parts.rightElbow = new THREE.Group();
        parts.rightElbow.position.y = -0.40;
        parts.rightShoulder.add(parts.rightElbow);

        const rForearm = box(0.16 * wScale, 0.36, 0.16, armColor);
        rForearm.position.y = -0.18;
        parts.rightElbow.add(rForearm);

        const rHand = sphere(0.08, skinColor);
        rHand.position.y = -0.40;
        parts.rightElbow.add(rHand);

        // ---- NECK + HEAD ----
        parts.neck = new THREE.Group();
        parts.neck.position.y = 0.76;
        parts.spine.add(parts.neck);

        const neckMesh = box(0.12, 0.10, 0.12, skinColor);
        neckMesh.position.y = 0.05;
        parts.neck.add(neckMesh);

        parts.head = new THREE.Group();
        parts.head.position.y = 0.15;
        parts.neck.add(parts.head);

        const headMesh = box(0.44, 0.44, 0.44, skinColor);
        parts.head.add(headMesh);
        parts.headMesh = headMesh;

        // Eyes
        const eyeWhite = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const eyeGeo = new THREE.SphereGeometry(0.05, 6, 6);
        const leftEye = new THREE.Mesh(eyeGeo, eyeWhite);
        leftEye.position.set(-0.10, 0.03, 0.22);
        parts.head.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeo, eyeWhite);
        rightEye.position.set(0.10, 0.03, 0.22);
        parts.head.add(rightEye);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.03, 6, 6);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0x222222 });
        const leftPupil = new THREE.Mesh(pupilGeo, pupilMat);
        leftPupil.position.set(-0.10, 0.02, 0.26);
        parts.head.add(leftPupil);
        const rightPupil = new THREE.Mesh(pupilGeo, pupilMat);
        rightPupil.position.set(0.10, 0.02, 0.26);
        parts.head.add(rightPupil);

        // Drop shadow disc (flat circle under feet)
        const shadowGeo = new THREE.CircleGeometry(0.5 * wScale, 16);
        const shadowMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 });
        const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
        shadowDisc.rotation.x = -Math.PI / 2;
        shadowDisc.position.y = 0.01;
        root.add(shadowDisc);
        parts.shadowDisc = shadowDisc;

        // ---- CHARACTER-SPECIFIC FEATURES ----
        this.addCharacterFeatures(charName, parts, bodyGroup, colors, wScale, UNIT);

        // Store all meshes for emissive flash
        parts._allMeshes = [];
        bodyGroup.traverse(child => {
            if (child.isMesh && child.material && child.material.emissive) {
                parts._allMeshes.push(child);
            }
        });

        return { root, bodyGroup, parts };
    },

    addCharacterFeatures(charName, parts, bodyGroup, colors, wScale, UNIT) {
        function box(w, h, d, color) {
            const geo = new THREE.BoxGeometry(w, h, d);
            const mat = new THREE.MeshPhongMaterial({ color: color });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.castShadow = true;
            return mesh;
        }

        switch (charName) {
            case 'borre': {
                // Red beanie
                const beanie = box(0.48, 0.18, 0.48, 0xCC0000);
                beanie.position.y = 0.28;
                parts.head.add(beanie);
                // Beanie brim
                const brim = box(0.50, 0.06, 0.50, 0x990000);
                brim.position.y = 0.18;
                parts.head.add(brim);
                // Hoodie pocket
                const pocket = box(0.35, 0.10, 0.02, 0x777777);
                pocket.position.set(0, 0.15, 0.18);
                parts.spine.add(pocket);
                break;
            }
            case 'idaho': {
                // Neon stripes on torso
                const stripe1 = box(0.60, 0.03, 0.36, 0x00F2EA);
                stripe1.position.set(0, 0.42, 0);
                parts.spine.add(stripe1);
                const stripe2 = box(0.55, 0.03, 0.36, 0xFF0050);
                stripe2.position.set(0, 0.30, 0);
                parts.spine.add(stripe2);
                // Neon shoe color
                parts.leftKnee.children.forEach(c => {
                    if (c.geometry && c.geometry.parameters && c.geometry.parameters.depth > 0.3)
                        c.material.color.set(0x00F2EA);
                });
                parts.rightKnee.children.forEach(c => {
                    if (c.geometry && c.geometry.parameters && c.geometry.parameters.depth > 0.3)
                        c.material.color.set(0x00F2EA);
                });
                break;
            }
            case 'ruff': {
                // Short brown hair
                const hair = box(0.46, 0.15, 0.46, 0x5D4E37);
                hair.position.y = 0.27;
                parts.head.add(hair);
                break;
            }
            case 'pelam': {
                // Striped torso texture
                const stripeCanvas = document.createElement('canvas');
                stripeCanvas.width = 64;
                stripeCanvas.height = 64;
                const sCtx = stripeCanvas.getContext('2d');
                sCtx.fillStyle = '#FFFFFF';
                sCtx.fillRect(0, 0, 64, 64);
                sCtx.fillStyle = '#CC3333';
                for (let sy = 0; sy < 64; sy += 8) {
                    sCtx.fillRect(0, sy, 64, 3);
                }
                const stripeTex = new THREE.CanvasTexture(stripeCanvas);
                parts.torsoMesh.material = new THREE.MeshPhongMaterial({ map: stripeTex });

                // Blonde hair
                const hair = box(0.44, 0.14, 0.44, 0xD4A44C);
                hair.position.y = 0.26;
                parts.head.add(hair);
                break;
            }
            case 'timo': {
                // Navy blazer side panels
                const lPanel = box(0.12, 0.72, 0.36, 0x1B2A4A);
                lPanel.position.set(-0.32, 0.36, 0);
                parts.spine.add(lPanel);
                const rPanel = box(0.12, 0.72, 0.36, 0x1B2A4A);
                rPanel.position.set(0.32, 0.36, 0);
                parts.spine.add(rPanel);
                // Blonde hair
                const hair = box(0.42, 0.12, 0.42, 0xC4A74C);
                hair.position.y = 0.26;
                parts.head.add(hair);
                break;
            }
            case 'otosi': {
                // Suit jacket panels
                const lPanel = box(0.11, 0.72, 0.36, 0x222222);
                lPanel.position.set(-0.32, 0.36, 0);
                parts.spine.add(lPanel);
                const rPanel = box(0.11, 0.72, 0.36, 0x222222);
                rPanel.position.set(0.32, 0.36, 0);
                parts.spine.add(rPanel);
                // White shirt torso color
                parts.torsoMesh.material.color.set(0xF0F0F0);
                // Watch
                const watch = box(0.06, 0.04, 0.08, 0xC0C0C0);
                watch.position.set(0, -0.32, 0.10);
                parts.rightElbow.add(watch);
                // Gray hair
                const hair = box(0.40, 0.12, 0.42, 0x555555);
                hair.position.y = 0.26;
                parts.head.add(hair);
                break;
            }
            case 'matkum': {
                // Ribbing at bottom of sweater
                const ribbing = box(0.72, 0.06, 0.36, 0x2a2a2a);
                ribbing.position.set(0, 0.04, 0);
                parts.spine.add(ribbing);
                // Balding hair patches
                const lHair = box(0.08, 0.10, 0.20, 0x8B7355);
                lHair.position.set(-0.22, 0.14, 0);
                parts.head.add(lHair);
                const rHair = box(0.08, 0.10, 0.20, 0x8B7355);
                rHair.position.set(0.22, 0.14, 0);
                parts.head.add(rHair);
                break;
            }
            case 'thepanu': {
                // Dark green blazer panels
                const lPanel = box(0.12, 0.72, 0.36, 0x1B3A2A);
                lPanel.position.set(-0.32, 0.36, 0);
                parts.spine.add(lPanel);
                const rPanel = box(0.12, 0.72, 0.36, 0x1B3A2A);
                rPanel.position.set(0.32, 0.36, 0);
                parts.spine.add(rPanel);
                // Tan shirt torso
                parts.torsoMesh.material.color.set(0xD4C5A0);
                // Beard
                const beard = box(0.34, 0.18, 0.25, 0x6B4226);
                beard.position.set(0, -0.16, 0.12);
                parts.head.add(beard);
                break;
            }
        }
    },

    getOrCreate(charName) {
        if (!this.cache[charName]) {
            this.cache[charName] = this.createModel(charName);
        }
        return this.cache[charName];
    },

    // Clone a model for when both fighters are the same character
    cloneModel(charName) {
        return this.createModel(charName);
    },

    clearCache() {
        for (const charName in this.cache) {
            const model = this.cache[charName];
            if (model && model.root) {
                model.root.traverse(obj => {
                    if (obj.geometry) obj.geometry.dispose();
                    if (obj.material) {
                        if (obj.material.map) obj.material.map.dispose();
                        obj.material.dispose();
                    }
                });
            }
        }
        this.cache = {};
    },

    setEmissive(parts, color, intensity) {
        for (const mesh of parts._allMeshes) {
            mesh.material.emissive.set(color);
            mesh.material.emissiveIntensity = intensity;
        }
    }
};
