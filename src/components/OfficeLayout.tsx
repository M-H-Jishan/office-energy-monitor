"use client";

import { motion } from "framer-motion";
import type { RoomWithDevices } from "@/types";

const SVG_BASE = "/components_svg";

export default function OfficeLayout({ rooms }: { rooms: RoomWithDevices[] }) {
  return (
    <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white tracking-wide">
          OFFICE LAYOUT (TOP VIEW)
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          All rooms have 2 Fans and 3 Lights
        </p>
      </div>

      {/* Main layout: floor plan + sidebar */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Floor plan SVG */}
        <div className="flex-1 overflow-x-auto">
          <svg
            viewBox="0 0 750 520"
            className="w-full min-w-[600px] h-auto"
            style={{ maxHeight: "520px" }}
          >
            {/* Page background */}
            <rect width="750" height="520" fill="#1a1a1a" rx="8" />

            {/* Exterior walls */}
            <rect
              x="20"
              y="20"
              width="710"
              height="380"
              fill="none"
              stroke="#555"
              strokeWidth="4"
              rx="2"
            />

            {/* Interior walls (2 dividers) */}
            <line x1="256" y1="20" x2="256" y2="400" stroke="#444" strokeWidth="3" />
            <line x1="494" y1="20" x2="494" y2="400" stroke="#444" strokeWidth="3" />

            {/* Interior wall door openings (just gaps, no door icons) */}

            {/* Windows on exterior walls */}
            <image href={`${SVG_BASE}/window.svg`} x="10" y="18" width="50" height="20" />
            <image href={`${SVG_BASE}/window.svg`} x="690" y="18" width="50" height="20" />

            {/* Mirrors on top wall of each room */}
            <MirrorH x={108} y={20} w={60} />
            <MirrorH x={344} y={20} w={60} />
            <MirrorH x={582} y={20} w={60} />

            {/* Mirror on left wall of Drawing Room (little up from middle) */}
            <MirrorV x={20} y={150} h={70} />

            {/* Mirror on right wall of Work Room 2 (little down from middle) */}
            <MirrorV x={728} y={260} h={70} />

            {/* Room 1: Drawing Room (warm beige floor) */}
            <rect x="22" y="22" width="232" height="376" fill="#3d3528" opacity="0.6" />
            {rooms[0] && <RoomContent room={rooms[0]} roomType="drawing" x={22} y={22} w={232} h={376} />}

            {/* Room 2: Work Room 1 (light gray floor) */}
            <rect x="258" y="22" width="232" height="376" fill="#2a2a30" opacity="0.6" />
            {rooms[1] && <RoomContent room={rooms[1]} roomType="work" x={258} y={22} w={232} h={376} />}

            {/* Room 3: Work Room 2 (warm wood floor) */}
            <rect x="496" y="22" width="232" height="376" fill="#2e2515" opacity="0.6" />
            {rooms[2] && <RoomContent room={rooms[2]} roomType="work" x={496} y={22} w={232} h={376} />}

            {/* Corridor */}
            <rect x="20" y="400" width="710" height="60" fill="#1e1e24" stroke="#444" strokeWidth="3" />
            <text x="375" y="435" textAnchor="middle" fill="#555" fontSize="13" fontFamily="sans-serif" fontWeight="500">
              CORRIDOR / LOBBY
            </text>

            {/* Main entry door on corridor (bottom-center) */}
            <rect x="355" y="455" width="40" height="6" fill="#1a1a1a" />
            <image href={`${SVG_BASE}/door.svg`} x="353" y="458" width="44" height="35" />
            <text x="375" y="505" textAnchor="middle" fill="#888" fontSize="9" fontFamily="sans-serif" fontWeight="600">
              ↑ MAIN ENTRY
            </text>

            {/* Corridor plants */}
            <image href={`${SVG_BASE}/plant.svg`} x="50" y="408" width="28" height="28" />

            {/* Water cooler (right side of corridor) */}
            <image href={`${SVG_BASE}/water_cooler.svg`} x="690" y="405" width="30" height="30" />
            <image href={`${SVG_BASE}/plant.svg`} x="650" y="408" width="28" height="28" />

            {/* Entry doors — one on the bottom wall of each room */}
            {/* Drawing Room entry */}
            <rect x="120" y="396" width="36" height="6" fill="#1a1a1a" />
            <image href={`${SVG_BASE}/door.svg`} x="118" y="398" width="40" height="30" />
            <text x="138" y="430" textAnchor="middle" fill="#888" fontSize="8" fontFamily="sans-serif" fontWeight="600">
              ENTRY
            </text>

            {/* Work Room 1 entry */}
            <rect x="356" y="396" width="36" height="6" fill="#1a1a1a" />
            <image href={`${SVG_BASE}/door.svg`} x="354" y="398" width="40" height="30" />
            <text x="374" y="430" textAnchor="middle" fill="#888" fontSize="8" fontFamily="sans-serif" fontWeight="600">
              ENTRY
            </text>

            {/* Work Room 2 entry */}
            <rect x="594" y="396" width="36" height="6" fill="#1a1a1a" />
            <image href={`${SVG_BASE}/door.svg`} x="592" y="398" width="40" height="30" />
            <text x="612" y="430" textAnchor="middle" fill="#888" fontSize="8" fontFamily="sans-serif" fontWeight="600">
              ENTRY
            </text>

            {/* Room labels */}
            <text x={138} y="42" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">
              DRAWING ROOM
            </text>
            <text x={374} y="42" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">
              WORK ROOM 1
            </text>
            <text x={612} y="42" textAnchor="middle" fill="#aaa" fontSize="11" fontFamily="sans-serif" fontWeight="700" letterSpacing="1">
              WORK ROOM 2
            </text>
          </svg>
        </div>

        {/* Sidebar panels */}
        <div className="w-full lg:w-64 flex flex-col gap-3">
          {/* Legend */}
          <div className="bg-neutral-850 rounded-lg p-3 border border-neutral-800">
            <h3 className="text-xs font-bold text-white mb-2 tracking-wide">LEGEND</h3>
            <div className="space-y-1.5">
              <LegendItem color="#22d3ee" label="Fan (2 per room)" />
              <LegendItem color="#fbbf24" label="Light (3 per room)" />
              <LegendItem color="#888" label="Door" />
              <LegendItem color="#3b82f6" label="Window" />
            </div>
          </div>

          {/* Devices Summary */}
          <div className="bg-neutral-850 rounded-lg p-3 border border-neutral-800">
            <h3 className="text-xs font-bold text-white mb-2 tracking-wide">DEVICES SUMMARY</h3>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>3 Rooms</li>
              <li>2 Fans per room</li>
              <li>3 Lights per room</li>
              <li className="text-neutral-300 font-semibold">Total Fans: 6</li>
              <li className="text-neutral-300 font-semibold">Total Lights: 9</li>
              <li className="text-white font-bold">Total Devices: 15</li>
            </ul>
          </div>

          {/* Room Usage */}
          <div className="bg-neutral-850 rounded-lg p-3 border border-neutral-800">
            <h3 className="text-xs font-bold text-white mb-2 tracking-wide">ROOM USAGE</h3>
            <ul className="text-xs text-neutral-400 space-y-1">
              <li>Drawing Room — Waiting area</li>
              <li>Work Room 1 — Employees</li>
              <li>Work Room 2 — Employees</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Room-wise device cards */}
      <div className="grid grid-cols-3 gap-3 mt-4">
        {rooms.map((room, i) => {
          const colors = ["bg-amber-900/40 border-amber-700/50", "bg-slate-700/40 border-slate-500/50", "bg-yellow-900/40 border-yellow-700/50"];
          return (
            <div key={room.id} className={`${colors[i] || colors[0]} rounded-lg p-3 border`}>
              <p className="text-sm font-bold text-white mb-1">{room.name}</p>
              <div className="flex gap-3 text-xs text-neutral-300">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" /> 2 Fans
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> 3 Lights
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Room content renderer ---------- */

function RoomContent({
  room,
  roomType,
  x,
  y,
  w,
  h,
}: {
  room: RoomWithDevices;
  roomType: "drawing" | "work";
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const fans = room.devices.filter((d) => d.type === "fan");
  const lights = room.devices.filter((d) => d.type === "light");

  // Fan positions: top-center and bottom-center of room
  const fanPositions = [
    { x: x + w / 2, y: y + 85 },
    { x: x + w / 2, y: y + h - 100 },
  ];

  // Light positions: 2 on top row (spread wider), 1 in bottom center (under fans)
  const lightPositions = [
    { x: x + w * 0.2, y: y + 60 },
    { x: x + w * 0.8, y: y + 60 },
    { x: x + w * 0.5, y: y + h - 45 },
  ];

  return (
    <g>
      {roomType === "drawing" ? (
        <DrawingRoomFurniture x={x} y={y} w={w} h={h} />
      ) : (
        <WorkRoomFurniture x={x} y={y} w={w} h={h} />
      )}

      {/* Lights */}
      {lights.map((light, i) => {
        const pos = lightPositions[i] || lightPositions[0];
        return <LightIcon key={light.id} x={pos.x} y={pos.y} on={light.status} />;
      })}

      {/* Fans */}
      {fans.map((fan, i) => {
        const pos = fanPositions[i] || fanPositions[0];
        return <FanIcon key={fan.id} x={pos.x} y={pos.y} on={fan.status} />;
      })}
    </g>
  );
}

/* ---------- Furniture ---------- */

function DrawingRoomFurniture({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  // Sofa centered on the left side of the room
  const sofaW = 70;
  const sofaX = x + 20;
  const sofaY = y + h / 2 - sofaW / 2 - 10;

  return (
    <g>
      {/* L-shaped sofa (left-centered, vertical orientation) */}
      {/* Horizontal part */}
      <rect x={sofaX} y={sofaY} width={sofaW} height={22} fill="#4a3a2a" stroke="#5a4a3a" strokeWidth="1" rx="4" />
      {/* Vertical part (backrest going down) */}
      <rect x={sofaX} y={sofaY} width={22} height={sofaW} fill="#4a3a2a" stroke="#5a4a3a" strokeWidth="1" rx="4" />

      {/* Coffee table (to the right of sofa, centered) */}
      <image href={`${SVG_BASE}/coffee_table.svg`} x={x + w / 2 - 10} y={sofaY + 5} width="40" height="28" />

      {/* Armchair (bottom-left, centered) */}
      <image href={`${SVG_BASE}/armchair.svg`} x={x + 20} y={y + h - 75} width="35" height="35" />

      {/* Potted plants */}
      <image href={`${SVG_BASE}/plant.svg`} x={x + 4} y={y + 18} width="28" height="28" />
      <image href={`${SVG_BASE}/plant.svg`} x={x + w - 40} y={y + h - 40} width="28" height="28" />
    </g>
  );
}

function WorkRoomFurniture({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  // 4 desks in 2x2 grid, centered
  const deskW = 50;
  const deskH = 35;
  const gapX = 30;
  const gapY = 50;
  const startX = x + (w - (deskW * 2 + gapX)) / 2;
  const totalH = deskH * 2 + gapY;
  const startY = y + (h - totalH) / 2;

  const desks = [
    { x: startX, y: startY },
    { x: startX + deskW + gapX, y: startY },
    { x: startX, y: startY + deskH + gapY },
    { x: startX + deskW + gapX, y: startY + deskH + gapY },
  ];

  return (
    <g>
      {desks.map((d, i) => (
        <g key={i}>
          {/* Desk with monitor */}
          <image href={`${SVG_BASE}/desk.svg`} x={d.x} y={d.y} width={deskW} height={deskH} />
        </g>
      ))}
      {/* Small plants on 2 desks */}
      <image href={`${SVG_BASE}/plant.svg`} x={desks[0].x + deskW - 14} y={desks[0].y - 14} width="16" height="16" />
      <image href={`${SVG_BASE}/plant.svg`} x={desks[3].x + deskW - 14} y={desks[3].y - 14} width="16" height="16" />
    </g>
  );
}

/* ---------- Icons ---------- */

function FanIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  const size = 32;
  return (
    <g>
      {on && (
        <circle cx={x} cy={y} r="20" fill="rgba(34,211,238,0.08)" />
      )}
      {on ? (
        <motion.g
          style={{ transformOrigin: `${x}px ${y}px` }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        >
          <image
            href={`${SVG_BASE}/fan.svg`}
            x={x - size / 2}
            y={y - size / 2}
            width={size}
            height={size}
            style={{ filter: "hue-rotate(180deg) brightness(1.3)" }}
          />
        </motion.g>
      ) : (
        <image
          href={`${SVG_BASE}/fan.svg`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          opacity="0.3"
        />
      )}
    </g>
  );
}

function LightIcon({ x, y, on }: { x: number; y: number; on: boolean }) {
  const size = 24;
  return (
    <g>
      {on && (
        <motion.circle
          cx={x}
          cy={y}
          r="18"
          fill="rgba(251,191,36,0.12)"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      {on ? (
        <image
          href={`${SVG_BASE}/light.svg`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
        />
      ) : (
        <image
          href={`${SVG_BASE}/light.svg`}
          x={x - size / 2}
          y={y - size / 2}
          width={size}
          height={size}
          opacity="0.2"
          style={{ filter: "grayscale(1)" }}
        />
      )}
    </g>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-neutral-400">
      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </div>
  );
}

/* ---------- Mirrors ---------- */

function MirrorH({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <defs>
        <linearGradient id={`mirror-h-${x}-${y}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0e7ef" />
          <stop offset="50%" stopColor="#b8c5d6" />
          <stop offset="100%" stopColor="#d4dce6" />
        </linearGradient>
      </defs>
      <rect x={x} y={y - 4} width={w} height={8} fill={`url(#mirror-h-${x}-${y})`} stroke="#6a7a8a" strokeWidth="1" rx="1" />
      <line x1={x + 4} y1={y - 2} x2={x + w - 4} y2={y - 2} stroke="#fff" strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}

function MirrorV({ x, y, h }: { x: number; y: number; h: number }) {
  return (
    <g>
      <defs>
        <linearGradient id={`mirror-v-${x}-${y}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#e0e7ef" />
          <stop offset="50%" stopColor="#b8c5d6" />
          <stop offset="100%" stopColor="#d4dce6" />
        </linearGradient>
      </defs>
      <rect x={x - 4} y={y} width={8} height={h} fill={`url(#mirror-v-${x}-${y})`} stroke="#6a7a8a" strokeWidth="1" rx="1" />
      <line x1={x - 2} y1={y + 4} x2={x - 2} y2={y + h - 4} stroke="#fff" strokeWidth="0.5" opacity="0.6" />
    </g>
  );
}
