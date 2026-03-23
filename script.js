/* ================================================
   COSMIC PORTFOLIO — SCRIPT.JS
   Particle system, scroll effects, tilt, nav logic
   ================================================ */

(function () {
    'use strict';

    // ─── PARTICLE CANVAS SYSTEM ───
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let width, height, particles, mouse, animationId;
    const PARTICLE_COUNT = 400;
    const CONNECTION_DISTANCE = 120;
    const MOUSE_RADIUS = 180;

    mouse = { x: -1000, y: -1000 };

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.z = Math.random() * 3 + 1;           // depth layer (1–4)
            this.baseRadius = Math.random() * 1.8 + 0.4;
            this.radius = this.baseRadius;
            this.vx = (Math.random() - 0.5) * 0.4;
            this.vy = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.hue = Math.random() > 0.5 ? 190 : 270; // cyan or purple
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinkleOffset = Math.random() * Math.PI * 2;
        }

        update(time) {
            // Move
            this.x += this.vx;
            this.y += this.vy;

            // Twinkle
            this.opacity = 0.25 + Math.sin(time * this.twinkleSpeed + this.twinkleOffset) * 0.25;

            // Mouse attraction
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < MOUSE_RADIUS) {
                const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
                const angle = Math.atan2(dy, dx);
                this.x -= Math.cos(angle) * force * 3;
                this.y -= Math.sin(angle) * force * 3;
                this.radius = this.baseRadius + force * 2;
            } else {
                this.radius += (this.baseRadius - this.radius) * 0.1;
            }

            // Parallax depth on mouse
            const cx = width / 2;
            const cy = height / 2;
            const parallaxX = (mouse.x - cx) * 0.003 / this.z;
            const parallaxY = (mouse.y - cy) * 0.003 / this.z;
            this.x += parallaxX;
            this.y += parallaxY;

            // Wrap edges
            if (this.x < -20) this.x = width + 20;
            if (this.x > width + 20) this.x = -20;
            if (this.y < -20) this.y = height + 20;
            if (this.y > height + 20) this.y = -20;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${this.opacity})`;
            ctx.fill();

            // Glow
            if (this.radius > 1) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${this.opacity * 0.08})`;
                ctx.fill();
            }
        }
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < CONNECTION_DISTANCE) {
                    const opacity = (1 - dist / CONNECTION_DISTANCE) * 0.15;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animate(time) {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update(time);
            p.draw();
        });

        drawConnections();
        animationId = requestAnimationFrame(animate);
    }

    function initParticles() {
        resize();
        particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
        if (animationId) cancelAnimationFrame(animationId);
        animationId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        // Re-initialize only if particle count has drifted
        if (particles && particles.length !== PARTICLE_COUNT) {
            initParticles();
        }
    });

    window.addEventListener('mousemove', e => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = -1000;
        mouse.y = -1000;
    });

    initParticles();


    // ─── NAVBAR SCROLL EFFECT ───
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 60);
        lastScroll = scrollY;
    }, { passive: true });


    // ─── MOBILE NAV TOGGLE ───
    const navToggle = document.getElementById('navToggle');
    const mobileNav = document.getElementById('mobileNav');

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    });

    mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    });


    // ─── SCROLL REVEAL (Intersection Observer) ───
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ─── STAT COUNTER ANIMATION ───
    const statNumbers = document.querySelectorAll('.stat-number');
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseInt(el.getAttribute('data-target'), 10);
                let current = 0;
                const step = Math.max(1, Math.floor(target / 40));
                const interval = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(interval);
                    }
                    el.textContent = current;
                }, 30);
                statObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => statObserver.observe(el));


    // ─── PROJECT CARD 3D TILT ───
    const tiltCards = document.querySelectorAll('.project-card[data-tilt]');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -8;
            const rotateY = ((x - centerX) / centerX) * 8;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
        });
    });


    // ─── ORBITAL SKILLS GALAXY ENGINE ───
    (function initSkillsOrbit() {
        const wrapper = document.getElementById('skillsOrbitWrapper');
        const canvasEl = document.getElementById('skillsCanvas');
        const container = document.getElementById('orbitNodesContainer');
        const mobileFallback = document.getElementById('skillsMobileFallback');
        if (!wrapper || !canvasEl || !container) return;

        const ctx = canvasEl.getContext('2d');

        // ── Skill data ──
        const CATEGORIES = [
            {
                name: 'Languages', icon: '\u{1F4BB}', color: 'cyan', speed: 0.3,
                skills: [{ n: 'C', i: '\u00A9' }, { n: 'C++', i: '\u27AA' }, { n: 'Python', i: '\u{1F40D}' }, { n: 'JavaScript', i: '\u269B' }, { n: 'TypeScript', i: '\u{1F527}' }]
            },
            {
                name: 'Web Dev', icon: '\u{1F310}', color: 'purple', speed: 0.22,
                skills: [{ n: 'HTML', i: '\u{1F4C4}' }, { n: 'CSS', i: '\u{1F3A8}' }, { n: 'Tailwind', i: '\u{1F4A8}' }, { n: 'React.js', i: '\u269B' }, { n: 'Node.js', i: '\u{1F7E2}' }, { n: 'Express.js', i: '\u{1F680}' }]
            },
            {
                name: 'Databases', icon: '\u{1F5C3}', color: 'pink', speed: 0.18,
                skills: [{ n: 'MySQL', i: '\u{1F418}' }, { n: 'SQLite3', i: '\u{1F4E6}' }]
            },
            {
                name: 'Tools', icon: '\u{1F6E0}', color: 'blue', speed: 0.26,
                skills: [{ n: 'Git', i: '\u{1F50C}' }, { n: 'Chart.js', i: '\u{1F4C8}' }, { n: 'Recharts', i: '\u{1F4CA}' }, { n: 'Web Speech API', i: '\u{1F3A4}' }]
            },
            {
                name: 'Core CS', icon: '\u{1F9E0}', color: 'cyan', speed: 0.15,
                skills: [{ n: 'DSA', i: '\u{1F522}' }, { n: 'OOPs', i: '\u{1F6E1}' }, { n: 'DBMS', i: '\u{1F5C3}' }, { n: 'FLAT/TOC', i: '\u{1F52C}' }, { n: 'OS', i: '\u{1F5A5}' }]
            },
            {
                name: 'Vision', icon: '\u{1F441}', color: 'purple', speed: 0.2,
                skills: [{ n: 'OpenCV', i: '\u{1F4F8}' }, { n: 'MediaPipe', i: '\u{1F30D}' }]
            },
            {
                name: 'CP', icon: '\u{1F3C6}', color: 'pink', speed: 0.28,
                skills: [{ n: 'Codeforces', i: '\u2694', extra: 'polygon' },{ n: 'C++', i: '\u27AA' }]
            },
        ];

        // Related technology connections (indices into flat skills list for visual lines)
        const CONNECTIONS = [
            // React.js ↔ Node.js ↔ Express.js
            { from: 1, fromSkill: 3, to: 1, toSkill: 4 },
            { from: 1, fromSkill: 4, to: 1, toSkill: 5 },
            // JavaScript ↔ React.js
            { from: 0, fromSkill: 3, to: 1, toSkill: 3 },
            // Python ↔ OpenCV
            { from: 0, fromSkill: 2, to: 5, toSkill: 0 },
        ];

        const COLOR_MAP = {
            cyan: { r: 0, g: 240, b: 255 },
            purple: { r: 180, g: 74, b: 255 },
            pink: { r: 255, g: 0, b: 170 },
            blue: { r: 74, g: 122, b: 255 },
        };

        let W, H, cx, cy;
        let orbMouse = { x: 0, y: 0 };
        let activeNode = null;
        let nodeElements = [];
        let subSkillElements = [];
        let orbitAnimId = null;
        let globalTime = 0;

        // ── Sizing ──
        function sizeCanvas() {
            const rect = wrapper.getBoundingClientRect();
            W = rect.width;
            H = rect.height;
            canvasEl.width = W * devicePixelRatio;
            canvasEl.height = H * devicePixelRatio;
            canvasEl.style.width = W + 'px';
            canvasEl.style.height = H + 'px';
            ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
            cx = W / 2;
            cy = H / 2;
        }

        // ── Build DOM nodes ──
        function buildNodes() {
            // Clear previous
            nodeElements.forEach(n => n.el.remove());
            subSkillElements.forEach(s => s.el.remove());
            nodeElements = [];
            subSkillElements = [];

            const baseRadius = Math.min(W, H) * 0.34;

            CATEGORIES.forEach((cat, i) => {
                const angle = (Math.PI * 2 / CATEGORIES.length) * i - Math.PI / 2;
                const orbitR = baseRadius + (i % 2 === 0 ? 0 : baseRadius * 0.15);

                // Create node element
                const el = document.createElement('div');
                el.className = 'orbit-node';
                el.setAttribute('data-color', cat.color);
                el.innerHTML = `<div class="orbit-node-inner">
                    <span class="orbit-node-icon">${cat.icon}</span>
                    <span class="orbit-node-label">${cat.name}</span>
                </div>`;
                container.appendChild(el);

                const nodeObj = {
                    el,
                    cat,
                    index: i,
                    angle,
                    orbitR,
                    speed: cat.speed * 0.008,
                    x: 0, y: 0,
                    expanded: false,
                    subSkills: [],
                };

                // Create sub-skill elements
                cat.skills.forEach((sk, si) => {
                    const sub = document.createElement('div');
                    sub.className = 'sub-skill';
                    let label = `<span class="sub-skill-icon">${sk.i}</span> ${sk.n}`;
                    if (sk.extra) label += ` <span style="color:var(--neon-pink);font-size:0.6rem;opacity:0.8;">${sk.extra}</span>`;
                    sub.innerHTML = label;
                    container.appendChild(sub);
                    const subObj = { el: sub, parentIndex: i, skillIndex: si, x: 0, y: 0 };
                    nodeObj.subSkills.push(subObj);
                    subSkillElements.push(subObj);
                });

                // Click handler
                el.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (activeNode === nodeObj) {
                        collapseNode(nodeObj);
                        activeNode = null;
                    } else {
                        if (activeNode) collapseNode(activeNode);
                        expandNode(nodeObj);
                        activeNode = nodeObj;
                    }
                });

                // Hover
                el.addEventListener('mouseenter', () => {
                    if (!nodeObj.expanded) expandNode(nodeObj);
                });
                el.addEventListener('mouseleave', () => {
                    if (activeNode !== nodeObj) collapseNode(nodeObj);
                });

                nodeElements.push(nodeObj);
            });

            // Click outside to collapse
            wrapper.addEventListener('click', () => {
                if (activeNode) {
                    collapseNode(activeNode);
                    activeNode = null;
                }
            });
        }

        function expandNode(node) {
            node.expanded = true;
            node.el.classList.add('expanded');
            const subR = 55;
            node.subSkills.forEach((sub, i) => {
                const a = (Math.PI * 2 / node.subSkills.length) * i - Math.PI / 2;
                const sx = Math.cos(a) * subR;
                const sy = Math.sin(a) * subR;
                sub._offsetX = sx;
                sub._offsetY = sy;
                setTimeout(() => sub.el.classList.add('visible'), i * 50);
            });
        }

        function collapseNode(node) {
            node.expanded = false;
            node.el.classList.remove('expanded');
            node.subSkills.forEach(sub => {
                sub.el.classList.remove('visible');
            });
        }

        // ── Mouse tracking ──
        wrapper.addEventListener('mousemove', (e) => {
            const rect = wrapper.getBoundingClientRect();
            orbMouse.x = e.clientX - rect.left;
            orbMouse.y = e.clientY - rect.top;
        });

        wrapper.addEventListener('mouseleave', () => {
            orbMouse.x = cx;
            orbMouse.y = cy;
        });

        // ── Canvas drawing helpers ──
        function drawOrbitRing(radius, color, alpha) {
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.setLineDash([6, 10]);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        function drawConnection(x1, y1, x2, y2, color, alpha) {
            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
            grad.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 1.5})`);
            grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function drawCoreGlow(time) {
            const pulse = 0.5 + Math.sin(time * 0.002) * 0.2;
            const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 120);
            grad.addColorStop(0, `rgba(0, 240, 255, ${0.08 * pulse})`);
            grad.addColorStop(0.5, `rgba(180, 74, 255, ${0.04 * pulse})`);
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.fillRect(cx - 120, cy - 120, 240, 240);
        }

        // Draw small particle trails
        let trailParticles = [];
        function spawnTrail(x, y, color) {
            if (trailParticles.length > 120) return;
            trailParticles.push({
                x, y,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                life: 1,
                decay: 0.008 + Math.random() * 0.01,
                color
            });
        }

        function updateTrails() {
            for (let i = trailParticles.length - 1; i >= 0; i--) {
                const p = trailParticles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= p.decay;
                if (p.life <= 0) { trailParticles.splice(i, 1); continue; }
                ctx.beginPath();
                ctx.arc(p.x, p.y, 1.2 * p.life, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${p.life * 0.4})`;
                ctx.fill();
            }
        }

        // ── Main animation loop ──
        function animate(time) {
            globalTime = time;
            ctx.clearRect(0, 0, W, H);

            // Core glow
            drawCoreGlow(time);

            // Mouse influence
            const mdx = (orbMouse.x - cx) / (W / 2);
            const mdy = (orbMouse.y - cy) / (H / 2);
            const mouseInfluence = 0.015;

            // Update & draw nodes
            nodeElements.forEach((node) => {
                // Orbit motion
                node.angle += node.speed + mdx * mouseInfluence * node.speed;

                // Small vertical float
                const floatY = Math.sin(time * 0.001 + node.index * 1.2) * 4;

                node.x = cx + Math.cos(node.angle) * node.orbitR;
                node.y = cy + Math.sin(node.angle) * node.orbitR + floatY;

                // Draw orbit ring
                const c = COLOR_MAP[node.cat.color];
                drawOrbitRing(node.orbitR, c, 0.2 + (node.expanded ? 0.12 : 0));

                // Draw connection line from core to node
                drawConnection(cx, cy, node.x, node.y, c, 0.15);

                // Position DOM node
                node.el.style.transform = `translate(${node.x - 36}px, ${node.y - 36}px)`;

                // Spawn trail
                if (Math.random() < 0.15) spawnTrail(node.x, node.y, c);

                // Position sub-skills
                if (node.expanded || node.el.classList.contains('expanded')) {
                    node.subSkills.forEach((sub) => {
                        const sx = node.x + (sub._offsetX || 0);
                        const sy = node.y + (sub._offsetY || 0);
                        sub.x = sx;
                        sub.y = sy;
                        sub.el.style.left = sx + 'px';
                        sub.el.style.top = sy + 'px';
                        sub.el.style.transform = 'translate(-50%, -50%)';

                        // Draw tiny line from node to sub-skill
                        if (sub.el.classList.contains('visible')) {
                            drawConnection(node.x, node.y, sx, sy, c, 0.35);
                        }
                    });
                }
            });

            // Draw technology connection lines
            CONNECTIONS.forEach(conn => {
                const fromNode = nodeElements[conn.from];
                const toNode = nodeElements[conn.to];
                if (!fromNode || !toNode) return;
                const alpha = 0.15 + Math.sin(time * 0.001) * 0.05;
                drawConnection(fromNode.x, fromNode.y, toNode.x, toNode.y, COLOR_MAP.cyan, alpha);
            });

            // Update particle trails
            updateTrails();

            orbitAnimId = requestAnimationFrame(animate);
        }

        // ── Mobile fallback builder ──
        function buildMobileFallback() {
            if (!mobileFallback) return;
            mobileFallback.innerHTML = '';
            CATEGORIES.forEach(cat => {
                const card = document.createElement('div');
                card.className = 'mobile-skill-card';
                let badgesHTML = cat.skills.map(sk => {
                    let extra = sk.extra ? ` <span style="color:var(--neon-pink);font-size:0.68rem;">${sk.extra}</span>` : '';
                    return `<span class="mobile-badge"><span class="mobile-badge-icon">${sk.i}</span>${sk.n}${extra}</span>`;
                }).join('');

                card.innerHTML = `
                    <div class="mobile-card-header">
                        <span>${cat.icon}</span>
                        <h3>${cat.name}</h3>
                    </div>
                    <div class="mobile-card-badges">${badgesHTML}</div>
                `;
                mobileFallback.appendChild(card);
            });
        }

        // ── Init ──
        function init() {
            sizeCanvas();
            buildNodes();
            buildMobileFallback();
            orbMouse.x = cx;
            orbMouse.y = cy;
            if (orbitAnimId) cancelAnimationFrame(orbitAnimId);
            orbitAnimId = requestAnimationFrame(animate);
        }

        // ── Responsive resize ──
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                sizeCanvas();
                // Rebuild nodes to recalculate orbit radii
                nodeElements.forEach(n => n.el.remove());
                subSkillElements.forEach(s => s.el.remove());
                nodeElements = [];
                subSkillElements = [];
                activeNode = null;
                buildNodes();
            }, 200);
        });

        // Only init once wrapper becomes visible
        const orbObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    init();
                    orbObserver.unobserve(wrapper);
                }
            });
        }, { threshold: 0.1 });

        orbObserver.observe(wrapper);
    })();


    // ─── CONTACT FORM ───
    const form = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Simulate sending
        const btn = form.querySelector('.btn-submit');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>Sending...</span>';
        btn.disabled = true;
        btn.style.opacity = '0.6';

        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = '1';
            formSuccess.classList.add('show');
            form.reset();

            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 5000);
        }, 1500);
    });


    // ─── SMOOTH SCROLL FOR ANCHOR LINKS ───
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

})();
