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

  // Get enabled socials with valid URLs
  const socials = ((t.footer as any).socials || []).filter(
    (s: any) => s.enabled && s.url
  );

  return (
    <footer className="border-t border-border py-5 sm:py-6 px-4 sm:px-6 pb-24 sm:pb-6">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-3">
          <img
            src={orbitLogo}
            alt="ORBIT SaaS"
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-display font-bold text-foreground">ORBIT SaaS</span>
        </div>
        <p className="text-muted-foreground text-sm">{t.footer.tagline}</p>

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

        <p className="text-muted-foreground text-xs">{t.footer.rights}</p>
      </div>
    </footer>
  );
}
