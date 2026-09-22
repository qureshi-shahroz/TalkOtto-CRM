"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function CallsChart({ data }: { data: { label: string; calls: number; connected: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="callsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.35} />
            <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="connectedFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2733" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: "#8792a2", fontSize: 11 }}
          axisLine={{ stroke: "#1f2733" }}
          tickLine={false}
        />
        <YAxis tick={{ fill: "#8792a2", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{
            background: "#131a23",
            border: "1px solid #1f2733",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "#e6ebf1" }}
        />
        <Area
          type="monotone"
          dataKey="calls"
          name="Calls"
          stroke="#2dd4bf"
          fill="url(#callsFill)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="connected"
          name="Connected"
          stroke="#818cf8"
          fill="url(#connectedFill)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
