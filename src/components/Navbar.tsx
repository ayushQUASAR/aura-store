import React from "react";
import { ShoppingBag, ShieldCheck, LogIn, LogOut, User as UserIcon, ClipboardList } from "lucide-react";
import { User } from "../types";

interface NavbarProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  currentTab: "shop" | "admin" | "orders";
  setTab: (tab: "shop" | "admin" | "orders") => void;
}

export default function Navbar({
  user,
  onOpenAuth,
  onLogout,
  cartCount,
  onOpenCart,
  currentTab,
  setTab,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div 
          onClick={() => setTab("shop")} 
          className="flex cursor-pointer items-center space-x-2"
          id="nav-logo"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-950">
            Aura<span className="font-light text-zinc-500">Store</span>
          </span>
          <span className="hidden rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-600 sm:inline-block">
            Microservices Preview
          </span>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden space-x-1 md:flex">
          <button
            onClick={() => setTab("shop")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              currentTab === "shop"
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            }`}
            id="nav-tab-shop"
          >
            Shop Storefront
          </button>
          
          {user && user.role === "ADMIN" && (
            <button
              onClick={() => setTab("admin")}
              className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentTab === "admin"
                  ? "bg-emerald-50 text-emerald-950"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
              id="nav-tab-admin"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Admin Dashboard</span>
            </button>
          )}

          {user && (
            <button
              onClick={() => setTab("orders")}
              className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                currentTab === "orders"
                  ? "bg-indigo-50 text-indigo-950"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
              }`}
              id="nav-tab-orders"
            >
              <ClipboardList className="h-4 w-4 text-indigo-600" />
              <span>Order History</span>
            </button>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Active Navigation Menu on Mobile */}
          <div className="flex md:hidden space-x-1">
            <button
              onClick={() => setTab("shop")}
              className={`rounded-md p-1.5 text-xs font-semibold ${currentTab === "shop" ? "bg-zinc-100 text-zinc-950" : "text-zinc-500"}`}
            >
              Shop
            </button>
            {user?.role === "ADMIN" && (
              <button
                onClick={() => setTab("admin")}
                className={`rounded-md p-1.5 text-xs font-semibold ${currentTab === "admin" ? "bg-emerald-50 text-emerald-900" : "text-zinc-500"}`}
              >
                Admin
              </button>
            )}
            {user && (
              <button
                onClick={() => setTab("orders")}
                className={`rounded-md p-1.5 text-xs font-semibold ${currentTab === "orders" ? "bg-indigo-50 text-indigo-900" : "text-zinc-500"}`}
              >
                Orders
              </button>
            )}
          </div>

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
            aria-label="Shopping Cart"
            id="nav-cart-btn"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-[10px] font-bold text-white ring-2 ring-white">
                {cartCount}
              </span>
            )}
          </button>

          {/* Auth State */}
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-semibold text-zinc-800">{user.name}</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{user.role}</span>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 ring-2 ring-zinc-200">
                <UserIcon className="h-4 w-4 text-zinc-600" />
              </div>
              <button
                onClick={onLogout}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-red-50 hover:text-red-600"
                title="Log Out"
                id="nav-logout-btn"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center space-x-1.5 rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-800"
              id="nav-login-btn"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
