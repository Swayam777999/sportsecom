import { useEffect, useRef, useState } from 'react';

interface SportsClip {
  id: string;
  name: string;
  icon: string;
  badge: string;
  src: string;
  description: string;
}

const CLIPS: SportsClip[] = [
  {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    badge: 'Court Match',
    src: '/videos/basketball.mp4',
    description: 'Athlete playing basketball & shooting hoops'
  },
  {
    id: 'soccer',
    name: 'Soccer',
    icon: '⚽',
    badge: 'Field Play',
    src: '/videos/soccer_field.mp4',
    description: 'Dynamic field soccer gameplay'
  },
  {
    id: 'dribble',
    name: 'Dribble',
    icon: '⛹️',
    badge: 'Ball Handling',
    src: '/videos/basketball_dribble.mp4',
    description: 'Court crossovers & offensive drive'
  },
  {
    id: 'sprinter',
    name: 'Sprint',
    icon: '🏃',
    badge: 'Track Action',
    src: '/videos/sprinter.mp4',
    description: 'Explosive track & field sprint'
  },
  {
    id: 'athletic_drills',
    name: 'Drills',
    icon: '⚡',
    badge: 'Agility',
    src: '/videos/athletic_drills.mp4',
    description: 'High-tempo footwork & training'
  }
];

export default function LiveSportBackground() {
  const [currentClipIndex, setCurrentClipIndex] = useState<number>(() => {
    const saved = localStorage.getItem('peaknxt_live_scene');
    const idx = CLIPS.findIndex((c) => c.id === saved);
    // Default to basketball (index 0) if none saved or if old key was found
    return idx >= 0 ? idx : 0;
  });

  const [isVivid, setIsVivid] = useState<boolean>(() => {
    const savedClarity = localStorage.getItem('peaknxt_live_clarity');
    return savedClarity !== 'ambient'; // default to vivid action mode
  });

  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentClip = CLIPS[currentClipIndex];

  // Auto-play and change source when clip changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      if (isPlaying) {
        videoRef.current.play().catch(() => {
          // Auto-play policy catch
        });
      }
    }
    localStorage.setItem('peaknxt_live_scene', currentClip.id);
  }, [currentClipIndex, currentClip.id, isPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const toggleClarity = () => {
    setIsVivid((prev) => {
      const next = !prev;
      localStorage.setItem('peaknxt_live_clarity', next ? 'vivid' : 'ambient');
      return next;
    });
  };

  // Kinetic cursor telemetry particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, radius: 130 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark';

    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2 + 1.2,
      alpha: Math.random() * 0.35 + 0.12
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const dark = isDarkMode();
      const color = dark ? '#00f076' : '#2563eb';

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 1.2;
          p.y -= (dy / dist) * force * 1.2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      {/* Background Video & Stadium Atmosphere (Non-interactive, positioned behind content) */}
      <div className="live-sports-video-container" aria-hidden="true">
        <video
          ref={videoRef}
          key={currentClip.src}
          className="live-sports-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src={currentClip.src} type="video/mp4" />
        </video>

        {/* Cinematic Tint Overlay (Vivid or Ambient) */}
        <div className={`live-sports-overlay ${isVivid ? 'vivid' : 'ambient'}`} />

        {/* Floating Stadium Ambient Light Orbs */}
        <div className="ambient-light-orb orb-primary" />
        <div className="ambient-light-orb orb-secondary" />

        {/* Kinetic Telemetry Particle Layer */}
        <canvas ref={canvasRef} className="live-sports-canvas" />
      </div>

      {/* Interactive HUD Scene & Clarity Controller (Dedicated top-level UI element, fully clickable) */}
      <aside
        className={`live-scene-controller ${showControls ? 'expanded' : 'collapsed'}`}
        aria-label="Live Sports Background Controls"
      >
        <button
          type="button"
          className="scene-toggle-pill"
          onClick={() => setShowControls((prev) => !prev)}
          title="Toggle live sports background HUD"
        >
          <span className="live-indicator-dot" />
          <span className="scene-label-text">
            {showControls ? 'Live Sport:' : `${currentClip.icon} ${currentClip.name}`}
          </span>
        </button>

        {showControls && (
          <div className="scene-options-row">
            {CLIPS.map((clip, idx) => (
              <button
                key={clip.id}
                type="button"
                className={`scene-chip ${idx === currentClipIndex ? 'active' : ''}`}
                onClick={() => setCurrentClipIndex(idx)}
                title={`${clip.name} — ${clip.description}`}
              >
                <span>{clip.icon}</span>
                <span>{clip.name}</span>
              </button>
            ))}

            {/* Clarity / Visibility Switcher (Vivid Action vs Ambient Focus) */}
            <button
              type="button"
              className={`scene-clarity-btn ${isVivid ? 'vivid-active' : ''}`}
              onClick={toggleClarity}
              title={isVivid ? 'Switch to Subdued Ambient Mode' : 'Switch to Vivid Stadium Action Mode'}
            >
              {isVivid ? '👁️ Vivid' : '🕶️ Dim'}
            </button>

            {/* Play/Pause Toggle */}
            <button
              type="button"
              className="scene-play-btn"
              onClick={togglePlay}
              title={isPlaying ? 'Pause background video' : 'Play background video'}
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
