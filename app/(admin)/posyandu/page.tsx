import { getPosyanduData } from "@/app/actions/posyandu";
import PosyanduClients from "./clients/posyandu-clients";

export default async function PosyanduPage() {
  const data = await getPosyanduData();
  return (
    <div>
      <PosyanduClients posyanduList={data} />
    </div>
  );
}
