import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

const StatsSection = () => {
  const { t } = useLanguage();

  const stats = [
    { value: "50+", label: t("stats.ministries") },
    { value: "10K+", label: t("stats.documents") },
    { value: "5K+", label: t("stats.employees") },
    { value: "98%", label: t("stats.accuracy") },
  ];

  return (
    <section className="py-16 bg-primary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-1">{stat.value}</div>
              <div className="text-sm text-primary-foreground/80">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
