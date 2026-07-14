// src/app/core/models/diagram.model.ts
export interface DiagramProject {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  lastOpened?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramModel {
  id: string;
  name: string;
  diagramType: string;
  mermaidScript: string;
  metadata: any;
  projectId: string;
  projectName?: string;
  userId: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramVersion {
  id: string;
  diagramId: string;
  mermaidScript: string;
  versionNumber: number;
  changeComment?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  diagramId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  contextData?: any;
  createdAt: string;
}

export type DiagramType = 
  | 'Flowchart'
  | 'Sequence'
  | 'Class'
  | 'ER'
  | 'DFD'
  | 'State'
  | 'Journey'
  | 'Mindmap'
  | 'Timeline'
  | 'Requirement'
  | 'C4'
  | 'Git Graph'
  | 'Pie'
  | 'Gantt';

export const DIAGRAM_TYPES: DiagramType[] = [
  'Flowchart', 'Sequence', 'Class', 'ER', 'DFD', 'State',
  'Journey', 'Mindmap', 'Timeline', 'Requirement',
  'C4', 'Git Graph', 'Pie', 'Gantt'
];

export const DIAGRAM_DEFAULTS: Record<DiagramType, string> = {
  Flowchart: 'graph TD\n  A[Start] --> B[Process]\n  B --> C[End]',
  Sequence: 'sequenceDiagram\n  participant User\n  participant System\n  User->>System: Request\n  System-->>User: Response',
  Class: 'classDiagram\n  class Person {\n    +String name\n    +int age\n    +greet()\n  }',
  ER: 'erDiagram\n  CUSTOMER ||--o{ ORDER : places\n  ORDER ||--|{ LINE_ITEM : contains',
  DFD: 'graph TD\n  A[User] -->|Login| B[Auth System]\n  B --> C[Database]',
  State: 'stateDiagram-v2\n  [*] --> Idle\n  Idle --> Processing : start\n  Processing --> Done : complete\n  Done --> [*]',
  Journey: 'journey\n  section Login\n    Enter credentials: 5: User\n    Click login: 3: User\n    Verify account: 1: System',
  Mindmap: 'mindmap\n  root((Project))\n    Planning\n      Requirements\n      Design\n    Development\n      Coding\n      Testing',
  Timeline: 'timeline\n  title Project Timeline\n  2024 Q1 : Planning\n  2024 Q2 : Development\n  2024 Q3 : Testing\n  2024 Q4 : Launch',
  Requirement: 'requirementDiagram\n  requirement req1 {\n    id: REQ-001\n    text: User login\n  }\n  element elem1 {\n    type: feature\n  }\n  req1 - elem1',
  C4: 'C4Context\n  Person(user, "User")\n  System(system, "System")\n  Rel(user, system, "Uses")',
  'Git Graph': 'gitGraph\n  commit\n  branch develop\n  checkout develop\n  commit\n  checkout main\n  merge develop',
  Pie: 'pie\n  "Development" : 45\n  "Testing" : 25\n  "Design" : 20\n  "Planning" : 10',
  Gantt: 'gantt\n  title Project Plan\n  section Design\n    UI Design :a1, 2024-01-01, 7d\n    Database :a2, after a1, 5d\n  section Development\n    API :b1, after a2, 10d',
};