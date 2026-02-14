import { useState, useEffect } from "react";
import { Search, BookOpen, Filter, Plus, ChevronDown, ChevronUp, ArrowUpAZ, Edit2, Trash2, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TerminologyQuiz from "@/components/TerminologyQuiz";

interface Term {
  id?: string;
  fr: string;
  en: string;
  category: string;
  definition_fr?: string;
  definition_en?: string;
  example_fr?: string;
  example_en?: string;
  isDefault?: boolean;
}

const defaultTerms: Term[] = [
  { fr: "Ministère de l'Éducation", en: "Ministry of Education", category: "Education", definition_fr: "Organisme gouvernemental chargé de l'éducation nationale.", definition_en: "Government body responsible for national education.", example_fr: "Le Ministère de l'Éducation a publié de nouvelles directives.", example_en: "The Ministry of Education published new guidelines.", isDefault: true },
  { fr: "Décret présidentiel", en: "Presidential Decree", category: "Legal", definition_fr: "Acte juridique pris par le président de la République.", definition_en: "Legal act issued by the President of the Republic.", example_fr: "Un décret présidentiel a été signé hier.", example_en: "A presidential decree was signed yesterday.", isDefault: true },
  { fr: "Fonction publique", en: "Civil Service", category: "Administration", definition_fr: "Ensemble des agents travaillant pour l'État.", definition_en: "All agents working for the State.", example_fr: "Il travaille dans la fonction publique depuis 10 ans.", example_en: "He has been working in the civil service for 10 years.", isDefault: true },
  { fr: "Collectivité locale", en: "Local Authority", category: "Administration", definition_fr: "Structure administrative gérant les affaires locales.", definition_en: "Administrative structure managing local affairs.", example_fr: "La collectivité locale a voté le budget.", example_en: "The local authority voted on the budget.", isDefault: true },
  { fr: "Budget de l'État", en: "State Budget", category: "Finance", definition_fr: "Plan financier annuel du gouvernement.", definition_en: "Annual financial plan of the government.", example_fr: "Le budget de l'État sera présenté au parlement.", example_en: "The state budget will be presented to parliament.", isDefault: true },
  { fr: "Appel d'offres", en: "Call for Tenders", category: "Procurement", definition_fr: "Procédure de mise en concurrence pour un marché public.", definition_en: "Competitive procedure for a public contract.", example_fr: "L'appel d'offres sera clôturé le 30 mars.", example_en: "The call for tenders will close on March 30.", isDefault: true },
  { fr: "Journal officiel", en: "Official Gazette", category: "Legal", definition_fr: "Publication officielle des lois et décrets.", definition_en: "Official publication of laws and decrees.", example_fr: "La loi a été publiée au journal officiel.", example_en: "The law was published in the official gazette.", isDefault: true },
  { fr: "Conseil des ministres", en: "Council of Ministers", category: "Government", definition_fr: "Réunion du cabinet exécutif présidée par le chef de l'État.", definition_en: "Executive cabinet meeting chaired by the head of state.", example_fr: "Le conseil des ministres s'est réuni ce matin.", example_en: "The council of ministers met this morning.", isDefault: true },
  { fr: "Assemblée populaire", en: "People's Assembly", category: "Government", definition_fr: "Corps législatif représentant le peuple.", definition_en: "Legislative body representing the people.", example_fr: "L'assemblée populaire a adopté la loi.", example_en: "The People's Assembly passed the law.", isDefault: true },
  { fr: "Arrêté ministériel", en: "Ministerial Order", category: "Legal", definition_fr: "Décision réglementaire prise par un ministre.", definition_en: "Regulatory decision made by a minister.", example_fr: "L'arrêté ministériel entre en vigueur demain.", example_en: "The ministerial order takes effect tomorrow.", isDefault: true },
  { fr: "Recrutement", en: "Recruitment", category: "HR", definition_fr: "Processus d'embauche dans la fonction publique.", definition_en: "Government hiring process.", example_fr: "Le recrutement se fait par concours.", example_en: "Recruitment is done through competitive examination.", isDefault: true },
  { fr: "Cahier des charges", en: "Specifications Document", category: "Procurement", definition_fr: "Document décrivant les exigences d'un marché.", definition_en: "Document describing contract requirements.", example_fr: "Le cahier des charges a été validé.", example_en: "The specifications document has been approved.", isDefault: true },
  { fr: "Délibération", en: "Deliberation", category: "Legal", definition_fr: "Décision prise par un organe collégial.", definition_en: "Decision made by a collegiate body.", example_fr: "La délibération du conseil a été adoptée.", example_en: "The council's deliberation was adopted.", isDefault: true },
  { fr: "Procès-verbal", en: "Minutes / Official Report", category: "Administration", definition_fr: "Document officiel résumant les décisions d'une réunion.", definition_en: "Official document summarizing meeting decisions.", example_fr: "Le procès-verbal a été signé par tous les membres.", example_en: "The minutes were signed by all members.", isDefault: true },
  { fr: "Secrétaire général", en: "Secretary General", category: "Government", definition_fr: "Plus haut fonctionnaire d'un ministère.", definition_en: "Highest-ranking official in a ministry.", example_fr: "Le secrétaire général a présidé la réunion.", example_en: "The Secretary General chaired the meeting.", isDefault: true },
];

const categories = ["All", "Government", "Legal", "Administration", "Finance", "Education", "Procurement", "HR"];

const Terminology = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [dbTerms, setDbTerms] = useState<Term[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [newFr, setNewFr] = useState("");
  const [newEn, setNewEn] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDefinitionFr, setNewDefinitionFr] = useState("");
  const [newDefinitionEn, setNewDefinitionEn] = useState("");
  const [newExampleFr, setNewExampleFr] = useState("");
  const [newExampleEn, setNewExampleEn] = useState("");
  const [adding, setAdding] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [sortAlpha, setSortAlpha] = useState(false);
  const { t, lang } = useLanguage();
  const { role, user, profile } = useAuth();
  const { toast } = useToast();

  const { isVerified } = useAuth();
  const canManage = role === "admin" || (role === "administrative" && isVerified);

  const exportTermsPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Terminology Bank / Banque Terminologique", 15, 20);
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(15, 24, 195, 24);

    let y = 35;
    const terms = [...allTerms];
    terms.sort((a, b) => a.fr.localeCompare(b.fr, "fr"));

    for (const term of terms) {
      if (y > 260) { doc.addPage(); y = 20; }
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(30, 64, 175);
      doc.text(`${term.fr}  /  ${term.en}`, 15, y);
      y += 5;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`[${term.category}]`, 15, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      if (term.definition_fr) {
        const defLines = doc.splitTextToSize(`Définition (FR): ${term.definition_fr}`, 175);
        for (const l of defLines) { if (y > 280) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 5; }
      }
      if (term.definition_en) {
        const defLines = doc.splitTextToSize(`Definition (EN): ${term.definition_en}`, 175);
        for (const l of defLines) { if (y > 280) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 5; }
      }
      if (term.example_fr) {
        doc.setFont("helvetica", "italic");
        const exLines = doc.splitTextToSize(`Ex (FR): "${term.example_fr}"`, 175);
        for (const l of exLines) { if (y > 280) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 5; }
      }
      if (term.example_en) {
        const exLines = doc.splitTextToSize(`Ex (EN): "${term.example_en}"`, 175);
        for (const l of exLines) { if (y > 280) { doc.addPage(); y = 20; } doc.text(l, 15, y); y += 5; }
      }
      doc.setFont("helvetica", "normal");
      doc.setDrawColor(200, 200, 200);
      doc.line(15, y + 1, 195, y + 1);
      y += 6;
    }
    doc.save("terminology-bank.pdf");
    toast({ title: lang === "en" ? "PDF exported!" : "PDF exporté !" });
  };

  const fetchTerms = async () => {
    const { data } = await supabase.from("terminology_terms").select("id, fr, en, category, definition_fr, definition_en, example_fr, example_en").order("created_at", { ascending: false });
    if (data) setDbTerms(data.map(d => ({ ...d, isDefault: false })));
  };

  useEffect(() => { fetchTerms(); }, []);

  const allTerms = [...dbTerms, ...defaultTerms];

  const filtered = allTerms
    .filter((term) => {
      const matchesSearch = !search || term.fr.toLowerCase().includes(search.toLowerCase()) || term.en.toLowerCase().includes(search.toLowerCase());
      const matchesCat = category === "All" || term.category === category;
      return matchesSearch && matchesCat;
    })
    .sort((a, b) => {
      if (sortAlpha) {
        return a.fr.toLowerCase().localeCompare(b.fr.toLowerCase(), 'fr');
      }
      // Default: newest first (db terms first, then defaults in original order)
      return 0;
    });

  const handleAdd = async () => {
    if (!newFr.trim() || !newEn.trim() || !user) return;
    setAdding(true);
    const { error } = await supabase.from("terminology_terms").insert({
      fr: newFr.trim(),
      en: newEn.trim(),
      category: newCategory.trim() || "General",
      definition_fr: newDefinitionFr.trim(),
      definition_en: newDefinitionEn.trim(),
      example_fr: newExampleFr.trim(),
      example_en: newExampleEn.trim(),
      created_by: user.id,
      organization_id: profile?.organization_id || null,
    });
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("terminology.added") });
      resetForm();
      setDialogOpen(false);
      fetchTerms();
    }
  };

  const handleEdit = async () => {
    if (!editingTerm?.id || !newFr.trim() || !newEn.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("terminology_terms").update({
      fr: newFr.trim(),
      en: newEn.trim(),
      category: newCategory.trim() || "General",
      definition_fr: newDefinitionFr.trim(),
      definition_en: newDefinitionEn.trim(),
      example_fr: newExampleFr.trim(),
      example_en: newExampleEn.trim(),
    }).eq("id", editingTerm.id);
    setAdding(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("terminology.updated") });
      resetForm();
      setEditDialogOpen(false);
      setEditingTerm(null);
      fetchTerms();
    }
  };

  const handleDelete = async (term: Term) => {
    if (!term.id) return;
    const { error } = await supabase.from("terminology_terms").delete().eq("id", term.id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: t("terminology.deleted") });
      fetchTerms();
    }
  };

  const openEdit = (term: Term) => {
    setEditingTerm(term);
    setNewFr(term.fr);
    setNewEn(term.en);
    setNewCategory(term.category);
    setNewDefinitionFr(term.definition_fr || "");
    setNewDefinitionEn(term.definition_en || "");
    setNewExampleFr(term.example_fr || "");
    setNewExampleEn(term.example_en || "");
    setEditDialogOpen(true);
  };

  const resetForm = () => {
    setNewFr(""); setNewEn(""); setNewCategory("");
    setNewDefinitionFr(""); setNewDefinitionEn("");
    setNewExampleFr(""); setNewExampleEn("");
  };

  const termFormFields = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>{t("terminology.frLabel")}</Label>
          <Input value={newFr} onChange={e => setNewFr(e.target.value)} />
        </div>
        <div>
          <Label>{t("terminology.enLabel")}</Label>
          <Input value={newEn} onChange={e => setNewEn(e.target.value)} />
        </div>
      </div>
      <div>
        <Label>{t("terminology.categoryLabel")}</Label>
        <Input value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="e.g. Legal, Finance..." />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>{t("terminology.defFr")}</Label>
          <Textarea value={newDefinitionFr} onChange={e => setNewDefinitionFr(e.target.value)} rows={2} />
        </div>
        <div>
          <Label>{t("terminology.defEn")}</Label>
          <Textarea value={newDefinitionEn} onChange={e => setNewDefinitionEn(e.target.value)} rows={2} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>{t("terminology.exFr")}</Label>
          <Textarea value={newExampleFr} onChange={e => setNewExampleFr(e.target.value)} rows={2} />
        </div>
        <div>
          <Label>{t("terminology.exEn")}</Label>
          <Textarea value={newExampleEn} onChange={e => setNewExampleEn(e.target.value)} rows={2} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold mb-2">
            <span className="text-gradient">{t("terminology.title")}</span> {t("terminology.bank")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">{t("terminology.desc")}</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Quiz Section - above search */}
          <div className="mb-6">
            <TerminologyQuiz allTerms={allTerms} />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("terminology.search")} className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <Filter className="h-4 w-4 mr-2" /><SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button variant={sortAlpha ? "default" : "outline"} size="icon" onClick={() => setSortAlpha(!sortAlpha)} title={t("terminology.sort")}>
                <ArrowUpAZ className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={exportTermsPdf} title={lang === "en" ? "Export PDF" : "Exporter PDF"}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
            {canManage && (
              <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
                <DialogTrigger asChild>
                  <Button className="gap-2 w-full sm:w-auto"><Plus className="h-4 w-4" /> {t("terminology.addTerm")}</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t("terminology.addTerm")}</DialogTitle>
                  </DialogHeader>
                  {termFormFields}
                  <Button className="w-full" onClick={handleAdd} disabled={adding || !newFr.trim() || !newEn.trim()}>
                    {adding ? "..." : t("terminology.addTerm")}
                  </Button>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Edit dialog */}
          <Dialog open={editDialogOpen} onOpenChange={(o) => { setEditDialogOpen(o); if (!o) { resetForm(); setEditingTerm(null); } }}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{t("terminology.editTerm")}</DialogTitle>
              </DialogHeader>
              {termFormFields}
              <Button className="w-full" onClick={handleEdit} disabled={adding || !newFr.trim() || !newEn.trim()}>
                {adding ? "..." : t("terminology.saveTerm")}
              </Button>
            </DialogContent>
          </Dialog>

          {/* Terms list - card-based for mobile */}
          <div className="space-y-2">
            {/* Desktop header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-3 bg-primary/5 rounded-t-xl border border-border font-semibold text-sm">
              <div className="col-span-4">🇫🇷 {t("terminology.french")}</div>
              <div className="col-span-4">🇬🇧 {t("terminology.english")}</div>
              <div className="col-span-2">{t("terminology.category")}</div>
              <div className="col-span-2 text-right">{canManage ? t("terminology.actions") : ""}</div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground border border-border rounded-xl">
                <BookOpen className="h-8 w-8 mx-auto mb-2" /> {t("terminology.noTerms")}
              </div>
            ) : (
              filtered.map((term, i) => (
                <div key={term.id || `default-${i}`} className="border border-border/50 rounded-lg overflow-hidden hover:bg-muted/30 transition-colors">
                  {/* Main row */}
                  <div
                    className="px-4 py-3 cursor-pointer flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:gap-4 text-sm"
                    onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                  >
                    <div className="sm:col-span-4 font-medium flex items-center justify-between sm:justify-start">
                      <span className="break-words min-w-0">🇫🇷 {term.fr}</span>
                      <span className="sm:hidden ml-2 flex-shrink-0">
                        {expandedIndex === i ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </span>
                    </div>
                    <div className="sm:col-span-4 break-words min-w-0">🇬🇧 {term.en}</div>
                    <div className="sm:col-span-2">
                      <Badge variant="outline" className="text-xs">{term.category}</Badge>
                    </div>
                    <div className="sm:col-span-2 hidden sm:flex items-center justify-end gap-1">
                      {expandedIndex === i ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      {canManage && !term.isDefault && (
                        <>
                          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); openEdit(term); }}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete(term); }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded definition */}
                  {expandedIndex === i && (
                    <div className="px-4 pb-4 border-t border-border/50 bg-muted/20">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">🇫🇷 {t("terminology.definition")}</p>
                          <p className="text-sm">{term.definition_fr || <span className="italic text-muted-foreground">{t("terminology.noDefinition")}</span>}</p>
                          {term.example_fr && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">{t("terminology.example")}</p>
                              <p className="text-sm italic text-muted-foreground">"{term.example_fr}"</p>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1">🇬🇧 {t("terminology.definition")}</p>
                          <p className="text-sm">{term.definition_en || <span className="italic text-muted-foreground">{t("terminology.noDefinition")}</span>}</p>
                          {term.example_en && (
                            <div className="mt-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">{t("terminology.example")}</p>
                              <p className="text-sm italic text-muted-foreground">"{term.example_en}"</p>
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Mobile edit/delete buttons */}
                      {canManage && !term.isDefault && (
                        <div className="flex gap-2 mt-3 sm:hidden">
                          <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={() => openEdit(term)}>
                            <Edit2 className="h-3.5 w-3.5" /> {t("terminology.editTerm")}
                          </Button>
                          <Button size="sm" variant="outline" className="gap-1 text-destructive hover:text-destructive" onClick={() => handleDelete(term)}>
                            <Trash2 className="h-3.5 w-3.5" /> {t("admin.delete")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">{filtered.length} {t("terminology.termsFound")}</p>

          {/* Quiz section moved above search bar */}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Terminology;
