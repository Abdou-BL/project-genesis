import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookOpen, Play, FileText, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Chapter {
  id: string;
  title: string;
  pdf_url: string | null;
  link: string | null;
  sort_order: number;
}

interface CourseData {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: number;
}

const isYouTubeUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
};

const levelColor: Record<string, string> = {
  Beginner: "bg-primary/10 text-primary border-primary/20",
  Intermediate: "bg-secondary text-secondary-foreground border-secondary",
  Advanced: "bg-accent/10 text-accent border-accent/20",
};

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      const [courseRes, chaptersRes] = await Promise.all([
        supabase.from("courses").select("id, title, description, level, duration, modules").eq("id", id).single(),
        supabase.from("chapters").select("*").eq("course_id", id).order("sort_order", { ascending: true }),
      ]);
      if (courseRes.data) setCourse(courseRes.data);
      if (chaptersRes.data) {
        setChapters(chaptersRes.data);
        if (chaptersRes.data.length > 0) setActiveChapter(chaptersRes.data[0].id);
      }
      setLoading(false);
    };
    fetchData();
  }, [id]);

  const active = chapters.find((c) => c.id === activeChapter);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">Course not found</p>
          <Button variant="outline" onClick={() => navigate("/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Courses
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/courses")} className="mb-3 gap-2">
            <ArrowLeft className="h-4 w-4" /> {t("courses.backToCourses")}
          </Button>
          <div className="flex items-start gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-serif font-bold">{course.title}</h1>
                <Badge variant="outline" className={levelColor[course.level] || ""}>{course.level}</Badge>
              </div>
              <p className="text-muted-foreground">{course.description}</p>
              <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                {course.duration && <span>{course.duration}</span>}
                <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {chapters.length} {t("courses.chapters")}</span>
              </div>
            </div>
          </div>
        </div>

        {chapters.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">{t("courses.noChapters")}</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[300px_1fr] gap-6">
            {/* Sidebar - chapter list */}
            <div className="glass-card rounded-xl p-4 h-fit lg:sticky lg:top-4">
              <h3 className="font-serif font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-3 px-2">
                {t("courses.chapters")}
              </h3>
              <div className="space-y-1">
                {chapters.map((ch, i) => (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChapter(ch.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-3 group ${
                      activeChapter === ch.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/60 text-foreground"
                    }`}
                  >
                    <span className={`flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold shrink-0 ${
                      activeChapter === ch.id ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}>
                      {i + 1}
                    </span>
                    <span className="truncate">{ch.title}</span>
                    <div className="ml-auto flex gap-1 shrink-0">
                      {ch.pdf_url && <FileText className="h-3.5 w-3.5 opacity-60" />}
                      {ch.link && isYouTubeUrl(ch.link) && <Video className="h-3.5 w-3.5 opacity-60" />}
                      {ch.link && !isYouTubeUrl(ch.link) && <ExternalLink className="h-3.5 w-3.5 opacity-60" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Content area */}
            <div className="space-y-6">
              <AnimatePresence mode="wait">
                {active && (
                  <motion.div
                    key={active.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-xl font-serif font-semibold">{active.title}</h2>

                    {/* YouTube video */}
                    {active.link && isYouTubeUrl(active.link) && (
                      <div className="glass-card rounded-xl overflow-hidden">
                        <div className="aspect-video">
                          <iframe
                            src={`https://www.youtube.com/embed/${isYouTubeUrl(active.link)}`}
                            title={active.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          />
                        </div>
                      </div>
                    )}

                    {/* Non-YouTube link */}
                    {active.link && !isYouTubeUrl(active.link) && (
                      <div className="glass-card rounded-xl p-4">
                        <a href={active.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                          <ExternalLink className="h-4 w-4" />
                          {active.link}
                        </a>
                      </div>
                    )}

                    {/* PDF viewer */}
                    {active.pdf_url && (
                      <div className="glass-card rounded-xl overflow-hidden">
                        <div className="bg-muted/30 px-4 py-2 border-b border-border flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground font-medium">PDF Document</span>
                          <a href={active.pdf_url} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs text-primary hover:underline">
                            Open in new tab
                          </a>
                        </div>
                        <iframe
                          src={active.pdf_url}
                          title={`${active.title} PDF`}
                          className="w-full h-[70vh]"
                        />
                      </div>
                    )}

                    {!active.link && !active.pdf_url && (
                      <div className="glass-card rounded-xl p-12 text-center">
                        <p className="text-muted-foreground">{t("courses.noContent")}</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetail;
