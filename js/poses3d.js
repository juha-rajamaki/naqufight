// ========================
// 3D POSE SYSTEM
// ========================
const Poses3D = {
    poses: {
        idle: {
            leftShoulder:  { x: 0.15, y: 0, z: 0.3 },
            leftElbow:     { x: -0.5, y: 0, z: 0 },
            rightShoulder: { x: 0.15, y: 0, z: -0.3 },
            rightElbow:    { x: -0.5, y: 0, z: 0 },
            leftThigh:     { x: 0.05, y: 0, z: 0 },
            leftKnee:      { x: 0.1, y: 0, z: 0 },
            rightThigh:    { x: -0.05, y: 0, z: 0 },
            rightKnee:     { x: 0.1, y: 0, z: 0 },
            spine:         { x: 0, y: 0, z: 0 },
            head:          { x: 0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        highPunch: {
            rightShoulder: { x: -1.4, y: 0, z: -0.2 },
            rightElbow:    { x: -0.1, y: 0, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.4 },
            leftElbow:     { x: -0.8, y: 0, z: 0 },
            spine:         { x: 0, y: -0.2, z: 0 },
            leftThigh:     { x: 0.05, y: 0, z: 0 },
            leftKnee:      { x: 0.1, y: 0, z: 0 },
            rightThigh:    { x: -0.05, y: 0, z: 0 },
            rightKnee:     { x: 0.1, y: 0, z: 0 },
            head:          { x: 0, y: -0.1, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        lowPunch: {
            rightShoulder: { x: -0.8, y: 0, z: -0.5 },
            rightElbow:    { x: -0.2, y: 0, z: 0 },
            leftShoulder:  { x: 0.2, y: 0, z: 0.3 },
            leftElbow:     { x: -0.6, y: 0, z: 0 },
            spine:         { x: 0.15, y: -0.15, z: 0 },
            leftThigh:     { x: 0.1, y: 0, z: 0 },
            leftKnee:      { x: 0.2, y: 0, z: 0 },
            rightThigh:    { x: -0.05, y: 0, z: 0 },
            rightKnee:     { x: 0.1, y: 0, z: 0 },
            head:          { x: 0.1, y: -0.1, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        highKick: {
            rightThigh:    { x: -1.6, y: 0, z: 0 },
            rightKnee:     { x: 0.3, y: 0, z: 0 },
            leftThigh:     { x: 0.15, y: 0, z: 0 },
            leftKnee:      { x: 0.3, y: 0, z: 0 },
            spine:         { x: 0.1, y: 0.1, z: -0.1 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.5 },
            leftElbow:     { x: -0.6, y: 0, z: 0 },
            rightShoulder: { x: 0.3, y: 0, z: -0.5 },
            rightElbow:    { x: -0.6, y: 0, z: 0 },
            head:          { x: 0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        lowKick: {
            rightThigh:    { x: -0.9, y: 0, z: -0.3 },
            rightKnee:     { x: 0.15, y: 0, z: 0 },
            leftThigh:     { x: 0.15, y: 0, z: 0 },
            leftKnee:      { x: 0.3, y: 0, z: 0 },
            spine:         { x: 0.05, y: 0, z: 0.1 },
            leftShoulder:  { x: 0.2, y: 0, z: 0.4 },
            leftElbow:     { x: -0.5, y: 0, z: 0 },
            rightShoulder: { x: 0.2, y: 0, z: -0.4 },
            rightElbow:    { x: -0.5, y: 0, z: 0 },
            head:          { x: 0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        uppercut: {
            rightShoulder: { x: -2.2, y: 0, z: 0 },
            rightElbow:    { x: -0.1, y: 0, z: 0 },
            leftShoulder:  { x: 0.4, y: 0, z: 0.5 },
            leftElbow:     { x: -1.0, y: 0, z: 0 },
            spine:         { x: -0.15, y: 0, z: 0 },
            leftThigh:     { x: 0.25, y: 0, z: 0 },
            leftKnee:      { x: 0.5, y: 0, z: 0 },
            rightThigh:    { x: -0.1, y: 0, z: 0 },
            rightKnee:     { x: 0.2, y: 0, z: 0 },
            head:          { x: -0.15, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        jumpPunch: {
            rightShoulder: { x: -1.3, y: 0, z: -0.4 },
            rightElbow:    { x: -0.15, y: 0, z: 0 },
            leftShoulder:  { x: 0.5, y: 0, z: 0.3 },
            leftElbow:     { x: -0.6, y: 0, z: 0 },
            leftThigh:     { x: 0.4, y: 0, z: 0 },
            leftKnee:      { x: -0.3, y: 0, z: 0 },
            rightThigh:    { x: -0.3, y: 0, z: 0 },
            rightKnee:     { x: 0.2, y: 0, z: 0 },
            spine:         { x: 0.1, y: 0, z: 0 },
            head:          { x: 0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        jumpKick: {
            rightThigh:    { x: -1.4, y: 0, z: 0 },
            rightKnee:     { x: 0.15, y: 0, z: 0 },
            leftThigh:     { x: 0.6, y: 0, z: 0 },
            leftKnee:      { x: -0.8, y: 0, z: 0 },
            rightShoulder: { x: 0.3, y: 0, z: -0.5 },
            rightElbow:    { x: -0.4, y: 0, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.5 },
            leftElbow:     { x: -0.4, y: 0, z: 0 },
            spine:         { x: 0.1, y: 0, z: -0.05 },
            head:          { x: 0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        fatalityBlow: {
            rightShoulder: { x: -1.1, y: 0, z: -0.3 },
            rightElbow:    { x: -0.2, y: 0, z: 0 },
            leftShoulder:  { x: -0.9, y: 0, z: 0.3 },
            leftElbow:     { x: -0.3, y: 0, z: 0 },
            spine:         { x: -0.1, y: 0, z: 0 },
            rightThigh:    { x: -0.2, y: 0, z: 0 },
            rightKnee:     { x: 0.2, y: 0, z: 0 },
            leftThigh:     { x: 0.3, y: 0, z: 0 },
            leftKnee:      { x: 0.3, y: 0, z: 0 },
            head:          { x: -0.05, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        hit: {
            spine:         { x: 0.25, y: 0, z: 0.1 },
            head:          { x: 0.15, y: 0.1, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.2 },
            leftElbow:     { x: -0.3, y: 0, z: 0 },
            rightShoulder: { x: 0.3, y: 0, z: -0.2 },
            rightElbow:    { x: -0.3, y: 0, z: 0 },
            leftThigh:     { x: 0.1, y: 0, z: 0 },
            leftKnee:      { x: 0.15, y: 0, z: 0 },
            rightThigh:    { x: 0.05, y: 0, z: 0 },
            rightKnee:     { x: 0.1, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        knockdown: {
            spine:         { x: 1.5, y: 0, z: 0 },
            head:          { x: 0.2, y: 0, z: 0 },
            leftShoulder:  { x: 0.5, y: 0, z: 0.8 },
            leftElbow:     { x: -0.2, y: 0, z: 0 },
            rightShoulder: { x: 0.5, y: 0, z: -0.8 },
            rightElbow:    { x: -0.2, y: 0, z: 0 },
            leftThigh:     { x: 0.1, y: 0, z: 0 },
            leftKnee:      { x: 0.0, y: 0, z: 0 },
            rightThigh:    { x: 0.1, y: 0, z: 0 },
            rightKnee:     { x: 0.0, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },

        crouch: {
            leftThigh:     { x: 0.8, y: 0, z: 0.2 },
            leftKnee:      { x: -1.2, y: 0, z: 0 },
            rightThigh:    { x: 0.8, y: 0, z: -0.2 },
            rightKnee:     { x: -1.2, y: 0, z: 0 },
            spine:         { x: 0.2, y: 0, z: 0 },
            head:          { x: -0.1, y: 0, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.4 },
            leftElbow:     { x: -0.8, y: 0, z: 0 },
            rightShoulder: { x: 0.3, y: 0, z: -0.4 },
            rightElbow:    { x: -0.8, y: 0, z: 0 },
            hips:          { x: 0, y: -0.3, z: 0 },
        },

        block: {
            rightShoulder: { x: -0.8, y: 0, z: -0.8 },
            rightElbow:    { x: -1.3, y: 0, z: 0 },
            leftShoulder:  { x: -0.8, y: 0, z: 0.8 },
            leftElbow:     { x: -1.3, y: 0, z: 0 },
            spine:         { x: 0.05, y: 0, z: 0 },
            head:          { x: 0.05, y: 0, z: 0 },
            leftThigh:     { x: 0.1, y: 0, z: 0 },
            leftKnee:      { x: 0.2, y: 0, z: 0 },
            rightThigh:    { x: -0.05, y: 0, z: 0 },
            rightKnee:     { x: 0.15, y: 0, z: 0 },
            hips:          { x: 0, y: 0, z: 0 },
        },
    },

    // Per-character special attack poses
    specialPoses: {
        borre: {
            rightShoulder: { x: -2.6, y: 0, z: 0 },
            rightElbow:    { x: -0.15, y: 0, z: 0 },
            leftShoulder:  { x: -2.6, y: 0, z: 0 },
            leftElbow:     { x: -0.15, y: 0, z: 0 },
            spine:         { x: -0.15, y: 0, z: 0 },
            head:          { x: -0.2, y: 0, z: 0 },
        },
        idaho: {
            rightShoulder: { x: -1.3, y: 0, z: -0.1 },
            rightElbow:    { x: -0.1, y: 0, z: 0 },
            leftShoulder:  { x: 0.5, y: 0, z: 0.3 },
            leftElbow:     { x: -0.6, y: 0, z: 0 },
            spine:         { x: 0.3, y: 0, z: 0 },
        },
        ruff: {
            rightShoulder: { x: -0.5, y: 0, z: -1.3 },
            rightElbow:    { x: -0.3, y: 0, z: 0 },
            leftShoulder:  { x: -0.5, y: 0, z: 1.3 },
            leftElbow:     { x: -0.3, y: 0, z: 0 },
            spine:         { x: 0.1, y: 0, z: 0 },
        },
        pelam: {
            rightShoulder: { x: -1.4, y: 0, z: -0.2 },
            rightElbow:    { x: -0.1, y: 0, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.4 },
            leftElbow:     { x: -0.8, y: 0, z: 0 },
            spine:         { x: 0, y: -0.2, z: 0 },
        },
        timo: {
            rightShoulder: { x: -0.6, y: 0, z: -0.5 },
            rightElbow:    { x: -1.1, y: 0, z: 0 },
            leftShoulder:  { x: -0.6, y: 0, z: 0.5 },
            leftElbow:     { x: -1.1, y: 0, z: 0 },
            spine:         { x: 0.05, y: 0, z: 0 },
        },
        otosi: {
            rightShoulder: { x: -1.5, y: 0, z: -0.1 },
            rightElbow:    { x: -0.05, y: 0, z: 0 },
            leftShoulder:  { x: 0.3, y: 0, z: 0.4 },
            leftElbow:     { x: -0.6, y: 0, z: 0 },
            spine:         { x: 0, y: -0.1, z: 0 },
        },
        matkum: {
            rightShoulder: { x: -0.7, y: 0, z: -0.8 },
            rightElbow:    { x: -1.5, y: 0, z: 0 },
            leftShoulder:  { x: -0.7, y: 0, z: 0.8 },
            leftElbow:     { x: -1.5, y: 0, z: 0 },
            spine:         { x: 0, y: 0, z: 0 },
        },
        thepanu: {
            rightShoulder: { x: -1.0, y: 0, z: -0.3 },
            rightElbow:    { x: -0.5, y: 0, z: 0 },
            leftShoulder:  { x: -1.0, y: 0, z: 0.3 },
            leftElbow:     { x: -0.5, y: 0, z: 0 },
            spine:         { x: 0, y: 0, z: 0 },
        },
    },

    // Pre-allocated walk pose buffer to avoid per-frame allocations
    _walkPose: {
        leftThigh:     { x: 0, y: 0, z: 0 },
        leftKnee:      { x: 0, y: 0, z: 0 },
        rightThigh:    { x: 0, y: 0, z: 0 },
        rightKnee:     { x: 0, y: 0, z: 0 },
        leftShoulder:  { x: 0, y: 0, z: 0.3 },
        leftElbow:     { x: -0.5, y: 0, z: 0 },
        rightShoulder: { x: 0, y: 0, z: -0.3 },
        rightElbow:    { x: -0.5, y: 0, z: 0 },
        spine:         { x: 0, y: 0, z: 0 },
        head:          { x: 0, y: 0, z: 0 },
        hips:          { x: 0, y: 0, z: 0 },
    },

    // Pre-allocated joint names array
    _jointNames: ['leftShoulder', 'leftElbow', 'rightShoulder', 'rightElbow',
                   'leftThigh', 'leftKnee', 'rightThigh', 'rightKnee',
                   'spine', 'head', 'hips', 'neck'],

    // Get walk cycle pose (procedural, reuses pre-allocated buffer)
    getWalkPose(frameCount) {
        const t = frameCount * 0.15;
        const s = Math.sin(t);
        const p = this._walkPose;
        p.leftThigh.x = s * 0.5;
        p.leftKnee.x = Math.max(0, -s * 0.6);
        p.rightThigh.x = -s * 0.5;
        p.rightKnee.x = Math.max(0, s * 0.6);
        p.leftShoulder.x = -s * 0.25;
        p.rightShoulder.x = s * 0.25;
        return p;
    },

    // Determine target pose from fighter state
    getTargetPose(fighter, frameCount) {
        if (fighter.currentAttack === 'special') {
            const sp = this.specialPoses[fighter.charName];
            if (sp) {
                // Merge special pose over idle (reuse cached merge)
                const key = '_sp_' + fighter.charName;
                if (!this[key]) {
                    this[key] = Object.assign({}, this.poses.idle, sp);
                }
                return this[key];
            }
            return this.poses.idle;
        }
        if (fighter.currentAttack) {
            return this.poses[fighter.currentAttack] || this.poses.idle;
        }
        if (fighter.knockdownTimer > 0) return this.poses.knockdown;
        if (fighter.hitstunTimer > 0) return this.poses.hit;
        if (fighter.isBlocking) return this.poses.block;
        if (fighter.isCrouching) return this.poses.crouch;
        if (Math.abs(fighter.vx) > 0.5) return this.getWalkPose(frameCount);
        return this.poses.idle;
    },

    // Apply pose with lerp interpolation
    applyPose(parts, fighter, frameCount) {
        const target = this.getTargetPose(fighter, frameCount);
        // Attacks snap fast, other states transition smoothly
        const speed = fighter.currentAttack ? 0.4 : 0.18;

        for (const name of this._jointNames) {
            const joint = parts[name];
            if (!joint) continue;

            const t = target[name];
            const tx = t ? t.x : 0;
            const ty = t ? t.y : 0;
            const tz = t ? t.z : 0;

            joint.rotation.x += (tx - joint.rotation.x) * speed;
            joint.rotation.y += (ty - joint.rotation.y) * speed;
            joint.rotation.z += (tz - joint.rotation.z) * speed;
        }

        // Idle breathing (subtle spine oscillation)
        if (!fighter.currentAttack && fighter.knockdownTimer <= 0 && fighter.hitstunTimer <= 0) {
            parts.spine.rotation.x += Math.sin(frameCount * 0.03) * 0.008;
        }
    }
};
