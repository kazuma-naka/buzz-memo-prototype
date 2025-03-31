import Link from "next/link";
import { Mynerve } from "next/font/google";
import { auth } from "@/auth";
import LogoutButton from "./LogoutButton";
import LogInButton from "./LogInButton";

const mynerve = Mynerve({
  subsets: ["latin"],
  weight: "400",
});

export default async function Header() {
  const session = await auth();
  return (
    <header className="bg-[#91AFBB] shadow-lg">
      <div className="flex justify-between items-center h-16 max-w-xl mx-auto w-full px-4">
        <Link
          href="/"
          className={`text-5xl font-bold text-[#FFCF56] ${mynerve.className}`}
        >
          Buzz Memo
        </Link>
        <nav>{session ? <LogoutButton /> : <LogInButton />}</nav>
      </div>
    </header>
  );
}
