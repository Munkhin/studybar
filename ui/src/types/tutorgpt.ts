export interface Material {
  id: string;
  name: string;
  fileUrl?: string;
  uploadedAt: string;
  type?: string;
}

export interface Topic {
  id: string;
  name: string;
  conversationId: string;
  materials: Material[];
}

export interface Subject {
  id: string;
  name: string;
  topics: Topic[];
}

export interface SubjectContextType {
  subjects: Subject[];
  selectedSubject: string | null;
  selectedTopic: string | null;
  addSubject: (name: string) => void;
  removeSubject: (subjectId: string) => void;
  addTopic: (subjectId: string, topicName: string) => void;
  removeTopic: (subjectId: string, topicId: string) => void;
  selectTopic: (subjectId: string, topicId: string) => void;
  addMaterial: (subjectId: string, topicId: string, material: Material) => void;
  removeMaterial: (subjectId: string, topicId: string, materialId: string) => void;
  getSelectedSubjectData: () => Subject | null;
  getSelectedTopicData: () => { subject: Subject; topic: Topic } | null;
}
