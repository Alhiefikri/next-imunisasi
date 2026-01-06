import NavMenu from "@/components/navbar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthSession } from "@/lib/auth-utils";
import {
  Activity,
  CalendarHeart,
  ChevronRight,
  HeartPulse,
  Lock,
  Search,
  ShieldCheck,
  Syringe,
} from "lucide-react";

export default async function Home() {
  const session = await AuthSession();

  return (
    <div className="flex min-h-screen flex-col bg-background font-sans antialiased">
      {/* Navbar Wrapper agar tetap konsisten */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto">
          <NavMenu
            userName={session?.user.name}
            userImage={session?.user.image ?? ""}
          />
        </div>
      </div>

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
      {/* Background Pattern yang Halus & Modern */}
      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]"></div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Badge Animasi Kecil */}
          <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 backdrop-blur-sm transition-colors hover:bg-blue-100">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
            Sistem Posyandu Terintegrasi Digital
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl mx-auto text-slate-900 leading-tight">
            Tumbuh Kembang Anak, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Prioritas Utama Kami
            </span>
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground md:text-xl mx-auto leading-relaxed">
            Platform satu pintu untuk memantau jadwal imunisasi, riwayat
            kesehatan, dan grafik pertumbuhan buah hati Anda secara real-time.
          </p>

          {/* --- SEARCH WIDGET UTAMA --- */}
          <div className="w-full max-w-2xl mt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Card className="shadow-2xl shadow-blue-900/10 border-slate-200/60 backdrop-blur-sm bg-white/80">
              <CardContent className="p-3 sm:p-5">
                <form className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
                    <Input
                      placeholder="Masukkan NIK Anak (16 digit)..."
                      className="pl-11 h-12 text-lg bg-white border-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all"
                    />
                  </div>
                  <Button
                    size="lg"
                    type="submit"
                    className="h-12 px-8 text-base font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-95"
                  >
                    Cek Data
                  </Button>
                </form>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-green-600" />
                    <span>Enkripsi SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>Data Resmi Kemenkes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* End Search Widget */}
        </div>
      </div>
    </section>
  );
}

// --- Features Grid ---
function FeaturesSection() {
  const features = [
    {
      icon: CalendarHeart,
      color: "text-rose-500",
      bg: "bg-rose-50",
      title: "Jadwal Otomatis",
      desc: "Tak perlu menghafal. Sistem akan mengingatkan jadwal imunisasi berikutnya sesuai usia anak.",
    },
    {
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-50",
      title: "Grafik Pertumbuhan",
      desc: "Visualisasi kurva KMS (Kartu Menuju Sehat) digital untuk deteksi dini stunting.",
    },
    {
      icon: HeartPulse,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      title: "Riwayat Kesehatan",
      desc: "Catatan medis tersimpan rapi. Mudah diakses saat pindah domisili atau sekolah.",
    },
  ];

  return (
    <section id="fitur" className="py-24 bg-slate-50/50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Kenapa Memilih ImunKita?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Teknologi yang memudahkan orang tua dan kader Posyandu.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {features.map((item, i) => (
            <div
              key={i}
              className="group relative flex flex-col items-start p-8 rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 duration-300"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${item.bg} ${item.color}`}
              >
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// --- FAQ Section ---
function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-white">
      <div className="container mx-auto px-4 md:px-6 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">
            Pertanyaan Sering Diajukan
          </h2>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem
            value="item-1"
            className="border rounded-lg px-4 bg-slate-50/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all duration-200"
          >
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline py-4">
              Bagaimana jika NIK anak belum terdaftar?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              Silakan hubungi kader Posyandu setempat dengan membawa Kartu
              Keluarga (KK) untuk dilakukan pendataan awal ke dalam sistem
              database kami.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-2"
            className="border rounded-lg px-4 bg-slate-50/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all duration-200"
          >
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline py-4">
              Apakah data ini bisa dipakai untuk syarat sekolah?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              Ya. Anda dapat mencetak "Sertifikat Imunisasi Lengkap" dari
              halaman detail anak yang valid digunakan sebagai lampiran
              administrasi sekolah.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            value="item-3"
            className="border rounded-lg px-4 bg-slate-50/50 data-[state=open]:bg-white data-[state=open]:shadow-md transition-all duration-200"
          >
            <AccordionTrigger className="text-left font-semibold text-slate-800 hover:no-underline py-4">
              Apa yang harus dibawa saat imunisasi?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 pt-1">
              Wajib membawa buku KIA (Pink) dan fotokopi KK jika baru pertama
              kali. Pastikan anak dalam kondisi sehat (tidak demam tinggi).
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Syringe className="h-5 w-5" />
            </div>
            <span className="font-bold text-xl text-slate-900">ImunKita</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs text-center md:text-left mt-2">
            Membangun generasi emas Indonesia melalui kesehatan yang terpantau
            sejak dini.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-blue-600 transition-colors">
            Tentang Kami
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Kebijakan Privasi
          </a>
          <a href="#" className="hover:text-blue-600 transition-colors">
            Bantuan
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          © 2024 Posyandu Digital Indonesia.
        </p>
      </div>
    </footer>
  );
}
