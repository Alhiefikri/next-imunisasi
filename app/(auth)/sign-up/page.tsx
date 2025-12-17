import SignUpForm from "@/components/signup-form";
import { requireNoAuth } from "@/lib/auth-utils";

export default async function SignUpPage() {
  await requireNoAuth();
  return <SignUpForm />;
}
