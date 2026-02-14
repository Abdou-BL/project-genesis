import { useState, useEffect } from "react";
import { Video, Plus, Calendar, Clock, Users, ExternalLink, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface MeetingItem {
  id: string;
  title: string;
  meeting_date: string;
  meeting_time: string;
  participants: number;
  status: string;
  link: string;
}

const Meetings = () => {
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const { role, user, profile, isVerified } = useAuth();
  const canCreateMeeting = role === "admin" || (role === "administrative" && isVerified);

  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newLink, setNewLink] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchMeetings = async () => {
    const { data } = await supabase
      .from("meetings")
      .select("id, title, meeting_date, meeting_time, participants, status, link")
      .order("meeting_date", { ascending: true });
    if (data) setMeetings(data as MeetingItem[]);
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newDate || !newTime || !user) return;
    setAdding(true);
    const { error } = await supabase.from("meetings").insert({
      title: newTitle.trim(),
      meeting_date: newDate,
      meeting_time: newTime,
      link: newLink.trim(),
      created_by: user.id,
      organization_id: profile?.organization_id || null,
    });
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("meetings.schedule") });
      setNewTitle(""); setNewDate(""); setNewTime(""); setNewLink("");
      setDialogOpen(false);
      fetchMeetings();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("admin.delete") });
      fetchMeetings();
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingMeetings = meetings.filter(m => m.meeting_date >= today);
  const pastMeetings = meetings.filter(m => m.meeting_date < today);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
              {t("meetings.title")} <span className="text-gradient">{t("meetings.title2")}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">{t("meetings.desc")}</p>
          </div>
          {canCreateMeeting && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 flex-shrink-0 w-full sm:w-auto"><Plus className="h-4 w-4" /> {t("meetings.new")}</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-serif">{t("meetings.new")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div><Label>{t("meetings.meetingTitle")}</Label><Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Weekly Translation Review" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>{t("meetings.date")}</Label><Input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} /></div>
                    <div><Label>{t("meetings.time")}</Label><Input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} /></div>
                  </div>
                  <div><Label>{lang === "en" ? "Meeting Link" : "Lien de la réunion"}</Label><Input value={newLink} onChange={e => setNewLink(e.target.value)} placeholder="https://meet.google.com/..." /></div>
                  <Button onClick={handleAdd} disabled={adding || !newTitle.trim() || !newDate || !newTime} className="w-full">{adding ? "..." : t("meetings.schedule")}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" /> {t("meetings.upcoming")}
            </h2>
            <div className="space-y-3">
              {upcomingMeetings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {lang === "en" ? "No upcoming meetings" : "Aucune réunion à venir"}
                </p>
              )}
              {upcomingMeetings.map((m) => (
                <div key={m.id} className="glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Video className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm sm:text-base break-words">{m.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.meeting_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.meeting_time}</span>
                        {m.participants > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{m.participants}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <Badge className="bg-primary/10 text-primary border-primary/20 hidden sm:inline-flex">{t("meetings.upcoming")}</Badge>
                    {canCreateMeeting && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {m.link && (
                      <a href={m.link} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="gap-1"><ExternalLink className="h-3 w-3" /> {t("meetings.join")}</Button>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-serif font-semibold text-lg mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" /> {t("meetings.past")}
            </h2>
            <div className="space-y-3">
              {pastMeetings.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {lang === "en" ? "No past meetings" : "Aucune réunion passée"}
                </p>
              )}
              {pastMeetings.map((m) => (
                <div key={m.id} className="glass-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-75">
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Video className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-sm sm:text-base break-words">{m.title}</h4>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{m.meeting_date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{m.meeting_time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex-shrink-0">Completed</Badge>
                    {canCreateMeeting && (
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(m.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
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

export default Meetings;
