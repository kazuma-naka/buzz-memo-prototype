import { auth } from "@/auth";
import { createClient } from "@/lib/server";
import Header from "@/components/Header";
import ServiceList from "@/app/_components/ServiceList";
import WelcomePage from "./welcome/page";

export default async function TopPage() {
  const session = await auth();
  if (!session) {
    return <WelcomePage />;
  }

  const userId = session.user?.id?.toString();
  const userName = session.user?.name;
  const userEmail = session.user?.email;
  const userImage = session.user?.image;

  const supabase = await createClient();

  const { data: existingUser, error: fetchError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error checking user existence:", fetchError);
  }

  if (!existingUser) {
    const { data, error } = await supabase.from("users").insert([
      {
        id: userId,
        name: userName,
        email: userEmail,
        image: userImage,
      },
    ]);
    if (error) {
      console.error("Insert failed:", error);
    } else {
      console.log("Inserted user:", data);
    }
  } else {
    console.log("User already exists:", existingUser.id);
  }

  return (
    <div className="bg-[#91AFBB] min-h-screen flex flex-col gap-10 items-center">
      <div className="w-full">
        <Header />
      </div>
      <div className="max-w-xl flex flex-col">
        <ServiceList userId={userId!} userEmail={userEmail!} />
      </div>
    </div>
  );
}
