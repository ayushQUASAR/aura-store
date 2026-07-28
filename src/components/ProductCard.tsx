import React from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { Product } from "../types";

interface ProductCardProps {
  key?: string | number;
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdding?: boolean;
}

export default function ProductCard({ product, onAddToCart, isAdding = false }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  return (
    <div 
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-all hover:shadow-lg hover:shadow-zinc-100"
      id={`product-card-${product.id}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-100">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-zinc-900 backdrop-blur-sm shadow-sm">
            {product.category}
          </span>
          {isOutOfStock ? (
            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-800">
              Sold Out
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              Only {product.stock} left
            </span>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-zinc-950">
            {product.name}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500 leading-relaxed">
            {product.description}
          </p>
        </div>
        
        {/* Footer & Pricing */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div className="flex flex-col">
            <span className="text-xs text-zinc-400">Price</span>
            <span className="text-base font-bold text-zinc-950">
              ${product.price.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(product)}
            disabled={isOutOfStock || isAdding}
            className={`flex h-9 items-center justify-center rounded-lg px-3.5 text-xs font-semibold transition-all ${
              isOutOfStock
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : isAdding
                ? "bg-zinc-100 text-zinc-600"
                : "bg-zinc-950 text-white hover:bg-zinc-800"
            }`}
            id={`add-to-cart-btn-${product.id}`}
          >
            {isAdding ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-3.5 w-3.5" />
            )}
            <span>{isOutOfStock ? "Sold Out" : isAdding ? "Adding..." : "Add to Cart"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
