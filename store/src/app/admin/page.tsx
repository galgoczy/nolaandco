"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronRight,
  RefreshCw,
  Mail,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/app/api/orders/route";

const statusConfig = {
  pending: {
    label: "Függőben",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
  processing: {
    label: "Készítés alatt",
    color: "bg-blue-100 text-blue-700",
    icon: RefreshCw,
  },
  shipped: {
    label: "Kiszállítva",
    color: "bg-purple-100 text-purple-700",
    icon: Truck,
  },
  delivered: {
    label: "Kézbesítve",
    color: "bg-green-100 text-green-700",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Lemondva",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [subscribers, setSubscribers] = useState<{ total: number }>({
    total: 0,
  });

  useEffect(() => {
    fetchOrders();
    fetchSubscribers();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscribers = async () => {
    try {
      const res = await fetch("/api/newsletter");
      const data = await res.json();
      setSubscribers({ total: data.total });
    } catch (err) {
      console.error("Failed to fetch subscribers:", err);
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error("Failed to update:", err);
    }
  };

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(
    (o) => o.status === "pending" || o.status === "processing"
  ).length;

  const stats = [
    {
      label: "Összes rendelés",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-terracotta",
    },
    {
      label: "Bevétel",
      value: formatPrice(totalRevenue),
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      label: "Függőben",
      value: pendingOrders,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Feliratkozók",
      value: subscribers.total,
      icon: Users,
      color: "text-blue-600",
    },
  ];

  return (
    <div className="min-h-screen bg-warm-beige">
      {/* Admin navbar */}
      <header className="bg-carbon text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package size={24} className="text-terracotta" />
            <h1 className="text-lg font-medium tracking-wider">
              NOLA&CO Admin
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/rendelesek"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Rendelések
            </Link>
            <Link
              href="/"
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Webshop →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-semibold text-carbon">{stat.value}</p>
              <p className="text-xs text-carbon-light mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Orders */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-warm-beige-dark flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-carbon">
              Legutóbbi rendelések
            </h2>
            <button
              onClick={fetchOrders}
              className="p-2 hover:bg-warm-beige-dark rounded-lg transition-colors"
            >
              <RefreshCw size={16} className="text-carbon-light" />
            </button>
          </div>

          {loading ? (
            <div className="p-12 text-center text-carbon-light">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="inline-block"
              >
                <RefreshCw size={24} />
              </motion.div>
              <p className="mt-2 text-sm">Betöltés...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-carbon-light">
              <ShoppingBag
                size={48}
                strokeWidth={1}
                className="mx-auto mb-4 opacity-30"
              />
              <p className="text-sm">Még nincs rendelés</p>
            </div>
          ) : (
            <div className="divide-y divide-warm-beige-dark">
              {orders.map((order) => {
                const statusInfo =
                  statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 sm:p-6 hover:bg-warm-beige/30 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-warm-beige-dark rounded-xl flex items-center justify-center">
                          <Package size={18} className="text-carbon-light" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-carbon">
                              {order.id}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.color}`}
                            >
                              <StatusIcon size={10} />
                              {statusInfo.label}
                            </span>
                          </div>
                          <p className="text-xs text-carbon-light mt-0.5">
                            {order.shipping.lastName}{" "}
                            {order.shipping.firstName} •{" "}
                            {new Date(order.createdAt).toLocaleDateString(
                              "hu-HU"
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-carbon">
                          {formatPrice(order.total)}
                        </span>
                        <ChevronRight
                          size={16}
                          className="text-carbon-light"
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <Link
            href="/admin/rendelesek"
            className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-10 h-10 bg-terracotta/10 rounded-xl flex items-center justify-center">
              <Package size={18} className="text-terracotta" />
            </div>
            <div>
              <p className="text-sm font-medium text-carbon">
                Rendelés kezelés
              </p>
              <p className="text-xs text-carbon-light">
                Rendelések feldolgozása, státusz frissítés
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-4 p-5 bg-white rounded-2xl shadow-sm">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-carbon">
                Hírlevél feliratkozók
              </p>
              <p className="text-xs text-carbon-light">
                {subscribers.total} feliratkozó
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Order detail modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 shadow-2xl overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display text-xl font-medium text-carbon">
                    {selectedOrder.id}
                  </h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-warm-beige-dark rounded-lg transition-colors"
                  >
                    <XCircle size={20} className="text-carbon-light" />
                  </button>
                </div>

                {/* Status update */}
                <div className="mb-6">
                  <p className="text-xs text-carbon-light mb-2">Státusz</p>
                  <div className="flex flex-wrap gap-2">
                    {(
                      Object.keys(statusConfig) as Array<
                        keyof typeof statusConfig
                      >
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateOrderStatus(selectedOrder.id, status)
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          selectedOrder.status === status
                            ? statusConfig[status].color +
                              " ring-2 ring-offset-1 ring-current"
                            : "bg-warm-beige-dark text-carbon-light hover:bg-warm-beige"
                        }`}
                      >
                        {statusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customer */}
                <div className="mb-6 bg-warm-beige rounded-xl p-4">
                  <h3 className="text-sm font-medium text-carbon mb-2">
                    Vásárló
                  </h3>
                  <p className="text-sm text-carbon-light">
                    {selectedOrder.shipping.lastName}{" "}
                    {selectedOrder.shipping.firstName}
                  </p>
                  <p className="text-xs text-carbon-light mt-1">
                    {selectedOrder.shipping.email}
                  </p>
                  <p className="text-xs text-carbon-light">
                    {selectedOrder.shipping.phone}
                  </p>
                </div>

                {/* Shipping */}
                <div className="mb-6 bg-warm-beige rounded-xl p-4">
                  <h3 className="text-sm font-medium text-carbon mb-2">
                    Szállítási cím
                  </h3>
                  <p className="text-sm text-carbon-light">
                    {selectedOrder.shipping.zip}{" "}
                    {selectedOrder.shipping.city},{" "}
                    {selectedOrder.shipping.address}
                  </p>
                  {selectedOrder.shipping.note && (
                    <p className="text-xs text-carbon-light mt-1 italic">
                      Megjegyzés: {selectedOrder.shipping.note}
                    </p>
                  )}
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-carbon mb-3">
                    Tételek
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div
                        key={item.productId}
                        className="bg-warm-beige rounded-xl p-4"
                      >
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-carbon">
                            {item.name}
                          </span>
                          <span className="text-sm text-carbon">
                            {item.quantity} × {formatPrice(item.price)}
                          </span>
                        </div>
                        {item.customData && (
                          <div className="mt-2 space-y-1">
                            {Object.entries(item.customData).map(
                              ([key, val]) => (
                                <p
                                  key={key}
                                  className="text-xs text-carbon-light"
                                >
                                  <span className="font-medium">{key}:</span>{" "}
                                  {val}
                                </p>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-warm-beige-dark pt-4 flex justify-between items-center">
                  <span className="font-medium text-carbon">Összesen</span>
                  <span className="text-xl font-semibold text-terracotta">
                    {formatPrice(selectedOrder.total)}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
