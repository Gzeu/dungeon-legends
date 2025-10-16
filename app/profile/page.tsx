"use client"
import { useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!session) router.replace("/auth/signin")
  }, [session, router])

  if (!session?.user) return <div>Loading...</div>

  return (
    <div className="profile-container">
      <h1 className="text-2xl font-bold mb-2">Welcome, {session.user.name || session.user.email}</h1>
      <img src={session.user.image || "/knight-portrait.png"} alt="avatar" className="rounded-full w-16 h-16 mb-4"/>
      <div><strong>Email:</strong> {session.user.email}</div>
      <button className="btn-logout mt-6" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>Sign Out</button>
    </div>
  )
}
