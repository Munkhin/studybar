import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Calendar, BookOpen, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockErrors = [
  {
    id: 1,
    subject: "Mathematics",
    topic: "Calculus",
    question: "Find the derivative of x²",
    userAnswer: "x",
    correctAnswer: "2x",
    date: "2024-10-01",
    attempts: 3,
  },
  {
    id: 2,
    subject: "Physics",
    topic: "Mechanics",
    question: "Calculate force when mass = 5kg and acceleration = 2m/s²",
    userAnswer: "7N",
    correctAnswer: "10N",
    date: "2024-10-02",
    attempts: 2,
  },
  {
    id: 3,
    subject: "Computer Science",
    topic: "Algorithms",
    question: "What is the time complexity of binary search?",
    userAnswer: "O(n)",
    correctAnswer: "O(log n)",
    date: "2024-10-03",
    attempts: 1,
  },
];

const ErrorLog = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <AlertCircle className="h-8 w-8 text-accent" />
                Error Log
              </h1>
              <p className="text-muted-foreground mt-1">Track and learn from your mistakes</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Errors</TabsTrigger>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="topical">By Topic</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <Card className="p-4 bg-muted/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent-light">
                    <TrendingDown className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mockErrors.length}</p>
                    <p className="text-sm text-muted-foreground">Total errors this week</p>
                  </div>
                </div>
              </Card>

              {mockErrors.map((error) => (
                <Card key={error.id} className="p-6 hover:shadow-lg transition-all duration-200">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{error.subject}</Badge>
                          <Badge variant="secondary">{error.topic}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(error.date).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-semibold text-lg">{error.question}</h3>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-destructive text-destructive"
                      >
                        {error.attempts} attempts
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                        <p className="text-sm font-medium text-destructive mb-2">Your Answer</p>
                        <p className="text-foreground">{error.userAnswer}</p>
                      </div>
                      <div className="p-4 rounded-lg bg-success/5 border border-success/20">
                        <p className="text-sm font-medium text-success mb-2">Correct Answer</p>
                        <p className="text-foreground">{error.correctAnswer}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Review Topic
                      </Button>
                      <Button variant="outline" size="sm">
                        Practice Similar
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Errors by Day
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="font-medium">Monday, Oct 1</span>
                    <Badge>1 error</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="font-medium">Tuesday, Oct 2</span>
                    <Badge>1 error</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <span className="font-medium">Wednesday, Oct 3</span>
                    <Badge>1 error</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="topical" className="space-y-4">
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-secondary" />
                  Errors by Topic
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">Calculus</p>
                      <p className="text-sm text-muted-foreground">Mathematics</p>
                    </div>
                    <Badge>1 error</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">Mechanics</p>
                      <p className="text-sm text-muted-foreground">Physics</p>
                    </div>
                    <Badge>1 error</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div>
                      <p className="font-medium">Algorithms</p>
                      <p className="text-sm text-muted-foreground">Computer Science</p>
                    </div>
                    <Badge>1 error</Badge>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ErrorLog;
