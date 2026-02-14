import { useEffect, useState } from "react";
import { Shield, Users, Building2, Check, Trash2, Plus, ShieldCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface UserRow {
  user_id: string;
  first_name: string;
  last_name: string;
  is_verified: boolean;
  organization_id: string | null;
  ministry: string | null;
  role?: string;
  org_name?: string;
  email?: string;
}

const Admin = () => {
  const { role } = useAuth();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [newOrgName, setNewOrgName] = useState("");
  const [orgDialogOpen, setOrgDialogOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const [{ data: profiles }, { data: roles }, { data: orgs }] = await Promise.all([
      supabase.from("profiles").select("user_id, first_name, last_name, is_verified, organization_id, ministry"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("organizations").select("id, name"),
    ]);

    let emailMap: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("get-user-emails", {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.data?.emailMap) emailMap = res.data.emailMap;
    } catch (e) {
      console.error("Failed to fetch emails", e);
    }
    
    const orgMap = new Map((orgs || []).map(o => [o.id, o.name]));
    const roleMap = new Map((roles || []).map(r => [r.user_id, r.role]));
    
    const merged = (profiles || []).map(p => ({
      ...p,
      role: roleMap.get(p.user_id) || "employee",
      org_name: p.organization_id ? orgMap.get(p.organization_id) || "" : "",
      email: emailMap[p.user_id] || "",
    }));
    
    setUsers(merged);
    setOrganizations(orgs || []);
    setLoadingUsers(false);
  };

  useEffect(() => {
    if (role === "admin") fetchUsers();
  }, [role]);

  const approveUser = async (userId: string) => {
    const { error } = await supabase.from("profiles").update({ is_verified: true }).eq("user_id", userId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send notification to the user
      await supabase.from("notifications").insert({
        user_id: userId,
        title: lang === "en" ? "Account Approved" : "Compte approuvé",
        message: lang === "en" ? "Your account has been verified by an administrator." : "Votre compte a été vérifié par un administrateur.",
        type: "approval",
      });
      toast({ title: t("admin.approve"), description: "User approved" });
      fetchUsers();
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("delete-user", {
        body: { userId },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.data?.error) throw new Error(res.data.error);
      toast({ title: lang === "en" ? "User deleted" : "Utilisateur supprimé" });
      fetchUsers();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const addOrganization = async () => {
    if (!newOrgName.trim()) return;
    const { error } = await supabase.from("organizations").insert({ name: newOrgName.trim() });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.addOrg"), description: newOrgName });
      setNewOrgName("");
      setOrgDialogOpen(false);
      fetchUsers();
    }
  };

  const deleteOrganization = async (id: string) => {
    const { error } = await supabase.from("organizations").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.delete"), description: "Organization deleted" });
      fetchUsers();
    }
  };

  if (role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("admin.noAccess")}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const adminUsers = users.filter(u => u.role === "admin");
  const administrativeUsers = users.filter(u => u.role === "administrative");
  const employeeUsers = users.filter(u => u.role === "employee");

  const UserTable = ({ userList, showApprove = false, showDelete = false }: { userList: UserRow[]; showApprove?: boolean; showDelete?: boolean }) => (
    <div className="space-y-2">
      {userList.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No users</p>}
      {userList.map(u => (
        <div key={u.user_id} className="glass-card rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="font-medium">{u.first_name} {u.last_name}</p>
            {u.email && <p className="text-xs text-muted-foreground truncate">{u.email}</p>}
            <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
              {u.ministry && <p className="text-xs text-muted-foreground">🏛️ {u.ministry}</p>}
              {u.org_name && <p className="text-xs text-muted-foreground">🏢 {u.org_name}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {showApprove && (
              u.is_verified ? (
                <Badge className="bg-green-500/10 text-green-600 border-green-500/20 gap-1">
                  <ShieldCheck className="h-3 w-3" /> {t("auth.verified")}
                </Badge>
              ) : (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => approveUser(u.user_id)}>
                  <Check className="h-3 w-3" /> {t("admin.approve")}
                </Button>
              )
            )}
            <Badge variant="outline">{u.role}</Badge>
            {showDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{lang === "en" ? "Delete User" : "Supprimer l'utilisateur"}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {lang === "en"
                        ? `Are you sure you want to delete ${u.first_name} ${u.last_name}? This action cannot be undone.`
                        : `Êtes-vous sûr de vouloir supprimer ${u.first_name} ${u.last_name} ? Cette action est irréversible.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{lang === "en" ? "Cancel" : "Annuler"}</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteUser(u.user_id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      {lang === "en" ? "Delete" : "Supprimer"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-serif font-bold">{t("admin.title")}</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="glass-card rounded-xl p-5">
            <Users className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-serif font-bold">{users.length}</div>
            <div className="text-xs text-muted-foreground">{t("admin.users")}</div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <Building2 className="h-5 w-5 text-primary mb-2" />
            <div className="text-2xl font-serif font-bold">{organizations.length}</div>
            <div className="text-xs text-muted-foreground">{t("admin.organizations")}</div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <ShieldCheck className="h-5 w-5 text-green-500 mb-2" />
            <div className="text-2xl font-serif font-bold">{administrativeUsers.filter(u => u.is_verified).length}</div>
            <div className="text-xs text-muted-foreground">{t("auth.verified")}</div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <Clock className="h-5 w-5 text-yellow-500 mb-2" />
            <div className="text-2xl font-serif font-bold">{administrativeUsers.filter(u => !u.is_verified).length}</div>
            <div className="text-xs text-muted-foreground">{t("auth.pending")}</div>
          </div>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="gap-1"><Users className="h-4 w-4" /> {t("admin.users")}</TabsTrigger>
            <TabsTrigger value="organizations" className="gap-1"><Building2 className="h-4 w-4" /> {t("admin.organizations")}</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <div className="space-y-6">
              <div>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" /> Admins ({adminUsers.length})
                </h3>
                <UserTable userList={adminUsers} />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> {t("auth.administrative")} ({administrativeUsers.length})
                </h3>
                <UserTable userList={administrativeUsers} showApprove showDelete />
              </div>
              <div>
                <h3 className="font-serif font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" /> {t("auth.employeeRole")} ({employeeUsers.length})
                </h3>
                <UserTable userList={employeeUsers} showDelete />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="organizations">
            <div className="flex justify-end mb-4">
              <Dialog open={orgDialogOpen} onOpenChange={setOrgDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2"><Plus className="h-4 w-4" /> {t("admin.addOrg")}</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{t("admin.addOrg")}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>{t("admin.name")}</Label>
                      <Input value={newOrgName} onChange={e => setNewOrgName(e.target.value)} placeholder="Ministry of..." />
                    </div>
                    <Button onClick={addOrganization} className="w-full">{t("admin.addOrg")}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {organizations.map(org => {
                const orgMembers = users.filter(u => u.organization_id === org.id);
                const isExpanded = selectedOrgId === org.id;
                return (
                  <div key={org.id} className="glass-card rounded-lg overflow-hidden">
                    <div
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setSelectedOrgId(isExpanded ? null : org.id)}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{org.name}</span>
                        <Badge variant="outline" className="text-xs">{orgMembers.length} {lang === "en" ? "members" : "membres"}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteOrganization(org.id); }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-3 bg-muted/20">
                        {orgMembers.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-2">
                            {lang === "en" ? "No members in this organization" : "Aucun membre dans cette organisation"}
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {orgMembers.map(u => (
                              <div key={u.user_id} className="flex items-center justify-between p-2 rounded bg-background/50">
                                <div>
                                  <p className="text-sm font-medium">{u.first_name} {u.last_name}</p>
                                  {u.email && <p className="text-xs text-muted-foreground">{u.email}</p>}
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">{u.role}</Badge>
                                  {u.is_verified ? (
                                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-xs gap-1">
                                      <ShieldCheck className="h-3 w-3" /> {t("auth.verified")}
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-xs">{t("auth.pending")}</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
