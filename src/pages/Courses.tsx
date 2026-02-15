import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Clock, Users, Play, Star, BookOpen, Plus, Edit2, Trash2, Upload, Link as LinkIcon, X } from "lucide-react";
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

interface ChapterDraft {
  title: string;
  pdfFile: File | null;
  link: string;
}

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
  const navigate = useNavigate();
  const canManage = role === "admin" || (role === "administrative" && isVerified);

  const [dbCourses, setDbCourses] = useState<CourseItem[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newLevel, setNewLevel] = useState("Beginner");
  const [newDuration, setNewDuration] = useState("");
  const [chapters, setChapters] = useState<ChapterDraft[]>([]);
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
    setNewTitle(""); setNewDesc(""); setNewLevel("Beginner"); setNewDuration(""); setChapters([]);
  };

  const addChapter = () => {
    setChapters(prev => [...prev, { title: "", pdfFile: null, link: "" }]);
  };

  const updateChapter = (index: number, field: keyof ChapterDraft, value: any) => {
    setChapters(prev => prev.map((ch, i) => i === index ? { ...ch, [field]: value } : ch));
  };

  const removeChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPdf = async (file: File): Promise<string | null> => {
    const fileName = `${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("course-pdfs").upload(fileName, file);
    if (error) {
      toast({ title: "Upload error", description: error.message, variant: "destructive" });
      return null;
    }
    const { data: urlData } = supabase.storage.from("course-pdfs").getPublicUrl(fileName);
    return urlData.publicUrl;
  };

  const handleAdd = async () => {
    if (!newTitle.trim() || !user) return;
    setAdding(true);

    // Create course
    const { data: courseData, error } = await supabase.from("courses").insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      level: newLevel,
      duration: newDuration.trim(),
      modules: chapters.length,
      created_by: user.id,
      organization_id: profile?.organization_id || null,
    }).select("id").single();

    if (error || !courseData) {
      toast({ title: "Error", description: error?.message, variant: "destructive" });
      setAdding(false);
      return;
    }

    // Create chapters
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      if (!ch.title.trim()) continue;
      let pdfUrl: string | null = null;
      if (ch.pdfFile) pdfUrl = await uploadPdf(ch.pdfFile);

      await supabase.from("chapters").insert({
        course_id: courseData.id,
        title: ch.title.trim(),
        pdf_url: pdfUrl,
        link: ch.link.trim() || null,
        sort_order: i,
      });
    }

    toast({ title: t("courses.added") });
    resetForm();
    setDialogOpen(false);
    fetchCourses();
    setAdding(false);
  };

  const handleEdit = async () => {
    if (!editingCourse?.id || !newTitle.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("courses").update({
      title: newTitle.trim(),
      description: newDesc.trim(),
      level: newLevel,
      duration: newDuration.trim(),
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
    setEditDialogOpen(true);
  };

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
              <DialogContent className="max-h-[90vh] overflow-y-auto max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("courses.addCourse")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>{t("courses.courseTitle")}</Label>
                    <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label>{t("courses.courseDesc")}</Label>
                    <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  {/* Chapters section */}
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-base font-serif font-semibold">{t("courses.chapters")} ({chapters.length})</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addChapter} className="gap-1">
                        <Plus className="h-3.5 w-3.5" /> {t("courses.addChapter")}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {chapters.map((ch, i) => (
                        <div key={i} className="rounded-lg border border-border p-4 space-y-3 relative bg-muted/20">
                          <Button
                            type="button" variant="ghost" size="icon"
                            className="absolute top-2 right-2 h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeChapter(i)}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">{i + 1}</span>
                            <span className="text-sm font-medium text-muted-foreground">{t("courses.chapter")}</span>
                          </div>
                          <div>
                            <Label className="text-xs">{t("courses.chapterTitle")}</Label>
                            <Input
                              value={ch.title}
                              onChange={e => updateChapter(i, "title", e.target.value)}
                              placeholder={t("courses.chapterTitlePlaceholder")}
                            />
                          </div>
                          <div>
                            <Label className="text-xs flex items-center gap-1"><Upload className="h-3 w-3" /> PDF</Label>
                            <Input
                              type="file"
                              accept=".pdf"
                              onChange={e => updateChapter(i, "pdfFile", e.target.files?.[0] || null)}
                              className="cursor-pointer"
                            />
                          </div>
                          <div>
                            <Label className="text-xs flex items-center gap-1"><LinkIcon className="h-3 w-3" /> {t("courses.linkLabel")}</Label>
                            <Input
                              value={ch.link}
                              onChange={e => updateChapter(i, "link", e.target.value)}
                              placeholder="https://youtube.com/watch?v=... or any URL"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleAdd} disabled={adding || !newTitle.trim()}>
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
            </div>
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
                  {course.modules > 0 && <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" />{course.modules} {t("courses.chapters")}</span>}
                </div>
                <Button
                  className="w-full gap-2"
                  variant="outline"
                  onClick={() => course.id ? navigate(`/courses/${course.id}`) : undefined}
                  disabled={!course.id}
                >
                  <Play className="h-4 w-4" /> {t("courses.start")}
                </Button>
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
