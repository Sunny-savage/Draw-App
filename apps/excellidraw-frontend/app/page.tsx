"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex h-screen w-screen justify-center items-center flex-col gap-10">
      <Link href={"/signin"}>
        <button className="cursor-pointer bg-amber-500 rounded">SignIn</button>
      </Link>
      <Link href={"/signup"}>
        <button className="cursor-pointer bg-amber-600 rounded">SignUp</button>
      </Link>
    </div>
  );
}
