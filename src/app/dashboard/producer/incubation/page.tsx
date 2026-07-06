import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { redirect }         from 'next/navigation'
import { IncubationTrackerPage } from '@/components/dashboard/producer/incubation-tracker'

export const metadata = { title: 'Incubation Tracker — HerbRx' }

export default async function Page() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const userRole = (session.user as { role?: string } | undefined)?.role
  if (userRole !== 'PRODUCER') redirect('/dashboard')

  return <IncubationTrackerPage />
}
