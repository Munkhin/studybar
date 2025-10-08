import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, X, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFlashcardJob } from "@/hooks/useFlashcards";

const Flashcards = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);

  const { jobId, status, flashcards, error, uploadPdf } = useFlashcardJob();

  const handleFile = async (file?: File) => {
    if (!file) return;
    // start processing immediately
    await uploadPdf(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFile(f);
  };

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);
    setTimeout(() => {
      setSwipeDirection(null);
      setIsFlipped(false);
      if (!flashcards) return;
      setCurrentIndex((prev) => (prev + 1) % flashcards.length);
    }, 300);
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    if (!flashcards) return;
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const handleNext = () => {
    setIsFlipped(false);
    if (!flashcards) return;
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const currentCard = flashcards && flashcards.length > 0 ? flashcards[currentIndex] : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Flashcards</h1>
              <p className="text-muted-foreground mt-1">
                {flashcards ? `Card ${currentIndex + 1} of ${flashcards.length}` : "No flashcards yet"}
              </p>
            </div>
            <div className="flex gap-2">
              <input type="file" accept="application/pdf" ref={fileInputRef} onChange={handleFileInput} hidden />
              <Button size="icon" variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="outline">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative min-h-[400px] flex items-center justify-center">
            <Card
              className={cn(
                "w-full h-[400px] cursor-pointer transition-all duration-300 perspective-1000",
                swipeDirection === "left" && "animate-slide-out-left",
                swipeDirection === "right" && "animate-slide-out-right"
              )}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={cn(
                  "relative w-full h-full transition-transform duration-500 transform-style-3d",
                  isFlipped && "rotate-y-180"
                )}
              >
                <div className="absolute inset-0 p-8 flex items-center justify-center backface-hidden">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground font-medium">QUESTION</p>
                    <p className="text-2xl font-semibold">{currentCard ? currentCard.front : "Upload a PDF to start"}</p>
                    <p className="text-sm text-muted-foreground italic">Click to reveal answer</p>
                  </div>
                </div>

                <div className="absolute inset-0 p-8 flex items-center justify-center backface-hidden rotate-y-180 bg-primary-light">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-primary font-medium">ANSWER</p>
                    <p className="text-2xl font-semibold text-primary">{currentCard ? currentCard.back : ""}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ArrowLeft className="h-5 w-5" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => handleSwipe("left")}
            >
              <X className="h-5 w-5" />
              Review Later
            </Button>

            <Button
              size="lg"
              className="gap-2 bg-success hover:bg-success/90"
              onClick={() => handleSwipe("right")}
            >
              <Check className="h-5 w-5" />
              Understood
            </Button>

            <Button variant="outline" size="icon" onClick={handleNext}>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {status ? `Status: ${status}` : "Idle"} {error && ` — Error: ${error}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcards;
