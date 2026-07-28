import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ShieldCheck } from "lucide-react";
import Navbar from "./components/Navbar";
import ProductCard from "./components/ProductCard";
import CartModal from "./components/CartModal";
import AuthModal from "./components/AuthModal";
import AdminDashboard from "./components/AdminDashboard";
import OrderHistory from "./components/OrderHistory";
import { User, Product, CartItem, Order } from "./types";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("aura_token"));
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((v, k) => { headers[k] = v; });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([k, v]) => { headers[k] = v; });
      } else {
        Object.assign(headers, options.headers);
      }
    }
    const currentToken = token ?? localStorage.getItem("aura_token");
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
    return fetch(url, { ...options, headers });
  };

  // Filtering / UI States
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [currentTab, setTab] = useState<"shop" | "admin" | "orders">("shop");

  // Modals
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Shopping Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);

  // Initialize and load default state from simulated services
  useEffect(() => {
    // Attempt to restore persistent session
    const savedSession = localStorage.getItem("aura_session");
    const savedToken = localStorage.getItem("aura_token");
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession);
        const restoredUser = parsedSession.user || parsedSession;
        if (restoredUser?.email) {
          setUser(restoredUser);
        }
      } catch (err) {
        console.error("Error restoring session", err);
      }
    }
    if (savedToken) {
      setToken(savedToken);
    }

    // Load categories
    fetch("/api/catalog/categories")
      .then((res) => res.json())
      .then((data) => setCategories(["All", ...data]))
      .catch((err) => console.error("Error loading categories", err));

    // Initial load of products
    loadProducts();
    // Load orders logs
    loadOrders();
  }, []);

  // Fetch products with selected queries
  const loadProducts = () => {
    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (selectedCategory && selectedCategory !== "All") {
      queryParams.append("category", selectedCategory);
    }
    if (sortBy && sortBy !== "default") {
      queryParams.append("sort", sortBy);
    }

    fetch(`/api/catalog/products?${queryParams.toString()}`)
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error("Error loading products", err));
  };

  // Reload products whenever filters alter
  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, sortBy]);

  const loadOrders = () => {
    authFetch("/api/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setOrders(data))
      .catch((err) => console.error("Error loading orders", err));
  };

  // Auth Handlers
  const handleLoginSubmit = async (
    email: string,
    name: string,
    role: "CUSTOMER" | "ADMIN",
    password: string,
    isLogin: boolean
  ) => {
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin
        ? { email, password }
        : { email, name, password, role };

      let res = await authFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      let data = await res.json();
      if (!res.ok) {
        if (isLogin === false && data.error === "Email already exists") {
          res = await authFetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });
          data = await res.json();
        }
      }

      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      const loggedUser: User = {
        email: data.user?.email || email,
        name: data.user?.name || name,
        role: (data.user?.role || role) as "CUSTOMER" | "ADMIN",
      };

      if (data.token) {
        localStorage.setItem("aura_token", data.token);
        setToken(data.token);
      }

      setUser(loggedUser);
      localStorage.setItem("aura_session", JSON.stringify({ user: loggedUser }));
      loadOrders();
    } catch (err) {
      console.error("Auth error", err);
      throw err;
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("aura_session");
    localStorage.removeItem("aura_token");
    setCartItems([]);
    setTab("shop");
    setOrders([]);
  };

  // Shopping Cart Actions
  const handleAddToCart = (product: Product) => {
    setAddingProductId(product.id);
    setTimeout(() => {
      setCartItems((prevItems) => {
        const existingIdx = prevItems.findIndex((item) => item.product.id === product.id);
        if (existingIdx > -1) {
          const updated = [...prevItems];
          updated[existingIdx].quantity += 1;
          return updated;
        } else {
          return [...prevItems, { product, quantity: 1 }];
        }
      });
      setAddingProductId(null);
      setIsCartOpen(true);
    }, 400);
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  // Place Order API
  const handleCheckout = async (): Promise<string | null> => {
    if (!user) {
      setIsCartOpen(false);
      setIsAuthOpen(true);
      return null;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * 1.08;

    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: orderItems, totalAmount, userEmail: user.email }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.error || "Failed to place order");
        return null;
      }

      const createdOrder = await res.json();
      setCartItems([]);
      loadOrders();
      loadProducts();
      return createdOrder.id;
    } catch (err) {
      console.error("Checkout error:", err);
      return null;
    }
  };

  // Admin CRUD actions are controlled by the dashboard UI.
  const handleAddProduct = async (productData: any) => {
    try {
      const res = await authFetch("/api/catalog/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create product");
      }
    } catch (err) {
      console.error("Error creating product:", err);
    }
  };

  const handleUpdateProduct = async (id: string, productData: any) => {
    try {
      const res = await authFetch(`/api/catalog/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update product");
      }
    } catch (err) {
      console.error("Error updating product:", err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      const res = await authFetch(`/api/catalog/products/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        loadProducts();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete product");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await authFetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        loadOrders();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900" id="app-root-container">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentTab={currentTab}
        setTab={setTab}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentTab === "shop" && (
          <div className="space-y-8" id="shop-view-tab">
            <div className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white p-8 md:p-12 shadow-xl">
              <div className="absolute top-0 right-0 h-96 w-96 -translate-y-12 translate-x-12 rounded-full bg-indigo-500/10 blur-3xl" />
              <div className="absolute bottom-0 right-1/4 h-64 w-64 translate-y-12 rounded-full bg-purple-500/10 blur-3xl" />
              <div className="relative max-w-2xl space-y-4">
                <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
                  An authentic retail app powered by a cloud-native backend. Browse catalog queries accelerated with <strong>Redis</strong>, complete order logs dispatched over <strong>Kafka brokers</strong>, and track deployment telemetry via <strong>Prometheus Scraping</strong>.
                </p>
                <div className="pt-4 flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      if (user?.role === "ADMIN") {
                        setTab("admin");
                      } else {
                        setIsAuthOpen(true);
                      }
                    }}
                    className="flex items-center space-x-1.5 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-950 hover:bg-zinc-100 transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Test Admin Controls</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative max-w-md flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products by brand, tag, details..."
                  className="w-full rounded-xl border border-zinc-200 bg-white py-2.5 pl-10 pr-4 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none focus:ring-1 focus:ring-zinc-950 shadow-sm"
                  id="catalog-search-input"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center space-x-1.5 overflow-x-auto">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${selectedCategory === cat ? "bg-zinc-900 text-white shadow-sm" : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2 border border-zinc-200 bg-white px-3 py-1.5 rounded-lg text-xs text-zinc-600">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="focus:outline-none bg-transparent"
                  >
                    <option value="default">Default Sorting</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                  </select>
                </div>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center">
                <p className="text-sm font-semibold text-zinc-900">No products match your filters</p>
                <p className="text-xs text-zinc-500 mt-1">Try resetting search parameters or selecting all categories.</p>
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("All");
                    setSortBy("default");
                  }}
                  className="mt-4 rounded-lg bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-zinc-800"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} isAdding={addingProductId === product.id} />
                ))}
              </div>
            )}
          </div>
        )}

        {currentTab === "admin" && user?.role === "ADMIN" && (
          <AdminDashboard
            products={products}
            orders={orders}
            categories={categories.filter((c) => c !== "All")}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
          />
        )}

        {currentTab === "orders" && user && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                <ShieldCheck className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-zinc-900">Order History</h1>
                <p className="text-xs text-zinc-500">
                  Track all your order events and status updates
                </p>
              </div>
            </div>
            <OrderHistory user={user} />
          </div>
        )}
      </main>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onCheckout={handleCheckout}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLoginSubmit}
      />

      <footer className="border-t border-zinc-200 bg-white py-8 mt-16 text-center text-xs text-zinc-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-1">
          <p>© 2026 AuraStore Corporation. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
