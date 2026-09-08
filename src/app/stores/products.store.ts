import { Injectable } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductState {
  products: Product[];
  selectedProductId: string | null;
  isLoading: boolean;
}

const initialState: ProductState = {
  products: [],
  selectedProductId: null,
  isLoading: false,
};

@Injectable({ providedIn: 'root' })
export class ProductsStore extends signalStore(
  withState(initialState),
  withComputed(({ products, selectedProductId }) => ({
    selectedProduct: computed(() =>
      products().find((p) => p.id === selectedProductId())
    ),
    productCount: computed(() => products().length),
    isEmpty: computed(() => products().length === 0),
  })),
  withMethods((store) => ({
    setProducts(products: Product[]): void {
      patchState(store, { products });
    },
    selectProduct(id: string): void {
      patchState(store, { selectedProductId: id });
    },
    clearSelection(): void {
      patchState(store, { selectedProductId: null });
    },
    setLoading(isLoading: boolean): void {
      patchState(store, { isLoading });
    },
    addProduct(product: Product): void {
      patchState(store, {
        products: [...store.products(), product],
      });
    },
    removeProduct(id: string): void {
      patchState(store, {
        products: store.products().filter((p) => p.id !== id),
      });
    },
  }))
) { }