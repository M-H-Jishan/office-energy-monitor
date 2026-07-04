export type DeviceType = "fan" | "light";

export interface DeviceWithRoom {
  id: number;
  name: string;
  type: DeviceType;
  status: boolean;
  powerDraw: number;
  lastChangedAt: string;
  roomId: number;
  room: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface RoomWithDevices {
  id: number;
  name: string;
  slug: string;
  devices: DeviceWithRoom[];
}

export interface UsageData {
  totalWatts: number;
  rooms: {
    id: number;
    name: string;
    slug: string;
    watts: number;
  }[];
  dailyKwh: number;
}

export interface AlertData {
  id: number;
  type: string;
  message: string;
  roomId: number | null;
  room: { name: string; slug: string } | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface SSEEvent {
  type: "device_update" | "alert" | "usage" | "connected";
  data: unknown;
  timestamp: string;
}
