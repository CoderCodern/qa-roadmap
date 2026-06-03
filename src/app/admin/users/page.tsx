import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { db } from '@/db'
import { users } from '@/db/schema'
import Image from 'next/image'

export default async function AdminUsersPage() {
  const session = await auth()
  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect('/')
  }

  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, image: users.image })
    .from(users)
    .limit(500)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Users</h1>
        <span className="text-sm text-gray-500">{rows.length} total</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">User</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900">
            {rows.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      {u.image && (
                        <Image
                          src={u.image}
                          alt={u.name ?? ''}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      )}
                    </div>
                    <span className="font-medium">{u.name ?? '—'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{u.email ?? '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{u.id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
