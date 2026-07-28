import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { CartItem } from "../types";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (shippingAddress: string) => Promise<string | null>;
}

export default function CartModal({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartModalProps) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [address, setAddress] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + tax;

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !cardNumber || !cvv) return;

    setIsSubmitting(true);
    // Simulate order placement through express mock gateway
    const resultOrderNum = await onCheckout(address);
    setIsSubmitting(false);

    if (resultOrderNum) {
      setOrderNumber(resultOrderNum);
      setStep("success");
    }
  };

  const resetFlow = () => {
    setStep("cart");
    setAddress("");
    setCardName("");
    setCardNumber("");
    setExpiry("");
    setCvv("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={resetFlow}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl"
            id="cart-drawer-panel"
          >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-zinc-200 px-6">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5 text-zinc-950" />
                <h2 className="text-lg font-bold text-zinc-900">
                  {step === "cart" ? "Shopping Cart" : step === "checkout" ? "Secure Checkout" : "Success"}
                </h2>
              </div>
              <button
                onClick={resetFlow}
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-950 transition-colors"
                id="close-cart-btn"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 overflow-y-auto p-6">
              {step === "cart" && (
                <>
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="rounded-2xl bg-zinc-50 p-6 text-zinc-400">
                        <ShoppingBag className="h-12 w-12 stroke-1" />
                      </div>
                      <h3 className="mt-4 text-base font-semibold text-zinc-900">Your cart is empty</h3>
                      <p className="mt-1 text-sm text-zinc-400 max-w-xs">
                        Add items to your cart to begin your checkout journey.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-6 rounded-lg bg-zinc-950 px-5 py-2.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-all"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={item.product.id}
                          className="flex items-center space-x-4 rounded-xl border border-zinc-100 p-3.5 hover:border-zinc-200 transition-all"
                        >
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="h-16 w-16 rounded-lg object-cover object-center bg-zinc-50"
                          />
                          <div className="flex-1">
                            <h4 className="text-sm font-semibold text-zinc-900 line-clamp-1">
                              {item.product.name}
                            </h4>
                            <p className="text-xs font-bold text-zinc-950 mt-0.5">
                              ${item.product.price.toFixed(2)}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              {/* Quantity adjustments */}
                              <div className="flex items-center rounded-lg border border-zinc-200">
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, -1)}
                                  className="p-1 text-zinc-500 hover:text-zinc-950 transition-colors"
                                  id={`qty-minus-${item.product.id}`}
                                >
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="px-2.5 text-xs font-semibold text-zinc-900">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => onUpdateQuantity(item.product.id, 1)}
                                  className="p-1 text-zinc-500 hover:text-zinc-950 transition-colors"
                                  id={`qty-plus-${item.product.id}`}
                                >
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Remove item */}
                              <button
                                onClick={() => onRemoveItem(item.product.id)}
                                className="text-zinc-400 hover:text-red-600 p-1 transition-colors"
                                title="Remove Item"
                                id={`remove-item-${item.product.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {step === "checkout" && (
                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div className="rounded-xl bg-zinc-50 p-4 border border-zinc-100">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Total Due</span>
                    <p className="text-2xl font-black text-zinc-950 mt-0.5">${total.toFixed(2)}</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700">Shipping Address</label>
                    <input
                      type="text"
                      required
                      placeholder="123 Silicon Alley, San Francisco, CA"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <hr className="border-zinc-100 my-4" />

                  <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Payment Simulation</span>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700">Card Number</label>
                    <input
                      type="text"
                      required
                      placeholder="4111 2222 3333 4444"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">Expiry Date</label>
                      <input
                        type="text"
                        required
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700">CVV</label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-zinc-200 px-3.5 py-2 text-sm text-zinc-900 focus:border-zinc-950 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-6 flex items-center justify-center rounded-xl bg-zinc-950 py-3 text-sm font-bold text-white hover:bg-zinc-800 disabled:bg-zinc-300 transition-all shadow-md shadow-zinc-100"
                    id="submit-payment-btn"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="h-4 w-4 rounded-full border-2 border-white border-t-transparent"
                        />
                        <span>Broadcasting Kafka Events...</span>
                      </div>
                    ) : (
                      <span className="flex items-center space-x-1">
                        <span>Place Order & Authorize</span>
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    )}
                  </button>
                </form>
              )}

              {step === "success" && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="rounded-full bg-emerald-50 p-4 text-emerald-600">
                    <CheckCircle2 className="h-12 w-12" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-zinc-950">Order Confirmed!</h3>
                  <p className="mt-1 text-sm text-zinc-500">
                    Your order has been submitted and is processing.
                  </p>

                  <div className="mt-6 w-full space-y-2 rounded-xl border border-zinc-100 p-4 text-left bg-zinc-50">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-medium">Order Reference:</span>
                      <span className="font-mono font-bold text-zinc-900">{orderNumber}</span>
                    </div>
                    <div className="flex justify-between text-xs border-t border-zinc-200/50 pt-2">
                      <span className="text-zinc-500 font-medium">Topic Dispatch:</span>
                      <span className="font-mono font-bold text-indigo-600">orders.created.v1</span>
                    </div>
                    <div className="flex justify-between text-xs pt-1">
                      <span className="text-zinc-500 font-medium">Broker Handshake:</span>
                      <span className="font-mono text-emerald-600 font-bold">ACK RECEIVED</span>
                    </div>
                  </div>

                  <button
                    onClick={resetFlow}
                    className="mt-8 w-full rounded-xl bg-zinc-950 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors"
                  >
                    Back to Storefront
                  </button>
                </div>
              )}
            </div>

            {/* Bottom calculation billing summary panel (only on step 'cart' when there are items) */}
            {step === "cart" && cartItems.length > 0 && (
              <div className="border-t border-zinc-200 p-6 bg-zinc-50">
                <div className="space-y-2 text-sm text-zinc-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-zinc-900">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sales Tax (8%)</span>
                    <span className="font-medium text-zinc-900">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-200 pt-2 text-base font-bold text-zinc-950">
                    <span>Total Amount</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep("checkout")}
                  className="mt-4 flex w-full items-center justify-center space-x-2 rounded-xl bg-zinc-950 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition-colors shadow-md shadow-zinc-200"
                  id="checkout-next-btn"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
