"use client";

import { useState } from "react";
import * as XLSX from "xlsx"; // Perlu install: npm install xlsx
import { FileSpreadsheet, Printer, Search, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function ReportClient({
  initialData,
  months,
  years,
  villages,
}: any) {
  const [data, setData] = useState(initialData);

  const exportToExcel = () => {
    // Persiapkan data untuk Excel
    const worksheetData = data.detail.map((item: any, index: number) => ({
      No: index + 1,
      Tanggal: format(new Date(item.givenAt), "dd/MM/yyyy"),
      Nama_Anak: item.patient.name,
      NIK: item.patient.nik,
      Vaksin: item.vaccine.name,
      Dosis_Ke: item.doseNumber,
      Ibu: item.patient.motherName,
    }));

    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Imunisasi");
    XLSX.writeFile(wb, `Laporan_Bulanan_${Date.now()}.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* FILTER BAR (Contoh singkat) */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-xl border shadow-sm items-end">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500">
            Pilih Bulan
          </label>
          <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors">
            {months.map((m: any) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
        <Button variant="default" size="sm" className="gap-2">
          <Search className="h-4 w-4" /> Tampilkan
        </Button>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToExcel}
            className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
          >
            <Download className="h-4 w-4 mr-2" /> Excel
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Cetak PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* REKAP VAKSIN */}
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="bg-slate-50/50 py-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Cakupan Vaksin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jenis Vaksin</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.rekap.map((r: any) => (
                  <TableRow key={r.name}>
                    <TableCell className="text-sm font-medium">
                      {r.name}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {r.total} Anak
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DETAIL PASIEN */}
        <Card className="md:col-span-2 shadow-sm">
          <CardHeader className="bg-slate-50/50 py-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider">
              Daftar Penerima Vaksin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs uppercase">Nama Anak</TableHead>
                  <TableHead className="text-xs uppercase">Vaksin</TableHead>
                  <TableHead className="text-xs uppercase">Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.detail.map((d: any) => (
                  <TableRow key={d.id}>
                    <TableCell className="text-sm font-medium">
                      {d.patient.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">
                        {d.vaccine.name} ({d.doseNumber})
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {format(new Date(d.givenAt), "dd MMM yyyy", {
                        locale: id,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
