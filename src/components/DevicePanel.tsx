"use client";

import { motion } from "framer-motion";
import { Fan, Lightbulb } from "lucide-react";
import type { RoomWithDevices } from "@/types";

export default function DevicePanel({ rooms }: { rooms: RoomWithDevices[] }) {
  if (rooms.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
        <p className="text-neutral-500 text-center">Loading devices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
        <span className="w-1 h-5 bg-blue-500 rounded-full" />
        Device Status
      </h2>
      {rooms.map((room) => (
        <div
          key={room.id}
          className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden"
        >
          <div className="px-4 py-3 bg-neutral-850 border-b border-neutral-800 flex items-center justify-between">
            <h3 className="font-medium text-white">{room.name}</h3>
            <span className="text-xs text-neutral-400">
              {room.devices.filter((d) => d.status).length}/{room.devices.length} active
            </span>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {room.devices.map((device) => (
              <DeviceCard key={device.id} device={device} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceCard({ device }: { device: RoomWithDevices["devices"][0] }) {
  const isOn = device.status;
  const isFan = device.type === "fan";

  return (
    <motion.div
      layout
      className={`relative rounded-lg border p-3 flex flex-col items-center gap-2 transition-colors ${
        isOn
          ? isFan
            ? "bg-cyan-950/40 border-cyan-800/50"
            : "bg-amber-950/40 border-amber-800/50"
          : "bg-neutral-850 border-neutral-800"
      }`}
    >
      {/* Icon */}
      <div className="relative">
        {isFan ? (
          <Fan
            className={`w-8 h-8 ${
              isOn ? "text-cyan-400 animate-spin-slow" : "text-neutral-600"
            }`}
          />
        ) : (
          <Lightbulb
            className={`w-8 h-8 ${
              isOn ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" : "text-neutral-600"
            }`}
          />
        )}
      </div>

      {/* Name */}
      <span className={`text-xs font-medium ${isOn ? "text-white" : "text-neutral-500"}`}>
        {device.name}
      </span>

      {/* Status badge */}
      <span
        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
          isOn
            ? "bg-green-500/20 text-green-400"
            : "bg-neutral-700/50 text-neutral-400"
        }`}
      >
        {isOn ? "ON" : "OFF"}
      </span>

      {/* Power draw */}
      {isOn && (
        <span className="text-[10px] text-neutral-400">{device.powerDraw}W</span>
      )}
    </motion.div>
  );
}
