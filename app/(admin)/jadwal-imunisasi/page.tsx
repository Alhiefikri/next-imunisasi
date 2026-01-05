import { getSchedules } from "@/app/actions/jadwal";
import { getPosyandus } from "@/app/actions/posyandu";
import JadwalClients from "./clients/jadwal-clients";

export default async function JadwalPage() {
  const [schedules, posyandus] = await Promise.all([
    getSchedules(),
    getPosyandus(),
  ]);

  return <JadwalClients schedules={schedules} posyandus={posyandus} />;
}
