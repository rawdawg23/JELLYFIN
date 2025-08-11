"use client"

import type * as React from "react"
import {
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  Home,
  Server,
  ShoppingCart,
  User,
  Shield,
  Library,
  Sparkles,
  Users,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useAuth } from "@/providers/auth-provider"

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Jellyfin Store",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "OG Media Server",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Community Hub",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: Home,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "#",
          section: "home",
        },
        {
          title: "Your Library",
          url: "#",
          section: "library",
        },
      ],
    },
    {
      title: "3D Features",
      url: "#",
      icon: Sparkles,
      items: [
        {
          title: "3D Hero",
          url: "#",
          section: "3d-hero",
        },
        {
          title: "3D Slider",
          url: "#",
          section: "3d-slider",
        },
        {
          title: "Server Map",
          url: "#",
          section: "3d-map",
        },
      ],
    },
    {
      title: "Marketplace",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "Browse",
          url: "#",
          section: "marketplace",
        },
        {
          title: "Sell Items",
          url: "#",
          section: "seller",
        },
        {
          title: "Messages",
          url: "#",
          section: "messages",
        },
      ],
    },
    {
      title: "Community",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Forum",
          url: "#",
          section: "forum",
        },
        {
          title: "Support",
          url: "#",
          section: "tickets",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Your Profile",
      url: "#",
      icon: User,
      section: "profile",
    },
    {
      name: "Library Browser",
      url: "#",
      icon: Library,
      section: "library",
    },
    {
      name: "Server Status",
      url: "#",
      icon: Server,
      section: "3d-map",
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onSectionChange: (section: string) => void
  activeSection: string
}

export function AppSidebar({ onSectionChange, activeSection, ...props }: AppSidebarProps) {
  const { user } = useAuth()

  // Add admin section if user is admin
  const navMainWithAdmin =
    user?.role === "admin"
      ? [
          ...data.navMain,
          {
            title: "Administration",
            url: "#",
            icon: Shield,
            items: [
              {
                title: "Admin Dashboard",
                url: "#",
                section: "admin",
              },
            ],
          },
        ]
      : data.navMain

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainWithAdmin} onSectionChange={onSectionChange} activeSection={activeSection} />
        <NavProjects projects={data.projects} onSectionChange={onSectionChange} activeSection={activeSection} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user || data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
