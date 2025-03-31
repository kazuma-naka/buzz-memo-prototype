"use client";

import { signIn } from "next-auth/react";

export default function LogInButton() {
  return (
    <button
      onClick={() => signIn()}
      className="text-blue-600 hover:text-blue-800 text-md font-medium cursor-pointer"
    >
      ログイン
    </button>
  );
}
