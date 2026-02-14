import { Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/Logo.png";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4">
          <img src={logo} alt="LangGov" className="h-12 w-auto" />
          <span className="text-xl font-serif font-bold text-gradient">LangGov</span>
          <p className="text-sm text-muted-foreground text-center">{t("footer.tagline")}</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" /> contact@langgov.dz
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" /> +213 XX XXX XXXX
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Algiers, Algeria
            </div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} LangGov. {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
