// ========================
// THREE.JS 3D SCENE
// ========================
const Scene3D = {
    scene: null,
    camera: null,
    renderer: null,
    groundMesh: null,
    arenaGroup: null,
    active: false,

    // Coordinate mapping: game 2D → 3D world
    GAME_LEFT: 30,
    GAME_RIGHT: 770,
    GAME_WIDTH: 740,
    WORLD_WIDTH: 16,
    WORLD_LEFT: -8,
    SCALE_Y: 0.018,

    cameraBasePos: { x: 0, y: 3.5, z: 12 },
    cameraOrbitAngle: 0,
    cameraOrbitSpeed: 0.003,
    cameraOrbitRadius: 12,
    cameraOrbitAmplitude: 0.25, // radians of sway (about 14 degrees each way)

    init(canvas) {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.FogExp2(0x0a0a1e, 0.035);

        // Camera
        this.camera = new THREE.PerspectiveCamera(45, 800 / 600, 0.1, 100);
        this.camera.position.set(this.cameraBasePos.x, this.cameraBasePos.y, this.cameraBasePos.z);
        this.camera.lookAt(0, 1.0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
        this.renderer.setSize(800, 600);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x0a0a1e);

        // Handle WebGL context loss/restore
        canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.active = false;
        }, false);
        canvas.addEventListener('webglcontextrestored', () => {
            this.active = true;
        }, false);

        // Lights
        const ambient = new THREE.AmbientLight(0x404060, 0.5);
        this.scene.add(ambient);

        const keyLight = new THREE.DirectionalLight(0xFFEEDD, 0.9);
        keyLight.position.set(5, 10, 7);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.camera.near = 0.5;
        keyLight.shadow.camera.far = 30;
        keyLight.shadow.camera.left = -12;
        keyLight.shadow.camera.right = 12;
        keyLight.shadow.camera.top = 8;
        keyLight.shadow.camera.bottom = -2;
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x4444AA, 0.3);
        fillLight.position.set(-5, 5, 3);
        this.scene.add(fillLight);

        const redAccent = new THREE.PointLight(0xFF2200, 0.5, 20);
        redAccent.position.set(0, 6, 2);
        this.scene.add(redAccent);

        this.createArena();
        this.active = true;
    },

    createArena() {
        this.arenaGroup = new THREE.Group();

        // Ground plane
        const groundGeo = new THREE.PlaneGeometry(22, 12);
        const groundMat = new THREE.MeshPhongMaterial({ color: 0x1a1a1a });
        this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
        this.groundMesh.rotation.x = -Math.PI / 2;
        this.groundMesh.receiveShadow = true;
        this.arenaGroup.add(this.groundMesh);

        // Ground grid lines
        const gridHelper = new THREE.GridHelper(22, 22, 0x333333, 0x222222);
        gridHelper.position.y = 0.01;
        this.arenaGroup.add(gridHelper);

        // Back wall with gradient texture
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 256;
        wallCanvas.height = 256;
        const wCtx = wallCanvas.getContext('2d');
        const wGrad = wCtx.createLinearGradient(0, 0, 0, 256);
        wGrad.addColorStop(0, '#1a0a2e');
        wGrad.addColorStop(0.5, '#2d1b4e');
        wGrad.addColorStop(1, '#0d0d0d');
        wCtx.fillStyle = wGrad;
        wCtx.fillRect(0, 0, 256, 256);
        const wallTex = new THREE.CanvasTexture(wallCanvas);

        const wallGeo = new THREE.PlaneGeometry(22, 10);
        const wallMat = new THREE.MeshBasicMaterial({ map: wallTex });
        const wallMesh = new THREE.Mesh(wallGeo, wallMat);
        wallMesh.position.set(0, 5, -5);
        this.arenaGroup.add(wallMesh);

        // Side pillars
        const pillarGeo = new THREE.BoxGeometry(0.6, 7, 0.6);
        const pillarMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a });
        const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
        leftPillar.position.set(-9.5, 3.5, -3);
        leftPillar.castShadow = true;
        this.arenaGroup.add(leftPillar);
        const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
        rightPillar.position.set(9.5, 3.5, -3);
        rightPillar.castShadow = true;
        this.arenaGroup.add(rightPillar);

        // Ambient floating particles
        const particleGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const particleMat = new THREE.MeshBasicMaterial({ color: 0xFF4422 });
        this.ambientParticles = [];
        for (let i = 0; i < 12; i++) {
            const p = new THREE.Mesh(particleGeo, particleMat);
            p.position.set(
                (Math.random() - 0.5) * 18,
                Math.random() * 5 + 0.5,
                (Math.random() - 0.5) * 6
            );
            p.userData = {
                baseY: p.position.y,
                speed: 0.3 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            };
            this.arenaGroup.add(p);
            this.ambientParticles.push(p);
        }

        this.scene.add(this.arenaGroup);
    },

    mapGameTo3D(gameX, gameY) {
        const x = ((gameX - this.GAME_LEFT) / this.GAME_WIDTH) * this.WORLD_WIDTH + this.WORLD_LEFT;
        const y = (460 - gameY) * this.SCALE_Y;
        return { x: x, y: Math.max(0, y), z: 0 };
    },

    setCameraShake(intensity) {
        if (intensity > 0) {
            this.camera.position.x += (Math.random() - 0.5) * intensity * 0.04;
            this.camera.position.y = this.cameraBasePos.y + (Math.random() - 0.5) * intensity * 0.04;
        } else {
            this.camera.position.y = this.cameraBasePos.y;
        }
    },

    updateAmbientParticles(frameCount) {
        for (const p of this.ambientParticles) {
            const d = p.userData;
            p.position.y = d.baseY + Math.sin(frameCount * 0.02 * d.speed + d.phase) * 0.5;
            p.position.x += Math.sin(frameCount * 0.005 + d.phase) * 0.002;
        }
    },

    updateCameraOrbit(frameCount) {
        this.cameraOrbitAngle += this.cameraOrbitSpeed;
        const sway = Math.sin(this.cameraOrbitAngle) * this.cameraOrbitAmplitude;
        this.cameraBasePos.x = Math.sin(sway) * this.cameraOrbitRadius;
        this.cameraBasePos.z = Math.cos(sway) * this.cameraOrbitRadius;
        this.camera.position.x = this.cameraBasePos.x;
        this.camera.position.z = this.cameraBasePos.z;
        this.camera.lookAt(0, 1.0, 0);
    },

    render(frameCount) {
        if (!this.active) return;
        this.updateCameraOrbit(frameCount);
        this.updateAmbientParticles(frameCount);
        this.renderer.render(this.scene, this.camera);
    },

    show() {
        if (this.renderer) this.renderer.domElement.style.display = '';
    },

    hide() {
        if (this.renderer) this.renderer.domElement.style.display = 'none';
    },

    dispose() {
        if (this.arenaGroup) {
            this.arenaGroup.traverse(obj => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (obj.material.map) obj.material.map.dispose();
                    obj.material.dispose();
                }
            });
        }
        if (this.renderer) this.renderer.dispose();
        this.active = false;
    }
};
