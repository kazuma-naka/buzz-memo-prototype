import { Mynerve } from "next/font/google";
import GoogleSignInButton from "@/app/welcome/_components/GoogleSignInButton";

const mynerve = Mynerve({
  subsets: ["latin"],
  weight: "400",
});

export default function WelcomePageComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#91AFBB] text-gray-800 gap-20">
      <h1
        className={`${mynerve.className} text-8xl text-[#FFCF56] font-bold mb-4`}
      >
        Buzz Memo
      </h1>
      <GoogleSignInButton />
    </div>
  );
}
