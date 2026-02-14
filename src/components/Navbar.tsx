import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Globe, LogIn, LogOut, LayoutDashboard, UserCircle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import NotificationBell from "@/components/NotificationBell";
import logo from "@/assets/Logo.png";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { user, role, isVerified, signOut } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const navLinks = [
    { label: t("nav.home"), path: "/" },
    { label: t("nav.translation"), path: "/translation" },
    { label: t("nav.courses"), path: "/courses" },
    { label: t("nav.terminology"), path: "/terminology" },
    { label: t("nav.meetings"), path: "/meetings" },
  ];

  const toggleLang = () => setLang(lang === "en" ? "fr" : "en");

  const NavItem = ({ link }: { link: { label: string; path: string } }) => (
    <Link
      to={link.path}
      onClick={() => setOpen(false)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        location.pathname === link.path
          ? "bg-primary text-primary-foreground"
          : "text-foreground/70 hover:text-foreground hover:bg-muted"
      }`}
    >
      {link.label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-md">
      <div className="container mx-auto flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src={logo} alt="LangGov" className="h-8 w-auto" />
          <span className="text-lg font-serif font-bold text-gradient">LangGov</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => <NavItem key={link.path} link={link} />)}
        </div>

        {/* Desktop right actions */}
        <div className="hidden lg:flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={toggleLang} className="gap-1.5 text-xs font-semibold">
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "EN" : "FR"}
          </Button>
          {user ? (
            <>
              <NotificationBell />
              <Link to="/profile">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <UserCircle className="h-3.5 w-3.5" />
                  {t("nav.profile")}
                </Button>
              </Link>
              {role === "admin" ? (
                <Link to="/admin">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    {t("admin.title")}
                  </Button>
                </Link>
              ) : (
                <Link to="/dashboard">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    {t("nav.dashboard")}
                  </Button>
                </Link>
              )}
              <Button variant="default" size="sm" className="gap-1.5" onClick={signOut}>
                <LogOut className="h-3.5 w-3.5" />
                {t("nav.signout")}
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button variant="default" size="sm" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                {t("nav.signin")}
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile right actions */}
        <div className="flex items-center gap-2 lg:hidden">
          {!user && (
            <Link to="/login">
              <Button variant="default" size="sm" className="gap-1.5">
                <LogIn className="h-3.5 w-3.5" />
                {t("nav.signin")}
              </Button>
            </Link>
          )}
          {user && <NotificationBell />}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-muted">
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
          <SheetContent side="right" className="w-72 p-0">
            <SheetHeader className="p-4 border-b border-border">
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} alt="LangGov" className="h-6 w-auto" />
                <span className="font-serif font-bold text-gradient">LangGov</span>
              </SheetTitle>
            </SheetHeader>
            <div className="flex flex-col p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setOpen(false)}
                  className={`px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/70 hover:bg-muted"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="border-t border-border p-4 space-y-2 mt-auto">
              <Button variant="ghost" size="sm" onClick={toggleLang} className="w-full justify-start gap-1.5">
                <Globe className="h-3.5 w-3.5" />{lang === "en" ? "EN" : "FR"}
              </Button>
              {user ? (
                <>

                  <Link to="/profile" className="block" onClick={() => setOpen(false)}>
                    <Button variant="outline" size="sm" className="gap-1.5 w-full">
                      <UserCircle className="h-3.5 w-3.5" />{t("nav.profile")}
                    </Button>
                  </Link>
                  {role === "admin" ? (
                    <Link to="/admin" className="block" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="gap-1.5 w-full">
                        <Shield className="h-3.5 w-3.5" />{t("admin.title")}
                      </Button>
                    </Link>
                  ) : (
                    <Link to="/dashboard" className="block" onClick={() => setOpen(false)}>
                      <Button variant="outline" size="sm" className="gap-1.5 w-full">
                        <LayoutDashboard className="h-3.5 w-3.5" />{t("nav.dashboard")}
                      </Button>
                    </Link>
                  )}
                  <Button variant="default" size="sm" className="gap-1.5 w-full" onClick={() => { signOut(); setOpen(false); }}>
                    <LogOut className="h-3.5 w-3.5" />{t("nav.signout")}
                  </Button>
                </>
              ) : (
                <Link to="/login" className="block" onClick={() => setOpen(false)}>
                  <Button variant="default" size="sm" className="gap-1.5 w-full">
                    <LogIn className="h-3.5 w-3.5" />{t("nav.signin")}
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
