'use client'
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

const InviteButton = () => {
  const { projectId } = useProject()
  const [open, setOpen] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setInviteLink(`${window.location.origin}/join/${projectId}`)
    }
  }, [projectId])

  // ✅ Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    toast.success("Copied to clipboard")
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Members</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            Ask them to copy and paste this link
          </p>

          {/* ✅ Input + Copy Button wrapper */}
<div className="mt-4 flex items-center gap-2">
  <Input readOnly value={inviteLink} className="flex-1" />
  <Button 
    onClick={handleCopy} 
    className="bg-blue-500 text-white hover:bg-blue-600 transition-colors"
  >
    Copy
  </Button>
</div>

        </DialogContent>
      </Dialog>

      <Button size='sm' onClick={() => setOpen(true)}>
        Invite Members
      </Button>
    </>
  )
}

export default InviteButton


// 'use client'
// import React, { useEffect, useState } from 'react'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import useProject from '@/hooks/use-project'
// import { toast } from 'sonner'
// import { Button } from '@/components/ui/button'

// const InviteButton = () => {
//   const { projectId } = useProject()
//   const [open, setOpen] = useState(false)
//   const [inviteLink, setInviteLink] = useState('')

//   useEffect(() => {
//     if (typeof window !== 'undefined') {
//       setInviteLink(`${window.location.origin}/join/${projectId}`)
//     }
//   }, [projectId])

//   return (
//     <>
//       <Dialog open={open} onOpenChange={setOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Invite Team Members</DialogTitle>
//           </DialogHeader>
//           <p className="text-sm text-gray-500">
//             Ask them to copy and paste this link
//           </p>
//           <Input
//             className="mt-4"
//             readOnly
//             onClick={() => {
//               navigator.clipboard.writeText(inviteLink)
//               toast.success("Copied to clipboard")
//             }}
//             value={inviteLink}
//           />
//         </DialogContent>
//       </Dialog>
//       <Button size='sm' onClick={() => setOpen(true)}>
//         Invite Members
//       </Button>
//     </>
//   )
// }

// export default InviteButton
