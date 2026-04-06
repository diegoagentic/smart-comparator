import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from 'strata-design-system'
import { Bell, FileText, ScanSearch, Moon, Sun, LogOut, User, ChevronDown } from 'lucide-react'
import ActionCenter from './notifications/ActionCenter'

type NavTab = 'Transactions' | 'OCR'

interface NavbarProps {
    onLogout: () => void;
    activeTab?: NavTab | string;
    onNavigateToWorkspace: () => void;
    onNavigate: (page: any) => void;
}

export default function Navbar({ onLogout, activeTab = 'Transactions', onNavigate }: NavbarProps) {
    const { theme, toggleTheme } = useTheme()
    const { user } = useAuth()
    const [isActionCenterOpen, setIsActionCenterOpen] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    const tabs: { name: string; page: string; icon: any }[] = [
        { name: 'Transactions', page: 'transactions', icon: FileText },
        { name: 'OCR', page: 'ocr', icon: ScanSearch },
    ]

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Expert'

    return (
        <>
            <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl">
                <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-lg px-4 py-2 flex items-center justify-between gap-4">
                    {/* Left: Brand */}
                    <div className="flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center">
                            <svg className="w-5 h-5 text-white dark:text-zinc-900" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div className="hidden sm:block border-l border-border pl-3">
                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">SMART COMPARATOR</div>
                            <div className="text-sm font-bold text-foreground leading-tight">Strata</div>
                        </div>
                    </div>

                    {/* Center: Nav Tabs */}
                    <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.name
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => onNavigate(tab.page)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                        isActive
                                            ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Notifications */}
                        <button
                            onClick={() => setIsActionCenterOpen(true)}
                            className="relative p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white text-xs font-bold">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">{displayName}</div>
                                    <div className="text-[10px] text-muted-foreground leading-none">Expert</div>
                                </div>
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </button>

                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 p-1">
                                        <div className="px-3 py-2 border-b border-border mb-1">
                                            <div className="text-sm font-medium text-foreground">{displayName}</div>
                                            <div className="text-xs text-muted-foreground">{user?.email || 'expert@strata.com'}</div>
                                        </div>
                                        <button
                                            onClick={() => { setIsUserMenuOpen(false); onLogout(); }}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error-light dark:hover:bg-error/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Action Center Overlay */}
            {isActionCenterOpen && (
                <>
                    <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIsActionCenterOpen(false)} />
                    <div className="fixed top-20 right-4 z-50 w-[380px] max-h-[80vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl">
                        <ActionCenter />
                    </div>
                </>
            )}
        </>
    )
}
