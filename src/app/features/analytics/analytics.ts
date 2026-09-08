import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  imports: [CommonModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.scss',
})
export class Analytics {
  private readonly analyticsService = inject(AnalyticsService);

  readonly monthlySalesData = this.analyticsService.monthlySalesData;
  readonly topProducts = this.analyticsService.topSellingProducts;
  readonly categoryStats = this.analyticsService.productCategoryStats;
}
