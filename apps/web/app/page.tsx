"use client"

import { useRouter } from "next/navigation";
import Button from "components/ui/Button";   

export default function Home() {

  const router = useRouter()

  return (
    <div className="w-full h-screen flex flex-col gap-6 justify-center items-center">
      <div className=""><h1>Welcome to the landing Page of MindCanvas</h1></div>
      
      <button className="border-2 bg-lime-600 p-2" onClick={() => router.push('/signin')}>Sign In</button>
      <button className="border-2 bg-lime-600 p-2" onClick={() => router.push('/signup')} >Sign up</button>
    </div>
  );
}
