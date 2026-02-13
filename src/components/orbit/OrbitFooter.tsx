import { useLang } from '@/contexts/LanguageContext';

export function OrbitFooter() {
  const { t } = useLang();

  return (
    <footer className="border-t border-border py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex items-center gap-3">
          <img
            src="https://storage.googleapis.com/gpt-engineer-file-uploads/aMjanxrDoUP1QJ5krTWiqhWnSbF3/uploads/1758710472461-logo-icon-BG-circle copy.png"
            alt="ORBIT SaaS"
            className="w-8 h-8 rounded-full"
          />
          <span className="font-display font-bold text-foreground">ORBIT SaaS</span>
        </div>
        <p className="text-muted-foreground text-sm">{t.footer.tagline}</p>
        <p className="text-muted-foreground text-sm">{t.footer.rights}</p>
      </div>
    </footer>
  );
}
