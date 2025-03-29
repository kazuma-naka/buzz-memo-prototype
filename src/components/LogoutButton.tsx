"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="text-blue-600 hover:text-blue-800 text-md font-medium cursor-pointer"
    >
      ログアウト
    </button>
  );
}
