"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import React from "react"

export default function SignInPage() {
  const { data: session } = useSession()
  const router = useRouter()

  if (session?.user) {
    router.push("/profile")
    return <div>Redirecting...</div>
  }

  return (
    <motion.div className="signin-container" initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-2xl font-bold mb-4">Sign In</h2>
      <button
        className="btn-google w-full mb-3"
        onClick={() => signIn("google")}
      >
        <img src="/google-logo.svg" alt="Google" className="inline mr-2" style={{width:24}} />
        Sign In with Google
      </button>
      <button
        className="btn-github w-full"
        onClick={() => signIn("github")}
      >
        <img src="/github-logo.svg" alt="GitHub" className="inline mr-2" style={{width:24}} />
        Sign In with GitHub
      </button>
    </motion.div>
  )
}
