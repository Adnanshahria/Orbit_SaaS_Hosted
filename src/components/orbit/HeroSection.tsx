import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLang } from '@/contexts/LanguageContext';



/* ── Particle field ───────────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    let animId: number;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.8 + 0.4,
        o: Math.random() * 0.3 + 0.05,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(108, 92, 231, ${p.o})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = p.x - particles[j].x;
          const dy = p.y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(108, 92, 231, ${0.07 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

/* ── Hero component ───────────────────────────────────────────── */
export function HeroSection() {
  const { t } = useLang();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentY = useTransform(scrollYProgress, [0, 0.5], ['0%', '15%']);

  // Staggered word animation for the subtitle
  const subtitle = t.hero.subtitle || '';
  const words = subtitle.split(' ');

  // Theme Customization from admin
  const taglineColor = (t.hero as any).taglineColor || '#00F5FF';
  const titleColor = (t.hero as any).titleColor || '#FF00A8';
  const ctaGradientStart = (t.hero as any).ctaGradientStart || '#6c5ce7';
  const ctaGradientEnd = (t.hero as any).ctaGradientEnd || '#3b82f6';

  // Dynamic WhatsApp URL from admin settings
  const whatsappNumber = (t.contact as any).whatsapp || '';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`;

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-[100svh] flex items-center justify-center overflow-hidden pt-28 pb-20 sm:pt-0 sm:pb-0"
    >
      {/* Parallax background layers */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-gradient-to-br from-background via-secondary/40 to-background" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(108,92,231,0.12),transparent_60%)]" />
      <motion.div style={{ y: bgY }} className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,245,255,0.08),transparent_60%)]" />
      <ParticleField />

      {/* Content with scroll fade */}
      <motion.div
        style={{ opacity: contentOpacity, y: contentY }}
        className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto"
      >
        {/* Badge — slides down with spring */}
        {t.hero.tagline && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-effect text-[10px] sm:text-xs font-bold mb-6 sm:mb-8 uppercase tracking-[0.2em]"
            style={{ color: taglineColor }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: taglineColor, boxShadow: `0 0 10px ${taglineColor}` }}
            />
            {t.hero.tagline}
          </motion.div>
        )}

        {/* Title — "ORBIT SaaS" scales up dramatically */}
        <motion.h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground leading-[1] mb-8 sm:mb-10 tracking-tighter">
          <motion.span
            className="block"
            initial={{ opacity: 0, scale: 0.7, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.4 }}
          >
            ORBIT <span className="text-primary">SaaS</span>
          </motion.span>
          <motion.span
            className="block mt-3 sm:mt-5 text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-bold italic leading-snug"
            style={{ fontFamily: "'Lobster Two', cursive", color: titleColor }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 18, delay: 0.7 }}
          >
            {t.hero.title}
          </motion.span>
        </motion.h1>

        {/* Subtitle — word-by-word reveal */}
        <motion.p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed flex flex-wrap justify-center gap-x-[0.3em] font-medium">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.9 + i * 0.04,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.p>

        {/* CTA buttons — slide up with spring */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 60, damping: 16, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0"
        >
          <motion.a
            id="hero-book-appointment"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.04, boxShadow: `0 8px 30px ${ctaGradientStart}44` }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-flex items-center gap-2 px-7 sm:px-8 py-4 rounded-full font-semibold text-primary-foreground shadow-lg gentle-animation cursor-pointer w-full sm:w-auto justify-center text-base"
            style={{ background: `linear-gradient(to right, ${ctaGradientStart}, ${ctaGradientEnd})` }}
          >
            {t.hero.cta}
            <ArrowRight className="w-5 h-5" />
          </motion.a>
          <motion.a
            href="#services"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className="inline-flex items-center gap-2 px-7 sm:px-8 py-4 rounded-full font-semibold glass-effect text-foreground cursor-pointer w-full sm:w-auto justify-center text-base"
          >
            {t.hero.learnMore}
          </motion.a>
        </motion.div>
      </motion.div>

      {/* Scroll indicator — gentle bounce */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute bottom-20 sm:bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}>
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </motion.div>
    </section>
  );
}
