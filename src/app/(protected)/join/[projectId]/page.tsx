// app/(protected)/join/[projectId]/page.tsx

import { auth } from '@clerk/nextjs/server'
import { clerkClient } from '@clerk/clerk-sdk-node'
import { redirect } from 'next/navigation'
import { db } from '@/server/db'

// ✅ Do NOT destructure in parameters (per Next.js requirement)
export default async function JoinHandler(context: { params: { projectId: string } }) {
  // ✅ Extract params safely inside the function
  const { projectId } = context.params

  const { userId } = await auth()
  if (!userId) return redirect('/sign-in')

  let dbUser = await db.user.findUnique({
    where: { id: userId }
  })

  if (!dbUser) {
    const user = await clerkClient.users.getUser(userId)
    dbUser = await db.user.create({
      data: {
        id: userId,
        emailAddress: user.emailAddresses?.[0]?.emailAddress || '',
        imageUrl: user.imageUrl || '',
        firstName: user.firstName || '',
        lastName: user.lastName || ''
      }
    })
  }

  const project = await db.project.findUnique({
    where: { id: projectId }
  })

  if (!project) return redirect('/dashboard')

  try {
    await db.userToProject.create({
      data: {
        userId,
        projectId
      }
    })
  } catch (error: any) {
    if (
      error?.code === 'P2002' || 
      error?.message?.includes('Unique constraint failed') ||
      error?.message?.includes('duplicate key')
    ) {
      console.log('User already in project or duplicate entry')
    } else {
      console.error('Error joining project:', error)
      throw error // Optional: rethrow or handle differently
    }
  }

  return redirect('/dashboard')
}
