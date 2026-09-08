import {
  AfterViewInit,
  Component,
  OnDestroy,
  computed,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit, OnDestroy {

  private readonly analyticsService = inject(AnalyticsService);

  // ==========================
  // Signals
  // ==========================

  readonly metrics = this.analyticsService.dashboardMetrics;
  readonly monthlySalesData = this.analyticsService.monthlySalesData;
  readonly topProducts = this.analyticsService.topSellingProducts;

  // ==========================
  // Dashboard Cards
  // ==========================

  readonly totalRevenue = computed(() =>
    this.metrics().totalRevenue.toFixed(2)
  );

  readonly todayRevenue = computed(() =>
    this.metrics().todayRevenue.toFixed(2)
  );

  readonly lowStock = computed(() =>
    this.metrics().lowStock
  );

  readonly activeProducts = computed(() =>
    this.metrics().activeProducts
  );

  readonly revenueTrend = computed(() =>
    this.metrics().trends.revenue
  );

  readonly todayTrend = computed(() =>
    this.metrics().trends.today
  );

  readonly lowStockTrend = computed(() =>
    this.metrics().trends.lowStock
  );

  readonly productTrend = computed(() =>
    this.metrics().trends.products
  );

  // ==========================
  // Charts
  // ==========================

  private revenueChart?: Chart;
  private topProductsChart?: Chart;

  ngAfterViewInit(): void {
    console.log('Monthly Data:', this.monthlySalesData());
    console.log('Top Products:', this.topProducts());
    this.loadCharts();
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // ==========================
  // Load Charts
  // ==========================

  private loadCharts(): void {
    this.destroyCharts();
    this.renderRevenueChart();
    this.renderTopProductsChart();
  }

  // ==========================
  // Revenue Chart
  // ==========================

  private renderRevenueChart(): void {
    const monthlyData = this.monthlySalesData();
    this.revenueChart = new Chart('revenueChart', {
      type: 'line',
      data: {
        labels: monthlyData.map(item => item.date),
        datasets: [
          {
            label: 'Revenue',
            data: monthlyData.map(item => item.amount),
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79,70,229,0.18)',
            fill: true,
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.4
          }
        ]
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000
        },
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },

        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback(value) {
                return '$' + value;
              }
            }
          }
        }
      }
    });
  }

  // ==========================
  // Top Products Chart
  // ==========================

  private renderTopProductsChart(): void {

    const products = this.topProducts();

    this.topProductsChart = new Chart('topProductsChart', {

      type: 'bar',

      data: {

        labels: products.map(item => item.name),

        datasets: [

          {

            label: 'Units Sold',

            data: products.map(item => item.quantity),

            backgroundColor: [

              '#4f46e5',
              '#06b6d4',
              '#10b981',
              '#f59e0b',
              '#ef4444'

            ],

            borderRadius: 8,

            maxBarThickness: 45

          }

        ]

      },

      options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

          duration: 1000

        },

        plugins: {

          legend: {

            display: false

          }

        },

        scales: {

          x: {

            grid: {

              display: false

            }

          },

          y: {

            beginAtZero: true,

            ticks: {

              precision: 0

            }

          }

        }

      }

    });

  }

  // ==========================
  // Destroy Charts
  // ==========================

  private destroyCharts(): void {
    if (this.revenueChart) {
      this.revenueChart.destroy();
      this.revenueChart = undefined;
    }
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
      this.topProductsChart = undefined;
    }
  }

}