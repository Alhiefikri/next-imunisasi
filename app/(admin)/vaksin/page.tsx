import VaccinesClient from "./clients/vaccines-client";
import { getVaccines } from "@/app/actions/vaccines";

export default async function VaksinPage() {
  const data = await getVaccines();
  return (
    <div>
      <VaccinesClient vaccines={data} />
    </div>
  );
}
