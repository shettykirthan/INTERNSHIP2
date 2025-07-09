"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useRole } from "@/context/RoleContext"

export default function AdminLoginPage() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL
  const router = useRouter()
  const { setRole } = useRole()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await axios.post(`${baseUrl}/api/auth/signin`, {
        email,
        password,
      })

      const { token, user } = res.data

      // Save token and user in sessionStorage
      sessionStorage.setItem("authToken", token)
      sessionStorage.setItem("user", JSON.stringify(user))

      // Optional: Check for admin privileges (for now assume any valid login is admin)
      setRole("admin")

      router.push("/") // redirect to home/dashboard
    } catch (err: any) {
      console.error("Login failed:", err)
      setError("Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center px-4">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg w-full max-w-sm shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block text-sm text-slate-300 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
            placeholder="admin@example.com"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-slate-300 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-700 text-white border border-slate-600 focus:outline-none"
            placeholder="********"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition"
        >
          Login
        </button>
      </form>
    </div>
  )
}
