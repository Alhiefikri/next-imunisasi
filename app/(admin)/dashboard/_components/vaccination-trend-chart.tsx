// app/dashboard/_components/vaccination-trend-chart.tsx
"use client";

import { VaccinationTrend } from "@/app/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: VaccinationTrend[];
};

export function VaccinationTrendChart({ data }: Props) {
  const chartData = data.map((item) => ({
    month: item.month,
    total: item.total,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trend Vaksinasi 6 Bulan</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" fontSize={12} />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
