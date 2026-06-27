import Navbar from './Navbar'
import LeftNav from './LeftNav'
import RightPanel from './RightPanel'
import BottomBar from './BottomBar'
import type { ReactNode } from 'react'
import type { ModuleType, RightPanelProps } from './RightPanel'

interface LayoutProps {
  children: ReactNode
  rightPanelModule?: ModuleType
  rightPanelProps?: Partial<RightPanelProps>
}

export default function Layout({ children, rightPanelModule, rightPanelProps }: LayoutProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden" style={{ background: 'var(--navy-900)' }}>
      {/* Top Bar */}
      <Navbar hideLogo={true} hideUserMenu={true} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Navigation */}
        <LeftNav />

        {/* Center Workspace */}
        <main className="flex-1 min-w-[640px] overflow-y-auto" style={{ background: 'var(--navy-900)' }}>
          {children}
        </main>

        {/* Right Panel */}
        <RightPanel moduleType={rightPanelModule} {...rightPanelProps} />
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </div>
  )
}
