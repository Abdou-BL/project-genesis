import { motion } from "framer-motion";
import { ArrowRight, Languages, BookOpen, Video, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const cards = [
    { icon: Languages, title: t("hero.card1.title"), desc: t("hero.card1.desc") },
    { icon: BookOpen, title: t("hero.card2.title"), desc: t("hero.card2.desc") },
    { icon: Globe, title: t("hero.card3.title"), desc: t("hero.card3.desc") },
    { icon: Video, title: t("hero.card4.title"), desc: t("hero.card4.desc") },
  ];

  return (
    <section className="relative overflow-hidden bg-hero-gradient min-h-[85vh] flex items-center">
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />

      <div className="container mx-auto px-4 py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-6">
            <Languages className="h-4 w-4" />
            {t("hero.badge")}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
            {t("hero.title1")}{" "}
            <span className="text-gradient">{t("hero.title2")}</span>
            {" "}{t("hero.title3")}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg mx-auto">{t("hero.desc")}</p>
          {!user && (
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="gap-2 text-base px-8">
                  {t("hero.getstarted")} <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/translation">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8">
                  {t("hero.trytranslation")}
                </Button>
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
        >
          {cards.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="glass-card rounded-xl p-6 hover:shadow-card-hover transition-shadow text-center"
            >
              <item.icon className="h-8 w-8 text-primary mb-3 mx-auto" />
              <h3 className="font-serif font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
