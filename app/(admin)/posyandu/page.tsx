import { getPosyandus } from "@/app/actions/posyandu";
import PosyanduClients from "./clients/posyandu-clients";

export default async function PosyanduPage() {
  const data = await getPosyandus();
  return (
    <div>
      <PosyanduClients posyanduList={data} />
    </div>
  );
}
