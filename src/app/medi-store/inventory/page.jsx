import Header from "@/app/components/Header";
import Inventory from "./inventory";
import { auth } from "@/app/lib/auth";

export default async function Stock() {

  const session = await auth();
  const token = session?.token || "";
  return (
    <div>
  
      <Header />
      <Inventory token={token} />
    </div>
  );
}
