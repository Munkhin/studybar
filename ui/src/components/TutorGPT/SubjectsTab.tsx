import React, { useState } from "react";
import { useSubjectContext } from "../../contexts/SubjectContext";
import { ChevronRight, X, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export const SubjectsTab: React.FC = () => {
  const {
    subjects,
    selectedSubject,
    selectedTopic,
    addSubject,
    removeSubject,
    addTopic,
    removeTopic,
    selectTopic,
  } = useSubjectContext();

  const [subjectInput, setSubjectInput] = useState("");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(
    new Set(subjects.map((s) => s.id))
  );
  const [topicInputs, setTopicInputs] = useState<Record<string, string>>({});

  const handleAddSubject = () => {
    const name = subjectInput.trim();
    if (!name) return;
    addSubject(name);
    setSubjectInput("");
    // Expand the newly added subject
    const id = name.toLowerCase().replace(/\s+/g, "_");
    setExpandedSubjects((prev) => new Set([...prev, id]));
  };

  const handleAddTopic = (subjectId: string) => {
    const name = topicInputs[subjectId]?.trim();
    if (!name) return;
    addTopic(subjectId, name);
    setTopicInputs((prev) => ({ ...prev, [subjectId]: "" }));
  };

  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(subjectId)) {
        next.delete(subjectId);
      } else {
        next.add(subjectId);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-3 p-1">
      <h4 className="text-sm font-semibold text-foreground/90">
        Subjects & Topics
      </h4>

      <div className="flex gap-2">
        <Input
          type="text"
          value={subjectInput}
          onChange={(e) => setSubjectInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAddSubject()}
          placeholder="Add subject..."
          className="h-9 text-sm"
        />
        <Button
          type="button"
          onClick={handleAddSubject}
          size="sm"
          variant="secondary"
        >
          Add
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        {subjects.map((subject) => {
          const isExpanded = expandedSubjects.has(subject.id);
          return (
            <Collapsible
              key={subject.id}
              open={isExpanded}
              onOpenChange={() => toggleSubject(subject.id)}
            >
              <div className="rounded-md bg-muted/40 overflow-hidden">
                <div className="flex items-center justify-between p-2 hover:bg-muted/60 transition-colors">
                  <div className="flex items-center gap-2 flex-1">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 p-0"
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 transition-transform",
                            isExpanded && "rotate-90"
                          )}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <span className="text-sm font-medium">{subject.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSubject(subject.id)}
                    aria-label={`Remove ${subject.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <CollapsibleContent>
                  <div className="px-2 pb-2 pt-1 space-y-2 bg-background/50">
                    <div className="space-y-1">
                      {subject.topics.map((topic) => {
                        const isSelected =
                          selectedSubject === subject.id &&
                          selectedTopic === topic.id;
                        const isGeneral = topic.id === "general";

                        return (
                          <div
                            key={topic.id}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors group",
                              "hover:bg-muted",
                              isSelected &&
                                "bg-primary/20 hover:bg-primary/25 border border-primary/50"
                            )}
                            onClick={() => selectTopic(subject.id, topic.id)}
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm truncate">
                                {topic.name}
                              </span>
                              {isGeneral && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs shrink-0"
                                >
                                  All
                                </Badge>
                              )}
                              {topic.materials.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs shrink-0"
                                >
                                  {topic.materials.length}
                                </Badge>
                              )}
                            </div>
                            {!isGeneral && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTopic(subject.id, topic.id);
                                }}
                                aria-label={`Remove ${topic.name}`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Input
                        type="text"
                        value={topicInputs[subject.id] || ""}
                        onChange={(e) =>
                          setTopicInputs((prev) => ({
                            ...prev,
                            [subject.id]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddTopic(subject.id)
                        }
                        placeholder="Add topic..."
                        className="h-8 text-xs"
                      />
                      <Button
                        type="button"
                        onClick={() => handleAddTopic(subject.id)}
                        size="icon"
                        variant="secondary"
                        className="h-8 w-8 shrink-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          );
        })}
      </div>
    </div>
  );
};
