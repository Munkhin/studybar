import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Subject, Topic, Material, SubjectContextType } from "../types/tutorgpt";

const SubjectContext = createContext<SubjectContextType | undefined>(undefined);

export const useSubjectContext = () => {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error("useSubjectContext must be used within a SubjectProvider");
  }
  return context;
};

const STORAGE_KEY = "tutorgpt_subjects";

export const SubjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    // Load from localStorage on initialization
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse stored subjects:", e);
      }
    }
    // Default subjects with "general" topic
    return [
      {
        id: "biology",
        name: "Biology",
        topics: [
          {
            id: "general",
            name: "General",
            conversationId: "biology_general",
            materials: [],
          },
        ],
      },
      {
        id: "math",
        name: "Math",
        topics: [
          {
            id: "general",
            name: "General",
            conversationId: "math_general",
            materials: [],
          },
        ],
      },
    ];
  });

  const [selectedSubject, setSelectedSubject] = useState<string | null>(() => {
    return localStorage.getItem("tutorgpt_selected_subject");
  });

  const [selectedTopic, setSelectedTopic] = useState<string | null>(() => {
    return localStorage.getItem("tutorgpt_selected_topic");
  });

  // Persist subjects to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  // Persist selected subject/topic to localStorage
  useEffect(() => {
    if (selectedSubject) {
      localStorage.setItem("tutorgpt_selected_subject", selectedSubject);
    } else {
      localStorage.removeItem("tutorgpt_selected_subject");
    }
  }, [selectedSubject]);

  useEffect(() => {
    if (selectedTopic) {
      localStorage.setItem("tutorgpt_selected_topic", selectedTopic);
    } else {
      localStorage.removeItem("tutorgpt_selected_topic");
    }
  }, [selectedTopic]);

  const addSubject = useCallback((name: string) => {
    const id = name.toLowerCase().replace(/\s+/g, "_");
    setSubjects((prev) => {
      // Check if subject already exists
      if (prev.some((s) => s.id === id)) {
        return prev;
      }
      return [
        ...prev,
        {
          id,
          name,
          topics: [
            {
              id: "general",
              name: "General",
              conversationId: `${id}_general`,
              materials: [],
            },
          ],
        },
      ];
    });
  }, []);

  const removeSubject = useCallback((subjectId: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
    // Clear selection if the removed subject was selected
    if (selectedSubject === subjectId) {
      setSelectedSubject(null);
      setSelectedTopic(null);
    }
  }, [selectedSubject]);

  const addTopic = useCallback((subjectId: string, topicName: string) => {
    const topicId = topicName.toLowerCase().replace(/\s+/g, "_");
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        // Check if topic already exists
        if (subject.topics.some((t) => t.id === topicId)) {
          return subject;
        }
        return {
          ...subject,
          topics: [
            ...subject.topics,
            {
              id: topicId,
              name: topicName,
              conversationId: `${subjectId}_${topicId}`,
              materials: [],
            },
          ],
        };
      })
    );
  }, []);

  const removeTopic = useCallback((subjectId: string, topicId: string) => {
    // Prevent removing "general" topic
    if (topicId === "general") {
      return;
    }
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          topics: subject.topics.filter((t) => t.id !== topicId),
        };
      })
    );
    // Clear selection if the removed topic was selected
    if (selectedSubject === subjectId && selectedTopic === topicId) {
      setSelectedTopic(null);
    }
  }, [selectedSubject, selectedTopic]);

  const selectTopic = useCallback((subjectId: string, topicId: string) => {
    setSelectedSubject(subjectId);
    setSelectedTopic(topicId);
  }, []);

  const addMaterial = useCallback((subjectId: string, topicId: string, material: Material) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          topics: subject.topics.map((topic) => {
            if (topic.id !== topicId) return topic;
            // Check if material already exists
            if (topic.materials.some((m) => m.id === material.id)) {
              return topic;
            }
            return {
              ...topic,
              materials: [...topic.materials, material],
            };
          }),
        };
      })
    );

    // Also add to "general" topic if not already adding to general
    if (topicId !== "general") {
      setSubjects((prev) =>
        prev.map((subject) => {
          if (subject.id !== subjectId) return subject;
          return {
            ...subject,
            topics: subject.topics.map((topic) => {
              if (topic.id !== "general") return topic;
              // Check if material already exists
              if (topic.materials.some((m) => m.id === material.id)) {
                return topic;
              }
              return {
                ...topic,
                materials: [...topic.materials, material],
              };
            }),
          };
        })
      );
    }
  }, []);

  const removeMaterial = useCallback((subjectId: string, topicId: string, materialId: string) => {
    setSubjects((prev) =>
      prev.map((subject) => {
        if (subject.id !== subjectId) return subject;
        return {
          ...subject,
          topics: subject.topics.map((topic) => {
            if (topic.id !== topicId) return topic;
            return {
              ...topic,
              materials: topic.materials.filter((m) => m.id !== materialId),
            };
          }),
        };
      })
    );
  }, []);

  const getSelectedSubjectData = useCallback(() => {
    if (!selectedSubject) return null;
    return subjects.find((s) => s.id === selectedSubject) || null;
  }, [subjects, selectedSubject]);

  const getSelectedTopicData = useCallback(() => {
    if (!selectedSubject || !selectedTopic) return null;
    const subject = subjects.find((s) => s.id === selectedSubject);
    if (!subject) return null;
    const topic = subject.topics.find((t) => t.id === selectedTopic);
    if (!topic) return null;
    return { subject, topic };
  }, [subjects, selectedSubject, selectedTopic]);

  return (
    <SubjectContext.Provider
      value={{
        subjects,
        selectedSubject,
        selectedTopic,
        addSubject,
        removeSubject,
        addTopic,
        removeTopic,
        selectTopic,
        addMaterial,
        removeMaterial,
        getSelectedSubjectData,
        getSelectedTopicData,
      }}
    >
      {children}
    </SubjectContext.Provider>
  );
};
