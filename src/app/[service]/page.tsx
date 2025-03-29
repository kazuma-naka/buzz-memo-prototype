import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Header from "@/components/Header";

export default async function ServicePage() {
  const session = await auth();
  if (!session) {
    redirect("/");
  }
  return (
    <div>
      <Header />
    </div>
  );
}
