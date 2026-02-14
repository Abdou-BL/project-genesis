import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, Play, Star, BookOpen, Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface CourseItem {
  id?: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
  students?: number;
  rating?: number;
  isDefault?: boolean;
}

const defaultCourses: CourseItem[] = [
  { title: "English for Government Communication", level: "Beginner", duration: "8 weeks", students: 245, rating: 4.8, description: "Master basic English communication skills for official government correspondence.", modules: 12, isDefault: true },
  { title: "Official Letter Writing in English", level: "Intermediate", duration: "6 weeks", students: 189, rating: 4.9, description: "Learn to write professional government letters, memos, and reports.", modules: 10, isDefault: true },
  { title: "Legal & Administrative English", level: "Advanced", duration: "10 weeks", students: 132, rating: 4.7, description: "Advanced English for legal documents, administrative procedures, and policy writing.", modules: 15, isDefault: true },
  { title: "Public Speaking in English", level: "Intermediate", duration: "4 weeks", students: 98, rating: 4.6, description: "Develop confidence in delivering presentations and speeches in English.", modules: 8, isDefault: true },
  { title: "Technical English for IT Departments", level: "Intermediate", duration: "6 weeks", students: 76, rating: 4.8, description: "English terminology and communication for government IT professionals.", modules: 9, isDefault: true },
  { title: "Diplomatic English", level: "Advanced", duration: "12 weeks", students: 54, rating: 5.0, description: "High-level English for diplomatic correspondence and international relations.", modules: 18, isDefault: true },
];

const levelColor: Record<string, string> = {
  Beginner: "bg-primary/10 text-primary border-primary/20",
  Intermediate: "bg-secondary text-secondary-foreground border-secondary",
  Advanced: "bg-accent/10 text-accent border-accent/20",
};

const Courses = () => {
  const { t } = useLanguage();
  const { role, user, profile } = useAuth();
  const { toast } = useToast();
  const { isVerified } = useAuth();
  const canManage = role === "admin" || (role === "administrative" && isVerified);

  const [dbCourses, setDbCourses] = useState<CourseItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLevel, setNewLevel] = useState("Beginner");
  const [newDuration, setNewDuration] = useState("");
  const [newModules, setNewModules] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("id, title, description, level, duration, modules").order("created_at", { ascending: false });
    if (data) setDbCourses(data.map(c => ({ ...c, isDefault: false })));
  };

  useEffect(() => { fetchCourses(); }, []);

  const allCourses: CourseItem[] = [
    ...dbCourses.map(c => ({ ...c, students: 0, rating: 0 })),
    ...defaultCourses,
  ];

  const resetForm = () => {
    setNewTitle(""); setNewDesc(""); setNewLevel("Beginner"); setNewDuration(""); setNewModules("");
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !user) return;
    setAdding(true);
    const { error } = await supabase.from("courses").insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      level: newLevel,
      duration: newDuration.trim(),
      modules: parseInt(newModules) || 0,
      created_by: user.id,
      organization_id: profile?.organization_id || null,
    });
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("courses.added") });
      resetForm();
      setDialogOpen(false);
      fetchCourses();
    }
  };

  const handleEdit = async () => {
    if (!editingCourse?.id || !newTitle.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("courses").update({
      title: newTitle.trim(),
      description: newDesc.trim(),
      level: newLevel,
      duration: newDuration.trim(),
      modules: parseInt(newModules) || 0,
    }).eq("id", editingCourse.id);
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("courses.updated") });
      resetForm();
      setEditDialogOpen(false);
      setEditingCourse(null);
      fetchCourses();
    }
  };

  const handleDelete = async (course: CourseItem) => {
    if (!course.id) return;
    const { error } = await supabase.from("courses").delete().eq("id", course.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("courses.deleted") });
      fetchCourses();
    }
  };

  const openEdit = (course: CourseItem) => {
    setEditingCourse(course);
    setNewTitle(course.title);
    setNewDesc(course.description);
    setNewLevel(course.level);
    setNewDuration(course.duration);
    setNewModules(String(course.modules));
    setEditDialogOpen(true);
  };

  const courseFormFields = (
    <div className="space-y-4">
      <div>
        <Label>{t("courses.courseTitle")}</Label>
        <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} />
      </div>
      <div>
        <Label>{t("courses.courseDesc")}</Label>
        <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} />
      </div>
      <div>
        <Label>{t("courses.level")}</Label>
        <Select value={newLevel} onValueChange={setNewLevel}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Beginner">Beginner</SelectItem>
            <SelectItem value="Intermediate">Intermediate</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>{t("courses.duration")}</Label>
        <Input value={newDuration} onChange={e => setNewDuration(e.target.value)} placeholder="e.g. 6 weeks" />
      </div>
      <div>
        <Label>{t("courses.modulesCount")}</Label>
        <Input type="number" value={newModules} onChange={e => setNewModules(e.target.value)} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-serif font-bold mb-2">
            {t("courses.title")} <span className="text-gradient">{t("courses.title2")}</span>
          </h1>
          <p className="text-muted-foreground">{t("courses.desc")}</p>
        </div>

        {canManage && (
          <div className="flex justify-center mb-6">
            <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> {t("courses.addCourse")}</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("courses.addCourse")}</DialogTitle>
                </DialogHeader>
                {courseFormFields}
                <Button className="w-full" onClick={handleAdd} disabled={adding || !newTitle.trim()}>
                  {adding ? "..." : t("courses.addCourse")}
                </Button>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Edit dialog */}
        <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { resetForm(); setEditingCourse(null); } }}>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("courses.editCourse")}</DialogTitle>
            </DialogHeader>
            {courseFormFields}
            <Button className="w-full" onClick={handleEdit} disabled={adding || !newTitle.trim()}>
              {adding ? "..." : t("courses.saveCourse")}
            </Button>
          </DialogContent>
        </Dialog>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {allCourses.map((course, i) => (
            <motion.div key={course.id || `default-${i}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass-card rounded-xl overflow-hidden hover:shadow-card-hover transition-all group">
              <div className="h-2 bg-primary" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline" className={levelColor[course.level] || ""}>{course.level}</Badge>
                  <div className="flex items-center gap-1">
                    {(course.rating ?? 0) > 0 && (
                      <span className="flex items-center gap-1 text-sm"><Star className="h-3.5 w-3.5 fill-primary text-primary" />{course.rating}</span>
                    )}
                    {canManage && !course.isDefault && (
                      <>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(course)}>
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDelete(course)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="font-serif font-semibold text-lg mb-2 group-hover:text-primary transition-colors">{course.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{course.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  {course.duration && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>}
                  {(course.students ?? 0) > 0 && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.students} {t("courses.students")}</span>}
                  {course.modules > 0 && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules} {t("courses.modules")}</span>}
                </div>
                <Button className="w-full gap-2" variant="outline"><Play className="h-4 w-4" /> {t("courses.start")}</Button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Courses;
