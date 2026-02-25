import { useLang } from '@/contexts/LanguageContext';
import orbitLogo from '@/assets/orbit-logo.png';
import {
  Facebook,
  Instagram,
  Linkedin,
  Send,
  Twitter,
  Youtube,
  Github,
  MessageCircle,
} from 'lucide-react';

const PLATFORM_ICONS: Record<string, typeof Facebook> = {
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
  telegram: Send,
  twitter: Twitter,
  youtube: Youtube,
  github: Github,
  whatsapp: MessageCircle,
};

export function OrbitFooter() {
  const { t } = useLang();

  const footer = t.footer as any;
  const brandName = footer.brandName || 'ORBIT SaaS';

  // Get enabled socials with valid URLs
  const socials = (footer.socials || []).filter(
    (s: any) => s.enabled && s.url
  );

  return (
    <footer className="relative w-full pt-16 pb-24 sm:pb-12 mt-16 overflow-hidden">
      {/* Dynamic Glowing Top Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(108,92,231,0.5)]" />
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent" />

      {/* Faint Upward Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/[0.03] to-transparent pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
        {/* Brand */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-primary to-amber-400 opacity-30 blur-sm mix-blend-screen" />
              <img
                src={orbitLogo}
                alt={brandName}
                className="relative w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
              />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">
              {brandName}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-muted-foreground/80 max-w-sm text-sm sm:text-base leading-relaxed">
            {footer.tagline}
          </p>
        </div>

        {/* Social Media Icons */}
        {socials.length > 0 && (
          <div className="flex items-center gap-4 py-2 mt-2">
            {socials.map((social: any) => {
              const Icon = PLATFORM_ICONS[social.platform];
              if (!Icon) return null;
              return (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.platform}
                  className="group relative w-10 h-10 rounded-xl bg-secondary/60 hover:bg-primary/10 border border-border/80 hover:border-primary/50 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-110 hover:-translate-y-1"
                >
                  <div className="absolute inset-0 rounded-xl bg-primary/20 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300 pointer-events-none" />
                  <Icon className="relative w-4 h-4 z-10" strokeWidth={1.8} />
                </a>
              );
            })}
          </div>
        )}

        {/* Rights */}
        <div className="w-full h-px bg-border/40 mt-4 mb-2 max-w-md mx-auto" />
        <p className="text-muted-foreground/60 text-xs sm:text-sm tracking-wide">
          {footer.rights}
        </p>
      </div>
    </footer>
  );
}
