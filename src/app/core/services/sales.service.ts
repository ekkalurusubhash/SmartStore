import { Injectable, signal, computed, inject } from '@angular/core';
import { Sale } from '../models';
import { ProductService } from './product.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private readonly productService = inject(ProductService);
  private readonly notificationService = inject(NotificationService);

  private readonly sales = signal<Sale[]>([
    {
      id: 'sale_1',
      productId: 'prod_1',
      productName: 'Laptop Pro',
      quantity: 2,
      unitPrice: 1299.99,
      totalAmount: 2599.98,
      saleDate: new Date(new Date().setDate(new Date().getDate() - 2)),
      salesperson: 'John Smith',
    },
    {
      id: 'sale_2',
      productId: 'prod_3',
      productName: 'Mechanical Keyboard',
      quantity: 3,
      unitPrice: 99.99,
      totalAmount: 299.97,
      saleDate: new Date(new Date().setDate(new Date().getDate() - 1)),
      salesperson: 'Sarah Johnson',
    },
    {
      id: 'sale_3',
      productId: 'prod_5',
      productName: 'Monitor 27"',
      quantity: 1,
      unitPrice: 349.99,
      totalAmount: 349.99,
      saleDate: new Date(),
      salesperson: 'Mike Davis',
    },
  ]);

  readonly sales$ = this.sales.asReadonly();
  readonly totalRevenue = computed(() =>
    this.sales().reduce((sum, s) => sum + s.totalAmount, 0)
  );
  readonly todayRevenue = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.sales()
      .filter(s => {
        const saleDate = new Date(s.saleDate);
        saleDate.setHours(0, 0, 0, 0);
        return saleDate.getTime() === today.getTime();
      })
      .reduce((sum, s) => sum + s.totalAmount, 0);
  });
  readonly completedSalesCount = computed(() => this.sales().length);

  processSale(
    productId: string,
    quantity: number,
    salesperson: string
  ): Sale | null {
    const product = this.productService.getProduct(productId);
    if (!product) {
      this.notificationService.addNotification({
        type: 'error',
        title: 'Sale Failed',
        message: 'Product not found',
      });
      return null;
    }

    if (product.quantity < quantity) {
      this.notificationService.addNotification({
        type: 'error',
        title: 'Insufficient Stock',
        message: `Only ${product.quantity} units available for ${product.name}`,
      });
      return null;
    }

    const sale: Sale = {
      id: `sale_${Date.now()}`,
      productId,
      productName: product.name,
      quantity,
      unitPrice: product.price,
      totalAmount: product.price * quantity,
      saleDate: new Date(),
      salesperson,
    };

    // Update inventory
    const updated = this.productService.updateInventory(productId, -quantity);
    if (updated && updated.quantity <= updated.reorderLevel) {
      this.notificationService.addNotification({
        type: 'warning',
        title: 'Low Stock Alert',
        message: `${product.name} is running low. Current stock: ${updated.quantity}`,
      });
    }

    this.sales.update(list => [...list, sale]);

    this.notificationService.addNotification({
      type: 'success',
      title: 'Sale Completed',
      message: `Sale of ${quantity} unit(s) of ${product.name} completed successfully`,
    });

    return sale;
  }

  getSale(id: string): Sale | undefined {
    return this.sales().find(s => s.id === id);
  }

  getAllSales(): Sale[] {
    return this.sales();
  }

  getSalesByDate(startDate: Date, endDate: Date): Sale[] {
    return this.sales().filter(s => {
      const saleDate = new Date(s.saleDate);
      return saleDate >= startDate && saleDate <= endDate;
    });
  }
}
