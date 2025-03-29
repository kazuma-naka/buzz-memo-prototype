"use client";

import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-54 h-16 flex items-center bg-[#2E4A5A] text-[#FFFFFF] rounded-xl border border-gray-400 shadow hover:cursor-pointer gap-4"
    >
      <div className="ml-4 w-[42px] h-[42px] bg-[url('https://developers.google.com/identity/images/g-logo.png')] bg-no-repeat bg-[length:32px_32px] bg-center" />
      <span className="pr-6 text-sm font-bold font-['Roboto']">
        Google でログイン
      </span>
    </button>
  );
}
