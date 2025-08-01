'use client'

import { Button } from '@/components/ui/button'
import useProject from '@/hooks/use-project'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import React from 'react'
import { toast } from 'sonner'

const ArchiveButton = () => {
  const archiveProject = api.project.archiveProject.useMutation()
  const { projectId } = useProject()
  const refetch = useRefetch()

  return (
    <Button
      disabled={archiveProject.isPending}
      size="sm"
      variant="destructive"
      className="transition duration-200 ease-in-out hover:scale-105 hover:shadow-lg hover:bg-red-600"
      onClick={() => {
        const confirm = window.confirm("Are you sure you want to archive this project?")
        if (confirm)
          archiveProject.mutate({ projectId }, {
            onSuccess: () => {
              toast.success("Project archived")
              refetch()
            },
            onError: () => {
              toast.error("Failed to archive project")
            }
          })
      }}
    >
      Archive
    </Button>
  )
}

export default ArchiveButton
