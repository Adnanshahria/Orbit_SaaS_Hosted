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
    <footer className="relative z-10 px-4 sm:px-6 pb-24 sm:pb-6 pt-2 mt-16">
      <div
        className="max-w-4xl mx-auto rounded-2xl border border-border/60 bg-background/50 backdrop-blur-xl px-6 py-6 sm:py-7"
        style={{
          boxShadow:
            '0 -4px 30px rgba(100, 100, 255, 0.04), 0 2px 16px rgba(0,0,0,0.15)',
        }}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src={orbitLogo}
              alt={brandName}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-display font-bold text-foreground">
              {brandName}
            </span>
          </div>

          {/* Tagline */}
          <p className="text-muted-foreground text-sm">{footer.tagline}</p>

          {/* Social Media Icons */}
          {socials.length > 0 && (
            <div className="flex items-center gap-3 py-1">
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
                    className="w-9 h-9 rounded-full bg-secondary/80 hover:bg-primary/15 border border-border hover:border-primary/40 flex items-center justify-center text-muted-foreground hover:text-primary transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.8} />
                  </a>
                );
              })}
            </div>
          )}

          {/* Rights */}
          <p className="text-muted-foreground text-xs">{footer.rights}</p>
        </div>
      </div>
    </footer>
  );
}
