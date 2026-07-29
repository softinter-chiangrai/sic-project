// src/app/feature/pm/dt/pmdt02/pmdt02.utils.ts
import type { PhaseResponse } from '../../../../core/model/phase.model';
import type { DhtmlxGanttTask } from '../../../../core/component/sic-ganttchart/dhtmlx-gantt.component';

export function buildGanttTasks(phase: PhaseResponse): DhtmlxGanttTask[] {
  const result: DhtmlxGanttTask[] = [];

  // 1. Phase
  const phaseProgress = isNaN(phase.progress) ? 0 : phase.progress / 100;
  result.push({
    id: `phase-${phase.id}`,
    text: `📍 ${phase.phaseName}`,
    start_date: formatDateForDhtmlx(phase.startDate),
    end_date: formatDateForDhtmlx(phase.endDate),
    progress: phaseProgress,
    assignedTo: phase.owner || '-',
    assignees: phase.owner || '-',
    open: true,
    color: phase.color || undefined,
  });

  // 2. Milestones
  phase.milestones?.forEach((ms) => {
    const msId = `ms-${ms.id}`;
    result.push({
      id: msId,
      text: `📌 ${ms.milestoneName}`,
      start_date: formatDateForDhtmlx(ms.dueDate),
      end_date: formatDateForDhtmlx(ms.dueDate),
      progress: ms.status === 'Done' ? 1 : 0.5,
      parent: `phase-${phase.id}`,
      color: ms.color || undefined,
    });

    // 3. Work Packages
    ms.workPackages?.forEach((wp) => {
      const wpId = `wp-${wp.id}`;
      if (wp.startDate && wp.endDate) {
        const wpProgress = calculateWpProgress(wp);
        result.push({
          id: wpId,
          text: `📦 ${wp.packageName}`,
          start_date: formatDateForDhtmlx(wp.startDate),
          end_date: formatDateForDhtmlx(wp.endDate),
          progress: isNaN(wpProgress) ? 0 : wpProgress,
          parent: msId,
          color: wp.color || undefined,
        });
      }

      // 4. Tasks
      wp.tasks?.forEach((task) => {
        if (task.startDate) {
          const taskProgress = calculateTaskProgress(task);
          let assigneesText = '';
          if (task.assigneeNames) {
            if (Array.isArray(task.assigneeNames)) {
              assigneesText = task.assigneeNames.filter(Boolean).join(', ');
            } else if (typeof task.assigneeNames === 'object') {
              assigneesText = Object.values(task.assigneeNames).filter(Boolean).join(', ');
            }
          }
          if (!assigneesText) {
            assigneesText = task.assignedTo || '-';
          }
          result.push({
            id: task.id,
            text: `🔹 ${task.taskName}`,
            start_date: formatDateForDhtmlx(task.startDate),
            end_date: task.endDate ? formatDateForDhtmlx(task.endDate) : formatDateForDhtmlx(task.startDate),
            progress: taskProgress,
            parent: `wp-${wp.id}`,
            assignedTo: task.assignedTo || '-',
            assignees: assigneesText,
            color: task.color || undefined,
          });
        }
      });
    });
  });

  return result;
}

// ----- Helper functions (copy/paste จาก pmdt02.component.ts) -----
function formatDateForDhtmlx(dateStr: string | undefined): string {
  if (!dateStr) return '01-01-2024';
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function calculateTaskProgress(task: any): number {
  if (task.progress !== undefined && task.progress !== null && !isNaN(Number(task.progress))) {
    const p = Number(task.progress);
    return p > 1 ? p / 100 : p;
  }
  if (task.percent !== undefined && task.percent !== null && !isNaN(Number(task.percent))) {
    const p = Number(task.percent);
    return p > 1 ? p / 100 : p;
  }
  const status = task.status || '';
  if (status === 'Done') return 1;
  if (status === 'In Progress' || status === 'Waiting Review' || status === 'Waiting Fix') return 0.5;
  return 0;
}

function calculateWpProgress(wp: any): number {
  if (!wp.tasks || wp.tasks.length === 0) return 0;
  const totalProgress = wp.tasks.reduce((sum: number, t: any) => sum + calculateTaskProgress(t), 0);
  return totalProgress / wp.tasks.length;
}