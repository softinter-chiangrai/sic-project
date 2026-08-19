// src/app/core/models/project.model.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  isFavorite: boolean;
  lastOpened?: string;
  createdAt: string;
  updatedAt: string;
}