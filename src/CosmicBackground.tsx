import React, { useEffect, useRef } from 'react';
import './CosmicBackground.scss';

const CosmicBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    window.addEventListener('resize', () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    });

    interface Star {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
    }

    interface Comet {
        x: number;
        y: number;
        radius: number;
        vx: number;
        vy: number;
        len: number;
        color: string;
    }

    const stars: Star[] = [];
    const comets: Comet[] = [];
    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5,
        vx: Math.floor(Math.random() * 50) - 25,
        vy: Math.floor(Math.random() * 50) - 25,
      });
    }

    const createComet = () => {
        comets.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 200,
            vy: (Math.random() - 0.5) * 200,
            len: Math.random() * 50 + 50,
            color: `hsl(${180 + Math.random() * 60}, 100%, 75%)`
        });
    }

    setInterval(createComet, 3000);


    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, 2 * Math.PI);
        ctx.fill();
      }

      for (let i = 0; i < comets.length; i++) {
        const c = comets[i];
        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        const tailX = c.x - c.vx * (c.len / 30);
        const tailY = c.y - c.vy * (c.len / 30);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = c.color;
        ctx.lineWidth = c.radius;
        ctx.stroke();
      }
    };

    const update = () => {
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += s.vx / 60;
        s.y += s.vy / 60;

        if (s.x < 0 || s.x > width) s.vx = -s.vx;
        if (s.y < 0 || s.y > height) s.vy = -s.vy;
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += c.vx / 60;
        c.y += c.vy / 60;

        if (c.x + c.len < 0 || c.x - c.len > width || c.y + c.len < 0 || c.y - c.len > height) {
            comets.splice(i, 1);
        }
      }
    };

    const tick = () => {
      draw();
      update();
      requestAnimationFrame(tick);
    };

    tick();
  }, []);

  return <canvas ref={canvasRef} className="cosmic-background"></canvas>;
};

export default CosmicBackground;