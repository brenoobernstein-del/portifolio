class NeuralNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = [];
    this.mouse = { x: -9999, y: -9999 };
    this.animId = null;
    this.resize();
    this.init();
    this.bindEvents();
    this.animate();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  init() {
    this.nodes = [];
    const density = (this.canvas.width * this.canvas.height) / 14000;
    const count = Math.min(Math.max(Math.floor(density), 40), 120);
    for (let i = 0; i < count; i++) {
      this.nodes.push({
        x:  Math.random() * this.canvas.width,
        y:  Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r:  Math.random() * 1.8 + 0.8,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.02,
        hue: Math.random() > 0.5 ? 250 : 190,
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => { this.resize(); this.init(); });
    window.addEventListener('mousemove', e => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = -9999;
      this.mouse.y = -9999;
    });
  }

  drawConnections() {
    const maxDist = 160;
    const ctx = this.ctx;
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const a = this.nodes[i];
        const b = this.nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist) continue;
        const alpha = (1 - dist / maxDist) * 0.35;
        const gradient = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        gradient.addColorStop(0, `hsla(${a.hue}, 70%, 70%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${b.hue}, 70%, 70%, ${alpha})`);
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 0.7;
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  drawNodes() {
    const ctx = this.ctx;
    this.nodes.forEach(n => {
      n.pulse += n.pulseSpeed;
      const scale = 1 + Math.sin(n.pulse) * 0.3;
      const r = n.r * scale;
      const alpha = 0.5 + Math.sin(n.pulse) * 0.2;

      const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r * 3);
      grd.addColorStop(0, `hsla(${n.hue}, 80%, 75%, ${alpha})`);
      grd.addColorStop(1, `hsla(${n.hue}, 80%, 75%, 0)`);

      ctx.beginPath();
      ctx.fillStyle = grd;
      ctx.arc(n.x, n.y, r * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = `hsla(${n.hue}, 90%, 85%, ${alpha + 0.2})`;
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  drawMouseConnections() {
    const ctx = this.ctx;
    const maxDist = 180;
    this.nodes.forEach(n => {
      const dx = n.x - this.mouse.x;
      const dy = n.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > maxDist) return;
      const alpha = (1 - dist / maxDist) * 0.5;
      ctx.beginPath();
      ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
      ctx.lineWidth = 0.9;
      ctx.moveTo(n.x, n.y);
      ctx.lineTo(this.mouse.x, this.mouse.y);
      ctx.stroke();
    });
  }

  update() {
    const W = this.canvas.width;
    const H = this.canvas.height;
    this.nodes.forEach(n => {
      // Mouse repulsion
      const dx = n.x - this.mouse.x;
      const dy = n.y - this.mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100 && dist > 0) {
        const force = (100 - dist) / 100 * 0.6;
        n.vx += (dx / dist) * force;
        n.vy += (dy / dist) * force;
      }
      // Dampen velocity
      n.vx *= 0.98;
      n.vy *= 0.98;
      // Clamp speed
      const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
      if (speed > 1.2) { n.vx = (n.vx / speed) * 1.2; n.vy = (n.vy / speed) * 1.2; }
      n.x += n.vx;
      n.y += n.vy;
      // Bounce walls
      if (n.x < 0)  { n.x = 0;  n.vx *= -1; }
      if (n.x > W)  { n.x = W;  n.vx *= -1; }
      if (n.y < 0)  { n.y = 0;  n.vy *= -1; }
      if (n.y > H)  { n.y = H;  n.vy *= -1; }
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.update();
    this.drawConnections();
    this.drawMouseConnections();
    this.drawNodes();
    this.animId = requestAnimationFrame(() => this.animate());
  }
}

window.NeuralNetwork = NeuralNetwork;
