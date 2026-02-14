import { motion } from "framer-motion";
import { Languages, GraduationCap, BookOpen, Video, Shield } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { icon: Languages, title: t("features.f1.title"), description: t("features.f1.desc") },
    { icon: GraduationCap, title: t("features.f2.title"), description: t("features.f2.desc") },
    { icon: BookOpen, title: t("features.f3.title"), description: t("features.f3.desc") },
    { icon: Video, title: t("features.f4.title"), description: t("features.f4.desc") },
    { icon: Shield, title: t("features.f5.title"), description: t("features.f5.desc") },
  ];

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
            {t("features.title1")}{" "}
            <span className="text-gradient">{t("features.title2")}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{t("features.desc")}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-xl p-6 hover:shadow-card-hover transition-all group"
            >
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
