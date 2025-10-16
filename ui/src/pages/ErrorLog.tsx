import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingDown, TrendingUp, Target } from "lucide-react";
import { useEffect, useState } from "react";

interface ErrorEntry {
  id: number;
  subject: string;
  topic: string;
  question: string;
  mistake: string;
  suggestion: string;
  date: string;
  severity: "high" | "medium" | "low";
}

// dynamic errors loaded from backend
const ErrorLog = () => {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/errors`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load errors");
        const data = await res.json();
        if (data.status === "ok") {
          // map DB rows to ErrorEntry shape as best-effort
          const mapped = data.errors.map((e: any, idx: number) => ({
            id: idx + 1,
            subject: "", // subject not stored in DB row; leave blank
            topic: e.topic || "",
            question: e.question || "",
            mistake: e.answer || "",
            suggestion: e.feedback || "",
            date: e.date || "",
            severity: "medium" as const,
          }));
          setErrors(mapped as ErrorEntry[]);
        } else {
          setErrors([]);
        }
      })
      .catch(() => setErrors([]))
      .finally(() => setLoading(false));
  }, []);
  const severityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-warning/10 text-warning border-warning/20",
    low: "bg-secondary/10 text-secondary border-secondary/20",
  };

  const stats = {
    totalErrors: errors.length,
    highSeverity: errors.filter((e) => e.severity === "high").length,
    improvement: 15,
    commonMistake: "Formula application",
  };

  const renderedAll = loading ? (
    <div className="text-center text-muted-foreground">Loading...</div>
  ) : (
    errors.map((error, index) => (
      <Card
        key={error.id}
        className={`p-6 border-2 ${severityColors[error.severity]} animate-fade-in`}
        style={{ animationDelay: `${index * 0.1}s` }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">{error.subject}</Badge>
              <Badge variant="secondary">{error.topic}</Badge>
              <Badge variant={error.severity === "high" ? "destructive" : "secondary"}>
                {error.severity}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{error.question}</h3>
          </div>
          <span className="text-xs text-muted-foreground">{error.date}</span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-destructive mb-1">❌ What went wrong:</p>
            <p className="text-sm text-muted-foreground">{error.mistake}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-secondary mb-1">💡 How to improve:</p>
            <p className="text-sm text-muted-foreground">{error.suggestion}</p>
          </div>
        </div>
      </Card>
    ))
  );

  const renderedHigh = loading ? (
    <div className="text-center text-muted-foreground">Loading...</div>
  ) : (
    errors
      .filter((e) => e.severity === "high")
      .map((error) => (
        <Card key={error.id} className={`p-6 border-2 ${severityColors[error.severity]}`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline">{error.subject}</Badge>
                <Badge variant="secondary">{error.topic}</Badge>
                <Badge variant="destructive">{error.severity}</Badge>
              </div>
              <h3 className="font-semibold text-lg mb-2">{error.question}</h3>
            </div>
            <span className="text-xs text-muted-foreground">{error.date}</span>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-destructive mb-1">❌ What went wrong:</p>
              <p className="text-sm text-muted-foreground">{error.mistake}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-secondary mb-1">💡 How to improve:</p>
              <p className="text-sm text-muted-foreground">{error.suggestion}</p>
            </div>
          </div>
        </Card>
      ))
  );

  const renderedRecent = loading ? (
    <div className="text-center text-muted-foreground">Loading...</div>
  ) : (
    errors.slice(0, 2).map((error) => (
      <Card key={error.id} className={`p-6 border-2 ${severityColors[error.severity]}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline">{error.subject}</Badge>
              <Badge variant="secondary">{error.topic}</Badge>
              <Badge variant={error.severity === "high" ? "destructive" : "secondary"}>
                {error.severity}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg mb-2">{error.question}</h3>
          </div>
          <span className="text-xs text-muted-foreground">{error.date}</span>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-destructive mb-1">❌ What went wrong:</p>
            <p className="text-sm text-muted-foreground">{error.mistake}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-secondary mb-1">💡 How to improve:</p>
            <p className="text-sm text-muted-foreground">{error.suggestion}</p>
          </div>
        </div>
      </Card>
    ))
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Error Log</h1>
          <p className="text-muted-foreground text-lg">
            Learn from your mistakes and track your improvement
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Errors</p>
                <p className="text-3xl font-bold">{stats.totalErrors}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6 border-2 border-destructive/20 bg-destructive/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">High Priority</p>
                <p className="text-3xl font-bold text-destructive">{stats.highSeverity}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-destructive" />
            </div>
          </Card>

          <Card className="p-6 border-2 border-secondary/20 bg-secondary/5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Improvement</p>
                <p className="text-3xl font-bold text-secondary">+{stats.improvement}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-secondary" />
            </div>
          </Card>

          <Card className="p-6 border-2">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Focus Area</p>
                <p className="text-sm font-semibold mt-2">Formula Application</p>
              </div>
              <Target className="w-8 h-8 text-primary" />
            </div>
          </Card>
        </div>

        {/* Tabs for filtering */}
        <Tabs defaultValue="all" className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Errors</TabsTrigger>
            <TabsTrigger value="high">High Priority</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6 space-y-4">
            {renderedAll}
          </TabsContent>

          <TabsContent value="high" className="mt-6 space-y-4">
            {renderedHigh}
          </TabsContent>

          <TabsContent value="recent" className="mt-6 space-y-4">
            {renderedRecent}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ErrorLog;
