"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock } from "lucide-react";
import type { AlertData } from "@/types";

export default function AlertsPanel({ alerts }: { alerts: AlertData[] }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5 h-full">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <AlertTriangle className="w-5 h-5 text-orange-400" />
        Active Alerts
        {alerts.length > 0 && (
          <span className="ml-auto text-xs px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded-full">
            {alerts.length}
          </span>
        )}
      </h2>

      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-neutral-400">All clear — no active alerts</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          <AnimatePresence>
            {alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={`rounded-lg border p-3 ${
                  alert.type === "after_hours"
                    ? "bg-red-950/30 border-red-900/50"
                    : "bg-orange-950/30 border-orange-900/50"
                }`}
              >
                <div className="flex items-start gap-2">
                  {alert.type === "after_hours" ? (
                    <Clock className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white">{alert.message}</p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
