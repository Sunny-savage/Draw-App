"use client";
export function AuthPage({ isSignin }: { isSignin: boolean }) {
  return (
    <div className="w-screen h-screen flex justify-center items-center">
      <div className="p-2 m-2 rounded flex flex-col gap-2 bg-amber-950">
        <input
          className="bg-white text-black  rounded"
          type="text"
          placeholder="Email"
        ></input>
        <input
          className="bg-white text-black  rounded"
          type="password"
          placeholder="Password"
        ></input>
        <button className="cursor-pointer" onClick={() => {}}>
          {isSignin ? "Sign In" : "Sign Up"}
        </button>
      </div>
    </div>
  );
}
