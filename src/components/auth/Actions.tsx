"use client";

import { AiFillGithub } from "react-icons/ai";
import { signIn, signOut } from "next-auth/react";

export function SignOut() {
  return (
    <button
      className="mb-6 mt-2 text-xs text-white hover:text-[hsl(280,100%,70%)]"
      onClick={() => signOut()}
    >
      → Sign out
    </button>
  );
}

export function SignIn() {
  return (
    <button
      className="mb-4 flex rounded-md border border-gray-800 bg-black px-4 py-3 text-sm font-semibold text-neutral-200 transition-all hover:text-white"
      onClick={() => signIn("github")}
    >
      <AiFillGithub className={"self-center text-xl"} />
      <div className="ml-3">Sign in with GitHub</div>
    </button>
  );
}
