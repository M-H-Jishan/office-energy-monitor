"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import type { UsageData } from "@/types";

export default function PowerMeter({ usage }: { usage: UsageData }) {
  const maxPower = 15 * 60; // Max possible: all 15 devices at 60W = 900W (worst case)
  const totalWatts = usage.totalWatts ?? 0;
  const dailyKwh = usage.dailyKwh ?? 0;
  const rooms = usage.rooms ?? [];
  const percentage = Math.min((totalWatts / maxPower) * 100, 100);

  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400" />
        Power Consumption
      </h2>

      {/* Total power */}
      <div className="flex items-baseline gap-3 mb-4">
        <motion.span
          key={totalWatts}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-white tabular-nums"
        >
          {totalWatts.toFixed(0)}
        </motion.span>
        <span className="text-xl text-neutral-400">Watts</span>
        <span className="ml-auto text-sm text-neutral-500">
          Est. today: {dailyKwh.toFixed(2)} kWh
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-neutral-800 rounded-full overflow-hidden mb-5">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>

      {/* Per-room breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="bg-neutral-850 rounded-lg p-3 border border-neutral-800"
          >
            <p className="text-sm text-neutral-400 mb-1">{room.name}</p>
            <div className="flex items-baseline gap-1">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={room.watts}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-2xl font-bold tabular-nums ${
                    room.watts > 0 ? "text-white" : "text-neutral-600"
                  }`}
                >
                  {room.watts.toFixed(0)}
                </motion.span>
              </AnimatePresence>
              <span className="text-sm text-neutral-500">W</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
