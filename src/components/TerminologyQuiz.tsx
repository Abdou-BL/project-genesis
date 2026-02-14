import { useState, useEffect } from "react";
import { Brain, CheckCircle2, XCircle, Loader2, History, Trophy, RotateCcw, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuizQuestion {
  type: "multiple_choice" | "fill_blank" | "match_definition";
  question: string;
  options?: string[];
  correct_answer: string;
  suggestions?: string[];
  match_pairs?: { left: string; right: string }[];
}

interface QuizResult {
  id: string;
  quiz_type: string;
  total_questions: number;
  correct_answers: number;
  created_at: string;
  questions: any;
}

interface Term {
  fr: string;
  en: string;
  category: string;
  definition_fr?: string;
  definition_en?: string;
  example_fr?: string;
  example_en?: string;
}

interface Props {
  allTerms: Term[];
}

const TerminologyQuiz = ({ allTerms }: Props) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState<Record<number, boolean>>({});
  const [quizDone, setQuizDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fillInput, setFillInput] = useState("");
  const [history, setHistory] = useState<QuizResult[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  // Matching state
  const [matchSelections, setMatchSelections] = useState<Record<number, number | null>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<number, number>>({});
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [shuffledRightPairs, setShuffledRightPairs] = useState<{ left: string; right: string }[]>([]);
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchHistory = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);
    if (data) setHistory(data as QuizResult[]);
  };

  useEffect(() => { fetchHistory(); }, [user]);

  // Stable shuffled right column for match quiz - shuffle once per question change
  const currentQuestion = questions[currentIdx];
  useEffect(() => {
    if (currentQuestion?.match_pairs && currentQuestion.match_pairs.length > 0) {
      setShuffledRightPairs([...currentQuestion.match_pairs].sort(() => Math.random() - 0.5));
    }
  }, [currentIdx, questions]);

  const generateQuiz = async () => {
    if (allTerms.length < 4) {
      toast({ title: lang === "en" ? "Need at least 4 terms" : "Il faut au moins 4 termes", variant: "destructive" });
      return;
    }
    setLoading(true);
    setQuestions([]);
    setCurrentIdx(0);
    setAnswers({});
    setShowResult({});
    setQuizDone(false);
    setFillInput("");
    setMatchSelections({});
    setMatchAnswers({});
    setSelectedLeft(null);

    try {
      const shuffled = [...allTerms].sort(() => Math.random() - 0.5).slice(0, 15);
      const { data, error } = await supabase.functions.invoke("generate-quiz", {
        body: { terms: shuffled, lang },
      });
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      // Post-process: add suggestions for fill_blank, generate match_pairs for match_definition
      const processed = (data.questions || []).map((q: QuizQuestion) => {
        if (q.type === "fill_blank" && !q.suggestions) {
          // Generate suggestions: correct answer + 3 random distractors from terms
          const correct = q.correct_answer;
          const distractors = shuffled
            .map(t => lang === "fr" ? t.fr : t.en)
            .filter(t => t.toLowerCase() !== correct.toLowerCase())
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
          q.suggestions = [correct, ...distractors].sort(() => Math.random() - 0.5);
        }
        if (q.type === "match_definition") {
          // Generate match pairs: pick 3-4 terms, show FR left and EN right (or term-definition)
          const pairCount = Math.min(4, shuffled.length);
          const pairTerms = shuffled.sort(() => Math.random() - 0.5).slice(0, pairCount);
          q.match_pairs = pairTerms.map(t => ({
            left: t.fr,
            right: t.en,
          }));
        }
        return q;
      });

      setQuestions(processed);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentIdx]: answer }));
    setShowResult(prev => ({ ...prev, [currentIdx]: true }));
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setFillInput("");
      setSelectedLeft(null);
      setMatchSelections({});
      setMatchAnswers({});
    } else {
      finishQuiz(questions.length);
    }
  };

  const answeredCount = Object.keys(answers).length;

  const getCorrectCount = (upTo?: number) => {
    const limit = upTo ?? questions.length;
    return Object.entries(answers).filter(
      ([idx, ans]) => {
        const i = parseInt(idx);
        if (i >= limit) return false;
        return ans.toLowerCase().trim() === questions[i]?.correct_answer?.toLowerCase().trim();
      }
    ).length;
  };

  const correctCount = getCorrectCount();

  const stopQuiz = () => {
    // Answer current question if not answered yet with empty to mark as attempted
    finishQuiz(currentIdx + (showResult[currentIdx] ? 1 : 0));
  };

  const finishQuiz = async (totalAnswered?: number) => {
    const total = totalAnswered ?? questions.length;
    setQuizDone(true);
    if (!user) return;
    const correct = getCorrectCount(total);
    const questionsWithAnswers = questions.slice(0, total).map((q, i) => ({
      ...q,
      user_answer: answers[i] || "",
      is_correct: (answers[i] || "").toLowerCase().trim() === q.correct_answer.toLowerCase().trim(),
    }));
    await supabase.from("quiz_results").insert({
      user_id: user.id,
      quiz_type: "mixed",
      total_questions: total,
      correct_answers: correct,
      questions: questionsWithAnswers,
    });
    fetchHistory();
  };

  const q = currentQuestion;

  // -- No quiz started
  if (questions.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            {lang === "en" ? "Terminology Quiz" : "Quiz Terminologique"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {lang === "en"
              ? "Test your knowledge with AI-generated quizzes based on the terminology bank."
              : "Testez vos connaissances avec des quiz générés par IA basés sur la banque terminologique."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generateQuiz} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              {lang === "en" ? "Start Quiz" : "Commencer le quiz"}
            </Button>
            <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={fetchHistory}>
                  <History className="h-4 w-4" />
                  {lang === "en" ? "History" : "Historique"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{lang === "en" ? "Quiz History" : "Historique des quiz"}</DialogTitle>
                </DialogHeader>
                {history.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    {lang === "en" ? "No quizzes taken yet." : "Aucun quiz passé pour le moment."}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium">
                            {h.correct_answers}/{h.total_questions} {lang === "en" ? "correct" : "correctes"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", {
                              day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                            })}
                          </p>
                        </div>
                        <Badge variant={h.correct_answers / h.total_questions >= 0.7 ? "default" : "secondary"}>
                          {Math.round((h.correct_answers / h.total_questions) * 100)}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
          {history.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary" />
              {lang === "en" ? `${history.length} quizzes completed` : `${history.length} quiz complétés`}
              {" · "}
              {lang === "en" ? "Best:" : "Meilleur :"}
              {" "}
              {Math.max(...history.map(h => Math.round((h.correct_answers / h.total_questions) * 100)))}%
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // -- Quiz done
  if (quizDone) {
    const answeredQuestions = questions.slice(0, Math.max(answeredCount, 1));
    const totalAnswered = answeredQuestions.length;
    const finalCorrect = getCorrectCount(totalAnswered);
    const pct = totalAnswered > 0 ? Math.round((finalCorrect / totalAnswered) * 100) : 0;
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            {lang === "en" ? "Quiz Complete!" : "Quiz terminé !"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary">{pct}%</p>
            <p className="text-muted-foreground">
              {finalCorrect}/{totalAnswered} {lang === "en" ? "correct answers" : "réponses correctes"}
            </p>
            {totalAnswered < questions.length && (
              <p className="text-xs text-muted-foreground mt-1">
                {lang === "en" ? `(Stopped at question ${totalAnswered}/${questions.length})` : `(Arrêté à la question ${totalAnswered}/${questions.length})`}
              </p>
            )}
          </div>
          <Progress value={pct} className="h-3" />
          <div className="space-y-2">
            {answeredQuestions.map((q, i) => {
              const isCorrect = (answers[i] || "").toLowerCase().trim() === q.correct_answer.toLowerCase().trim();
              return (
                <div key={i} className={`flex items-start gap-2 p-2 rounded text-sm ${isCorrect ? "bg-green-500/10" : "bg-red-500/10"}`}>
                  {isCorrect ? <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <div className="min-w-0">
                    <p className="break-words">{q.question}</p>
                    {!isCorrect && <p className="text-xs text-muted-foreground mt-1">{lang === "en" ? "Correct:" : "Correct :"} {q.correct_answer}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <Button onClick={generateQuiz} className="w-full gap-2">
            <RotateCcw className="h-4 w-4" />
            {lang === "en" ? "New Quiz" : "Nouveau quiz"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // -- Active quiz
  const isAnswered = showResult[currentIdx];
  const isCorrect = isAnswered && (answers[currentIdx] || "").toLowerCase().trim() === q?.correct_answer?.toLowerCase().trim();


  // Matching UI for match_definition with pairs
  const renderMatchPairs = () => {
    if (!q?.match_pairs || q.match_pairs.length === 0) return null;
    const pairs = q.match_pairs;

    return (
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground">
          {lang === "en" ? "Click a term on the left, then its match on the right:" : "Cliquez sur un terme à gauche, puis sa correspondance à droite :"}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {/* Left column */}
          <div className="space-y-2">
            {pairs.map((p, i) => (
              <Button
                key={`l-${i}`}
                variant={selectedLeft === i ? "default" : "outline"}
                className={`w-full justify-start text-left h-auto min-h-[40px] py-2 px-3 text-sm whitespace-normal break-words overflow-hidden ${matchAnswers[i] !== undefined ? "opacity-50 pointer-events-none" : ""}`}
                disabled={isAnswered}
                onClick={() => setSelectedLeft(i)}
              >
                <span className="line-clamp-3 break-words">{p.left}</span>
              </Button>
            ))}
          </div>
          {/* Right column */}
          <div className="space-y-2">
            {shuffledRightPairs.map((p, i) => {
              const rightIdx = pairs.findIndex(pr => pr.right === p.right);
              const isMatched = Object.values(matchAnswers).includes(rightIdx);
              return (
                <Button
                  key={`r-${i}`}
                  variant="outline"
                  className={`w-full justify-start text-left h-auto min-h-[40px] py-2 px-3 text-sm whitespace-normal break-words overflow-hidden ${isMatched ? "opacity-50 pointer-events-none" : ""}`}
                  disabled={isAnswered || isMatched}
                  onClick={() => {
                    if (selectedLeft === null) return;
                    const newMatchAnswers = { ...matchAnswers, [selectedLeft]: rightIdx };
                    setMatchAnswers(newMatchAnswers);
                    setSelectedLeft(null);
                    // If all matched, auto-submit
                    if (Object.keys(newMatchAnswers).length === pairs.length) {
                      const allCorrect = Object.entries(newMatchAnswers).every(([li, ri]) => parseInt(li) === ri);
                      answerQuestion(allCorrect ? q.correct_answer : "wrong_match");
                    }
                  }}
                >
                  <span className="line-clamp-3 break-words">{p.right}</span>
                </Button>
              );
            })}
          </div>
        </div>
        {Object.keys(matchAnswers).length > 0 && Object.keys(matchAnswers).length < pairs.length && (
          <p className="text-xs text-muted-foreground">
            {Object.keys(matchAnswers).length}/{pairs.length} {lang === "en" ? "matched" : "associés"}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {lang === "en" ? "Quiz" : "Quiz"}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currentIdx + 1}/{questions.length}</Badge>
            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive gap-1" onClick={stopQuiz}>
              <StopCircle className="h-4 w-4" />
              <span className="hidden sm:inline">{lang === "en" ? "Stop" : "Arrêter"}</span>
            </Button>
          </div>
        </div>
        <Progress value={((currentIdx + (isAnswered ? 1 : 0)) / questions.length) * 100} className="h-2 mt-2" />
        <p className="text-xs text-muted-foreground mt-1">
          {correctCount} {lang === "en" ? "correct so far" : "correctes jusqu'ici"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Badge variant="secondary" className="mb-2 text-xs">
            {q?.type === "multiple_choice" ? (lang === "en" ? "Multiple Choice" : "Choix multiple") :
             q?.type === "fill_blank" ? (lang === "en" ? "Fill the Blank" : "Compléter") :
             (lang === "en" ? "Match Terms" : "Associer les termes")}
          </Badge>
          <p className="text-sm font-medium break-words">{q?.question}</p>
        </div>

        {/* Multiple choice / standard match_definition with options */}
        {(q?.type === "multiple_choice" || (q?.type === "match_definition" && !q?.match_pairs)) && q?.options && (
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let cls = "w-full justify-start text-left h-auto py-2.5 px-3";
              if (isAnswered) {
                if (opt.toLowerCase().trim() === q.correct_answer.toLowerCase().trim()) {
                  cls += " border-green-500 bg-green-500/10 text-green-700";
                } else if (opt === answers[currentIdx] && !isCorrect) {
                  cls += " border-red-500 bg-red-500/10 text-red-700";
                }
              }
              return (
                <Button key={i} variant="outline" className={cls} disabled={isAnswered} onClick={() => answerQuestion(opt)}>
                  <span className="break-words text-sm">{opt}</span>
                </Button>
              );
            })}
          </div>
        )}

        {/* Match pairs for match_definition */}
        {q?.type === "match_definition" && q?.match_pairs && renderMatchPairs()}

        {/* Fill blank with suggestions */}
        {q?.type === "fill_blank" && (
          <div className="space-y-2">
            <Input
              value={fillInput}
              onChange={e => setFillInput(e.target.value)}
              placeholder={lang === "en" ? "Type your answer..." : "Tapez votre réponse..."}
              disabled={isAnswered}
              onKeyDown={e => { if (e.key === "Enter" && fillInput.trim() && !isAnswered) answerQuestion(fillInput.trim()); }}
            />
            {/* Suggestion chips */}
            {!isAnswered && q.suggestions && q.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground self-center">{lang === "en" ? "Suggestions:" : "Suggestions :"}</span>
                {q.suggestions.map((s, i) => (
                  <Button key={i} size="sm" variant="outline" className="text-xs h-7 px-2" onClick={() => { setFillInput(s); }}>
                    {s}
                  </Button>
                ))}
              </div>
            )}
            {!isAnswered && (
              <Button size="sm" onClick={() => answerQuestion(fillInput.trim())} disabled={!fillInput.trim()}>
                {lang === "en" ? "Submit" : "Valider"}
              </Button>
            )}
            {isAnswered && !isCorrect && (
              <p className="text-xs text-muted-foreground">
                {lang === "en" ? "Correct answer:" : "Réponse correcte :"} <strong>{q.correct_answer}</strong>
              </p>
            )}
          </div>
        )}

        {isAnswered && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <><CheckCircle2 className="h-5 w-5 text-green-500" /><span className="text-sm text-green-600 font-medium">{lang === "en" ? "Correct!" : "Correct !"}</span></>
              ) : (
                <><XCircle className="h-5 w-5 text-red-500" /><span className="text-sm text-red-600 font-medium">{lang === "en" ? "Incorrect" : "Incorrect"}</span></>
              )}
            </div>
            <Button size="sm" onClick={nextQuestion}>
              {currentIdx < questions.length - 1 ? (lang === "en" ? "Next" : "Suivant") : (lang === "en" ? "Finish" : "Terminer")}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TerminologyQuiz;
