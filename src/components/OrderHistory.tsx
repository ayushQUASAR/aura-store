import React, { useEffect, useState } from "react";
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  ChevronDown,
  ChevronUp,
  DollarSign,
  Hash,
} from "lucide-react";
import { OrderHistoryEvent, OrderHistoryStats, User } from "../types";

interface OrderHistoryProps {
  user: User;
}

const statusIcon = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return <Clock className="h-4 w-4 text-amber-500" />;
    case "SHIPPED":
      return <Truck className="h-4 w-4 text-blue-500" />;
    case "DELIVERED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
    default:
      return <Package className="h-4 w-4 text-zinc-400" />;
  }
};

const statusColor = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "SHIPPED":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "DELIVERED":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-zinc-50 text-zinc-600 ring-zinc-200";
  }
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function OrderHistory({ user }: OrderHistoryProps) {
  const [events, setEvents] = useState<OrderHistoryEvent[]>([]);
  const [stats, setStats] = useState<OrderHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.email) return;
    setLoading(true);

    Promise.all([
      fetch(`/api/history/${encodeURIComponent(user.email)}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("aura_token") || ""}` },
      }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`/api/history/${encodeURIComponent(user.email)}/stats`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("aura_token") || ""}` },
      }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([historyData, statsData]) => {
        setEvents(historyData);
        setStats(statsData);
      })
      .catch((err) => {
        console.error("Error loading order history:", err);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  const ordersMap = new Map<string, OrderHistoryEvent[]>();
  events.forEach((ev) => {
    const key = String(ev.orderId);
    if (!ordersMap.has(key)) ordersMap.set(key, []);
    ordersMap.get(key)!.push(ev);
  });

  const sortedOrders = Array.from(ordersMap.entries()).sort((a, b) => {
    const aTime = new Date(a[1][0]?.eventTime || 0).getTime();
    const bTime = new Date(b[1][0]?.eventTime || 0).getTime();
    return bTime - aTime;
  });

  const toggleExpand = (orderId: string) => {
    setExpandedOrder((prev) => (prev === orderId ? null : orderId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Orders"
            value={String(stats.totalOrders)}
            icon={<Package className="h-5 w-5 text-indigo-500" />}
          />
          <StatCard
            label="Total Spent"
            value={`$${stats.totalSpent.toFixed(2)}`}
            icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
          />
          <StatCard
            label="Status Updates"
            value={String(stats.totalStatusUpdates)}
            icon={<Truck className="h-5 w-5 text-blue-500" />}
          />
          <StatCard
            label="Total Events"
            value={String(stats.totalEvents)}
            icon={<Hash className="h-5 w-5 text-purple-500" />}
          />
        </div>
      )}

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-zinc-300" />
          <p className="mt-4 text-sm font-semibold text-zinc-900">
            No order history yet
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Your order events will appear here once you place an order.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map(([orderId, orderEvents]) => {
            const latest = orderEvents[0];
            const isExpanded = expandedOrder === orderId;

            return (
              <div
                key={orderId}
                className="rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <button
                  onClick={() => toggleExpand(orderId)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-zinc-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100">
                      <Package className="h-5 w-5 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-900">
                        Order #{orderId}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {formatDate(latest.eventTime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {latest.totalAmount != null && (
                      <span className="text-sm font-bold text-zinc-900">
                        ${latest.totalAmount.toFixed(2)}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusColor(
                        latest.status
                      )}`}
                    >
                      {statusIcon(latest.status)}
                      {latest.status}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Timeline */}
                {isExpanded && (
                  <div className="border-t border-zinc-100 bg-zinc-50/50 px-5 py-4">
                    <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Event Timeline
                    </p>
                    <div className="space-y-3">
                      {orderEvents.map((ev, idx) => (
                        <div key={ev.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                                idx === 0
                                  ? "bg-zinc-900 text-white"
                                  : "bg-zinc-200 text-zinc-500"
                              }`}
                            >
                              {statusIcon(ev.status)}
                            </div>
                            {idx < orderEvents.length - 1 && (
                              <div className="mt-1 h-full w-px bg-zinc-200" />
                            )}
                          </div>
                          <div className="pb-2">
                            <p className="text-sm font-medium text-zinc-900">
                              {ev.details}
                            </p>
                            <p className="text-[11px] text-zinc-400">
                              {formatDate(ev.eventTime)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
            {label}
          </p>
          <p className="text-lg font-bold text-zinc-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
