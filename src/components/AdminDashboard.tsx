import React, { useState } from "react";
import { Plus, Edit, Trash2, Package, ShoppingBag, DollarSign, Check, X, Sparkles, RefreshCw } from "lucide-react";
import { Product, Order } from "../types";

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  categories: string[];
  onAddProduct: (productData: any) => void;
  onUpdateProduct: (id: string, productData: any) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateOrderStatus: (orderId: string, status: string) => void;
}

export default function AdminDashboard({
  products,
  orders,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
}: AdminDashboardProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");

  const handleEditClick = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setPrice(String(prod.price));
    setCategory(prod.category);
    setImageUrl(prod.imageUrl);
    setStock(String(prod.stock));
    setShowForm(true);
  };

  const handleResetForm = () => {
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setCategory(categories[0] || "Electronics");
    setImageUrl("");
    setStock("");
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { name, description, price, category, imageUrl, stock };
    if (editingProduct) {
      onUpdateProduct(editingProduct.id, data);
    } else {
      onAddProduct(data);
    }
    handleResetForm();
  };

  // Stats Counters
  const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const activeProducts = products.length;
  const pendingOrders = orders.filter((o) => o.status !== "DELIVERED").length;

  return (
    <div className="space-y-8" id="admin-dashboard-container">
      {/* Title Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-950">Catalog & Order Operations</h1>
          <p className="text-sm text-zinc-500">
            Simulated Admin Console managing core Spring Boot PostgreSQL databases.
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => {
              setCategory(categories[0] || "Electronics");
              setShowForm(true);
            }}
            className="flex items-center space-x-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-colors shadow-sm"
            id="admin-add-product-btn"
          >
            <Plus className="h-4 w-4" />
            <span>Create Catalog Item</span>
          </button>
        )}
      </div>

      {/* Overview Statistics widgets */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center space-x-4 shadow-sm shadow-zinc-50">
          <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Gross Sales Revenue</span>
            <p className="text-2xl font-black text-zinc-950">${totalRevenue.toFixed(2)}</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center space-x-4 shadow-sm shadow-zinc-50">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Active Catalog</span>
            <p className="text-2xl font-black text-zinc-950">{activeProducts} Products</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5 flex items-center space-x-4 shadow-sm shadow-zinc-50">
          <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Unfulfilled Orders</span>
            <p className="text-2xl font-black text-zinc-950">{pendingOrders} Active</p>
          </div>
        </div>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/20 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900">
              {editingProduct ? `Edit Catalog Item: ${editingProduct.name}` : "Create New Catalog Entry"}
            </h3>
            <button onClick={handleResetForm} className="text-zinc-400 hover:text-zinc-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-zinc-700">Product Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="High Performance Router"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700">Description</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description describing specifications, features..."
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700">Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="29.99"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700">Initial Stock</label>
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="100"
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-zinc-700">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-400 mt-1 block">Leave empty to use automatic product fallback vector.</span>
            </div>

            <div className="sm:col-span-2 flex justify-end space-x-3 mt-2">
              <button
                type="button"
                onClick={handleResetForm}
                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500 shadow-sm"
              >
                {editingProduct ? "Save Changes" : "Save Catalog Entry"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Catalog & Orders tabs */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Products Table (8 columns) */}
        <div className="lg:col-span-7 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-50">
          <h2 className="text-base font-bold text-zinc-900 mb-4 flex items-center space-x-2">
            <Package className="h-4 w-4 text-zinc-500" />
            <span>Storefront Products</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  <th className="py-3 px-2">Product</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Price</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-800">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="h-10 w-10 rounded-lg object-cover bg-zinc-50"
                        />
                        <div>
                          <span className="font-semibold block line-clamp-1 text-zinc-900">{prod.name}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">{prod.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                        {prod.category}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono font-semibold">${prod.price.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <span className={`font-semibold ${prod.stock === 0 ? "text-red-500" : prod.stock <= 5 ? "text-amber-500" : "text-zinc-600"}`}>
                        {prod.stock}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={() => handleEditClick(prod)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                          title="Edit product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Orders Table (5 columns) */}
        <div className="lg:col-span-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-50">
          <h2 className="text-base font-bold text-zinc-900 mb-4 flex items-center space-x-2">
            <ShoppingBag className="h-4 w-4 text-zinc-500" />
            <span>Order Logs (K8s Service Sync)</span>
          </h2>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-8 text-center text-zinc-400 text-sm">
                No orders processed yet in this session.
              </div>
            ) : (
              orders.map((ord) => (
                <div key={ord.id} className="rounded-xl border border-zinc-100 p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-zinc-900 text-sm">{ord.id}</span>
                      <span className="text-[10px] text-zinc-400 block">{ord.userEmail}</span>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      ord.status === "DELIVERED"
                        ? "bg-emerald-50 text-emerald-700"
                        : ord.status === "SHIPPED"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-amber-50 text-amber-700"
                    }`}>
                      {ord.status}
                    </span>
                  </div>

                  {/* Order items lists */}
                  <div className="text-xs text-zinc-500 space-y-1 bg-zinc-50 p-2 rounded-lg">
                    {ord.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{item.productName} <span className="font-semibold">x{item.quantity}</span></span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action states */}
                  <div className="flex items-center justify-between border-t border-zinc-100 pt-2 text-xs">
                    <span className="font-bold text-zinc-900">Total: ${ord.totalAmount.toFixed(2)}</span>
                    
                    {ord.status !== "DELIVERED" && (
                      <div className="flex space-x-1">
                        {ord.status === "PROCESSING" && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, "SHIPPED")}
                            className="rounded bg-blue-600 px-2.5 py-1 font-semibold text-white hover:bg-blue-500"
                          >
                            Mark Shipped
                          </button>
                        )}
                        {ord.status === "SHIPPED" && (
                          <button
                            onClick={() => onUpdateOrderStatus(ord.id, "DELIVERED")}
                            className="rounded bg-emerald-600 px-2.5 py-1 font-semibold text-white hover:bg-emerald-500"
                          >
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
