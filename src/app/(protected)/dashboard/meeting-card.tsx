'use client'
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar'
import { Card } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone' // 61.2k (gzipped: 17.1k)
import React from 'react' // 6.9k (gzipped: 2.7k)
import { uploadFile } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Presentation } from 'lucide-react'
import { Upload } from 'lucide-react'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const MeetingCard = () => {
  const {project} = useProject()
  const [isUploading, setIsUploading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const router = useRouter()
  const uploadMeeting = api.project.uploadMeeting.useMutation()
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'audio/*': ['.mp3', '.wav', '.m4a']
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async acceptedFiles => {
      if(!project) return
      setIsUploading(true)
      // console.log(acceptedFiles)
      const file = acceptedFiles[0]
      if(!file) return
      const downloadURL = await uploadFile(file as File, setProgress) as string
      uploadMeeting.mutate({
        projectId:project.id,
        meetingUrl:downloadURL,
        name:file.name
      },{
        onSuccess:()=>{
          toast.success("Meeting uploaded successfully")
          router.push('/meetings')
        },
        onError:()=>{
          toast.error("Failed to upload meeting")
        }
      })
      // window.alert(downloadURL)
      setIsUploading(false)
    }
  })

  return (
    <Card className='col-span-2 flex flex-col items-center justify-center p-8 gap-3' {...getRootProps()}>
  {!isUploading && (
    <>
      <Presentation className="h-8 w-8 animate-bounce" />
      <h3 className="text-sm font-semibold text-gray-900">
        Create a new meeting
      </h3>
      <p className="text-center text-sm text-gray-500 leading-tight">
        Analyse your meeting with CodeSage.
        <br />
        Powered by A.I.
      </p>
      {/* <div className="mt-6"> */}
        <Button disabled={isUploading} className="flex items-center gap-1 text-sm">
          <Upload className="h-5 w-5" aria-hidden="true" />
          Upload Meeting
          <input className="hidden" {...getInputProps()} />
        </Button>
      {/* </div> */}
    </>
  )}
  {isUploading && (
    <div className="flex items-center justify-center">
      <CircularProgressbar
        value={progress}
        text={`${progress}%`}
        className='size-20' styles={
            buildStyles({
                pathColor:'#2563eb',
                textColor:'#2563eb'
            })
        }/>
        <p className='text-sm text-gray-500 text-center'>
            Uploading your meeting...
        </p>
    </div>
  )}
</Card>
  )
}

export default MeetingCard