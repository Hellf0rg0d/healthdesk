import Header from "@/app/components/Header";
import Medi from "./medicine";
import { auth } from "@/app/lib/auth";

export default async function Medicine() {
  const session = await auth();
  const token = session?.token || "";

  return (
    <div>
      <Header />
      <Medi token={token} />
    </div>
  );
}
