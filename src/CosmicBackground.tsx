import React, { useEffect, useRef } from 'react';
import './CosmicBackground.scss';

interface Star {
  x: number;
  y: number;
  radius: number;
  brightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
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
  const NUM_COMETS = isLowEnd ? 1 : isMobile ? 2 : 3;

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
    const comets: Comet[] = [];
    const particles: Particle[] = [];

    // Create stars
    // Create stars with layers for depth effect
    const layers = 3;
    for (let layer = 0; layer < layers; layer++) {
      const layerStars = Math.floor(NUM_STARS / layers);
      const layerMultiplier = (layer + 1) / layers;
      
      for (let i = 0; i < layerStars; i++) {
        const starType = Math.random();
        let color, radius, brightness;
        
        if (starType < 0.7) {
          // Белые/синие звезды
          color = `rgba(200, 220, 255, ${Math.random() * 0.4 + 0.6})`;
          radius = (Math.random() * 1.5 + 0.5) * layerMultiplier;
          brightness = Math.random() * 0.8 + 0.2;
        } else if (starType < 0.9) {
          // Желтые/оранжевые звезды
          color = `rgba(255, 220, 150, ${Math.random() * 0.5 + 0.5})`;
          radius = (Math.random() * 2 + 1) * layerMultiplier;
          brightness = Math.random() * 0.9 + 0.3;
        } else {
          // Красные/пурпурные звезды
          color = `rgba(255, 180, 200, ${Math.random() * 0.3 + 0.7})`;
          radius = (Math.random() * 1 + 0.3) * layerMultiplier;
          brightness = Math.random() * 0.7 + 0.4;
        }
        
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius,
          brightness,
          twinkleSpeed: Math.random() * 0.08 + 0.02,
          twinklePhase: Math.random() * Math.PI * 2,
          color,
          layer,
          parallax: layerMultiplier * 0.5
        });
      }
    }

    // Create additional bright stars (supergiants)
    const NUM_BRIGHT_STARS = isLowEnd ? 3 : isMobile ? 5 : 10;
    for (let i = 0; i < NUM_BRIGHT_STARS; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 2,
        brightness: Math.random() * 0.3 + 0.8,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: `rgba(255, 255, 220, ${Math.random() * 0.2 + 0.8})`,
        layer: 0,
        parallax: 0.8
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
        radius: Math.random() * 2.5 + 2.5,
        tail: [],
        life: 0,
        maxLife: Math.random() * 300 + 400,
        color: `rgba(220, 240, 255, ${Math.random() * 0.2 + 0.8})`,
        brightness: Math.random() * 0.3 + 0.7
      });
    }

    function createParticles(comet: Comet): void {
      const numParticles = Math.floor(comet.radius * 3);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: comet.x + (Math.random() - 0.5) * comet.radius * 2,
          y: comet.y + (Math.random() - 0.5) * comet.radius * 2,
          vx: comet.vx * 0.2 + (Math.random() - 0.5) * 1.5,
          vy: comet.vy * 0.2 + (Math.random() - 0.5) * 1.5,
          life: 0,
          maxLife: Math.random() * 40 + 30,
          size: Math.random() * 1.5 + 0.5,
          color: `rgba(220, 240, 255, ${Math.random() * 0.5 + 0.5})`
        });
      }
    }

    function draw(): void {
      if (!ctx || !canvas) return;
      
      // Clear canvas with space gradient
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, '#0a0a1a');
      gradient.addColorStop(0.5, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw stars
      stars.forEach(star => {
        const twinkle = 0.5 + 0.5 * Math.sin(star.twinklePhase);
        const alpha = star.brightness * twinkle;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Parse color and extract base RGB values
        const colorMatch = star.color.match(/rgba?\(([^)]+)\)/);
        if (colorMatch) {
          const [r, g, b] = colorMatch[1].split(',').map(v => parseInt(v.trim()));
          
          // Draw star core
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();

          // Add glow for brighter stars
          if (star.brightness > 0.7) {
            const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
            glowGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.4})`);
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius * 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      });

      // Draw particles
      particles.forEach(particle => {
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = 1 - lifeRatio;
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        const colorMatch = particle.color.match(/rgba?\(([^)]+)\)/);
        if (colorMatch) {
          const [r, g, b] = colorMatch[1].split(',').map(v => parseInt(v.trim()));
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      });

      // Draw comets
      comets.forEach(comet => {
        const lifeRatio = comet.life / comet.maxLife;
        const alpha = 1 - lifeRatio;

        // Draw tail with gradient
        if (comet.tail.length > 1) {
          ctx.save();
          
          // Create smooth gradient tail
          for (let i = 0; i < comet.tail.length - 1; i++) {
            const segmentAlpha = alpha * (1 - i / comet.tail.length);
            const segmentWidth = comet.radius * 2 * (1 - i / comet.tail.length);
            
            if (segmentWidth < 0.5) continue;
            
            ctx.globalAlpha = segmentAlpha;
            ctx.strokeStyle = 'rgba(220, 240, 255, 0.8)';
            ctx.lineWidth = segmentWidth;
            ctx.lineCap = 'round';
            
            ctx.beginPath();
            if (i === 0) {
              ctx.moveTo(comet.tail[i].x, comet.tail[i].y);
            } else {
              ctx.lineTo(comet.tail[i].x, comet.tail[i].y);
            }
            ctx.stroke();
          }
          
          ctx.restore();
        }

        // Draw bright comet core with glow
        ctx.save();
        
        // Outer glow
        const outerGlow = ctx.createRadialGradient(
          comet.x, comet.y, 0,
          comet.x, comet.y, comet.radius * 4
        );
        outerGlow.addColorStop(0, `rgba(220, 240, 255, ${alpha * 0.9})`);
        outerGlow.addColorStop(0.4, `rgba(180, 220, 255, ${alpha * 0.4})`);
        outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 4, 0, Math.PI * 2);
        ctx.fill();

        // Inner bright core
        const innerGlow = ctx.createRadialGradient(
          comet.x, comet.y, 0,
          comet.x, comet.y, comet.radius * 1.5
        );
        innerGlow.addColorStop(0, 'rgba(255, 255, 255, 1)');
        innerGlow.addColorStop(0.7, `rgba(220, 240, 255, ${alpha})`);
        innerGlow.addColorStop(1, 'rgba(200, 220, 255, 0)');
        
        ctx.fillStyle = innerGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Bright white center
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Ultra bright center point
        ctx.fillStyle = 'rgba(255, 255, 255, 1)';
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }

    function update(): void {
      // Update stars
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
      });

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        if (particle.life >= particle.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Update comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        
        // Add current position to tail
        comet.tail.push({ x: comet.x, y: comet.y, life: 0 });
        if (comet.tail.length > 20) {
          comet.tail.shift();
        }

        // Update position
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.life++;

        // Create particles occasionally
        if (comet.life % 3 === 0) {
          createParticles(comet);
        }

        // Remove old comets
        if (comet.life >= comet.maxLife || 
            comet.x < -100 || comet.x > (canvas?.width || 0) + 100 ||
            comet.y < -100 || comet.y > (canvas?.height || 0) + 100) {
          comets.splice(i, 1);
        }
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
      className="cosmic-background"
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