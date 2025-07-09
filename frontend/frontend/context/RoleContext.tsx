"use client"
import { createContext, useContext, useState, useEffect } from "react"

type RoleContextType = {
  role: string
  setRole: (role: string) => void
}

const RoleContext = createContext<RoleContextType>({
  role: "user",
  setRole: () => {},
})

export const RoleProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRoleState] = useState("user")

  useEffect(() => {
    const user = sessionStorage.getItem("user")
    if (user) {
      setRoleState("admin")
    }
  }, [])

  const setRole = (newRole: string) => {
    setRoleState(newRole)
  }

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  )
}

export const useRole = () => useContext(RoleContext)
