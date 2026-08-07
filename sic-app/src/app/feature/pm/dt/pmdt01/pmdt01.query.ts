// src/app/feature/pm/dt/pmdt01/pmdt01.query.ts
export const pmdt01QueryKeys = {
  all: ['phases'] as const,
  lists: () => [...pmdt01QueryKeys.all, 'list'] as const,
  list: (projectId: string) => [...pmdt01QueryKeys.lists(), projectId] as const,
  details: () => [...pmdt01QueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...pmdt01QueryKeys.details(), id] as const,
};