'use client'

import { Sidebar,SidebarHeader,SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,SidebarMenuItem,SidebarMenuButton, SidebarMenu, useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils";
import { Bot, CreditCard, LayoutDashboard, Link, Plus, Presentation } from "lucide-react";
import { usePathname } from "next/navigation";
import NextLink from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import useProject from "@/hooks/use-project";


const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot,
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation,
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard,
  },
];

// const projects=[
//     {
//         name:'Project 1'
//     },
//     {
//         name:'Project 2'
//     },
//     {
//         name:'Project 3'
//     },
// ]

export function AppSidebar() {
    const pathname = usePathname()
    const {open} = useSidebar()
    const {projects,projectId,setProjectId} = useProject()
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Image src='/codesageailogo.png' alt='logo' width={60} height={60}/>
            {open && (
                <h1 className="text-xl font-bold text-black">
            CodeSage
            </h1>
            )}
        </div>
      </SidebarHeader>
      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupLabel>
            Application
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
            {items.map(item => {
              return (
                <SidebarMenuItem key={item.title}>
  <SidebarMenuButton asChild>
    <NextLink
      href={item.url}
      className={cn({
        '!bg-primary text-white': pathname === item.url
      },'list-none')}>
      <item.icon />
      <span>{item.title}</span>
    </NextLink>
  </SidebarMenuButton>
</SidebarMenuItem>
              );
            })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>
                Your Projects
            </SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {projects?.map(project => {
      return (
        <SidebarMenuItem key={project.name}>
          <SidebarMenuButton asChild>
            <div onClick={()=>{
              setProjectId(project.id)
            }}>
              <div
                className={cn(
                  'rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary',
                  {
                    'bg-primary text-white': project.id === projectId
                  }
                )}
              >
                {project.name[0]}
              </div>
              <span>{project.name}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      );
     })}
    {open && (
<SidebarMenuItem>
  <SidebarMenuButton asChild>
    <NextLink href="/create">
      <Button
  size="icon"
  variant="outline"
  className="w-full max-w-[180px] justify-start font-semibold rounded-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-300 ease-in-out"
>
  <div className="flex items-center space-x-2 truncate">
    <Plus className="h-4 w-4 shrink-0" />
    <span className="hidden md:inline">Create Project</span>
  </div>
</Button>

    </NextLink>
  </SidebarMenuButton>
</SidebarMenuItem>
    )}
        </SidebarMenu>
    </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}