import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SubjectSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (subject: string, topic: string) => void;
}

const subjects = [
  {
    name: "Mathematics",
    topics: ["Calculus", "Algebra", "Geometry", "Trigonometry", "Statistics"],
  },
  {
    name: "English",
    topics: ["Grammar", "Literature", "Writing", "Reading Comprehension"],
  },
  {
    name: "Science",
    topics: ["Physics", "Chemistry", "Biology", "Earth Science"],
  },
  {
    name: "History",
    topics: ["World History", "US History", "European History", "Ancient Civilizations"],
  },
];

export const SubjectSelectionDialog = ({
  open,
  onOpenChange,
  onConfirm,
}: SubjectSelectionDialogProps) => {
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [selectedTopic, setSelectedTopic] = useState<string>("");

  const currentTopics = subjects.find((s) => s.name === selectedSubject)?.topics || [];

  const handleConfirm = () => {
    if (selectedSubject && selectedTopic) {
      onConfirm(selectedSubject, selectedTopic);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose Your Study Session</DialogTitle>
          <DialogDescription>
            Select the subject and topic you want to work on today.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.name} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Select
              value={selectedTopic}
              onValueChange={setSelectedTopic}
              disabled={!selectedSubject}
            >
              <SelectTrigger id="topic">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {currentTopics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedSubject || !selectedTopic}
            className="bg-primary hover:bg-primary/90"
          >
            Start Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
