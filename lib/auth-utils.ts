import { headers } from "next/headers";
import { auth } from "./auth";
import { redirect } from "next/navigation";

export const AuthSession = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session ?? null;
};

export const requireAuth = async () => {
  const session = await AuthSession();

  if (!session) {
    redirect("/sign-in");
  }
  return session;
};

export const requireAdmin = async () => {
  const session = await requireAuth();

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }
  return session;
};

export const requireNoAuth = async () => {
  const session = await AuthSession();
  if (session) {
    redirect("/");
  }
};
