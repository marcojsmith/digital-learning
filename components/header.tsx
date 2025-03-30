import type { User } from "@/types"

interface HeaderProps {
  user: User
}

export default function Header({ user }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-primary to-primary-dark text-white p-4 shadow-md sticky top-0 z-50 flex justify-between items-center">
      <div className="header-left">
        <h1 className="text-xl font-semibold m-0">Learning Platform</h1>
        <p className="text-sm opacity-90 m-0">Your personal learning journey</p>
      </div>
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-secondary text-primary-dark flex items-center justify-center mr-3 font-bold text-lg shadow-inner">
          {user.avatar}
        </div>
        <span className="font-medium">{user.name}</span>
      </div>
    </header>
  )
}

