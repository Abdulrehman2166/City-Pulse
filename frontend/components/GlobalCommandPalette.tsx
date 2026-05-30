'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Monitor, AlertTriangle, Radio, GitPullRequest, BarChart2, Users, LogIn, Power } from 'lucide-react'

export function GlobalCommandPalette({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const router = useRouter()
  const pathname = usePathname()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false)
      command()
    },
    [setOpen]
  )

  const scrollTo = (id: string) => {
    if (pathname === '/landing') {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    } else {
      router.push(`/landing#${id}`)
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => runCommand(() => scrollTo('hero'))}>
            <Monitor className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Command Center</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => scrollTo('incidents'))}>
            <AlertTriangle className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Live Incidents</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => scrollTo('dispatch'))}>
            <Radio className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>AI Dispatch</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => scrollTo('algorithms'))}>
            <GitPullRequest className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Scheduling Algorithms</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => scrollTo('analytics'))}>
            <BarChart2 className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Tactical Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => scrollTo('roles'))}>
            <Users className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Operator Roles</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="System Actions">
          <CommandItem onSelect={() => runCommand(() => router.push('/login'))}>
            <LogIn className="mr-2 h-4 w-4" />
            <span>Sign In</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push('/admin'))}>
            <Power className="mr-2 h-4 w-4 text-[#c8553d]" />
            <span>Initialize System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
