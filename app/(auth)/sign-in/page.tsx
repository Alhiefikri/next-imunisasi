import SignForm from "@/components/signin-form";
import { requireNoAuth } from "@/lib/auth-utils";

export default async function SignPage() {
  await requireNoAuth();
  return <SignForm />;
}
