import NavMenu from "@/components/navbar";
import { AuthSession } from "@/lib/auth-utils";
import Image from "next/image";

export default async function Home() {
  const session = await AuthSession();
  return (
    <>
      <div className="relative w-full">
        <NavMenu
          userName={session?.user.name}
          userImage={session?.user.image as string}
        />
      </div>
    </>
  );
}
