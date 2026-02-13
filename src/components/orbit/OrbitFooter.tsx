import { useLang } from '@/contexts/LanguageContext';

export function OrbitFooter() {
  const { t } = useLang();

  return (
    <footer className="border-t border-border py-8 sm:py-10 px-4 sm:px-6 pb-24 sm:pb-10">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-3">
          <img
            src="https://storage.googleapis.com/gpt-engineer-file-uploads/aMjanxrDoUP1QJ5krTWiqhWnSbF3/uploads/1758710472461-logo-icon-BG-circle copy.png"
            alt="ORBIT SaaS"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-display font-bold text-foreground">ORBIT SaaS</span>
        </div>
        <p className="text-muted-foreground text-sm">{t.footer.tagline}</p>
        <p className="text-muted-foreground text-xs">{t.footer.rights}</p>
      </div>
    </footer>
  );
}
