import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../shared/services/loader.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.html',
  styleUrl: './inventory.scss',
})
export class Inventory {

  private readonly productService = inject(ProductService);
  private readonly authService = inject(AuthService);
  private readonly loader = inject(LoaderService);

  readonly products = this.productService.products$;
  readonly lowStockProducts = this.productService.lowStockProducts;
  readonly totalValue = this.productService.totalInventoryValue;

  readonly isAdmin = computed(() => this.authService.isAdmin());

  showForm = signal(false);
  editingId = signal<string | null>(null);
  formData = signal({
    name: '',
    sku: '',
    price: 0,
    quantity: 0,
    reorderLevel: 0,
    category: '',
  });
  reorderProductId = signal<string | null>(null);
  reorderQuantity = signal(0);
  readonly isFormValid = computed(() => {
    const f = this.formData();
    return (
      f.name.trim().length > 0 &&
      f.sku.trim().length > 0 &&
      f.category.trim().length > 0 &&
      Number(f.price) > 0 &&
      Number(f.quantity) >= 0 &&
      Number(f.reorderLevel) >= 0
    );
  });

  // ===========================
  // Form Update Methods
  // ===========================

  updateName(name: string): void {
    this.formData.update(f => ({ ...f, name }));
  }

  updateSku(sku: string): void {
    this.formData.update(f => ({ ...f, sku }));
  }

  updateCategory(category: string): void {
    this.formData.update(f => ({ ...f, category }));
  }

  updatePrice(price: number): void {
    this.formData.update(f => ({ ...f, price: +price }));
  }

  updateQuantity(quantity: number): void {
    this.formData.update(f => ({ ...f, quantity: +quantity }));
  }

  updateReorderLevel(level: number): void {
    this.formData.update(f => ({
      ...f,
      reorderLevel: +level,
    }));
  }

  // ===========================
  // Save Product
  // ===========================
  saveProduct(): void {
    if (!this.isFormValid()) {
      return;
    }
    const isEdit = !!this.editingId();
    this.executeWithLoader(() => {
      const data = this.formData();
      const product = {
        name: data.name,
        sku: data.sku,
        price: data.price,
        quantity: data.quantity,
        reorderLevel: data.reorderLevel,
        category: data.category,
      };
      if (isEdit) {
        this.productService.updateProduct(
          this.editingId()!,
          product as any
        );
      } else {
        this.productService.addProduct(
          product as any
        );
      }
      this.resetForm();
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Product Updated' : 'Product Added',
        text: isEdit
          ? 'Product updated successfully.'
          : 'Product added successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  // ===========================
  // Edit Product
  // ===========================
  editProduct(id: string): void {
    this.executeWithLoader(() => {
      const product = this.productService.getProduct(id);
      if (!product) {
        return;
      }
      this.formData.set({
        name: product.name,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
        category: product.category,
      });
      this.editingId.set(id);
      this.showForm.set(true);
    }, 800);
  }

  // ===========================
  // Delete Product
  // ===========================
  async deleteProduct(id: string): Promise<void> {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      reverseButtons: true
    });
    if (!result.isConfirmed) {
      return;
    }
    this.executeWithLoader(() => {
      this.productService.deleteProduct(id);
      Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Product deleted successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  // ===========================
  // Reorder
  // ===========================
  openReorderForm(id: string): void {
    this.reorderProductId.set(id);
    this.reorderQuantity.set(0);
  }

  reorderProduct(): void {
    const id = this.reorderProductId();
    const qty = this.reorderQuantity();
    if (!id || qty <= 0) {
      return;
    }
    this.executeWithLoader(() => {
      this.productService.reorderProduct(id, qty);
      this.reorderProductId.set(null);
      this.reorderQuantity.set(0);
      Swal.fire({
        icon: 'success',
        title: 'Reordered',
        text: 'Stock updated successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    });
  }

  // ===========================
  // Toggle Form
  // ===========================
  toggleForm(): void {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.resetForm();
    }
  }

  // ===========================
  // Reset Form
  // ===========================
  private resetForm(): void {
    this.formData.set({
      name: '',
      sku: '',
      price: 0,
      quantity: 0,
      reorderLevel: 0,
      category: '',
    });
    this.editingId.set(null);
    this.showForm.set(false);
  }

  // ===========================
  // Loader Helper
  // ===========================
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