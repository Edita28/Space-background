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

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    // Обработчик движения мыши
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Обработчик touch-событий для мобильных устройств
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    interface Star {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      brightness: number;
      twinkle: number;
      twinkleSpeed: number;
    }

    interface Comet {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      len: number;
      color: string;
      life: number;
      maxLife: number;
      gravity: number;
      trail: { x: number; y: number }[];
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

    interface MovingNebula {
      x: number;
      y: number;
      radius: number;
      color: string;
      opacity: number;
      vx: number;
      vy: number;
      pulse: number;
      pulseSpeed: number;
    }

    interface Planet {
      x: number;
      y: number;
      radius: number;
      color: string;
      orbitRadius: number;
      orbitSpeed: number;
      angle: number;
      centerX: number;
      centerY: number;
      rotation: number;
      rotationSpeed: number;
    }

    interface Asteroid {
      x: number;
      y: number;
      radius: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      color: string;
      wobble: number;
      wobbleSpeed: number;
    }



    const stars: Star[] = [];
    const comets: Comet[] = [];
    const particles: Particle[] = [];
    const movingNebulae: MovingNebula[] = [];
    const planets: Planet[] = [];
    const asteroids: Asteroid[] = [];
    
    // Адаптивное количество элементов в зависимости от размера экрана
    const isMobile = window.innerWidth <= 768;
    const isSmallScreen = window.innerWidth <= 480;
    const numStars = isSmallScreen ? 150 : isMobile ? 200 : 300;
    const numNebulae = isSmallScreen ? 2 : isMobile ? 3 : 4;
    const numPlanets = isSmallScreen ? 1 : isMobile ? 2 : 3;
    const numAsteroids = isSmallScreen ? 8 : isMobile ? 12 : 18;

    // Переменные для интерактивности
    let mouseX = width / 2;
    let mouseY = height / 2;

    // Переменные для оптимизации производительности
    let lastTime = 0;
    const targetFPS = isSmallScreen ? 30 : isMobile ? 45 : 60; // Адаптивный FPS
    const frameInterval = 1000 / targetFPS;
    
    // Переменные для пульсирующих эффектов
    let globalPulse = 0;
    let backgroundPulse = 0;

    // Создание звезд с разными размерами и яркостью
    for (let i = 0; i < numStars; i++) {
      const starType = Math.random();
      let radius, brightness, twinkleSpeed;
      
      if (starType < 0.1) {
        // Яркие звезды (10%)
        radius = Math.random() * 3 + 2;
        brightness = Math.random() * 0.3 + 0.7;
        twinkleSpeed = 0.05;
      } else if (starType < 0.3) {
        // Средние звезды (20%)
        radius = Math.random() * 0.4 + 0.5;
        twinkleSpeed = 0.03;
      } else {
        // Мелкие звезды (70%)
        radius = Math.random() * 0.8 + 0.3;
        brightness = Math.random() * 0.5 + 0.3;
        twinkleSpeed = 0.02;
      }
      
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        brightness: brightness ?? 1,
        twinkle: Math.random() * Math.PI * 2,
        twinkleSpeed: twinkleSpeed ?? 0.02,
      });
    }

    const createComet = () => {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      
      // Создаем более динамичные траектории
      const speed = Math.random() * 4 + 3; // Увеличиваем скорость
      const angle = Math.random() * Math.PI * 0.5; // Угол для изогнутых траекторий
      
      switch (side) {
        case 0: // сверху
          x = Math.random() * width;
          y = -150;
          vx = Math.sin(angle) * speed * (Math.random() - 0.5) * 2;
          vy = Math.cos(angle) * speed + 1;
          break;
        case 1: // справа
          x = width + 150;
          y = Math.random() * height;
          vx = -(Math.cos(angle) * speed + 1);
          vy = Math.sin(angle) * speed * (Math.random() - 0.5) * 2;
          break;
        case 2: // снизу
          x = Math.random() * width;
          y = height + 150;
          vx = Math.sin(angle) * speed * (Math.random() - 0.5) * 2;
          vy = -(Math.cos(angle) * speed + 1);
          break;
        default: // слева
          x = -150;
          y = Math.random() * height;
          vx = Math.cos(angle) * speed + 1;
          vy = Math.sin(angle) * speed * (Math.random() - 0.5) * 2;
      }

      // Разные типы комет
      const cometType = Math.random();
      let radius, len, color, maxLife;
      
      if (cometType < 0.15) {
        // Огромные яркие кометы (15%)
        radius = Math.random() * 4 + 3;
        len = Math.random() * 150 + 120;
        color = `hsl(${180 + Math.random() * 30}, 100%, 90%)`;
        maxLife = Math.random() * 400 + 500;
      } else if (cometType < 0.35) {
        // Большие яркие кометы (20%)
        radius = Math.random() * 3 + 2;
        len = Math.random() * 120 + 100;
        color = `hsl(${180 + Math.random() * 40}, 100%, 85%)`;
        maxLife = Math.random() * 300 + 400;
      } else if (cometType < 0.6) {
        // Средние кометы (25%)
        radius = Math.random() * 2.5 + 1.5;
        len = Math.random() * 100 + 80;
        color = `hsl(${200 + Math.random() * 50}, 85%, 75%)`;
        maxLife = Math.random() * 250 + 300;
      } else {
        // Мелкие быстрые кометы (40%)
        radius = Math.random() * 1.5 + 0.8;
        len = Math.random() * 60 + 40;
        color = `hsl(${220 + Math.random() * 60}, 70%, 65%)`;
        maxLife = Math.random() * 150 + 200;
      }

      comets.push({
        x,
        y,
        radius,
        vx,
        vy,
        len,
        color,
        life: 0,
        maxLife,
        gravity: Math.random() * 0.02 + 0.01, // Гравитационное притяжение
        trail: [], // След кометы
      });
    };

    // Создание движущихся туманностей
    for (let i = 0; i < numNebulae; i++) {
      movingNebulae.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 200 + 150,
        color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`,
        opacity: Math.random() * 0.4 + 0.1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    // Создание планет
    for (let i = 0; i < numPlanets; i++) {
      const centerX = Math.random() * width;
      const centerY = Math.random() * height;
      const orbitRadius = Math.random() * 120 + 100;
      const planetColors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
      
      planets.push({
        x: centerX + orbitRadius,
        y: centerY,
        radius: Math.random() * 12 + 8,
        color: planetColors[Math.floor(Math.random() * planetColors.length)],
        orbitRadius,
        orbitSpeed: (Math.random() - 0.5) * 0.03,
        angle: Math.random() * Math.PI * 2,
        centerX,
        centerY,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      });
    }

    // Создание астероидов
    for (let i = 0; i < numAsteroids; i++) {
      asteroids.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 4 + 2,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        color: `hsl(${Math.random() * 30 + 20}, 30%, ${Math.random() * 30 + 40}%)`,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.1 + 0.05,
      });
    }

    // Функция создания частиц от комет
    const createParticles = (comet: Comet) => {
      const numParticles = Math.floor(comet.radius * 2);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: comet.x + (Math.random() - 0.5) * comet.radius * 2,
          y: comet.y + (Math.random() - 0.5) * comet.radius * 2,
          vx: comet.vx * 0.3 + (Math.random() - 0.5) * 2,
          vy: comet.vy * 0.3 + (Math.random() - 0.5) * 2,
          life: 0,
          maxLife: Math.random() * 60 + 30,
          size: Math.random() * 2 + 0.5,
          color: comet.color,
        });
      }
    };

    // Адаптивная частота создания комет
    const cometInterval = isSmallScreen ? 
      setInterval(createComet, 2000) : // Каждые 2 секунды на маленьких экранах
      isMobile ? 
      setInterval(createComet, 1500) : // Каждые 1.5 секунды на мобильных
      setInterval(createComet, 1000); // Каждую секунду на десктопе

    const draw = () => {
      // Очищаем canvas
      ctx.clearRect(0, 0, width, height);
      
      // Рисуем пульсирующий градиентный космический фон
      const pulseIntensity = 0.1 + 0.05 * Math.sin(backgroundPulse);
      const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
      gradient.addColorStop(0, `hsl(240, 60%, ${15 + pulseIntensity * 10}%)`);
      gradient.addColorStop(0.3, `hsl(240, 50%, ${20 + pulseIntensity * 8}%)`);
      gradient.addColorStop(0.7, `hsl(240, 40%, ${12 + pulseIntensity * 6}%)`);
      gradient.addColorStop(1, `hsl(240, 30%, ${8 + pulseIntensity * 4}%)`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Рисуем звезды с мерцанием
      ctx.globalCompositeOperation = 'screen';
      for (const star of stars) {
        const twinkleBrightness = star.brightness * (0.6 + 0.4 * Math.sin(star.twinkle));
        
        // Основная звезда
        ctx.fillStyle = `rgba(255, 255, 255, ${twinkleBrightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Свечение для ярких звезд
        if (star.radius > 1.5) {
          const glowGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 4);
          glowGradient.addColorStop(0, `rgba(255, 255, 255, ${twinkleBrightness * 0.4})`);
          glowGradient.addColorStop(0.5, `rgba(200, 200, 255, ${twinkleBrightness * 0.2})`);
          glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 4, 0, 2 * Math.PI);
          ctx.fill();
        }
        
        // Дополнительное свечение для очень ярких звезд
        if (star.radius > 2.5) {
          const outerGlow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.radius * 8);
          outerGlow.addColorStop(0, `rgba(150, 150, 255, ${twinkleBrightness * 0.1})`);
          outerGlow.addColorStop(1, 'rgba(150, 150, 255, 0)');
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius * 8, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      // Рисуем движущиеся туманности
      for (const nebula of movingNebulae) {
        const pulseOpacity = nebula.opacity * (0.7 + 0.3 * Math.sin(nebula.pulse));
        const gradient = ctx.createRadialGradient(nebula.x, nebula.y, 0, nebula.x, nebula.y, nebula.radius);
        gradient.addColorStop(0, nebula.color + Math.floor(pulseOpacity * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(0.5, nebula.color + Math.floor(pulseOpacity * 128).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, nebula.color + '00');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.radius, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Рисуем планеты
      for (const planet of planets) {
        // Рисуем орбиту (тонкую линию)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(planet.centerX, planet.centerY, planet.orbitRadius, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Рисуем планету с градиентом
        const planetGradient = ctx.createRadialGradient(
          planet.x - planet.radius * 0.3, 
          planet.y - planet.radius * 0.3, 
          0,
          planet.x, 
          planet.y, 
          planet.radius
        );
        planetGradient.addColorStop(0, planet.color);
        planetGradient.addColorStop(0.7, planet.color + 'cc');
        planetGradient.addColorStop(1, planet.color + '80');
        
        ctx.fillStyle = planetGradient;
        ctx.beginPath();
        ctx.arc(planet.x, planet.y, planet.radius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Добавляем блик на планете
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(planet.x - planet.radius * 0.3, planet.y - planet.radius * 0.3, planet.radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Добавляем кольца для некоторых планет
        if (Math.random() > 0.7) {
          ctx.strokeStyle = planet.color + '60';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(planet.x, planet.y, planet.radius * 1.5, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }

      // Рисуем астероиды
      for (const asteroid of asteroids) {
        ctx.save();
        ctx.translate(asteroid.x, asteroid.y);
        ctx.rotate(asteroid.rotation);
        
        // Добавляем покачивание
        const wobbleOffset = Math.sin(asteroid.wobble) * 2;
        ctx.translate(0, wobbleOffset);
        
        // Рисуем неправильную форму астероида
        ctx.fillStyle = asteroid.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, asteroid.radius, asteroid.radius * 0.7, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Добавляем детали на астероид
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-asteroid.radius * 0.3, -asteroid.radius * 0.2, asteroid.radius * 0.2, asteroid.radius * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Добавляем блик
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.ellipse(asteroid.radius * 0.2, -asteroid.radius * 0.3, asteroid.radius * 0.15, asteroid.radius * 0.1, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.restore();
      }

      // Рисуем кометы с улучшенными эффектами
      for (const comet of comets) {
        const lifeRatio = comet.life / comet.maxLife;
        const alpha = 1 - lifeRatio;
        
        // Рисуем многослойные градиентные следы кометы
        if (comet.trail.length > 1) {
          // Создаем градиентный след
          const gradient = ctx.createLinearGradient(
            comet.trail[0].x, comet.trail[0].y,
            comet.trail[comet.trail.length - 1].x, comet.trail[comet.trail.length - 1].y
          );
          gradient.addColorStop(0, comet.color + Math.floor(alpha * 100).toString(16).padStart(2, '0'));
          gradient.addColorStop(0.5, comet.color + Math.floor(alpha * 60).toString(16).padStart(2, '0'));
          gradient.addColorStop(1, comet.color + '00');
          
          // Внешний широкий след (самый тусклый)
          ctx.strokeStyle = comet.color + Math.floor(alpha * 20).toString(16).padStart(2, '0');
          ctx.lineWidth = comet.radius * 2.5;
          ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(comet.trail[0].x, comet.trail[0].y);
          for (let i = 1; i < comet.trail.length; i++) {
            ctx.lineTo(comet.trail[i].x, comet.trail[i].y);
          }
          ctx.stroke();
          
          // Средний след с градиентом
          ctx.strokeStyle = gradient;
          ctx.lineWidth = comet.radius * 1.5;
          ctx.beginPath();
          ctx.moveTo(comet.trail[0].x, comet.trail[0].y);
          for (let i = 1; i < comet.trail.length; i++) {
            ctx.lineTo(comet.trail[i].x, comet.trail[i].y);
          }
          ctx.stroke();
          
          // Внутренний яркий след
          ctx.strokeStyle = comet.color + Math.floor(alpha * 120).toString(16).padStart(2, '0');
          ctx.lineWidth = comet.radius * 0.8;
          ctx.beginPath();
          ctx.moveTo(comet.trail[0].x, comet.trail[0].y);
          for (let i = 1; i < comet.trail.length; i++) {
            ctx.lineTo(comet.trail[i].x, comet.trail[i].y);
          }
          ctx.stroke();
          
          // Точечные следы с градиентным затуханием
          for (let i = 0; i < comet.trail.length; i += 2) {
            const pointAlpha = alpha * (1 - i / comet.trail.length) * 0.8;
            const pointSize = comet.radius * 0.4 * (1 - i / comet.trail.length);
            ctx.fillStyle = comet.color + Math.floor(pointAlpha * 255).toString(16).padStart(2, '0');
            ctx.beginPath();
            ctx.arc(comet.trail[i].x, comet.trail[i].y, pointSize, 0, 2 * Math.PI);
            ctx.fill();
          }
          
          // Дополнительные светящиеся точки
          for (let i = 0; i < comet.trail.length; i += 4) {
            const glowAlpha = alpha * (1 - i / comet.trail.length) * 0.3;
            const glowSize = comet.radius * 0.8 * (1 - i / comet.trail.length);
            const glowGradient = ctx.createRadialGradient(
              comet.trail[i].x, comet.trail[i].y, 0,
              comet.trail[i].x, comet.trail[i].y, glowSize
            );
            glowGradient.addColorStop(0, comet.color + Math.floor(glowAlpha * 255).toString(16).padStart(2, '0'));
            glowGradient.addColorStop(1, comet.color + '00');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(comet.trail[i].x, comet.trail[i].y, glowSize, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
        
        // Рисуем хвост кометы с градиентом
        const tailLength = comet.len * (1 - lifeRatio * 0.3);
        const tailX = comet.x - comet.vx * (tailLength / 20);
        const tailY = comet.y - comet.vy * (tailLength / 20);
        
        // Внешний светящийся хвост (самый широкий)
        ctx.strokeStyle = comet.color + Math.floor(alpha * 40).toString(16).padStart(2, '0');
        ctx.lineWidth = comet.radius * 5 * (1 - lifeRatio * 0.2);
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        
        // Средний хвост
        ctx.strokeStyle = comet.color + Math.floor(alpha * 80).toString(16).padStart(2, '0');
        ctx.lineWidth = comet.radius * 3 * (1 - lifeRatio * 0.2);
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        
        // Основной хвост с градиентом
        const tailGradient = ctx.createLinearGradient(comet.x, comet.y, tailX, tailY);
        tailGradient.addColorStop(0, comet.color + Math.floor(alpha * 255).toString(16).padStart(2, '0'));
        tailGradient.addColorStop(0.3, comet.color + Math.floor(alpha * 200).toString(16).padStart(2, '0'));
        tailGradient.addColorStop(0.6, comet.color + Math.floor(alpha * 120).toString(16).padStart(2, '0'));
        tailGradient.addColorStop(0.9, comet.color + Math.floor(alpha * 60).toString(16).padStart(2, '0'));
        tailGradient.addColorStop(1, comet.color + '00');
        
        ctx.strokeStyle = tailGradient;
        ctx.lineWidth = comet.radius * 1.5 * (1 - lifeRatio * 0.2);
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
        
        // Внешнее свечение ядра
        const outerGlow = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.radius * 5);
        outerGlow.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.4})`);
        outerGlow.addColorStop(0.3, `rgba(200, 200, 255, ${alpha * 0.3})`);
        outerGlow.addColorStop(0.7, `rgba(150, 150, 255, ${alpha * 0.2})`);
        outerGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 5, 0, 2 * Math.PI);
        ctx.fill();
        
        // Ядро кометы с свечением
        const coreGradient = ctx.createRadialGradient(comet.x, comet.y, 0, comet.x, comet.y, comet.radius * 3);
        coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
        coreGradient.addColorStop(0.2, `rgba(255, 255, 200, ${alpha * 0.9})`);
        coreGradient.addColorStop(0.5, `rgba(200, 200, 255, ${alpha * 0.7})`);
        coreGradient.addColorStop(0.8, `rgba(150, 150, 255, ${alpha * 0.4})`);
        coreGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Центральное ядро
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(comet.x, comet.y, comet.radius * 0.8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Блик на ядре
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.beginPath();
        ctx.arc(comet.x - comet.radius * 0.3, comet.y - comet.radius * 0.3, comet.radius * 0.4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Рисуем частицы от комет
      for (const particle of particles) {
        const lifeRatio = particle.life / particle.maxLife;
        const alpha = 1 - lifeRatio;
        
        ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.globalCompositeOperation = 'source-over';
    };

    const update = () => {
      // Обновляем глобальные пульсирующие эффекты
      globalPulse += 0.02;
      backgroundPulse += 0.015;
      
      // Обновляем звезды
      for (const star of stars) {
        // Эффект притяжения к курсору мыши (адаптивный для мобильных)
        const dx = mouseX - star.x;
        const dy = mouseY - star.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = isMobile ? 150 : 200; // Меньший радиус на мобильных
        
        if (distance < maxDistance && distance > 0) {
          const forceMultiplier = isMobile ? 0.005 : 0.008; // Меньшая сила на мобильных
          const force = (maxDistance - distance) / maxDistance * forceMultiplier;
          star.vx += (dx / distance) * force;
          star.vy += (dy / distance) * force;
        }
        
        // Добавляем случайные колебания для более живого движения
        star.vx += (Math.random() - 0.5) * 0.01;
        star.vy += (Math.random() - 0.5) * 0.01;
        
        // Ограничиваем скорость
        const maxSpeed = 2.0; // Увеличиваем максимальную скорость
        const speed = Math.sqrt(star.vx * star.vx + star.vy * star.vy);
        if (speed > maxSpeed) {
          star.vx = (star.vx / speed) * maxSpeed;
          star.vy = (star.vy / speed) * maxSpeed;
        }
        
        star.x += star.vx;
        star.y += star.vy;
        star.twinkle += star.twinkleSpeed;

        // Отражаем от границ
        if (star.x < 0 || star.x > width) star.vx = -star.vx;
        if (star.y < 0 || star.y > height) star.vy = -star.vy;
      }

      // Обновляем кометы
      for (let i = comets.length - 1; i >= 0; i--) {
        const comet = comets[i];
        
        // Добавляем текущую позицию в след
        comet.trail.push({ x: comet.x, y: comet.y });
        
        // Ограничиваем длину следа (увеличиваем для более длинных следов)
        if (comet.trail.length > 40) {
          comet.trail.shift();
        }
        
        // Гравитационное притяжение к центру экрана (адаптивное для мобильных)
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = centerX - comet.x;
        const dy = centerY - comet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Уменьшаем гравитационное притяжение на мобильных для лучшей производительности
          const gravityMultiplier = isMobile ? 0.5 : 1;
          const gravityForce = (comet.gravity * gravityMultiplier) / (distance * 0.01);
          comet.vx += (dx / distance) * gravityForce;
          comet.vy += (dy / distance) * gravityForce;
        }
        
        // Обновляем позицию
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.life++;

        // Создаем частицы от комет периодически
        if (comet.life % 2 === 0) {
          createParticles(comet);
        }

        // Удаляем кометы, которые вышли за границы или закончили жизнь
        if (comet.life >= comet.maxLife || 
            comet.x + comet.len < -200 || 
            comet.x - comet.len > width + 200 || 
            comet.y + comet.len < -200 || 
            comet.y - comet.len > height + 200) {
          comets.splice(i, 1);
        }
      }

      // Обновляем частицы
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life++;

        // Замедляем частицы
        particle.vx *= 0.98;
        particle.vy *= 0.98;

        // Удаляем частицы, которые закончили жизнь или вышли за границы
        if (particle.life >= particle.maxLife || 
            particle.x < -50 || 
            particle.x > width + 50 || 
            particle.y < -50 || 
            particle.y > height + 50) {
          particles.splice(i, 1);
        }
      }

      // Обновляем движущиеся туманности
      for (const nebula of movingNebulae) {
        nebula.x += nebula.vx;
        nebula.y += nebula.vy;
        nebula.pulse += nebula.pulseSpeed;

        // Отражаем от границ
        if (nebula.x < -nebula.radius || nebula.x > width + nebula.radius) nebula.vx = -nebula.vx;
        if (nebula.y < -nebula.radius || nebula.y > height + nebula.radius) nebula.vy = -nebula.vy;
      }

      // Обновляем планеты
      for (const planet of planets) {
        planet.angle += planet.orbitSpeed;
        planet.rotation += planet.rotationSpeed;
        planet.x = planet.centerX + Math.cos(planet.angle) * planet.orbitRadius;
        planet.y = planet.centerY + Math.sin(planet.angle) * planet.orbitRadius;
      }

      // Обновляем астероиды
      for (const asteroid of asteroids) {
        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;
        asteroid.rotation += asteroid.rotationSpeed;
        asteroid.wobble += asteroid.wobbleSpeed;

        // Отражаем от границ
        if (asteroid.x < 0 || asteroid.x > width) asteroid.vx = -asteroid.vx;
        if (asteroid.y < 0 || asteroid.y > height) asteroid.vy = -asteroid.vy;
      }
    };

    const tick = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        draw();
        update();
        lastTime = currentTime;
      }
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      clearInterval(cometInterval);
    };
  }, []);

  return <canvas ref={canvasRef} className="cosmic-background"></canvas>;
};

export default CosmicBackground;