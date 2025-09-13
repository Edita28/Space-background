import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  isBig?: boolean;
  // время жизни для больших звёзд
  life?: number;
  maxLife?: number;
}

interface Comet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tail: Array<{ x: number; y: number; life: number }>;
  life: number;
  maxLife: number;
  color: string;
  brightness: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // Performance settings
  const TARGET_FPS = 60;
  const FRAME_INTERVAL = 1000 / TARGET_FPS;
  
  // Adaptive settings based on device
  const isMobile = window.innerWidth <= 768;
  const isLowEnd = window.devicePixelRatio > 1 && window.innerWidth <= 480;
  
  const NUM_STARS = isLowEnd ? 100 : isMobile ? 200 : 300;
  const NUM_BIG_STARS = isLowEnd ? 5 : isMobile ? 10 : 15;
  const NUM_COMETS = isLowEnd ? 1 : isMobile ? 2 : 3;
  const MAX_BIG_STARS = NUM_BIG_STARS + 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize cosmic objects
    const stars: Star[] = [];
    const particles: Particle[] = [];
    const comets: Comet[] = [];

    // Create stars
    for (let i = 0; i < NUM_STARS; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.5,
        brightness: Math.random() * 0.5 + 0.5,
        twinkleSpeed: Math.random() * 0.05 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: `rgba(255, 255, ${Math.random() * 55 + 200}, ${Math.random() * 0.5 + 0.5})`,
        isBig: false
      });
    }
    
    // Create big stars
    for (let i = 0; i < NUM_BIG_STARS; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2.5, // Bigger radius
        brightness: Math.random() * 0.3 + 0.7, // Brighter
        twinkleSpeed: Math.random() * 0.08 + 0.02, // Faster twinkling
        twinklePhase: Math.random() * Math.PI * 2,
        color: `rgba(${Math.random() * 55 + 200}, ${Math.random() * 55 + 200}, 255, ${Math.random() * 0.3 + 0.7})`, // More blue tint
        isBig: true
      });
    }

    // Create initial comets
    for (let i = 0; i < NUM_COMETS; i++) {
      createComet();
    }

    function createComet(): void {
      if (!canvas) return;
      
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;

      switch (side) {
        case 0: // Top
          x = Math.random() * canvas.width;
          y = -50;
          vx = (Math.random() - 0.5) * 2;
          vy = Math.random() * 2 + 1;
          break;
        case 1: // Right
          x = canvas.width + 50;
          y = Math.random() * canvas.height;
          vx = -(Math.random() * 2 + 1);
          vy = (Math.random() - 0.5) * 2;
          break;
        case 2: // Bottom
          x = Math.random() * canvas.width;
          y = canvas.height + 50;
          vx = (Math.random() - 0.5) * 2;
          vy = -(Math.random() * 2 + 1);
          break;
        default: // Left
          x = -50;
          y = Math.random() * canvas.height;
          vx = Math.random() * 2 + 1;
          vy = (Math.random() - 0.5) * 2;
      }

      comets.push({
        x,
        y,
        vx,
        vy,
        radius: Math.random() * 3 + 3, // Увеличиваем размер комет
        tail: [],
        life: 0,
        maxLife: Math.random() * 300 + 400,
        // Добавляем разнообразие цветов для комет
        color: `rgba(${Math.random() > 0.7 ? 220 : Math.random() * 55 + 200}, 
                ${Math.random() > 0.5 ? 240 : Math.random() * 55 + 200}, 
                ${Math.random() > 0.3 ? 255 : Math.random() * 55 + 200}, 
                ${Math.random() * 0.2 + 0.8})`,
        brightness: Math.random() * 0.3 + 0.7
      });
    }

    function createBigStar(): void {
      if(!canvas) return;
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2.5,
        brightness: Math.random() * 0.3 + 0.7,
        twinkleSpeed: Math.random() * 0.08 + 0.02,
        twinklePhase: Math.random() * Math.PI * 2,
        color: `rgba(${Math.random() * 55 + 200}, ${Math.random() * 55 + 200}, 255, ${Math.random() * 0.3 + 0.7})`,
        isBig: true
      });
    }

    function createParticles(comet: Comet): void {
      const numParticles = Math.floor(comet.radius * 3);
      
      for (let i = 0; i < numParticles; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.5;
        
        particles.push({
          x: comet.x,
          y: comet.y,
          vx: Math.cos(angle) * speed * 0.2,
          vy: Math.sin(angle) * speed * 0.2,
          life: 0,
          maxLife: Math.random() * 30 + 40,
          size: Math.random() * 1.5 + 0.5,
          color: `rgba(220, 240, 255, ${Math.random() * 0.5 + 0.5})`
        });
      }
    }

    function draw(): void {
      if (!canvas || !ctx) return;

      // Clear canvas with gradient background
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      );
      gradient.addColorStop(0, '#0a0a2a');
      gradient.addColorStop(1, '#000010');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars with twinkling effect
      stars.forEach(star => {
        // Enhanced twinkling effect with more variation
        const twinkleAmplitude = star.isBig ? 0.5 : 0.3;
        const twinkle = Math.sin(star.twinklePhase) * twinkleAmplitude + (star.isBig ? 0.8 : 0.7);
        
        ctx.fillStyle = star.color;
        ctx.globalAlpha = star.brightness * twinkle;
        
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect for big stars
        if (star.isBig) {
          const glowRadius = star.radius * 3;
          const glow = ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, glowRadius
          );
          glow.addColorStop(0, star.color.replace(/[^,]+(?=\))/, '0.8'));
          glow.addColorStop(0.5, star.color.replace(/[^,]+(?=\))/, '0.3'));
          glow.addColorStop(1, star.color.replace(/[^,]+(?=\))/, '0'));

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, glowRadius, 0, Math.PI * 2);
          ctx.fill();

          // Draw sharp star shape (five spikes)
          const spikes = 5;
          const outerRadius = star.radius * 1.5;
          const innerRadius = star.radius * 1.1;
          ctx.save();
          ctx.translate(star.x, star.y);
          ctx.rotate(star.twinklePhase * 0.2); // subtle rotation for twinkle
          ctx.beginPath();
          for (let i = 0; i < spikes * 2; i++) {
            const angle = (Math.PI / spikes) * i;
            const r = i % 2 === 0 ? outerRadius : innerRadius;
            ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
          }
          ctx.closePath();
          ctx.globalAlpha = star.brightness * twinkle * 0.7;
          ctx.fillStyle = star.color;
          ctx.shadowColor = star.color;
          ctx.shadowBlur = star.radius * 2;
          ctx.fill();
          ctx.restore();


        }
      });

      // Draw particles
      particles.forEach(particle => {
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = 1 - lifeRatio;
        
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = alpha;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset global alpha
      ctx.globalAlpha = 1;

      // Draw comets
      comets.forEach(comet => {
        const angle = Math.atan2(comet.vy, comet.vx);
        const beamLength = 100; // Увеличиваем длину луча
        const beamWidth = 4; // Увеличиваем ширину луча
        const lifeRatio = comet.life / comet.maxLife;
        const alpha = 1 - lifeRatio;
        
        ctx.save();
        ctx.translate(comet.x, comet.y);
        ctx.rotate(angle);
        
        // Draw long light beam
        const beamGradient = ctx.createLinearGradient(0, -beamWidth/2, -beamLength, 0);
        beamGradient.addColorStop(0, comet.color.replace(/[^,]+(?=\))/, '0.9'));
        beamGradient.addColorStop(0.3, comet.color.replace(/[^,]+(?=\))/, '0.6'));
        beamGradient.addColorStop(0.7, comet.color.replace(/[^,]+(?=\))/, '0.3'));
        beamGradient.addColorStop(1, comet.color.replace(/[^,]+(?=\))/, '0'));
        
        ctx.fillStyle = beamGradient;
        ctx.fillRect(-beamLength, -beamWidth/2, beamLength, beamWidth);
        
        // Outer glow for beam
        const glowGradient = ctx.createLinearGradient(0, -beamWidth*1.5, -beamLength, 0);
        glowGradient.addColorStop(0, comet.color.replace(/[^,]+(?=\))/, '0.4'));
        glowGradient.addColorStop(0.5, comet.color.replace(/[^,]+(?=\))/, '0.2'));
        glowGradient.addColorStop(1, comet.color.replace(/[^,]+(?=\))/, '0'));
        
        ctx.fillStyle = glowGradient;
        ctx.fillRect(-beamLength, -beamWidth*1.5, beamLength, beamWidth * 3);
        
        // Bright comet core
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, comet.radius * 2);
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        coreGradient.addColorStop(0.3, comet.color.replace(/[^,]+(?=\))/, '0.9'));
        coreGradient.addColorStop(0.7, comet.color.replace(/[^,]+(?=\))/, '0.6'));
        coreGradient.addColorStop(1, comet.color.replace(/[^,]+(?=\))/, '0'));
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, comet.radius * 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }

    function update(): void {
      // Update stars
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        
        // Random occasional brightness boost for big stars
        if (star.isBig && Math.random() < 0.01) {
          star.brightness = Math.min(1, star.brightness + Math.random() * 0.2);
        } else if (star.isBig && star.brightness > 0.7) {
          // Gradually return to normal brightness
          star.brightness = Math.max(0.7, star.brightness - 0.01);
        }
      });

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        particle.vx *= 0.995;
        particle.vy *= 0.995;

        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Update comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        
        // Add current position to tail
        comet.tail.push({ x: comet.x, y: comet.y, life: 0 });
        if (comet.tail.length > 30) {
          comet.tail.shift();
        }

        // Update position
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.life++;

        // Create particles occasionally
        if (comet.life % 2 === 0) {
          createParticles(comet);
        }

        // Remove old comets
        if (comet.life >= comet.maxLife || 
            comet.x < -100 || comet.x > (canvas?.width || 0) + 100 ||
            comet.y < -100 || comet.y > (canvas?.height || 0) + 100) {
          comets.splice(i, 1);
        }
      }

      // Randomly spawn additional big stars (average 1 каждые ~2 секунды)
      if (Math.random() < 0.02 && stars.filter(s => s.isBig).length < MAX_BIG_STARS) {
        createBigStar();
      }
      
      // Spawn new comets
      if (Math.random() < 0.001 && comets.length < NUM_COMETS) {
        createComet();
      }
    }
    function animate(currentTime: number): void {
      if (currentTime - lastTimeRef.current >= FRAME_INTERVAL) {
        draw();
        update();
        lastTimeRef.current = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
};

export default CosmicBackground;