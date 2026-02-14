import { useState, useRef } from "react";
import { Languages, ArrowRightLeft, Copy, Download, FileUp, Loader2, FileText, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RichTextEditor from "@/components/RichTextEditor";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { LETTER_CATEGORIES, type LetterCategory, type LetterTemplate } from "@/components/translation/LetterTemplates";

const Translation = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("fr");
  const [targetLang, setTargetLang] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  // Letters state (HTML)
  const [letterHtml, setLetterHtml] = useState("");
  const [translatedLetterHtml, setTranslatedLetterHtml] = useState("");
  const [letterSourceLang, setLetterSourceLang] = useState("fr");
  const [letterTargetLang, setLetterTargetLang] = useState("en");
  const [isTranslatingLetter, setIsTranslatingLetter] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Documents state (HTML)
  const [docHtml, setDocHtml] = useState("");
  const [translatedDocHtml, setTranslatedDocHtml] = useState("");
  const [docTargetLang, setDocTargetLang] = useState("en");
  const [isTranslatingDoc, setIsTranslatingDoc] = useState(false);
  const [docFileName, setDocFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { t, lang } = useLanguage();
  const { toast } = useToast();

  const translateText = async (text: string, from: string, to: string) => {
    const { data, error } = await supabase.functions.invoke("translate", {
      body: { text, sourceLang: from, targetLang: to },
    });
    if (error) throw error;
    if (data.error) throw new Error(data.error);
    return data.translated;
  };

  // --- TEXT TAB ---
  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateText(sourceText, sourceLang, targetLang);
      setTranslatedText(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const swapLangs = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: lang === "en" ? "Copied!" : "Copié !" });
  };

  const copyHtml = (html: string) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    navigator.clipboard.writeText(tmp.textContent || "");
    toast({ title: lang === "en" ? "Copied!" : "Copié !" });
  };

  // --- LETTERS TAB ---
  const selectTemplate = (template: LetterTemplate) => {
    const raw = template.template[letterSourceLang === "fr" ? "fr" : "en"];
    // Convert plain text newlines to HTML paragraphs for the rich text editor
    const html = raw
      .split("\n\n")
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
    setLetterHtml(html);
  };

  const handleTranslateLetter = async () => {
    if (!letterHtml.trim()) return;
    setIsTranslatingLetter(true);
    try {
      const result = await translateText(letterHtml, letterSourceLang, letterTargetLang);
      setTranslatedLetterHtml(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsTranslatingLetter(false);
    }
  };

  // --- DOCUMENTS TAB ---
  const extractHtmlFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const viewport = page.getViewport({ scale: 1 });
      const pageWidth = viewport.width;

      // Group items by vertical position to preserve line structure
      const lines: Record<number, any[]> = {};
      for (const item of content.items as any[]) {
        const y = Math.round(item.transform[5]);
        if (!lines[y]) lines[y] = [];
        lines[y].push(item);
      }
      const sortedYs = Object.keys(lines).map(Number).sort((a, b) => b - a);
      const pageHtml = sortedYs.map((y) => {
        const lineItems = lines[y].sort((a: any, b: any) => a.transform[4] - b.transform[4]);

        // Detect alignment based on position
        const firstX = lineItems[0]?.transform[4] || 0;
        const lastItem = lineItems[lineItems.length - 1];
        const lastX = lastItem ? lastItem.transform[4] + (lastItem.width || 0) : 0;
        const centerX = (firstX + lastX) / 2;
        const pageCenterX = pageWidth / 2;
        let align = "";
        if (Math.abs(centerX - pageCenterX) < 30 && firstX > 50) align = "center";
        else if (firstX > pageWidth * 0.5) align = "right";

        const text = lineItems.map((it: any) => {
          let s = it.str;
          // Detect bold from font name
          const isBold = it.fontName && (it.fontName.toLowerCase().includes("bold") || it.fontName.toLowerCase().includes("black"));
          // Detect italic from font name
          const isItalic = it.fontName && (it.fontName.toLowerCase().includes("italic") || it.fontName.toLowerCase().includes("oblique"));
          // Get font size from transform matrix
          const fontSize = Math.round(Math.abs(it.transform[0]));

          const styles: string[] = [];
          if (isBold) styles.push("font-weight:bold");
          if (isItalic) styles.push("font-style:italic");
          if (fontSize && fontSize !== 12 && fontSize !== 16) styles.push(`font-size:${fontSize}px`);

          if (styles.length > 0) {
            s = `<span style="${styles.join(";")}">${s}</span>`;
          } else if (isBold) {
            s = `<b>${s}</b>`;
          }
          return s;
        }).join(" ");

        const pStyle = align ? ` style="text-align:${align}"` : "";
        return `<p${pStyle}>${text}</p>`;
      }).join("");
      pages.push(pageHtml);
    }
    return pages.join("<hr/>");
  };

  const extractHtmlFromWord = async (file: File): Promise<string> => {
    try {
      const mammoth = await import("mammoth");
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer }, {
        styleMap: [
          "p[style-name='Heading 1'] => h1:fresh",
          "p[style-name='Heading 2'] => h2:fresh",
          "p[style-name='Heading 3'] => h3:fresh",
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Subtitle'] => h2:fresh",
          "b => b",
          "i => i",
          "u => u",
          "p[style-name='List Paragraph'] => li:fresh",
        ],
      });
      if (!result.value || result.value.trim() === "") {
        throw new Error("Empty result");
      }
      return result.value;
    } catch (e) {
      // Fallback: try reading as text
      const text = await file.text();
      if (text.trim()) return `<pre>${text}</pre>`;
      throw new Error(lang === "en" ? "Could not read this Word file. Only .docx format is supported." : "Impossible de lire ce fichier Word. Seul le format .docx est supporté.");
    }
  };

  const sanitizeImportedHtml = (html: string): string => {
    // Remove all layout-breaking CSS properties while keeping formatting (bold, size, etc.)
    return html
      .replace(/\s*width\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*max-width\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*min-width\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*margin-left\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*margin-right\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*margin\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*padding-left\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*padding-right\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*padding\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*position\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*left\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*right\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*top\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*bottom\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*float\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*display\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*overflow\s*:\s*[^;\"]+;?/gi, "")
      .replace(/\s*box-sizing\s*:\s*[^;\"]+;?/gi, "")
      .replace(/style="[\s;]*"/gi, "");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);
    setTranslatedDocHtml("");
    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      let html = "";
      if (ext === "pdf") {
        html = await extractHtmlFromPdf(file);
      } else if (ext === "docx" || ext === "doc") {
        html = await extractHtmlFromWord(file);
      } else {
        const text = await file.text();
        html = `<pre style="white-space:pre-wrap;word-break:break-word">${text}</pre>`;
      }
      setDocHtml(sanitizeImportedHtml(html));
    } catch {
      toast({ title: "Error", description: lang === "en" ? "Could not read file" : "Impossible de lire le fichier", variant: "destructive" });
    }
  };

  const handleTranslateDoc = async () => {
    if (!docHtml.trim()) return;
    setIsTranslatingDoc(true);
    try {
      const result = await translateText(docHtml, "auto", docTargetLang);
      setTranslatedDocHtml(result);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsTranslatingDoc(false);
    }
  };

  // --- EXPORT (HTML-aware) ---
  const htmlToFormattedText = (html: string): string => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    // Walk DOM nodes preserving structure
    const walk = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
      if (node.nodeType !== Node.ELEMENT_NODE) return "";
      const el = node as HTMLElement;
      const tag = el.tagName.toLowerCase();
      const childText = Array.from(el.childNodes).map(walk).join("");
      if (tag === "br") return "\n";
      if (tag === "p" || tag === "div" || tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6") return childText + "\n\n";
      if (tag === "li") return "• " + childText + "\n";
      if (tag === "ul" || tag === "ol") return childText + "\n";
      if (tag === "hr") return "\n---\n\n";
      return childText;
    };
    return walk(tmp).replace(/\n{3,}/g, "\n\n").trim();
  };

  const inlineStyles = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const tag = el.tagName.toLowerCase();
    const cs = window.getComputedStyle(el);
    const parts: string[] = [];
    if (cs.fontWeight === "bold" || parseInt(cs.fontWeight) >= 700) parts.push("font-weight:bold");
    if (cs.fontStyle === "italic") parts.push("font-style:italic");
    if (cs.textDecorationLine?.includes("underline") || cs.textDecoration?.includes("underline")) parts.push("text-decoration:underline");
    if (cs.textAlign && cs.textAlign !== "start") parts.push(`text-align:${cs.textAlign}`);
    const fs = parseFloat(cs.fontSize);
    if (fs && fs !== 16) parts.push(`font-size:${fs}px`);
    const style = parts.length ? ` style="${parts.join(";")}"` : "";
    const children = Array.from(el.childNodes).map(inlineStyles).join("");
    if (tag === "br") return "<br>";
    if (["p","div","h1","h2","h3","h4","h5","h6"].includes(tag)) return `<p${style}>${children}</p>`;
    if (tag === "span" || tag === "font" || tag === "b" || tag === "strong" || tag === "i" || tag === "em" || tag === "u") return `<span${style}>${children}</span>`;
    return children;
  };

  const getRenderedHtml = (rawHtml: string): string => {
    const container = document.createElement("div");
    container.style.cssText = "position:absolute;left:-9999px;font-family:Arial,sans-serif;font-size:16px;";
    container.innerHTML = rawHtml;
    document.body.appendChild(container);
    const result = Array.from(container.childNodes).map(inlineStyles).join("");
    document.body.removeChild(container);
    return result;
  };

  const exportHtmlAsFile = async (html: string, format: string) => {
    if (!html) return;
    const rendered = getRenderedHtml(html);
    const exportCss = `
      body { font-family: Arial, sans-serif; font-size: 12pt; margin: 20mm; line-height: 1.5; }
      p { margin: 0 0 6pt 0; }
    `;
    if (format === "pdf") {
      // Open a new window and trigger print dialog
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`<html><head><meta charset="utf-8"><title>Export PDF</title><style>@media print { @page { margin: 20mm; } } ${exportCss}</style></head><body>${rendered}</body></html>`);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
        }, 600);
      } else {
        // Fallback: use hidden iframe if popup blocked
        const iframe = document.createElement("iframe");
        iframe.style.cssText = "position:fixed;left:-9999px;top:-9999px;width:800px;height:600px;";
        document.body.appendChild(iframe);
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          iframeDoc.open();
          iframeDoc.write(`<html><head><meta charset="utf-8"><style>@media print { @page { margin: 20mm; } } ${exportCss}</style></head><body>${rendered}</body></html>`);
          iframeDoc.close();
          setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            setTimeout(() => document.body.removeChild(iframe), 5000);
          }, 500);
        }
      }
    } else if (format === "doc") {
      const fullHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>${exportCss}</style></head><body>${rendered}</body></html>`;
      const blob = new Blob(["\ufeff" + fullHtml], { type: "application/msword" });
      const { saveAs } = await import("file-saver");
      saveAs(blob, "translation.doc");
    } else if (format === "txt") {
      const formattedText = htmlToFormattedText(html);
      const blob = new Blob([formattedText], { type: "text/plain;charset=utf-8" });
      const { saveAs } = await import("file-saver");
      saveAs(blob, "translation.txt");
    }
    if (format !== "pdf") {
      toast({ title: lang === "en" ? "Exported!" : "Exporté !" });
    }
  };

  const ExportButtons = ({ text, isHtml = false }: { text: string; isHtml?: boolean }) => (
    <div className="flex flex-wrap gap-2">
      {isHtml ? (
        <>
          <Button variant="outline" size="sm" onClick={() => exportHtmlAsFile(text, "pdf")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportHtmlAsFile(text, "doc")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Word
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportHtmlAsFile(text, "txt")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyHtml(text)} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> {lang === "en" ? "Copy" : "Copier"}
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" size="sm" onClick={() => exportPlainAsFile(text, "pdf")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPlainAsFile(text, "doc")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Word
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportPlainAsFile(text, "txt")} className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> TXT
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyText(text)} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> {lang === "en" ? "Copy" : "Copier"}
          </Button>
        </>
      )}
    </div>
  );

  const exportPlainAsFile = async (text: string, format: string) => {
    if (!text) return;
    if (format === "pdf") {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      // Split on actual newlines to preserve formatting
      const allLines: string[] = [];
      for (const paragraph of text.split("\n")) {
        const wrapped = doc.splitTextToSize(paragraph || " ", 180);
        allLines.push(...wrapped);
      }
      doc.setFont("helvetica");
      doc.setFontSize(11);
      let y = 15;
      for (const line of allLines) {
        if (y > 280) { doc.addPage(); y = 15; }
        doc.text(line, 15, y);
        y += 6;
      }
      doc.save("translation.pdf");
    } else if (format === "doc") {
      // Convert newlines to HTML for better Word formatting
      const htmlContent = text.split("\n").map(l => `<p>${l || "&nbsp;"}</p>`).join("");
      const html = `<html><head><meta charset="utf-8"><style>body{font-family:Arial;font-size:12pt;}p{margin:0 0 6pt 0;}</style></head><body>${htmlContent}</body></html>`;
      const blob = new Blob([html], { type: "application/msword" });
      const { saveAs } = await import("file-saver");
      saveAs(blob, "translation.doc");
    } else if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const { saveAs } = await import("file-saver");
      saveAs(blob, "translation.txt");
    }
    toast({ title: lang === "en" ? "Exported!" : "Exporté !" });
  };

  const LangSelector = ({ source, target, onSourceChange, onTargetChange, onSwap }: any) => (
    <div className="flex items-center justify-center gap-4 mb-4">
      <Select value={source} onValueChange={onSourceChange}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="fr">🇫🇷 Français</SelectItem>
          <SelectItem value="en">🇬🇧 English</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="icon" onClick={onSwap}><ArrowRightLeft className="h-4 w-4" /></Button>
      <Select value={target} onValueChange={onTargetChange}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="en">🇬🇧 English</SelectItem>
          <SelectItem value="fr">🇫🇷 Français</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">
            <span className="text-gradient">{t("translation.title")}</span> {t("translation.tools")}
          </h1>
          <p className="text-muted-foreground">{t("translation.desc")}</p>
        </div>

        <Tabs defaultValue="text" className="max-w-5xl mx-auto">
          <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto mb-6">
            <TabsTrigger value="text">{t("translation.text")}</TabsTrigger>
            <TabsTrigger value="letter">{t("translation.letters")}</TabsTrigger>
            <TabsTrigger value="document">{t("translation.documents")}</TabsTrigger>
          </TabsList>

          {/* ===== TEXT TAB ===== */}
          <TabsContent value="text">
            <div className="glass-card rounded-xl p-6">
              <LangSelector source={sourceLang} target={targetLang} onSourceChange={setSourceLang} onTargetChange={setTargetLang} onSwap={swapLangs} />
              <div className="grid md:grid-cols-2 gap-4">
                <Textarea placeholder={t("translation.enterText")} className="min-h-[200px] resize-none" value={sourceText} onChange={(e) => setSourceText(e.target.value)} />
                <div className="relative">
                  <Textarea placeholder={t("translation.result")} className="min-h-[200px] resize-none bg-muted/50" value={translatedText} readOnly />
                  {translatedText && (
                    <div className="absolute bottom-3 right-3">
                      <Button variant="ghost" size="icon" onClick={() => copyText(translatedText)}><Copy className="h-4 w-4" /></Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <Button onClick={handleTranslate} disabled={isTranslating || !sourceText.trim()} className="gap-2 px-8">
                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  {t("translation.translate")}
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* ===== LETTERS TAB ===== */}
          <TabsContent value="letter">
            <div className="glass-card rounded-xl p-6 space-y-6">
              {/* Category cards */}
              <div>
                <h3 className="font-serif font-semibold mb-3">{lang === "en" ? "Choose a letter type" : "Choisir un type de lettre"}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {LETTER_CATEGORIES.map((cat) => (
                    <Card
                      key={cat.id}
                      className={`cursor-pointer transition-colors group ${expandedCategory === cat.id ? "border-primary ring-1 ring-primary/30" : "hover:border-primary/50"}`}
                      onClick={() => setExpandedCategory(expandedCategory === cat.id ? null : cat.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <cat.icon className="h-8 w-8 mx-auto mb-2 text-primary group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-medium">{cat.label[lang === "fr" ? "fr" : "en"]}</p>
                        {expandedCategory === cat.id ? (
                          <ChevronUp className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mx-auto mt-1 text-muted-foreground" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Expanded templates */}
              {expandedCategory && (
                <div className="border border-border rounded-lg p-4 bg-muted/30">
                  <h4 className="font-serif font-medium mb-3 text-sm">
                    {lang === "en" ? "Select a template:" : "Sélectionner un modèle :"}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {LETTER_CATEGORIES.find((c) => c.id === expandedCategory)?.templates.map((tpl) => (
                      <Button
                        key={tpl.id}
                        variant="outline"
                        className="justify-start gap-2 h-auto py-2 text-left"
                        onClick={() => selectTemplate(tpl)}
                      >
                        <tpl.icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-xs">{tpl.label[lang === "fr" ? "fr" : "en"]}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <LangSelector
                source={letterSourceLang}
                target={letterTargetLang}
                onSourceChange={setLetterSourceLang}
                onTargetChange={setLetterTargetLang}
                onSwap={() => {
                  setLetterSourceLang(letterTargetLang);
                  setLetterTargetLang(letterSourceLang);
                  setLetterHtml(translatedLetterHtml);
                  setTranslatedLetterHtml(letterHtml);
                }}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <RichTextEditor
                  value={letterHtml}
                  onChange={setLetterHtml}
                  placeholder={lang === "en" ? "Write or edit your letter here..." : "Rédigez ou modifiez votre lettre ici..."}
                />
                <RichTextEditor
                  value={translatedLetterHtml}
                  onChange={setTranslatedLetterHtml}
                  placeholder={lang === "en" ? "Translated letter will appear here..." : "La lettre traduite apparaîtra ici..."}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Button onClick={handleTranslateLetter} disabled={isTranslatingLetter || !letterHtml.trim()} className="gap-2 px-8">
                  {isTranslatingLetter ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                  {t("translation.translate")}
                </Button>
                {translatedLetterHtml && <ExportButtons text={translatedLetterHtml} isHtml />}
              </div>
            </div>
          </TabsContent>

          {/* ===== DOCUMENTS TAB ===== */}
          <TabsContent value="document">
            <div className="glass-card rounded-xl p-6 space-y-6">
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv,.md,.html,.xml,.json,.pdf,.doc,.docx" onChange={handleFileUpload} />

              <div
                className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="font-serif font-semibold text-lg mb-2">
                  {lang === "en" ? "Upload a file to translate" : "Téléverser un fichier à traduire"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {lang === "en" ? "Supports PDF, Word, TXT, CSV, MD, HTML, XML, JSON" : "Supporte PDF, Word, TXT, CSV, MD, HTML, XML, JSON"}
                </p>
              </div>

              {docHtml && (
                <>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{docFileName}</span>
                    <Button variant="ghost" size="sm" onClick={() => { setDocHtml(""); setTranslatedDocHtml(""); setDocFileName(""); }}>
                      {lang === "en" ? "Remove" : "Supprimer"}
                    </Button>
                  </div>

                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm font-medium">{lang === "en" ? "Translate to:" : "Traduire en :"}</span>
                    <Select value={docTargetLang} onValueChange={setDocTargetLang}>
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇬🇧 English</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <RichTextEditor
                      value={docHtml}
                      onChange={setDocHtml}
                      placeholder={lang === "en" ? "File content..." : "Contenu du fichier..."}
                    />
                    <RichTextEditor
                      value={translatedDocHtml}
                      onChange={setTranslatedDocHtml}
                      placeholder={lang === "en" ? "Translation will appear here..." : "La traduction apparaîtra ici..."}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Button onClick={handleTranslateDoc} disabled={isTranslatingDoc || !docHtml.trim()} className="gap-2 px-8">
                      {isTranslatingDoc ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                      {t("translation.translate")}
                    </Button>
                    {translatedDocHtml && <ExportButtons text={translatedDocHtml} isHtml />}
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default Translation;
