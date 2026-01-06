// app/dashboard/_components/top-vaccines-chart.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type Props = {
  data: {
    vaccineId: string;
    vaccineName: string;
    count: number;
  }[];
};

export function TopVaccinesChart({ data }: Props) {
  const chartData = data.map((item) => ({
    name: item.vaccineName,
    value: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top 5 Vaksin Terbanyak</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8b5cf6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
