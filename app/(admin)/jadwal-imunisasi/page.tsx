import { getJadwalData } from "@/app/actions/jadwal";
import JadwalClients from "./clients/jadwal-clients";
import { getPosyanduData } from "@/app/actions/posyandu";

export default async function PosyanduPage() {
  const [jadwalData, posyanduData] = await Promise.all([
    getJadwalData(),
    getPosyanduData(),
  ]);
  return (
    <div>
      <JadwalClients jadwalList={jadwalData} posyanduList={posyanduData} />
    </div>
  );
}
