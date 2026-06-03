import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { AdminNav } from './_components/AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    // Fixed full-screen overlay — hides the main site header/footer
    <div className="fixed inset-0 z-[100] flex bg-gray-50 dark:bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-gray-800">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Panel</p>
        </div>
        <AdminNav />
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto p-8">{children}</div>
    </div>
  )
}
