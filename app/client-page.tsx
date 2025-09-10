'use client'

import { Chat } from './chat'
import { FileExplorer } from './file-explorer'
import { Header } from './header'
import { Horizontal, Vertical } from '@/components/layout/panels'
import { Logs } from './logs'
import { Preview } from './preview'
import { TabContent, TabItem } from '@/components/tabs'
import { AgentChat } from '@/components/agent-chat/agent-chat'
import { LoginForm } from '@/components/login/login-form'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface ClientPageProps {
  horizontalSizes?: number[]
  verticalSizes?: number[]
}

export function ClientPage({ horizontalSizes, verticalSizes }: ClientPageProps) {
  const { user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <>
      {!user && <LoginForm />}
      <div className="flex flex-col h-screen max-h-screen overflow-hidden p-2 space-x-2">
        <div className="flex items-center justify-between w-full">
          <Header className="flex items-center" />
          {user && (
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user.name}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
        
        {user ? (
          <>
            <ul className="flex space-x-5 font-mono text-sm tracking-tight px-1 py-2 md:hidden">
              <TabItem tabId="agent-chat">AI Agent</TabItem>
              <TabItem tabId="chat">Code Chat</TabItem>
              <TabItem tabId="preview">Preview</TabItem>
              <TabItem tabId="file-explorer">File Explorer</TabItem>
              <TabItem tabId="logs">Logs</TabItem>
            </ul>

            <div className="flex flex-1 w-full overflow-hidden pt-2 md:hidden">
              <TabContent tabId="agent-chat" className="flex-1">
                <AgentChat />
              </TabContent>
              <TabContent tabId="chat" className="flex-1">
                <Chat className="flex-1 overflow-hidden" />
              </TabContent>
              <TabContent tabId="preview" className="flex-1">
                <Preview className="flex-1 overflow-hidden" />
              </TabContent>
              <TabContent tabId="file-explorer" className="flex-1">
                <FileExplorer className="flex-1 overflow-hidden" />
              </TabContent>
              <TabContent tabId="logs" className="flex-1">
                <Logs className="flex-1 overflow-hidden" />
              </TabContent>
            </div>

            <div className="hidden flex-1 w-full min-h-0 overflow-hidden pt-2 md:flex">
              <Horizontal
                defaultLayout={horizontalSizes ?? [30, 70]}
                left={<AgentChat />}
                right={
                  <Horizontal
                    defaultLayout={[50, 50]}
                    left={<Chat className="flex-1 overflow-hidden" />}
                    right={
                      <Vertical
                        defaultLayout={verticalSizes ?? [33.33, 33.33, 33.33]}
                        top={<Preview className="flex-1 overflow-hidden" />}
                        middle={<FileExplorer className="flex-1 overflow-hidden" />}
                        bottom={<Logs className="flex-1 overflow-hidden" />}
                      />
                    }
                  />
                }
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to AI Agent Platform</h2>
              <p className="text-muted-foreground mb-4">
                Please login to access the AI Agent and coding platform
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}