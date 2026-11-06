/* ==========================================================================
   FOR DISHA · AN INTERACTIVE BIRTHDAY MUSEUM
   Complete Interactive Experience & CapCut Slideshow Engine
   Customized for Disha & Sibu
   ========================================================================== */

(function () {
    'use strict';

    /* Helper aliases */
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);
    const clamp = (val, min, max) => Math.min(Math.max(val, min), max);
    const rand = (min, max) => Math.random() * (max - min) + min;

    /* Global State */
    const S = {
        unlockedAudio: false,
        bgmPlaying: false,
        currentScene: 'scene-bow',
        scratchCleared: false,
        voicePlaying: false,
        ssIndex: 0,
        ssPlaying: false,
        ssTimer: null,
        ssProgressTimer: null,
        ssStartTime: 0,
        ssDuration: 4500, // 4.5s comfortable pace per photo
        photos: (window.MOVIE && window.MOVIE.photos && window.MOVIE.photos.length) ? window.MOVIE.photos : [
            'media/photos/p001.jpg', 'media/photos/p002.jpg', 'media/photos/p004.jpg', 'media/photos/p005.jpg'
        ]
    };

    /* ------------------------------------------------------------- Audio Engine */
    let actx = null;
    const bgmAudio = $('#bgm-audio');
    const voiceAudio = $('#voice-audio');

    function initAudioContext() {
        if (actx) {
            if (actx.state === 'suspended') actx.resume().catch(() => {});
            return;
        }
        try {
            actx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) {
            actx = null;
        }
    }

    function unlockGlobalAudio() {
        if (S.unlockedAudio) return;
        S.unlockedAudio = true;
        initAudioContext();
        $('#audio-unlock-overlay').classList.add('hidden');

        if (bgmAudio) {
            bgmAudio.volume = 0.65;
            bgmAudio.play().then(() => {
                S.bgmPlaying = true;
                $('#bgm-pill').classList.remove('paused');
            }).catch(() => {});
        }
    }

    /* Sound Effects Synthesizer */
    function soundTwang() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
            gain.gain.setValueAtTime(0.4, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(t);
            osc.stop(t + 0.25);
        } catch(e) {}
    }

    function soundHeartHit() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
                const osc = actx.createOscillator();
                const gain = actx.createGain();
                osc.type = 'sine';
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.2, t + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.08 + 0.7);
                osc.connect(gain);
                gain.connect(actx.destination);
                osc.start(t + i * 0.08);
                osc.stop(t + i * 0.08 + 0.7);
            });
        } catch(e) {}
    }

    function soundKnock() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(140, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.09);
            gain.gain.setValueAtTime(0.7, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(t);
            osc.stop(t + 0.09);
        } catch(e) {}
    }

    function soundStamp() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(110, t);
            osc.frequency.exponentialRampToValueAtTime(30, t + 0.18);
            gain.gain.setValueAtTime(0.85, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(t);
            osc.stop(t + 0.18);
        } catch(e) {}
    }

    function soundPop() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            const osc = actx.createOscillator();
            const gain = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(450, t);
            osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);
            gain.gain.setValueAtTime(0.3, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(actx.destination);
            osc.start(t);
            osc.stop(t + 0.08);
        } catch(e) {}
    }

    function soundElectricZap() {
        if (!actx) return;
        try {
            const t = actx.currentTime;
            const bufferSize = actx.sampleRate * 0.25;
            const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
            }
            const noise = actx.createBufferSource();
            noise.buffer = buffer;
            const filter = actx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 800;
            const gain = actx.createGain();
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            noise.connect(filter);
            filter.connect(gain);
            gain.connect(actx.destination);
            noise.start(t);
        } catch(e) {}
    }

    /* Scene Navigation */
    function switchScene(nextId) {
        const curEl = $(`#${S.currentScene}`);
        const nextEl = $(`#${nextId}`);
        if (!nextEl || curEl === nextEl) return;

        if (curEl) {
            curEl.classList.remove('active');
            curEl.classList.add('exit-left');
            setTimeout(() => curEl.classList.remove('exit-left'), 900);
        }

        setTimeout(() => {
            nextEl.classList.add('active');
            S.currentScene = nextId;

            // Scene-specific lifecycle triggers
            if (nextId === 'scene-balloon-game') {
                initBalloonGame();
            } else if (nextId === 'scene-tree') {
                growTreeProcedural();
            } else if (nextId === 'scene-polaroids') {
                populatePolaroids();
            } else if (nextId === 'scene-door') {
                initDoorScene();
            } else if (nextId === 'scene-room-scratch') {
                initScratchCard();
            } else if (nextId === 'scene-room-puzzle') {
                initPhotoPuzzle();
            } else if (nextId === 'scene-room-wheel') {
                initDateWheel();
            } else if (nextId === 'scene-room-compliments') {
                initComplimentsScene();
            } else if (nextId === 'scene-room-stars') {
                initConstellationScene();
            } else if (nextId === 'scene-room-quiz') {
                initBoyfriendQuiz();
            } else if (nextId === 'scene-birthday') {
                initBirthdayScene();
            }
        }, 120);
    }

    /* -------------------------------------------------------------
       SCENE 1 · CUPID BOW & ARROW
       Lower-left bow aiming directly up-right towards center heart!
       ------------------------------------------------------------- */
    function initBowScene() {
        const canvas = $('#bow-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = 280;
        const H = canvas.height = 230;

        const anchorX = 45;
        const anchorY = H - 35;
        const aimAngle = -Math.PI / 4; // -45 deg points towards center heart

        let pullDist = 0;
        let isDragging = false;
        let arrowFired = false;

        function renderBow() {
            ctx.clearRect(0, 0, W, H);

            ctx.save();
            ctx.translate(anchorX, anchorY);
            ctx.rotate(aimAngle);

            const bowRadius = 55;
            const tipTopX = 0, tipTopY = -bowRadius;
            const tipBotX = 0, tipBotY = bowRadius;
            const stringRestX = -10, stringRestY = 0;
            const stringPullX = stringRestX - pullDist;

            // 1. Bow Wood Limbs
            ctx.beginPath();
            ctx.moveTo(tipTopX, tipTopY);
            ctx.quadraticCurveTo(35, 0, tipBotX, tipBotY);
            ctx.lineWidth = 6;
            ctx.strokeStyle = '#5a3825';
            ctx.lineCap = 'round';
            ctx.stroke();

            // Inner wood highlight
            ctx.beginPath();
            ctx.moveTo(tipTopX, tipTopY);
            ctx.quadraticCurveTo(32, 0, tipBotX, tipBotY);
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#b07d56';
            ctx.stroke();

            // 2. Bowstring
            ctx.beginPath();
            ctx.moveTo(tipTopX, tipTopY);
            ctx.lineTo(stringPullX, stringRestY);
            ctx.lineTo(tipBotX, tipBotY);
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = '#f4e8d0';
            ctx.stroke();

            // 3. Arrow loaded on bow
            if (!arrowFired) {
                const arrowLength = 70;
                const arrowTipX = stringPullX + arrowLength;
                
                ctx.beginPath();
                ctx.moveTo(stringPullX, stringRestY);
                ctx.lineTo(arrowTipX, stringRestY);
                ctx.lineWidth = 2.5;
                ctx.strokeStyle = '#d4af37';
                ctx.stroke();

                // Golden Heart Arrow Tip
                ctx.fillStyle = '#ff477e';
                ctx.beginPath();
                ctx.arc(arrowTipX, stringRestY - 3, 3, 0, Math.PI * 2);
                ctx.arc(arrowTipX, stringRestY + 3, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(arrowTipX + 7, stringRestY);
                ctx.lineTo(arrowTipX - 2, stringRestY - 6);
                ctx.lineTo(arrowTipX - 2, stringRestY + 6);
                ctx.closePath();
                ctx.fill();

                // Feathers at nock
                ctx.strokeStyle = '#ff9ebb';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(stringPullX, stringRestY);
                ctx.lineTo(stringPullX - 10, stringRestY - 6);
                ctx.moveTo(stringPullX, stringRestY);
                ctx.lineTo(stringPullX - 10, stringRestY + 6);
                ctx.stroke();
            }

            ctx.restore();
        }

        renderBow();

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (W / rect.width),
                y: (clientY - rect.top) * (H / rect.height)
            };
        }

        let aimDx = 0;
        let aimDy = 0;

        function onDown(e) {
            if (arrowFired) return;
            unlockGlobalAudio();
            isDragging = true;
            $('#pull-hint').textContent = 'AIM AT THE HEART & RELEASE!';
        }

        function onMove(e) {
            if (!isDragging || arrowFired) return;
            const pos = getPos(e);
            aimDx = pos.x - anchorX;
            aimDy = pos.y - anchorY;
            const dist = Math.hypot(aimDx, aimDy);
            pullDist = clamp(dist * 0.55, 0, 52);
            renderBow();
        }

        function onUp() {
            if (!isDragging || arrowFired) return;
            isDragging = false;
            if (pullDist > 16) {
                verifyAimAndShoot();
            } else {
                pullDist = 0;
                renderBow();
                $('#pull-hint').textContent = 'DRAG TO AIM & RELEASE';
            }
        }

        canvas.addEventListener('mousedown', onDown);
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);

        canvas.addEventListener('touchstart', onDown, { passive: true });
        window.addEventListener('touchmove', onMove, { passive: true });
        window.addEventListener('touchend', onUp);

        function verifyAimAndShoot() {
            const canvasRect = canvas.getBoundingClientRect();
            const startX = canvasRect.left + (anchorX * (canvasRect.width / W));
            const startY = canvasRect.top + (anchorY * (canvasRect.height / H));

            const heart = $('#target-heart');
            const heartRect = heart.getBoundingClientRect();
            const targetX = heartRect.left + heartRect.width / 2;
            const targetY = heartRect.top + heartRect.height / 2;

            // The direction arrow shoots is opposite to pull: (-aimDx, -aimDy)
            const shootAngle = Math.atan2(-aimDy, -aimDx);
            const targetAngle = Math.atan2(targetY - startY, targetX - startX);
            let angleDiff = Math.abs(shootAngle - targetAngle);
            while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - 2 * Math.PI);

            // Is the aim directed towards the heart target? (within ~32 degrees tolerance)
            const isHit = (angleDiff < 0.56);

            arrowFired = true;
            pullDist = 0;
            renderBow();
            soundTwang();

            const arrowEl = document.createElement('div');
            arrowEl.className = 'flying-arrow-el';
            arrowEl.innerHTML = `
                <svg width="60" height="20" viewBox="0 0 60 20">
                    <line x1="0" y1="10" x2="52" y2="10" stroke="#d4af37" stroke-width="3" stroke-linecap="round"/>
                    <path d="M52,4 L60,10 L52,16 Z" fill="#ff477e"/>
                    <path d="M4,4 L12,10 L4,16" stroke="#ff85a1" stroke-width="2" fill="none"/>
                </svg>
            `;
            document.body.appendChild(arrowEl);

            if (isHit) {
                $('#pull-hint').textContent = 'DIRECT HIT! 🎯❤️';
                const angleDeg = Math.atan2(targetY - startY, targetX - startX) * (180 / Math.PI);

                arrowEl.style.left = startX + 'px';
                arrowEl.style.top = startY + 'px';
                arrowEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(0.85)`;

                requestAnimationFrame(() => {
                    arrowEl.style.left = targetX + 'px';
                    arrowEl.style.top = targetY + 'px';
                    arrowEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(1.1)`;
                });

                setTimeout(() => {
                    heart.classList.add('hit');
                    soundHeartHit();
                    arrowEl.remove();

                    spawnHeartShatterParticles(targetX, targetY);

                    setTimeout(() => {
                        $('#shatter-text-wrap').classList.remove('hidden');
                        $('#bow-kicker').style.opacity = '0';
                        $('#bow-mechanic-wrap').style.opacity = '0';
                    }, 400);
                }, 460);

            } else {
                // Arrow missed! Flies off-screen in the aimed direction
                $('#pull-hint').textContent = 'Oops! Aim at the heart, Disha! 🏹';
                const flyDist = 1200;
                const endX = startX + Math.cos(shootAngle) * flyDist;
                const endY = startY + Math.sin(shootAngle) * flyDist;
                const angleDeg = shootAngle * (180 / Math.PI);

                arrowEl.style.left = startX + 'px';
                arrowEl.style.top = startY + 'px';
                arrowEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(0.85)`;

                requestAnimationFrame(() => {
                    arrowEl.style.left = endX + 'px';
                    arrowEl.style.top = endY + 'px';
                    arrowEl.style.transform = `translate(-50%, -50%) rotate(${angleDeg}deg) scale(1.1)`;
                });

                setTimeout(() => {
                    arrowEl.remove();
                    arrowFired = false;
                    renderBow();
                }, 700);
            }
        }

        $('#scene-bow').addEventListener('click', () => {
            if (!$('#shatter-text-wrap').classList.contains('hidden')) {
                switchScene('scene-balloon-game');
            }
        });
    }

    function spawnHeartShatterParticles(cx, cy) {
        const hearts = ['❤️', '💖', '✨', '🌸', '💕'];
        for (let i = 0; i < 22; i++) {
            const el = document.createElement('div');
            el.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            el.style.cssText = `
                position: fixed;
                left: ${cx}px;
                top: ${cy}px;
                font-size: ${rand(16, 28)}px;
                pointer-events: none;
                z-index: 999;
                transition: all ${rand(0.7, 1.4)}s cubic-bezier(0.16, 1, 0.3, 1);
                transform: translate(-50%, -50%);
            `;
            document.body.appendChild(el);

            const angle = Math.random() * Math.PI * 2;
            const dist = rand(70, 220);
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist - rand(30, 80);

            requestAnimationFrame(() => {
                el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`;
                el.style.opacity = '0';
            });
            setTimeout(() => el.remove(), 1500);
        }
    }

    /* -------------------------------------------------------------
       SCENE 1.2 · DISHA'S BALLOON ARCHERY LOVE HUNT
       Pop 5 floating balloons to unlock hidden love shayari & notes!
       ------------------------------------------------------------- */
    let balloonsPopped = 0;
    const balloonShayaris = [
        {
            emoji: "✨",
            title: "Tera Muskurana",
            text: "Tumhari muskurahat mein wo sukoon hai, jo kisi bhi udas din ko roshan kar de. Hamesha aise hi khulkar hasna! 🌸"
        },
        {
            emoji: "🌸",
            title: "Khaas Ehsaas",
            text: "Log kehte hain waqt kisi ke liye nahi rukta, par jab tum sath hoti ho na Disha, toh har lamha thehar sa jata hai. ✨"
        },
        {
            emoji: "💫",
            title: "Ankahi Dosti & Ishq",
            text: "Kuch rishton ka koi formal naam nahi hota, par wo dil ke sabse kareeb hote hain. Tum bohot khaas ho mere liye. 💖"
        },
        {
            emoji: "👑",
            title: "Khuda Ki Dua",
            text: "Aap wo khoobsurat dua ho jo khuda ne bina maange poori kar di. Happy 18th Birthday meri favourite insaan! 👑"
        },
        {
            emoji: "🌌",
            title: "Taaron Se Bhi Aage",
            text: "Aasman ke taare bhi kam pad jayein agar tumhari tareef karne lago... may your 18th year bring you infinite happiness! 💗✨"
        }
    ];

    function initBalloonGame() {
        const sky = $('#balloon-sky');
        const counterEl = $('#balloon-pop-counter');
        const noteCard = $('#balloon-note-card');
        const noteEmoji = $('#bn-emoji');
        const noteTitle = $('#bn-shayari-title');
        const noteText = $('#bn-shayari-text');
        const continueBtn = $('#btn-bn-continue');
        const completeBanner = $('#balloon-complete-banner');

        const colors = [
            'linear-gradient(135deg, #ff477e, #ff85a1)',
            'linear-gradient(135deg, #7b2cbf, #b5179e)',
            'linear-gradient(135deg, #f72585, #ff70a6)',
            'linear-gradient(135deg, #ffd166, #f4a261)',
            'linear-gradient(135deg, #06d6a0, #118ab2)'
        ];

        function spawnBalloon(index) {
            const b = document.createElement('div');
            b.className = 'balloon-item';
            const color = colors[index % colors.length];

            const leftPct = 12 + (index * 17) + rand(-3, 3);
            const startBottom = -100;
            const targetBottom = rand(25, 65);

            b.style.left = leftPct + '%';
            b.style.bottom = startBottom + 'px';

            b.innerHTML = `
                <div class="b-body" style="background: ${color};"></div>
                <div class="b-knot" style="background: ${color};"></div>
                <div class="b-string"></div>
            `;
            sky.appendChild(b);

            // Float up into view with sway
            setTimeout(() => {
                b.style.transition = `bottom ${rand(1.2, 1.8)}s cubic-bezier(0.2, 0.8, 0.2, 1)`;
                b.style.bottom = targetBottom + '%';
            }, index * 220);

            b.addEventListener('click', () => {
                popBalloon(b, index);
            });
        }

        for (let i = 0; i < 5; i++) {
            spawnBalloon(i);
        }

        function popBalloon(balloonEl, index) {
            soundPop();
            balloonEl.style.transform = 'scale(1.4)';
            balloonEl.style.opacity = '0';
            setTimeout(() => balloonEl.remove(), 200);

            balloonsPopped++;
            counterEl.textContent = `Popped: ${balloonsPopped} / 5 🎈`;

            // Display romantic Shayari note
            const sh = balloonShayaris[index % balloonShayaris.length];
            noteEmoji.textContent = sh.emoji;
            noteTitle.textContent = sh.title;
            noteText.textContent = sh.text;
            noteCard.classList.remove('hidden');

            triggerConfettiBurst();
        }

        continueBtn.addEventListener('click', () => {
            noteCard.classList.add('hidden');
            if (balloonsPopped >= 5) {
                completeBanner.classList.remove('hidden');
            }
        });

        $('#btn-after-balloons').addEventListener('click', () => {
            switchScene('scene-interlude');
        });
    }

    /* -------------------------------------------------------------
       SCENE 1.5 · MAGENTA INTERLUDE
       ------------------------------------------------------------- */
    function initInterludeScene() {
        $('#scene-interlude').addEventListener('click', () => {
            switchScene('scene-tree');
        });
    }

    /* -------------------------------------------------------------
       SCENE 2 · REALISTIC HEART TREE SPROUT FROM BOTTOM
       Organic trunk, realistic branches, soft 3D puffy heart blossoms!
       ------------------------------------------------------------- */
    let treeGrown = false;
    let treePetalTimer = null;
    function growTreeProcedural() {
        if (treeGrown) return;
        treeGrown = true;

        const wrap = $('#tree-visual-wrap');
        const stage = $('#tree-stage');
        if (wrap) wrap.classList.add('growing');

        // Transition from sprouting stage to fully bloomed dense heart canopy
        setTimeout(() => {
            if (wrap) wrap.classList.add('bloomed');
        }, 1100);

        // Continuous subtle drifting 3D pastel heart blossoms floating in the air
        function spawnDriftingPetal() {
            const container = $('#tree-drifting-petals');
            if (!container) return;
            const hearts = ['💖', '💕', '🌸', '✨', '💗', '💛'];
            const p = document.createElement('div');
            p.className = 'tree-drifting-petal';
            p.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            p.style.left = rand(22, 78) + '%';
            p.style.top = rand(12, 48) + '%';
            p.style.setProperty('--tx', rand(-90, 90) + 'px');
            p.style.setProperty('--ty', rand(110, 260) + 'px');
            p.style.setProperty('--rot', rand(-60, 60) + 'deg');
            container.appendChild(p);

            setTimeout(() => p.remove(), 4200);
        }

        treePetalTimer = setInterval(spawnDriftingPetal, 480);

        function goToGiftRoses() {
            clearInterval(treePetalTimer);
            switchScene('scene-gift-roses');
        }

        $('#btn-tree-next').addEventListener('click', (e) => {
            e.stopPropagation();
            goToGiftRoses();
        });

        if (stage) {
            stage.addEventListener('click', () => {
                goToGiftRoses();
            });
        }
    }

    /* -------------------------------------------------------------
       SCENE 3 · GIFT BOX & 100% FULL-SCREEN ROSE BLANKET
       Dense HD PNG roses blanket 100% of screen edge-to-edge!
       ------------------------------------------------------------- */
    function initGiftRosesScene() {
        const giftStage = $('#gift-box-stage');
        const curtain = $('#realistic-roses-curtain');
        const blanket = $('#roses-full-blanket');

        // Only pure high-definition transparent PNG isolated roses
        const roseImages = [
            'media/rose_pink.png',
            'media/rose_peach.png',
            'media/rose_white.png'
        ];

        let opened = false;
        giftStage.addEventListener('click', () => {
            if (opened) return;
            opened = true;
            giftStage.classList.add('opened');
            soundStamp();

            setTimeout(() => {
                curtain.classList.remove('hidden');
                spawn100PercentScreenRoseBlanket();
            }, 300);
        });

        function spawn100PercentScreenRoseBlanket() {
            const count = 260; // Massive dense blanket covering 100% of the screen with zero gaps
            const W = window.innerWidth;
            const H = window.innerHeight;

            for (let i = 0; i < count; i++) {
                const imgPath = roseImages[i % roseImages.length];
                const rose = document.createElement('div');
                rose.className = 'falling-rose-item';
                
                const size = rand(105, 185);
                rose.style.width = size + 'px';
                rose.style.height = size + 'px';

                const startX = rand(-40, W + 10);
                const targetY = rand(-40, H + 10);
                const rot = rand(0, 360);

                rose.innerHTML = `<img src="${imgPath}" alt="Rose" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.32));">`;
                rose.style.left = startX + 'px';
                rose.style.top = -rand(150, 700) + 'px';
                rose.style.transform = `rotate(${rot}deg) scale(0.6)`;
                blanket.appendChild(rose);

                const delay = rand(10, 800);
                setTimeout(() => {
                    rose.style.transition = `top ${rand(0.55, 1.0)}s cubic-bezier(0.22, 1, 0.36, 1), transform ${rand(0.55, 1.0)}s`;
                    rose.style.top = targetY + 'px';
                    rose.style.transform = `rotate(${rot + rand(-60, 60)}deg) scale(1.12)`;
                }, delay);
            }

            // Once 100% of the screen is blanketed, hold for 2.5s then clear downward into Polaroids!
            setTimeout(() => {
                blanket.classList.add('clearing');
                soundTwang();
                
                setTimeout(() => {
                    switchScene('scene-polaroids');
                }, 1000);
            }, 2600);
        }
    }

    /* -------------------------------------------------------------
       SCENE 4 · "FROM ME TO YOU" & POLAROIDS
       ------------------------------------------------------------- */
    function populatePolaroids() {
        const zone = $('#polaroid-scatter-zone');
        if (!zone || zone.children.length > 0) return;

        const photos = S.photos.slice(0, 6);
        const captions = ['Her Laugh', 'Pure Magic', 'My Favorite', 'Disha 👑', 'Always You', 'Unfiltered'];

        const rect = zone.getBoundingClientRect();
        const W = rect.width || 380;
        const H = rect.height || 320;

        photos.forEach((src, i) => {
            const card = document.createElement('div');
            card.className = 'polaroid-card';
            card.innerHTML = `
                <div class="polaroid-img-wrap"><img src="${src}" alt="Disha" loading="lazy"></div>
                <div class="polaroid-caption">${captions[i]}</div>
            `;

            const posX = (i % 3) * (W / 3) + rand(-15, 15);
            const posY = Math.floor(i / 3) * (H / 2.3) + rand(-10, 10);
            const rot = rand(-14, 14);

            card.style.left = posX + 'px';
            card.style.top = posY + 'px';
            card.style.transform = `rotate(${rot}deg)`;
            card.style.zIndex = i + 1;

            card.addEventListener('click', () => { soundKnock(); });
            zone.appendChild(card);
        });

        $('#btn-open-museum').addEventListener('click', () => {
            switchScene('scene-door');
        });
    }

    /* -------------------------------------------------------------
       SCENE 5 · 3D ARCHED MUSEUM DOOR (3 KNOCKS)
       ------------------------------------------------------------- */
    function initDoorScene() {
        const knocker = $('#door-knocker');
        const knockerRing = $('#knocker-ring');
        const facade = $('.door-facade-3d');
        const countBadge = $('#knock-count-badge');
        let knocks = 0;

        knocker.addEventListener('click', () => {
            if (knocks >= 3) return;
            knocks++;
            soundKnock();

            knockerRing.classList.remove('knocking');
            void knockerRing.offsetWidth;
            knockerRing.classList.add('knocking');

            countBadge.textContent = `${knocks} / 3`;

            if (knocks === 3) {
                countBadge.textContent = 'UNLOCKED';
                countBadge.style.color = '#70e000';

                setTimeout(() => {
                    facade.classList.add('opened');
                    soundHeartHit();

                    setTimeout(() => {
                        switchScene('scene-room-scratch');
                    }, 1800);
                }, 450);
            }
        });
    }

    /* -------------------------------------------------------------
       ROOM I · SCRATCH-OFF CARD
       ------------------------------------------------------------- */
    let scratchInitialized = false;
    function initScratchCard() {
        if (scratchInitialized) return;
        scratchInitialized = true;

        const canvas = $('#scratch-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = 380;
        const H = canvas.height = 380;

        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#d4af37');
        grad.addColorStop(0.3, '#fbe39d');
        grad.addColorStop(0.7, '#c59b27');
        grad.addColorStop(1, '#aa8212');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        ctx.font = '700 18px Playfair Display';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.textAlign = 'center';
        ctx.fillText('✨ SCRATCH WITH LOVE ✨', W / 2, H / 2 - 10);
        ctx.font = '14px Outfit';
        ctx.fillText('Rub to reveal a secret memory', W / 2, H / 2 + 18);

        let isScratching = false;
        let clearedPixels = 0;

        function scratch(x, y) {
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x, y, 26, 0, Math.PI * 2);
            ctx.fill();

            clearedPixels += 1;
            if (clearedPixels % 15 === 0) {
                checkScratchProgress();
            }
        }

        function checkScratchProgress() {
            if (S.scratchCleared) return;
            const imgData = ctx.getImageData(0, 0, W, H);
            let transparentCount = 0;
            const total = imgData.data.length / 4;
            for (let i = 3; i < imgData.data.length; i += 64) {
                if (imgData.data[i] === 0) transparentCount++;
            }
            const pct = Math.min(100, Math.round((transparentCount / (total / 16)) * 100));
            $('#scratch-bar').style.setProperty('--scratch-progress', pct + '%');
            $('#scratch-pct').textContent = pct + '% Revealed';

            if (pct > 45) {
                S.scratchCleared = true;
                canvas.style.opacity = '0';
                setTimeout(() => canvas.remove(), 600);
                soundHeartHit();
            }
        }

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return {
                x: (clientX - rect.left) * (W / rect.width),
                y: (clientY - rect.top) * (H / rect.height)
            };
        }

        canvas.addEventListener('mousedown', (e) => { isScratching = true; const p = getPos(e); scratch(p.x, p.y); });
        canvas.addEventListener('mousemove', (e) => { if (isScratching) { const p = getPos(e); scratch(p.x, p.y); } });
        window.addEventListener('mouseup', () => { isScratching = false; });

        canvas.addEventListener('touchstart', (e) => { isScratching = true; const p = getPos(e); scratch(p.x, p.y); }, { passive: true });
        canvas.addEventListener('touchmove', (e) => { if (isScratching) { const p = getPos(e); scratch(p.x, p.y); } }, { passive: true });
        window.addEventListener('touchend', () => { isScratching = false; });

        $('#btn-next-room-1').addEventListener('click', () => {
            switchScene('scene-room-puzzle');
        });
    }

    /* -------------------------------------------------------------
       ROOM II · THE ATELIER: 3x3 DRAG & DROP / TAP-TO-SWAP PUZZLE
       Pick up and drop to swap, or tap A then B!
       ------------------------------------------------------------- */
    let puzzleInitialized = false;
    function initPhotoPuzzle() {
        if (puzzleInitialized) return;
        puzzleInitialized = true;

        const grid = $('#puzzle-grid');
        const photoSrc = 'media/photos/p004.jpg';
        let tiles = [2, 0, 1, 5, 4, 3, 8, 6, 7]; // Initial shuffled state
        let selectedIndex = null;
        let draggedIndex = null;

        function renderPuzzle() {
            grid.innerHTML = '';
            tiles.forEach((val, pos) => {
                const el = document.createElement('div');
                el.className = 'puzzle-tile';
                el.setAttribute('draggable', 'true');
                el.dataset.pos = pos;
                el.dataset.val = val;

                const row = Math.floor(val / 3);
                const col = val % 3;
                el.style.backgroundImage = `url(${photoSrc})`;
                el.style.backgroundPosition = `-${col * 98}px -${row * 98}px`;

                // Badge Number
                const numBadge = document.createElement('span');
                numBadge.className = 'puzzle-tile-num';
                numBadge.textContent = val + 1;
                el.appendChild(numBadge);

                // Highlight if selected
                if (selectedIndex === pos) {
                    el.classList.add('selected');
                }

                // 1. Click / Tap to Swap
                el.addEventListener('click', () => {
                    onTileTap(pos);
                });

                // 2. HTML5 Drag & Drop
                el.addEventListener('dragstart', (e) => {
                    draggedIndex = pos;
                    el.classList.add('dragging');
                    e.dataTransfer.effectAllowed = 'move';
                });
                el.addEventListener('dragend', () => {
                    el.classList.remove('dragging');
                    $$('.puzzle-tile').forEach(t => t.classList.remove('drag-over'));
                });
                el.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    el.classList.add('drag-over');
                });
                el.addEventListener('dragleave', () => {
                    el.classList.remove('drag-over');
                });
                el.addEventListener('drop', (e) => {
                    e.preventDefault();
                    el.classList.remove('drag-over');
                    if (draggedIndex !== null && draggedIndex !== pos) {
                        swapTiles(draggedIndex, pos);
                    }
                });

                grid.appendChild(el);
            });
        }

        function onTileTap(pos) {
            soundPop();
            if (selectedIndex === null) {
                // Select first tile
                selectedIndex = pos;
                renderPuzzle();
            } else if (selectedIndex === pos) {
                // Deselect
                selectedIndex = null;
                renderPuzzle();
            } else {
                // Swap with second tile
                swapTiles(selectedIndex, pos);
                selectedIndex = null;
            }
        }

        function swapTiles(i1, i2) {
            const temp = tiles[i1];
            tiles[i1] = tiles[i2];
            tiles[i2] = temp;
            soundKnock();
            renderPuzzle();
            checkSolved();
        }

        function checkSolved() {
            const solved = tiles.every((v, i) => v === i);
            if (solved) {
                soundHeartHit();
                $('#puzzle-solved-banner').classList.remove('hidden');
                grid.style.boxShadow = '0 0 45px rgba(255, 71, 126, 0.7)';
                grid.style.border = '3px solid #ff477e';
                $('#btn-next-room-2').classList.add('gold-btn');
                triggerConfettiBurst();
            }
        }

        // Action Buttons
        $('#btn-puzzle-peek').addEventListener('click', () => {
            grid.style.backgroundImage = `url(${photoSrc})`;
            grid.style.backgroundSize = 'cover';
            setTimeout(() => { grid.style.backgroundImage = 'none'; }, 1500);
        });

        $('#btn-puzzle-numbers').addEventListener('click', () => {
            grid.classList.toggle('show-numbers');
        });

        $('#btn-puzzle-solve').addEventListener('click', () => {
            tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8];
            renderPuzzle();
            checkSolved();
        });

        renderPuzzle();

        $('#btn-next-room-2').addEventListener('click', () => {
            switchScene('scene-room-love-meter');
        });
    }

    /* -------------------------------------------------------------
       MASSIVE REALISTIC FALLING ROSES EXPLOSION
       High-resolution transparent roses shower the screen!
       ------------------------------------------------------------- */
    function spawnMassiveRealisticRosesExplosion() {
        const roseImages = [
            'media/rose_pink.png',
            'media/rose_peach.png',
            'media/rose_white.png'
        ];
        const count = 90;
        const W = window.innerWidth;
        const H = window.innerHeight;

        for (let i = 0; i < count; i++) {
            const imgPath = roseImages[Math.floor(Math.random() * roseImages.length)];
            const el = document.createElement('div');
            el.className = 'falling-rose-item';
            const size = rand(55, 115);
            el.style.cssText = `
                position: fixed;
                width: ${size}px;
                height: ${size}px;
                left: ${rand(10, W - size - 10)}px;
                top: -${rand(60, 350)}px;
                pointer-events: none;
                z-index: 9999;
                transition: top ${rand(1.8, 3.2)}s cubic-bezier(0.25, 1, 0.5, 1), transform ${rand(1.8, 3.2)}s linear, opacity 0.8s ease;
                transform: rotate(${rand(0, 360)}deg) scale(0.6);
            `;
            el.innerHTML = `<img src="${imgPath}" alt="Rose" style="width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 8px 18px rgba(0,0,0,0.28));">`;
            document.body.appendChild(el);

            const delay = rand(0, 1000);
            setTimeout(() => {
                el.style.top = (H + rand(40, 180)) + 'px';
                el.style.transform = `rotate(${rand(360, 720)}deg) scale(1.05)`;
            }, delay);

            setTimeout(() => el.remove(), delay + 3400);
        }
    }

    /* -------------------------------------------------------------
       ROOM III (CUTE TASK 1) · THE LOVE LAB & 1000% CHARGER
       ------------------------------------------------------------- */
    let loveCharge = 0;
    function initLoveMeter() {
        const trigger = $('#tap-heart-trigger');
        const liquid = $('#battery-liquid');
        const pctLabel = $('#battery-pct-label');
        const reactionBox = $('#love-reaction-box');

        const milestones = [
            { pct: 15, msg: "⚡ Sibu's eyes locked on Disha... Pulse accelerating! 💓" },
            { pct: 40, msg: "🌸 Disha smiled! Sibu's dopamine levels: +9999%!" },
            { pct: 75, msg: "🔥 Caution: Sibu thinking about Disha non-stop!" },
            { pct: 100, msg: "💖 100% MAXIMUM LOVE! But keep tapping to overcharge it!" },
            { pct: 250, msg: "🚨 OVERCLOCKING! Disha is legally too cute to exist!" },
            { pct: 500, msg: "⚠️ CRITICAL SYSTEM MELTDOWN! Disha owns Sibu forever!" },
            { pct: 1000, msg: "💍 1000% INFINITE LOVE! Sibu is permanently yours! 💖🎉" }
        ];

        trigger.addEventListener('click', () => {
            soundPop();
            loveCharge += 25;
            if (loveCharge > 1000) loveCharge = 1000;

            liquid.style.height = Math.min(100, loveCharge / 10) + '%';
            pctLabel.textContent = `${loveCharge}%`;

            // Milestone reaction update
            for (let i = milestones.length - 1; i >= 0; i--) {
                if (loveCharge >= milestones[i].pct) {
                    reactionBox.textContent = milestones[i].msg;
                    break;
                }
            }

            // Spawn floating hearts from heart
            spawnLoveBubbles();

            if (loveCharge === 1000) {
                soundHeartHit();
                triggerConfettiBurst();
                spawnMassiveRealisticRosesExplosion();
                reactionBox.style.background = '#ffe3ec';
                reactionBox.style.color = '#d61f5b';
            }
        });

        function spawnLoveBubbles() {
            const el = document.createElement('div');
            el.textContent = ['💖', '✨', '⚡', '💕', '🌹'][Math.floor(Math.random() * 5)];
            el.style.cssText = `
                position: absolute;
                bottom: 40px;
                font-size: ${rand(18, 28)}px;
                pointer-events: none;
                transition: all 0.8s ease-out;
                z-index: 20;
            `;
            trigger.appendChild(el);
            requestAnimationFrame(() => {
                el.style.transform = `translate(${rand(-40, 40)}px, -90px) scale(1.4)`;
                el.style.opacity = '0';
            });
            setTimeout(() => el.remove(), 850);
        }

        $('#btn-next-room-love').addEventListener('click', () => {
            switchScene('scene-room-wheel');
        });
    }

    /* -------------------------------------------------------------
       ROOM IV (CUTE TASK 2) · "AAJ KYA KHAYEIN?" DATE WHEEL
       ------------------------------------------------------------- */
    let wheelDrawn = false;
    function initDateWheel() {
        if (wheelDrawn) return;
        wheelDrawn = true;

        const canvas = $('#wheel-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = 300;
        const H = canvas.height = 300;
        const radius = W / 2;

        const options = [
            '👑 100 Forehead Kisses',
            '🚗 Midnight Long Drive',
            '📸 Sibu Is Your Photographer',
            '🧸 30-Min Unlimited Hugs',
            '💳 Sibu\'s Card Shopping Spree',
            '🍜 2 AM Midnight Maggi',
            '🎬 Disha Picks Any Movie',
            '💆 Relaxing Foot & Head Massage'
        ];

        const colors = ['#ff477e', '#ffd166', '#f4a261', '#ff85a1', '#e76f51', '#f72585', '#06d6a0', '#ff9ebb'];

        let currentAngle = 0;
        let isSpinning = false;

        function drawWheel(angle) {
            ctx.clearRect(0, 0, W, H);
            const sliceAngle = (Math.PI * 2) / options.length;

            options.forEach((opt, i) => {
                const startA = angle + i * sliceAngle;
                const endA = startA + sliceAngle;

                ctx.beginPath();
                ctx.moveTo(radius, radius);
                ctx.arc(radius, radius, radius - 6, startA, endA);
                ctx.fillStyle = colors[i % colors.length];
                ctx.fill();
                ctx.lineWidth = 2;
                ctx.strokeStyle = '#fff';
                ctx.stroke();

                // Text
                ctx.save();
                ctx.translate(radius, radius);
                ctx.rotate(startA + sliceAngle / 2);
                ctx.textAlign = 'right';
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 11px Outfit';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 4;
                ctx.fillText(opt, radius - 16, 4);
                ctx.restore();
            });
        }
        drawWheel(0);

        function spinWheel() {
            if (isSpinning) return;
            isSpinning = true;
            soundTwang();

            const extraRotations = rand(4, 7) * Math.PI * 2;
            const targetAngle = currentAngle + extraRotations + rand(0, Math.PI * 2);
            const duration = 3800;
            const startTime = performance.now();
            const startAngle = currentAngle;

            function step(now) {
                const elapsed = now - startTime;
                const t = Math.min(1, elapsed / duration);
                // Ease out cubic
                const easeOut = 1 - Math.pow(1 - t, 3);
                currentAngle = startAngle + (targetAngle - startAngle) * easeOut;

                drawWheel(currentAngle);

                if (t < 1) {
                    requestAnimationFrame(step);
                } else {
                    isSpinning = false;
                    determineWinner();
                }
            }
            requestAnimationFrame(step);
        }

        function determineWinner() {
            soundHeartHit();
            const sliceAngle = (Math.PI * 2) / options.length;
            // Top pointer is at -Math.PI / 2
            const normalizedAngle = (3 * Math.PI / 2 - (currentAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
            const winningIndex = Math.floor(normalizedAngle / sliceAngle) % options.length;
            const winner = options[winningIndex];

            $('#wheel-result-banner').innerHTML = `🎉 <b>Disha's Birthday Privilege:</b> ${winner}!<br><small style="color:var(--primary-rose)">Accepted! Sibu is on duty for you today! 🎂👑</small>`;
            triggerConfettiBurst();
        }

        $('#btn-spin-wheel').addEventListener('click', spinWheel);

        $('#btn-next-room-wheel').addEventListener('click', () => {
            switchScene('scene-room-compliments');
        });
    }

    /* -------------------------------------------------------------
       ROOM V · THE SECRET VAULT (FINGERPRINT / HEART SCANNER)
       Hold the sensor to decode 5 things Sibu deeply adores!
       ------------------------------------------------------------- */
    let complimentsInitialized = false;
    function initComplimentsScene() {
        if (complimentsInitialized) return;
        complimentsInitialized = true;

        const sensor = $('#fingerprint-sensor');
        const box = $('#compliment-reveal-box');
        const dots = $$('#compliments-progress .dot');
        const nextBtn = $('#btn-next-room-compliments');

        const compliments = [
            "🌸 Sibu loves the way your nose scrunches up when you giggle at something silly. It's the purest sight in the world.",
            "👑 The fact that behind your sweet smile is a fierce, stubborn queen who always stands her ground. Sibu respects you infinitely.",
            "🎶 Your voice at night when you're sleepy and soft-spoken—it's Sibu's peaceful sanctuary after a long day.",
            "✨ How effortlessly you light up every room you walk into. You make the ordinary feel like a movie scene.",
            "💍 That out of every single soul in this vast universe, you let Sibu hold your hand and call you his. Best blessing of my life."
        ];

        let currentComplimentIdx = 0;
        let scanTimer = null;

        function updateDots(idx) {
            dots.forEach((d, i) => {
                if (i <= idx) d.classList.add('active');
                else d.classList.remove('active');
            });
        }

        function revealNextCompliment() {
            soundHeartHit();
            triggerConfettiBurst();

            box.innerHTML = `<p class="cr-text">${compliments[currentComplimentIdx]}</p>`;
            updateDots(currentComplimentIdx);

            currentComplimentIdx++;
            if (currentComplimentIdx >= compliments.length) {
                sensor.classList.add('scanning');
                sensor.innerHTML = `<div class="sensor-icon">💖</div><span class="sensor-label">ALL UNLOCKED!</span>`;
                setTimeout(() => {
                    spawnMassiveRealisticRosesExplosion();
                }, 400);
            }
        }

        function startScanning() {
            if (currentComplimentIdx >= compliments.length) return;
            sensor.classList.add('scanning');
            soundPop();
            scanTimer = setTimeout(() => {
                revealNextCompliment();
                sensor.classList.remove('scanning');
            }, 550);
        }

        function stopScanning() {
            sensor.classList.remove('scanning');
            if (scanTimer) {
                clearTimeout(scanTimer);
                scanTimer = null;
            }
        }

        sensor.addEventListener('mousedown', startScanning);
        sensor.addEventListener('touchstart', (e) => { e.preventDefault(); startScanning(); }, { passive: false });
        window.addEventListener('mouseup', stopScanning);
        window.addEventListener('touchend', stopScanning);

        nextBtn.addEventListener('click', () => {
            switchScene('scene-room-stars');
        });
    }

    /* -------------------------------------------------------------
       ROOM VI · STARGAZING CONSTELLATION
       Tap stars 1 -> 5 to draw a glowing heart & connect D ❤️ S!
       ------------------------------------------------------------- */
    let constellationInitialized = false;
    function initConstellationScene() {
        if (constellationInitialized) return;
        constellationInitialized = true;

        const canvas = $('#stars-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = 340;
        const H = canvas.height = 340;
        const hint = $('#constellation-hint');
        const nextBtn = $('#btn-next-room-stars');

        const stars = [
            { x: 95,  y: 115, label: '1', name: 'Disha (D)' },
            { x: 170, y: 70,  label: '2', name: 'Destiny' },
            { x: 245, y: 115, label: '3', name: 'Sibu (S)' },
            { x: 170, y: 260, label: '4', name: 'Forever' },
            { x: 170, y: 155, label: '5', name: 'Love Core' }
        ];

        let nextExpectedStar = 0;
        let connectedLines = [];
        let completed = false;

        // Background twinkling stars
        const bgStars = [];
        for (let i = 0; i < 60; i++) {
            bgStars.push({
                x: rand(10, W - 10),
                y: rand(10, H - 10),
                size: rand(0.8, 2.2),
                alpha: rand(0.2, 0.9),
                speed: rand(0.01, 0.03)
            });
        }

        function drawScene() {
            ctx.clearRect(0, 0, W, H);

            // Draw twinkling micro-stars
            bgStars.forEach(s => {
                s.alpha += s.speed;
                if (s.alpha > 0.95 || s.alpha < 0.2) s.speed = -s.speed;
                ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connected glowing stardust lines
            connectedLines.forEach(line => {
                ctx.beginPath();
                ctx.moveTo(line.from.x, line.from.y);
                ctx.lineTo(line.to.x, line.to.y);
                ctx.lineWidth = 3;
                ctx.strokeStyle = '#ff477e';
                ctx.shadowColor = '#ff477e';
                ctx.shadowBlur = 14;
                ctx.stroke();

                ctx.lineWidth = 1.2;
                ctx.strokeStyle = '#fff';
                ctx.stroke();
            });

            // Draw interactive constellation stars
            stars.forEach((s, idx) => {
                const isActivated = idx < nextExpectedStar;
                const isNext = idx === nextExpectedStar && !completed;

                // Glowing outer halo
                ctx.beginPath();
                ctx.arc(s.x, s.y, isNext ? 14 : (isActivated ? 10 : 7), 0, Math.PI * 2);
                ctx.fillStyle = isActivated ? 'rgba(255, 71, 126, 0.4)' : (isNext ? 'rgba(255, 209, 102, 0.5)' : 'rgba(255, 255, 255, 0.15)');
                ctx.shadowColor = isActivated ? '#ff477e' : '#ffd166';
                ctx.shadowBlur = isNext ? 18 : 8;
                ctx.fill();

                // Core star
                ctx.beginPath();
                ctx.arc(s.x, s.y, isActivated ? 5 : 4, 0, Math.PI * 2);
                ctx.fillStyle = isActivated ? '#ff477e' : (isNext ? '#ffd166' : '#ffffff');
                ctx.fill();

                // Star label
                ctx.font = 'bold 11px Outfit';
                ctx.textAlign = 'center';
                ctx.fillStyle = isActivated ? '#ffb3c6' : (isNext ? '#ffeaa7' : '#aaaaaa');
                ctx.shadowBlur = 0;
                ctx.fillText(s.label, s.x, s.y - 12);
            });

            if (!completed || connectedLines.length > 0) {
                requestAnimationFrame(drawScene);
            }
        }
        drawScene();

        canvas.addEventListener('click', (e) => {
            if (completed) return;
            const rect = canvas.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) * (W / rect.width);
            const clickY = (e.clientY - rect.top) * (H / rect.height);

            const target = stars[nextExpectedStar];
            const dist = Math.hypot(clickX - target.x, clickY - target.y);

            if (dist < 30) {
                soundPop();
                if (nextExpectedStar > 0) {
                    connectedLines.push({
                        from: stars[nextExpectedStar - 1],
                        to: target
                    });
                }
                nextExpectedStar++;

                if (nextExpectedStar < stars.length) {
                    hint.textContent = `Great! Now tap star ${stars[nextExpectedStar].label}... ✨`;
                } else {
                    // Connect back to star 0 to close constellation!
                    connectedLines.push({
                        from: stars[stars.length - 1],
                        to: stars[0]
                    });
                    completed = true;
                    soundHeartHit();
                    triggerConfettiBurst();
                    hint.innerHTML = '✨ <b>Constellation Unlocked:</b> Sibu ❤️ Disha — Forever written in the stars! 🌌';
                    nextBtn.classList.add('gold-btn');
                }
            }
        });

        nextBtn.addEventListener('click', () => {
            switchScene('scene-room-quiz');
        });
    }

    /* -------------------------------------------------------------
       ROOM V (CUTE TASK 3) · "BOYFRIEND QUALITY CHECK" QUIZ
       ------------------------------------------------------------- */
    function initBoyfriendQuiz() {
        const questions = [
            {
                q: "When Disha gets hangry, what is Sibu's survival duty?",
                opts: [
                    { t: "Tell her to 'calm down' 💀", r: "WRONG! High risk of immediate demise! 🚑", correct: false },
                    { t: "Bring her favorite snacks silently 🍫", r: "CORRECT! Safe, smart, and Disha is happy! 🥰", correct: true },
                    { t: "Pretend to be asleep 😴", r: "Cowardly move! Disha will wake you up! 😂", correct: false }
                ]
            },
            {
                q: "Who actually won every single argument in 2026?",
                opts: [
                    { t: "Disha 👑", r: "OBVIOUSLY! The Queen never loses! 💅", correct: true },
                    { t: "Sibu", r: "Error 404: Sibu winning not found in universe! 🤣", correct: false },
                    { t: "It was a tie", r: "Keep dreaming! Disha took 1st place! 🏆", correct: false }
                ]
            },
            {
                q: "How much does Sibu love Disha?",
                opts: [
                    { t: "More than words, planets, & stars combined 🌌❤️", r: "100% Certified Truth! Always & Forever! 💖", correct: true },
                    { t: "A normal amount", r: "Blasphemy! It is infinite and unconditional! 😤", correct: false },
                    { t: "Enough to buy her 100 dresses 👗", r: "Also extremely true! Card ready! 💳", correct: true }
                ]
            }
        ];

        let qIndex = 0;
        const qTitle = $('#quiz-q-title');
        const qStep = $('#quiz-step');
        const optsList = $('#quiz-options-list');
        const feedback = $('#quiz-feedback-box');

        function loadQuestion(idx) {
            const cur = questions[idx];
            qStep.textContent = `QUESTION ${idx + 1} OF ${questions.length}`;
            qTitle.textContent = cur.q;
            feedback.classList.add('hidden');
            optsList.innerHTML = '';

            cur.opts.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quiz-opt-btn';
                btn.textContent = opt.t;

                btn.addEventListener('click', () => {
                    soundPop();
                    feedback.textContent = opt.r;
                    feedback.classList.remove('hidden');

                    if (opt.correct) {
                        btn.classList.add('correct');
                        soundHeartHit();
                        setTimeout(() => {
                            if (qIndex < questions.length - 1) {
                                qIndex++;
                                loadQuestion(qIndex);
                            } else {
                                feedback.textContent = '🎉 Sibu officially PASSED with 100/100! Certified best boyfriend! 👑';
                                triggerConfettiBurst();
                            }
                        }, 1200);
                    } else {
                        btn.classList.add('funny-wrong');
                    }
                });

                optsList.appendChild(btn);
            });
        }

        loadQuestion(0);

        $('#btn-next-room-quiz').addEventListener('click', () => {
            switchScene('scene-room-voice');
        });
    }

    /* -------------------------------------------------------------
       ROOM VI · ROOM 3: LETTER & SIBU'S VOICE NOTE
       Exact Open Letter matching Instagram Video & crystal clear audio!
       ------------------------------------------------------------- */
    function initVoiceNoteScene() {
        const pill = $('#exact-voice-pill');
        const playBtn = $('#btn-ev-play');
        const timeEl = $('#ev-time');

        if (voiceAudio) {
            voiceAudio.volume = 1.0;

            playBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                unlockGlobalAudio();

                if (voiceAudio.paused) {
                    if (bgmAudio) bgmAudio.pause();

                    voiceAudio.play().then(() => {
                        S.voicePlaying = true;
                        playBtn.textContent = '⏸';
                        if (pill) pill.classList.add('playing');
                    }).catch(() => {
                        playBtn.textContent = '⏸';
                        if (pill) pill.classList.add('playing');
                    });
                } else {
                    voiceAudio.pause();
                    S.voicePlaying = false;
                    playBtn.textContent = '▶';
                    if (pill) pill.classList.remove('playing');

                    if (bgmAudio && S.bgmPlaying) bgmAudio.play().catch(() => {});
                }
            });

            voiceAudio.addEventListener('timeupdate', () => {
                const cur = voiceAudio.currentTime || 0;
                const dur = voiceAudio.duration || 38.8;
                const curM = Math.floor(cur / 60);
                const curS = Math.floor(cur % 60).toString().padStart(2, '0');
                if (timeEl) timeEl.textContent = `${curM}:${curS}`;
            });

            voiceAudio.addEventListener('ended', () => {
                S.voicePlaying = false;
                playBtn.textContent = '▶';
                if (pill) pill.classList.remove('playing');
                if (timeEl) timeEl.textContent = '0:38';

                if (bgmAudio && S.bgmPlaying) bgmAudio.play().catch(() => {});
            });
        }

        $('#btn-next-room-3').addEventListener('click', () => {
            if (voiceAudio && !voiceAudio.paused) {
                voiceAudio.pause();
                if (bgmAudio && S.bgmPlaying) bgmAudio.play().catch(() => {});
            }
            switchScene('scene-room-promises');
        });
    }

    /* -------------------------------------------------------------
       ROOM VII · ROOM 4: PROMISES CHECKLIST & RUBBER STAMP
       ------------------------------------------------------------- */
    function initPromisesScene() {
        const stamper = $('#rubber-stamper');
        const stampMark = $('#promises-seal-stamp');
        const officialBtn = $('#btn-make-official');
        const toBdayBtn = $('#btn-to-birthday');

        officialBtn.addEventListener('click', () => {
            soundStamp();
            stamper.classList.add('stamping');

            setTimeout(() => {
                stampMark.classList.remove('hidden');
                officialBtn.style.opacity = '0.5';
                officialBtn.textContent = 'Official & Sealed Forever ❤️';
                officialBtn.disabled = true;
                toBdayBtn.classList.remove('hidden');
                triggerConfettiBurst();
            }, 300);
        });

        toBdayBtn.addEventListener('click', () => {
            switchScene('scene-birthday');
        });
    }

    /* -------------------------------------------------------------
       SCENE 10 · GRAND BIRTHDAY CELEBRATION (CAKE & KNIFE CUTTING)
       ------------------------------------------------------------- */
    function initBirthdayScene() {
        const knife = $('#cake-knife');
        const cakeStage = $('#cake-ceremony-stage');
        const cutSlice = $('#cake-cut-slice');
        const hint = $('#cake-instruction-hint');
        const preCutHeader = $('#cake-pre-cut-header');
        const wishingReveal = $('#cake-wishing-reveal');
        const slideshowBtn = $('#btn-play-slideshow');
        let cakeCut = false;

        function cutTheCake() {
            if (cakeCut) return;
            cakeCut = true;

            if (knife) knife.classList.add('slicing');
            if (cakeStage) cakeStage.classList.add('sliced');
            soundStamp();

            setTimeout(() => {
                if (preCutHeader) preCutHeader.classList.add('hidden');
                if (wishingReveal) wishingReveal.classList.remove('hidden');
                if (cutSlice) cutSlice.classList.remove('hidden');
                soundHeartHit();
                triggerConfettiBurst();
                spawnMassiveRealisticRosesExplosion();

                if (hint) {
                    hint.innerHTML = '🎉 <b>YAY! The cake is officially cut!</b><br><span style="color:var(--primary-rose)">Happy 18th Birthday, Queen Disha! 👑🍰</span>';
                }
                if (knife) knife.style.display = 'none';

                if (slideshowBtn) {
                    slideshowBtn.classList.remove('hidden');
                    slideshowBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 600);
        }

        if (knife) knife.addEventListener('click', cutTheCake);
        if (cakeStage) cakeStage.addEventListener('click', cutTheCake);

        if (slideshowBtn) {
            slideshowBtn.addEventListener('click', () => {
                openCapCutSlideshow();
            });
        }

        $('#btn-restart-museum').addEventListener('click', () => {
            location.reload();
        });
    }

    /* -------------------------------------------------------------
       CAPCUT-STYLE PHOTO SLIDESHOW THEATER ENGINE
       ------------------------------------------------------------- */
    const ssModal = $('#slideshow-modal');
    const ssImg = $('#slideshow-img');
    const ssCaption = $('#slideshow-caption');
    const ssCounter = $('#ss-counter');
    const ssProgressFill = $('#ss-progress-fill');
    const ssToggleBtn = $('#btn-ss-toggle');
    const splitContainer = $('#split-tear-container');
    const splitLeft = $('#split-left');
    const splitRight = $('#split-right');
    const thunderFlash = $('#thunder-flash');
    const lightningCanvas = $('#lightning-canvas');

    const kenBurnsClasses = ['kb-pan-down', 'kb-pan-up', 'kb-zoom-in', 'kb-zoom-out'];

    function openCapCutSlideshow() {
        ssModal.classList.remove('hidden');
        S.ssPlaying = true;
        ssToggleBtn.textContent = '⏸ Pause';
        showPhotoWithCapCutTransition(S.ssIndex, 'first');
    }

    function closeCapCutSlideshow() {
        ssModal.classList.add('hidden');
        S.ssPlaying = false;
        clearTimeout(S.ssTimer);
        cancelAnimationFrame(S.ssProgressTimer);
    }

    $('#btn-close-slideshow').addEventListener('click', closeCapCutSlideshow);

    function triggerStardustDissolve() {
        const stage = $('#ss-stage');
        if (!stage) return;
        for (let i = 0; i < 35; i++) {
            const p = document.createElement('div');
            p.textContent = ['✨', '⭐', '💛', '🌟'][Math.floor(Math.random() * 4)];
            p.style.cssText = `
                position: absolute;
                left: ${rand(15, 85)}%;
                top: ${rand(15, 85)}%;
                font-size: ${rand(14, 28)}px;
                pointer-events: none;
                z-index: 96;
                transition: transform 0.75s ease-out, opacity 0.75s ease-out;
            `;
            stage.appendChild(p);
            requestAnimationFrame(() => {
                p.style.transform = `translate(${rand(-90, 90)}px, ${rand(-90, 90)}px) scale(${rand(1.2, 2.2)})`;
                p.style.opacity = '0';
            });
            setTimeout(() => p.remove(), 800);
        }
    }

    function showPhotoWithCapCutTransition(newIndex, transitionType) {
        if (!S.photos || !S.photos.length) return;
        S.ssIndex = (newIndex + S.photos.length) % S.photos.length;

        const currentPhotoSrc = ssImg.src;
        const nextPhotoSrc = S.photos[S.ssIndex];

        ssCounter.textContent = `${S.ssIndex + 1} / ${S.photos.length}`;
        ssCaption.textContent = `Memory ${S.ssIndex + 1} of ${S.photos.length}`;

        kenBurnsClasses.forEach(c => ssImg.classList.remove(c));
        const chosenKb = kenBurnsClasses[S.ssIndex % kenBurnsClasses.length];

        if (transitionType === 'first') {
            ssImg.src = nextPhotoSrc;
            ssImg.classList.add(chosenKb);
            startProgressTrack();
            return;
        }

        const transType = S.ssIndex % 32;

        // Clean transition helper (removes prior animation classes)
        const allTrClasses = [
            'burst-from-inside', 'electric-burst', 'whip-zoom-in', 'page-curl-turn', 'stardust-dissolve',
            'tr-circle-expand', 'tr-diamond-wipe', 'tr-lens-blur-snap', 'tr-diagonal-slice', 'tr-vertigo-dolly',
            'tr-spin-whirlwind', 'tr-vintage-sepia', 'tr-curtain-part', 'tr-aurora-glow', 'tr-float-drift',
            'tr-shimmer-sparkle', 'tr-cinematic-bar', 'tr-elastic-bounce', 'tr-vertical-roll', 'tr-tilt-shift',
            'tr-zoom-out-pop', 'tr-slide-corner', 'tr-mirror-split', 'tr-neon-pulse', 'tr-kaleidoscope-hex',
            'tr-shutter-blinds', 'tr-flash-whiteout'
        ];
        allTrClasses.forEach(c => ssImg.classList.remove(c));

        function applyPureClass(cls, dur = 750) {
            ssImg.src = nextPhotoSrc;
            ssImg.classList.add(cls);
            ssImg.classList.add(chosenKb);
            setTimeout(() => ssImg.classList.remove(cls), dur);
        }

        switch (transType) {
            case 0: { // 1. 3D Split / Rip / Slash Tear
                splitLeft.style.backgroundImage = `url(${currentPhotoSrc})`;
                splitRight.style.backgroundImage = `url(${currentPhotoSrc})`;
                splitContainer.classList.add('active');
                splitContainer.classList.remove('tearing');
                void splitContainer.offsetWidth;
                splitContainer.classList.add('tearing');
                ssImg.src = nextPhotoSrc;
                ssImg.classList.add('burst-from-inside');
                ssImg.classList.add(chosenKb);
                setTimeout(() => {
                    splitContainer.classList.remove('active');
                    splitContainer.classList.remove('tearing');
                    ssImg.classList.remove('burst-from-inside');
                }, 850);
                break;
            }

            case 1: { // 2. Electric Lightning & Thunder Flash
                drawProceduralLightning();
                thunderFlash.classList.add('flashing');
                setTimeout(() => {
                    thunderFlash.classList.remove('flashing');
                    applyPureClass('electric-burst', 700);
                }, 100);
                break;
            }

            case 2: { // 3. 3D Cube Flip
                const cubeContainer = $('#cube-container');
                const cubeFront = $('#cube-front');
                const cubeBack = $('#cube-back');
                if (cubeContainer && cubeFront && cubeBack) {
                    cubeFront.style.backgroundImage = `url(${currentPhotoSrc})`;
                    cubeBack.style.backgroundImage = `url(${nextPhotoSrc})`;
                    cubeBack.style.transform = 'rotateY(90deg)';
                    cubeFront.style.transform = 'rotateY(0deg)';
                    cubeContainer.classList.remove('hidden');
                    cubeContainer.classList.remove('flipping');
                    void cubeContainer.offsetWidth;
                    cubeContainer.classList.add('flipping');
                    setTimeout(() => {
                        ssImg.src = nextPhotoSrc;
                        ssImg.classList.add(chosenKb);
                        cubeContainer.classList.add('hidden');
                        cubeContainer.classList.remove('flipping');
                    }, 750);
                } else {
                    applyPureClass('burst-from-inside', 750);
                }
                break;
            }

            case 3: { // 4. Film Reel Burn & Light Leak
                const filmFlash = $('#film-burn-flash');
                if (filmFlash) filmFlash.classList.add('flashing');
                setTimeout(() => {
                    ssImg.src = nextPhotoSrc;
                    ssImg.classList.add(chosenKb);
                    setTimeout(() => {
                        if (filmFlash) filmFlash.classList.remove('flashing');
                    }, 350);
                }, 180);
                break;
            }

            case 4: applyPureClass('whip-zoom-in', 700); break; // 5. Whip Zoom
            case 5: { // 6. Heart Iris Shutter
                const heartIris = $('#heart-iris-overlay');
                if (heartIris) {
                    heartIris.classList.remove('revealing');
                    void heartIris.offsetWidth;
                    ssImg.src = nextPhotoSrc;
                    ssImg.classList.add(chosenKb);
                    heartIris.classList.add('revealing');
                    setTimeout(() => heartIris.classList.remove('revealing'), 800);
                } else {
                    applyPureClass('burst-from-inside', 750);
                }
                break;
            }

            case 6: { // 7. RGB Cyber Glitch
                const glitch = $('#glitch-overlay');
                if (glitch) glitch.classList.add('glitching');
                setTimeout(() => {
                    ssImg.src = nextPhotoSrc;
                    ssImg.classList.add(chosenKb);
                    setTimeout(() => {
                        if (glitch) glitch.classList.remove('glitching');
                    }, 220);
                }, 180);
                break;
            }

            case 7: { // 8. Prism Kaleidoscope
                const prism = $('#prism-overlay');
                if (prism) prism.classList.add('prismatic');
                setTimeout(() => {
                    ssImg.src = nextPhotoSrc;
                    ssImg.classList.add(chosenKb);
                    setTimeout(() => {
                        if (prism) prism.classList.remove('prismatic');
                    }, 400);
                }, 220);
                break;
            }

            case 8: applyPureClass('page-curl-turn', 750); break; // 9. Page Curl
            case 9: { // 10. Golden Stardust Dissolve
                triggerStardustDissolve();
                applyPureClass('stardust-dissolve', 800);
                break;
            }

            case 10: applyPureClass('tr-circle-expand', 750); break;   // 11. Circle Expand
            case 11: applyPureClass('tr-diamond-wipe', 750); break;    // 12. Diamond Wipe
            case 12: applyPureClass('tr-lens-blur-snap', 700); break;  // 13. Lens Defocus Snap
            case 13: applyPureClass('tr-diagonal-slice', 750); break;  // 14. Diagonal Slice
            case 14: applyPureClass('tr-vertigo-dolly', 800); break;   // 15. Vertigo Dolly
            case 15: applyPureClass('tr-spin-whirlwind', 750); break;  // 16. Whirlwind Spin
            case 16: applyPureClass('tr-vintage-sepia', 750); break;   // 17. Vintage Sepia Flush
            case 17: applyPureClass('tr-curtain-part', 750); break;    // 18. Soft Curtain Part
            case 18: applyPureClass('tr-aurora-glow', 750); break;     // 19. Aurora Glow Wave
            case 19: applyPureClass('tr-float-drift', 800); break;     // 20. Float Breeze
            case 20: applyPureClass('tr-shimmer-sparkle', 750); break; // 21. Shimmer Sparkle
            case 21: applyPureClass('tr-cinematic-bar', 750); break;   // 22. Cinematic Anamorphic
            case 22: applyPureClass('tr-elastic-bounce', 800); break;  // 23. Elastic Slide Bounce
            case 23: applyPureClass('tr-vertical-roll', 750); break;   // 24. Film Reel Roll
            case 24: applyPureClass('tr-tilt-shift', 750); break;     // 25. Miniature Tilt Shift
            case 25: applyPureClass('tr-zoom-out-pop', 750); break;    // 26. Zoom Out Pop
            case 26: applyPureClass('tr-slide-corner', 750); break;    // 27. Corner Slide
            case 27: applyPureClass('tr-mirror-split', 750); break;    // 28. Mirror Split
            case 28: applyPureClass('tr-neon-pulse', 750); break;      // 29. Neon Pulse
            case 29: applyPureClass('tr-kaleidoscope-hex', 750); break;// 30. Kaleidoscope Hex
            case 30: applyPureClass('tr-shutter-blinds', 750); break;  // 31. Shutter Blinds
            case 31:
            default: applyPureClass('tr-flash-whiteout', 650); break;  // 32. High-key Studio Flash
        }

        startProgressTrack();
    }

    function startProgressTrack() {
        clearTimeout(S.ssTimer);
        cancelAnimationFrame(S.ssProgressTimer);

        if (!S.ssPlaying) return;

        S.ssStartTime = performance.now();

        function updateProgress(now) {
            if (!S.ssPlaying) return;
            const elapsed = now - S.ssStartTime;
            const pct = Math.min(100, (elapsed / S.ssDuration) * 100);
            ssProgressFill.style.width = pct + '%';

            if (elapsed < S.ssDuration) {
                S.ssProgressTimer = requestAnimationFrame(updateProgress);
            } else {
                ssProgressFill.style.width = '100%';
                showPhotoWithCapCutTransition(S.ssIndex + 1, 'auto');
            }
        }
        S.ssProgressTimer = requestAnimationFrame(updateProgress);
    }

    $('#btn-ss-next').addEventListener('click', () => {
        showPhotoWithCapCutTransition(S.ssIndex + 1, 'manual');
    });
    $('#btn-ss-prev').addEventListener('click', () => {
        showPhotoWithCapCutTransition(S.ssIndex - 1, 'manual');
    });

    ssToggleBtn.addEventListener('click', () => {
        S.ssPlaying = !S.ssPlaying;
        if (S.ssPlaying) {
            ssToggleBtn.textContent = '⏸ Pause';
            startProgressTrack();
        } else {
            ssToggleBtn.textContent = '▶ Play';
            cancelAnimationFrame(S.ssProgressTimer);
        }
    });

    function drawProceduralLightning() {
        if (!lightningCanvas) return;
        const ctx = lightningCanvas.getContext('2d');
        const W = lightningCanvas.width = window.innerWidth;
        const H = lightningCanvas.height = window.innerHeight;

        ctx.clearRect(0, 0, W, H);

        function drawBolt(startX, startY, endX, endY, branches) {
            ctx.beginPath();
            ctx.moveTo(startX, startY);

            let curX = startX, curY = startY;
            const steps = 18;
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const targetX = startX + (endX - startX) * t;
                const targetY = startY + (endY - startY) * t;
                curX = targetX + rand(-28, 28);
                curY = targetY + rand(-15, 15);
                ctx.lineTo(curX, curY);

                if (branches > 0 && Math.random() < 0.3) {
                    drawBolt(curX, curY, curX + rand(-120, 120), curY + rand(80, 200), branches - 1);
                }
            }
            ctx.lineTo(endX, endY);
            ctx.lineWidth = rand(2.5, 4.5);
            ctx.strokeStyle = '#fff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 20;
            ctx.stroke();

            ctx.lineWidth = 1.2;
            ctx.strokeStyle = '#e0ffff';
            ctx.stroke();
        }

        drawBolt(W / 2 + rand(-100, 100), 0, W / 2 + rand(-150, 150), H, 2);
        drawBolt(rand(100, W - 100), 0, W / 2, H / 2, 1);

        setTimeout(() => {
            ctx.clearRect(0, 0, W, H);
        }, 220);
    }

    /* Confetti Engine */
    function triggerConfettiBurst() {
        const canvas = $('#confetti-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const W = canvas.width = window.innerWidth;
        const H = canvas.height = window.innerHeight;

        const particles = [];
        const colors = ['#ff477e', '#ffd166', '#06d6a0', '#118ab2', '#f72585', '#fff'];

        for (let i = 0; i < 180; i++) {
            particles.push({
                x: W / 2,
                y: H * 0.45,
                vx: rand(-12, 12),
                vy: rand(-16, -2),
                size: rand(6, 12),
                color: colors[Math.floor(Math.random() * colors.length)],
                rot: rand(0, 360),
                vRot: rand(-10, 10),
                alpha: 1
            });
        }

        function step() {
            ctx.clearRect(0, 0, W, H);
            let alive = false;
            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.42;
                p.rot += p.vRot;
                p.alpha -= 0.008;

                if (p.alpha > 0) {
                    alive = true;
                    ctx.save();
                    ctx.translate(p.x, p.y);
                    ctx.rotate((p.rot * Math.PI) / 180);
                    ctx.globalAlpha = p.alpha;
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.5);
                    ctx.restore();
                }
            });
            if (alive) requestAnimationFrame(step);
            else ctx.clearRect(0, 0, W, H);
        }
        requestAnimationFrame(step);
    }

    /* Background Music Pill */
    $('#bgm-pill').addEventListener('click', () => {
        if (!bgmAudio) return;
        if (bgmAudio.paused) {
            bgmAudio.play().then(() => {
                S.bgmPlaying = true;
                $('#bgm-pill').classList.remove('paused');
            }).catch(() => {});
        } else {
            bgmAudio.pause();
            S.bgmPlaying = false;
            $('#bgm-pill').classList.add('paused');
        }
    });

    /* Initializations */
    window.addEventListener('DOMContentLoaded', () => {
        initBowScene();
        initBalloonGame();
        initInterludeScene();
        initGiftRosesScene();
        initDoorScene();
        initLoveMeter();
        initDateWheel();
        initComplimentsScene();
        initConstellationScene();
        initBoyfriendQuiz();
        initVoiceNoteScene();
        initPromisesScene();
        initBirthdayScene();

        document.body.addEventListener('click', unlockGlobalAudio, { once: true });
        document.body.addEventListener('touchstart', unlockGlobalAudio, { once: true });
    });

})();
