import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const mockProgress = [
  { subject: "Mathematics", progress: 75, studied: 45, total: 60 },
  { subject: "Physics", progress: 60, studied: 30, total: 50 },
  { subject: "Computer Science", progress: 85, studied: 51, total: 60 },
];

const nextTasks = [
  { subject: "Mathematics", topic: "Calculus", task: "Review derivatives", priority: "high" },
  { subject: "Physics", topic: "Mechanics", task: "Practice force problems", priority: "medium" },
];

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Here's your study progress overview</p>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              Progress by Subject
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockProgress.map((item) => (
              <Card key={item.subject} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{item.subject}</h3>
                    <span className="text-2xl font-bold text-primary">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {item.studied} of {item.total} topics completed
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-secondary" />
              Next Things to Work On
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {nextTasks.map((task, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-200">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            task.priority === "high"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{task.subject}</h3>
                      <p className="text-sm text-muted-foreground">{task.topic}</p>
                    </div>
                  </div>
                  <p className="text-foreground">{task.task}</p>
                  <Button className="w-full" variant="outline">
                    Start Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">Quick Access</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link to="/flashcards">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary-light">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Flashcards</h3>
                    <p className="text-sm text-muted-foreground">Practice with cards</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/tutorgpt">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-secondary">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-secondary-light">
                    <svg
                      className="h-6 w-6 text-secondary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">TutorGPT</h3>
                    <p className="text-sm text-muted-foreground">Get AI assistance</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/error-log">
              <Card className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-accent">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-accent-light">
                    <svg
                      className="h-6 w-6 text-accent"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Error Log</h3>
                    <p className="text-sm text-muted-foreground">Review mistakes</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
