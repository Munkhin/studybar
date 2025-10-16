import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCw, Check, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  subject: string;
}

const sampleFlashcards: Flashcard[] = [
  {
    id: 1,
    question: "What is the derivative of x²?",
    answer: "2x",
    subject: "Calculus",
  },
  {
    id: 2,
    question: "Define photosynthesis",
    answer: "The process by which plants convert light energy into chemical energy",
    subject: "Biology",
  },
  {
    id: 3,
    question: "What is a metaphor?",
    answer: "A figure of speech that makes a comparison between two unlike things without using 'like' or 'as'",
    subject: "English",
  },
];

const Flashcards = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<number[]>([]);
  const [difficultCards, setDifficultCards] = useState<number[]>([]);

  const currentCard = sampleFlashcards[currentIndex];
  const progress = ((currentIndex + 1) / sampleFlashcards.length) * 100;

  const handleNext = () => {
    if (currentIndex < sampleFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const markAsMastered = () => {
    if (!masteredCards.includes(currentCard.id)) {
      setMasteredCards([...masteredCards, currentCard.id]);
    }
    handleNext();
  };

  const markAsDifficult = () => {
    if (!difficultCards.includes(currentCard.id)) {
      setDifficultCards([...difficultCards, currentCard.id]);
    }
    handleNext();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold text-foreground mb-2">Flashcards</h1>
          <p className="text-muted-foreground text-lg">
            Master your subjects one card at a time
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              Card {currentIndex + 1} of {sampleFlashcards.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-secondary/10 border-secondary/20">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-secondary" />
              <div>
                <p className="text-sm text-muted-foreground">Mastered</p>
                <p className="text-2xl font-bold text-secondary">{masteredCards.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-warning/10 border-warning/20">
            <div className="flex items-center gap-2">
              <X className="w-5 h-5 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Need Practice</p>
                <p className="text-2xl font-bold text-warning">{difficultCards.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Flashcard */}
        <div
          className="relative h-96 mb-6 cursor-pointer perspective-1000 animate-scale-in"
          onClick={handleFlip}
        >
          <div
            className={`absolute w-full h-full transition-all duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
          >
            {/* Front */}
            <Card
              className={`absolute w-full h-full p-8 flex flex-col items-center justify-center backface-hidden border-2 ${
                isFlipped ? "invisible" : "visible"
              }`}
            >
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                  {currentCard.subject}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Question</h3>
              <p className="text-xl text-center text-foreground">{currentCard.question}</p>
              <p className="text-sm text-muted-foreground mt-8">Click to reveal answer</p>
            </Card>

            {/* Back */}
            <Card
              className={`absolute w-full h-full p-8 flex flex-col items-center justify-center backface-hidden border-2 bg-accent/5 rotate-y-180 ${
                isFlipped ? "visible" : "invisible"
              }`}
            >
              <div className="mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent">
                  {currentCard.subject}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-center mb-4">Answer</h3>
              <p className="text-xl text-center text-foreground">{currentCard.answer}</p>
              <p className="text-sm text-muted-foreground mt-8">Click to see question</p>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleFlip} className="gap-2">
              <RotateCw className="w-4 h-4" />
              Flip
            </Button>
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === sampleFlashcards.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Answer Buttons */}
        {isFlipped && (
          <div className="flex gap-4 mt-6 animate-fade-in">
            <Button
              onClick={markAsDifficult}
              variant="outline"
              className="flex-1 border-warning/50 hover:bg-warning/10 gap-2"
            >
              <X className="w-4 h-4" />
              Need Practice
            </Button>
            <Button
              onClick={markAsMastered}
              className="flex-1 bg-secondary hover:bg-secondary/90 gap-2"
            >
              <Check className="w-4 h-4" />
              Mastered
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Flashcards;
