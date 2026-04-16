"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LineData {
  date: string;
  value: number;
}

interface BarData {
  label: string;
  value: number;
}

const tooltipStyle = {
  backgroundColor: "#1C1D1F",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "8px",
  fontSize: "11px",
  color: "#f9f9f9",
};

export function MiniLineChart({
  data,
  color = "#65ae4c",
}: {
  data: LineData[];
  color?: string;
}) {
  if (!data.length) return <p className="py-8 text-center text-xs text-gray-text/40">No data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={data}>
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#9e9e9e", fontSize: "10px" }}
          formatter={(v) => [String(v), "Count"]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 3, fill: color }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MiniBarChart({
  data,
  color = "#65ae4c",
}: {
  data: BarData[];
  color?: string;
}) {
  if (!data.length) return <p className="py-8 text-center text-xs text-gray-text/40">No data yet</p>;

  return (
    <ResponsiveContainer width="100%" height={120}>
      <BarChart data={data}>
        <Tooltip
          contentStyle={tooltipStyle}
          labelStyle={{ color: "#9e9e9e", fontSize: "10px" }}
          formatter={(v) => [String(v), "Count"]}
        />
        <Bar dataKey="value" fill={color} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
