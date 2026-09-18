import { Component, ChangeDetectionStrategy, input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DashboardOrgSummary } from '../../../feature/dashboard/dashboard.model';

@Component({
  selector: 'app-sprint-health-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './sprint-health-widget.component.html',
  styleUrl: './sprint-health-widget.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SprintHealthWidgetComponent {
  private readonly translate = inject(TranslateService);

  readonly summary = input<DashboardOrgSummary | null>(null);

  // Sprint Manday Progress % from Real API
  readonly sprintProgress = computed<number>(() => {
    const s = this.summary();
    if (!s || !s.totalBudgetManday || s.totalBudgetManday === 0) return 0;
    return Math.min(100, Math.round(((s.totalUsedManday || 0) / s.totalBudgetManday) * 100));
  });

  // Test Pass Rate % from Real API
  readonly passRate = computed<number>(() => {
    const s = this.summary();
    if (!s || !s.totalTestCases || s.totalTestCases === 0) return 0;
    return Math.round(((s.passedTestCases || 0) / s.totalTestCases) * 100);
  });

  // 100% Real Checklist Status derived from API data
  readonly checklistItems = computed(() => {
    const s = this.summary();
    const reqCount = s?.stageRequirementsCount ?? 0;
    const reviewCount = s?.stageDesignReviewsCount ?? 0;
    const testTotal = s?.totalTestCases ?? 0;
    const passRateVal = this.passRate();
    const criticalBugs = s?.criticalOpenBugs ?? 0;

    return [
      {
        label: 'Requirement & Specs In Progress',
        passed: reqCount > 0,
        detail: reqCount > 0
          ? this.translate.instant('SPRINT_HEALTH_WIDGET_ITEMS_COUNT', { count: reqCount })
          : this.translate.instant('SPRINT_HEALTH_WIDGET_NO_PENDING_REQ'),
      },
      {
        label: 'Design Reviews Sign-off',
        passed: reviewCount === 0 || reviewCount <= 2,
        detail: reviewCount > 0
          ? this.translate.instant('SPRINT_HEALTH_WIDGET_PENDING_REVIEW_COUNT', { count: reviewCount })
          : this.translate.instant('SPRINT_HEALTH_WIDGET_REVIEW_COMPLETE'),
      },
      {
        label: 'QA Test Case Pass Rate (> 80%)',
        passed: testTotal > 0 ? passRateVal >= 80 : false,
        detail: testTotal > 0
          ? this.translate.instant('SPRINT_HEALTH_WIDGET_PASS_RATE_DETAIL', { rate: passRateVal, passed: s?.passedTestCases || 0, total: testTotal })
          : this.translate.instant('SPRINT_HEALTH_WIDGET_NO_TEST_CASES'),
      },
      {
        label: 'Zero Critical Blockers',
        passed: criticalBugs === 0,
        detail: criticalBugs === 0
          ? this.translate.instant('SPRINT_HEALTH_WIDGET_NO_CRITICAL_BUGS')
          : this.translate.instant('SPRINT_HEALTH_WIDGET_CRITICAL_BUGS_FOUND', { count: criticalBugs }),
      },
    ];
  });
}
