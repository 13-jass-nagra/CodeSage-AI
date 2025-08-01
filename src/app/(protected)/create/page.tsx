'use client'
import { Button } from '@/components/ui/button';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Plus } from 'lucide-react'

type FormInput = {
  repoUrl: string;
  projectName: string;
  githubToken?: string;
};

const CreatePage = () => {
  const { register, handleSubmit, reset } = useForm<FormInput>();
  const createProject=api.project.createProject.useMutation();
  const refetch = useRefetch()

  function onSubmit(data: FormInput){
    // window.alert(JSON.stringify(data,null,2))
    createProject.mutate({
      githubUrl:data.repoUrl,
      name:data.projectName,
      githubToken:data.githubToken
    },{
      onSuccess:()=>{
        toast.success('Project created successfully')
        refetch()
        reset()
      },
      onError:()=>{
        toast.error('Failed to create project')
      }
    })
    return true
  }
  return (
    <div className='flex items-center gap-12 h-full justify-center'>
      <img src='/undraw_miro.svg' className='h-56 w-auto' />
      <div>
        <div>
          <h1 className='font-semibold text-2xl'>
            Link your GitHub Repository
          </h1>
          <p className='text-sm text-shadow-muted-foreground'>
              Enter the URL of your repository to link it to CodeSage
          </p>
        </div>
        <div className='h-4'></div>
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input
            {...register('projectName',{required:true})}
            placeholder='Project Name'
            required
            className='w-90 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 text-sm'
            />
            <div className='h-2'></div>
            <input
            {...register('repoUrl',{required:true})}
            placeholder='Github URL'
            type='url'
            required
            className='w-90 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 text-sm'
            />
            <div className='h-2'></div> 
            <input
            {...register('githubToken')}
            placeholder='Github Token (Optional)'
            className='w-90 border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2 text-sm'
            /> 
            <div className="h-2"></div>
<Button
  type="submit"
  disabled={createProject.isPending}
  className=" bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold py-2 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
>
  Create Project
</Button>


          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;