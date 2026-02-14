import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import logo from "@/assets/Logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Register = () => {
  const [showPass, setShowPass] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"employee" | "administrative">("employee");
  const [organizationId, setOrganizationId] = useState("");
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    supabase.from("organizations").select("id, name").order("name").then(({ data }) => {
      if (data) setOrganizations(data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const meta: Record<string, string> = {
      first_name: firstName,
      last_name: lastName,
      role,
    };
    if (organizationId) {
      meta.organization_id = organizationId;
    }
    const { error } = await signUp(email, password, meta);
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSuccess(true);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center px-4 py-12 bg-hero-gradient">
          <div className="w-full max-w-md glass-card rounded-2xl p-8 text-center">
            <img src={logo} alt="LangGov" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold mb-4">✅ {t("auth.register")}</h1>
            <p className="text-muted-foreground mb-6">{t("auth.checkEmail")}</p>
            <Link to="/login">
              <Button className="gap-2"><UserPlus className="h-4 w-4" />{t("nav.signin")}</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-hero-gradient">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <img src={logo} alt="LangGov" className="h-16 mx-auto mb-4" />
            <h1 className="text-2xl font-serif font-bold">{t("auth.createAccount")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t("auth.joinPlatform")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">{t("auth.firstName")}</Label>
                <Input id="firstName" placeholder="Ahmed" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">{t("auth.lastName")}</Label>
                <Input id="lastName" placeholder="Benali" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" placeholder="you@government.dz" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>{t("auth.accountType")}</Label>
              <Select value={role} onValueChange={(v) => setRole(v as "employee" | "administrative")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="employee">{t("auth.employeeRole")}</SelectItem>
                  <SelectItem value="administrative">{t("auth.administrative")}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {role === "administrative" ? t("auth.roleDesc.administrative") : t("auth.roleDesc.employee")}
              </p>
            </div>
            <div>
              <Label>{t("auth.organization")}</Label>
              <Select value={organizationId} onValueChange={setOrganizationId}>
                <SelectTrigger><SelectValue placeholder={t("auth.selectOrg")} /></SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <div className="relative">
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full gap-2" disabled={loading}>
              <UserPlus className="h-4 w-4" /> {loading ? "..." : t("auth.createAccount")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {t("auth.hasAccount")}{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">{t("nav.signin")}</Link>
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Register;
