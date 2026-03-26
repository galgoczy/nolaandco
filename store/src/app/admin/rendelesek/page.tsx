"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { formatPrice } from "@/lib/products";
import type { Order } from "@/app/api/orders/route";

const statusConfig = {
  pending: { label: "Függőben", color: "bg-amber-100 text-amber-700", icon: Clock },
  processing: { label: "Készítés alatt", color: "bg-blue-100 text-blue-700", icon: RefreshCw },
  shipped: { label: "Kiszállítva", color: "bg-purple-100 text-purple-700", icon: Truck },
  delivered: { label: "Kézbesítve", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  cancelled: { label: "Lemondva", color: "bg-red-100 text-red-700", icon: XCircle },
};

type StatusKey = keyof typeof statusConfig;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusKey | "all">("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error("Failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    fetchOrders();
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-warm-beige">
      <header className="bg-carbon text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="hover:text-terracotta transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-lg font-medium tracking-wider">Rendelések</h1>
          </div>
          <button
            onClick={fetchOrders}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <Filter size={16} className="text-carbon-light flex-shrink-0" />
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              filter === "all"
                ? "bg-carbon text-white"
                : "bg-warm-beige-dark text-carbon-light hover:bg-terracotta/10"
            }`}
          >
            Mind ({orders.length})
          </button>
          {(Object.keys(statusConfig) as StatusKey[]).map((status) => {
            const count = orders.filter((o) => o.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  filter === status
                    ? statusConfig[status].color
                    : "bg-warm-beige-dark text-carbon-light hover:bg-terracotta/10"
                }`}
              >
                {statusConfig[status].label} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="inline-block"
            >
              <RefreshCw size={24} className="text-carbon-light" />
            </motion.div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-carbon-light">
            <Package size={48} strokeWidth={1} className="mx-auto mb-4 opacity-30" />
            <p className="text-sm">Nincs ilyen rendelés</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order, i) => {
              const statusInfo = statusConfig[order.status] || statusConfig.pending;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium text-carbon">{order.id}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-xs text-carbon-light mt-1">
                        {order.shipping.lastName} {order.shipping.firstName} •{" "}
                        {order.shipping.email} •{" "}
                        {new Date(order.createdAt).toLocaleDateString("hu-HU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-terracotta">
                      {formatPrice(order.total)}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mb-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between bg-warm-beige rounded-xl px-4 py-3"
                      >
                        <div>
                          <span className="text-sm text-carbon">{item.name}</span>
                          {item.customData?.babyName && (
                            <span className="text-xs text-terracotta ml-2">
                              ({item.customData.babyName})
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-carbon-light">
                          {item.quantity}× {formatPrice(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Address */}
                  <p className="text-xs text-carbon-light mb-4">
                    Szállítás: {order.shipping.zip} {order.shipping.city},{" "}
                    {order.shipping.address} • Tel: {order.shipping.phone}
                  </p>

                  {/* Status actions */}
                  <div className="flex flex-wrap gap-2">
                    {(Object.keys(statusConfig) as StatusKey[]).map((status) => (
                      <button
                        key={status}
                        onClick={() => updateStatus(order.id, status)}
                        disabled={order.status === status}
                        className={`px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                          order.status === status
                            ? statusConfig[status].color + " cursor-default"
                            : "bg-warm-beige-dark text-carbon-light hover:bg-terracotta/10"
                        }`}
                      >
                        {statusConfig[status].label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
