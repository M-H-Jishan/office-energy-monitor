"use client";

import { useEffect, useState, useCallback } from "react";
import DevicePanel from "./DevicePanel";
import PowerMeter from "./PowerMeter";
import AlertsPanel from "./AlertsPanel";
import OfficeLayout from "./OfficeLayout";
import type { DeviceWithRoom, RoomWithDevices, UsageData, AlertData, SSEEvent } from "@/types";

export default function Dashboard() {
  const [rooms, setRooms] = useState<RoomWithDevices[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [connected, setConnected] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      const [roomsRes, usageRes, alertsRes] = await Promise.all([
        fetch("/api/rooms"),
        fetch("/api/usage"),
        fetch("/api/alerts"),
      ]);
      const roomsData = await roomsRes.json();
      const usageData = await usageRes.json();
      const alertsData = await alertsRes.json();

      setRooms(roomsData);
      setUsage(usageData);
      setAlerts(alertsData);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();

    // SSE connection
    const eventSource = new EventSource("/api/events");

    eventSource.onopen = () => setConnected(true);
    eventSource.onerror = () => {
      setConnected(false);
      // Reconnect after 3s
      setTimeout(() => {
        eventSource.close();
      }, 3000);
    };

    eventSource.onmessage = (e) => {
      try {
        const event: SSEEvent = JSON.parse(e.data);
        handleSSEEvent(event);
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, [fetchInitialData]);

  function handleSSEEvent(event: SSEEvent) {
    if (event.type === "device_update") {
      const data = event.data as DeviceWithRoom & { roomName: string; roomSlug: string };
      setRooms((prev) =>
        prev.map((room) => {
          if (room.id !== data.roomId) return room;
          return {
            ...room,
            devices: room.devices.map((d) =>
              d.id === data.id
                ? { ...d, status: data.status, lastChangedAt: data.lastChangedAt }
                : d
            ),
          };
        })
      );
    } else if (event.type === "usage") {
      const data = event.data as UsageData;
      setUsage(data);
    } else if (event.type === "alert") {
      const data = event.data as AlertData;
      setAlerts((prev) => {
        if (prev.some((a) => a.id === data.id)) return prev;
        return [data, ...prev];
      });
      // Refetch alerts to get full data
      fetch("/api/alerts")
        .then((r) => r.json())
        .then((data) => setAlerts(data))
        .catch(() => {});
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Office Energy Monitor</h1>
              <p className="text-xs text-neutral-400">Real-time device & power monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            <span className="text-sm text-neutral-400">{connected ? "Live" : "Reconnecting..."}</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Power meter at top */}
        {usage && <PowerMeter usage={usage} />}

        {/* Office layout (bonus) */}
        {rooms.length > 0 && <OfficeLayout rooms={rooms} />}

        {/* Device panel and alerts side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DevicePanel rooms={rooms} />
          </div>
          <div className="lg:col-span-1">
            <AlertsPanel alerts={alerts} />
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-800 mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center text-sm text-neutral-500">
          Office Energy Monitor &middot; Hackathon Project &middot; Shared backend for Dashboard &amp; Discord Bot
        </div>
      </footer>
    </div>
  );
}
