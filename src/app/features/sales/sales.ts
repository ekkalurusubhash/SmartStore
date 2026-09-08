import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { SalesService } from '../../core/services/sales.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../shared/services/loader.service';

@Component({
  selector: 'app-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales.html',
  styleUrl: './sales.scss',
})
export class Sales {

  private readonly salesService = inject(SalesService);
  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly loader = inject(LoaderService);

  readonly sales = this.salesService.sales$;
  readonly products = this.productService.products$;
  readonly totalRevenue = this.salesService.totalRevenue;

  selectedProductId = signal('');
  quantity = signal(1);
  showForm = signal(false);

  readonly isFormValid = computed(() =>
    !!this.selectedProductId() &&
    this.quantity() > 0
  );

  updateProduct(productId: string): void {
    this.selectedProductId.set(productId);
  }

  updateQuantity(quantity: number): void {
    this.quantity.set(+quantity);
  }

  processSale(): void {
    if (!this.isFormValid()) {
      return;
    }
    const salesperson =
      this.authService.getCurrentUser()?.name ?? 'Unknown';
    this.executeWithLoader(() => {
      this.salesService.processSale(
        this.selectedProductId(),
        this.quantity(),
        salesperson
      );
      this.resetForm();
      Swal.fire({
        icon: 'success',
        title: 'Sale Completed',
        text: 'Sale processed successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  private resetForm(): void {
    this.selectedProductId.set('');
    this.quantity.set(1);
    this.showForm.set(false);
  }

  private executeWithLoader(
    action: () => void,
    delay = 1500
  ): void {
    this.loader.show();
    setTimeout(() => {
      try {
        action();
      } finally {
        this.loader.hide();
      }
    }, delay);
  }

}