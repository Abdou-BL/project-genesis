import { Languages, GraduationCap, BookOpen, Video, TrendingUp, Clock } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import logo from "@/assets/Logo.png";

const Dashboard = () => {
  const { user, role } = useAuth();
  const { t } = useLanguage();

  // Admins use the Admin page; redirect them
  if (role === "admin") return <Navigate to="/admin" replace />;

  const quickLinks = [
    { icon: Languages, label: t("nav.translation"), path: "/translation", desc: t("hero.card1.desc") },
    { icon: GraduationCap, label: t("nav.courses"), path: "/courses", desc: t("hero.card2.desc") },
    { icon: BookOpen, label: t("nav.terminology"), path: "/terminology", desc: t("hero.card3.desc") },
    { icon: Video, label: t("nav.meetings"), path: "/meetings", desc: t("hero.card4.desc") },
  ];

  const recentActivity = [
    { action: "Translated letter", detail: "Ministry of Finance correspondence", time: "2 hours ago" },
    { action: "Completed module", detail: "Official Letter Writing - Module 5", time: "Yesterday" },
    { action: "Added 12 terms", detail: "Legal terminology batch", time: "2 days ago" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <img src={logo} alt="LangGov" className="h-12" />
          <div>
            <h1 className="text-2xl font-serif font-bold">{t("dashboard.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("dashboard.welcome")} ({user?.email})</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Languages, label: t("dashboard.translations"), value: "142", trend: "+12%" },
            { icon: GraduationCap, label: t("dashboard.courseProgress"), value: "67%", trend: "+8%" },
            { icon: BookOpen, label: t("nav.terminology"), value: "580", trend: "+15" },
            { icon: Video, label: t("dashboard.meetings"), value: "24", trend: "+3" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-5 w-5 text-primary" />
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />{stat.trend}
                </span>
              </div>
              <div className="text-2xl font-serif font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <h2 className="font-serif font-semibold text-lg mb-4">{t("dashboard.quickAccess")}</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickLinks.map((link) => (
                <Link key={link.path} to={link.path} className="glass-card rounded-xl p-4 hover:shadow-card-hover transition-all group">
                  <link.icon className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-sm">{link.label}</h4>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif font-semibold text-lg mb-4">{t("dashboard.recentActivity")}</h2>
            <div className="glass-card rounded-xl divide-y divide-border/50">
              {recentActivity.map((item, i) => (
                <div key={i} className="p-4">
                  <h4 className="font-medium text-sm">{item.action}</h4>
                  <p className="text-xs text-muted-foreground">{item.detail}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />{item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
