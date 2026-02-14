import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Camera, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { user, role, profile, isVerified, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setAvatarUrl(profile.avatar_url || null);
      setOrganizationId(profile.organization_id || null);
    }
    supabase.from("organizations").select("id, name").order("name").then(({ data }) => {
      if (data) setOrganizations(data);
    });
  }, [user, profile, navigate]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${ext}`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const url = `${publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user.id);
      setAvatarUrl(url);
      toast({ title: t("nav.profile"), description: "Avatar updated!" });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase.from("profiles").update({
      first_name: firstName,
      last_name: lastName,
      organization_id: organizationId,
    }).eq("user_id", user.id);
    setLoading(false);
    if (!error) await refreshProfile();
    toast({
      title: error ? "Error" : t("nav.profile"),
      description: error ? error.message : "Profile updated successfully",
      variant: error ? "destructive" : "default",
    });
  };

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

  const roleLabelMap: Record<string, string> = {
    admin: "Admin",
    administrative: t("auth.administrative"),
    employee: t("auth.employeeRole"),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-hero-gradient">
        <div className="w-full max-w-md glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Avatar className="h-24 w-24 mx-auto cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                <AvatarFallback className="text-2xl font-serif">{initials}</AvatarFallback>
              </Avatar>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md hover:opacity-90 transition"
                disabled={uploading}
              >
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>
            <h1 className="text-2xl font-serif font-bold mt-4">{t("nav.profile")}</h1>
            <p className="text-sm text-muted-foreground mt-1">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="outline">{roleLabelMap[role || "employee"]}</Badge>
              {role === "administrative" && (
                isVerified ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                    <ShieldCheck className="h-3 w-3" /> {t("auth.verified")}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" /> {t("auth.pending")}
                  </Badge>
                )
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <Label>{t("auth.firstName")}</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>
            <div>
              <Label>{t("auth.lastName")}</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>
            <div>
              <Label>{t("auth.organization")}</Label>
              <Select value={organizationId || ""} onValueChange={(v) => setOrganizationId(v || null)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("auth.selectOrg")} />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map(org => (
                    <SelectItem key={org.id} value={org.id}>{org.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full gap-2" onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4" /> {loading ? "..." : "Save"}
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
