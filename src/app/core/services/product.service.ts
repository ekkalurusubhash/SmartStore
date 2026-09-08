import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly products = signal<Product[]>([
    {
      id: 'prod_1',
      name: 'Laptop Pro',
      sku: 'LP-001',
      price: 1299.99,
      quantity: 15,
      reorderLevel: 5,
      category: 'Electronics',
      createdAt: new Date('2024-01-10'),
    },
    {
      id: 'prod_2',
      name: 'Wireless Mouse',
      sku: 'WM-001',
      price: 29.99,
      quantity: 3,
      reorderLevel: 10,
      category: 'Accessories',
      createdAt: new Date('2024-01-12'),
    },
    {
      id: 'prod_3',
      name: 'Mechanical Keyboard',
      sku: 'MK-001',
      price: 99.99,
      quantity: 8,
      reorderLevel: 5,
      category: 'Accessories',
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'prod_4',
      name: 'USB-C Hub',
      sku: 'UC-001',
      price: 49.99,
      quantity: 2,
      reorderLevel: 8,
      category: 'Accessories',
      createdAt: new Date('2024-01-18'),
    },
    {
      id: 'prod_5',
      name: 'Monitor 27"',
      sku: 'MON-001',
      price: 349.99,
      quantity: 12,
      reorderLevel: 4,
      category: 'Electronics',
      createdAt: new Date('2024-01-20'),
    },
  ]);

  readonly products$ = this.products.asReadonly();
  readonly lowStockProducts = computed(() =>
    this.products().filter(p => p.quantity <= p.reorderLevel)
  );
  readonly lowStockCount = computed(() => this.lowStockProducts().length);
  readonly activeProductCount = computed(() => this.products().length);
  readonly totalInventoryValue = computed(() =>
    this.products().reduce((sum, p) => sum + (p.quantity * p.price), 0)
  );

  addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod_${Date.now()}`,
      createdAt: new Date(),
    };
    this.products.update(list => [...list, newProduct]);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const product = this.products().find(p => p.id === id);
    if (!product) return null;

    const updated = { ...product, ...updates };
    this.products.update(list =>
      list.map(p => (p.id === id ? updated : p))
    );
    return updated;
  }

  deleteProduct(id: string): boolean {
    const initialLength = this.products().length;
    this.products.update(list => list.filter(p => p.id !== id));
    return this.products().length < initialLength;
  }

  getProduct(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  updateInventory(id: string, quantityChange: number): Product | null {
    const product = this.products().find(p => p.id === id);
    if (!product) return null;

    const newQuantity = Math.max(0, product.quantity + quantityChange);
    return this.updateProduct(id, { quantity: newQuantity });
  }

  reorderProduct(id: string, restockQuantity: number): Product | null {
    return this.updateInventory(id, restockQuantity);
  }

  getAllProducts(): Product[] {
    return this.products();
  }
}
