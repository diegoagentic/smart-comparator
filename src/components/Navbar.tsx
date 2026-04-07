import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from 'strata-design-system'
import { Bell, ScanEye, FileText, Moon, Sun, LogOut, ChevronDown } from 'lucide-react'
import ActionCenter from './notifications/ActionCenter'
import logoLightBrand from '../assets/logo-light-brand.png'
import logoWhite from '../assets/logo-white.png'

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
        { name: 'OCR', page: 'ocr', icon: ScanEye },
        { name: 'Transactions', page: 'transactions', icon: FileText },
    ]

    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sara Chen'
    const userRole = 'Account Manager'

    return (
        <>
            {/* Navbar — matches UI-Dealer: rounded-full, top-6, min-w-[60vw], bg-card/80 backdrop-blur-xl */}
            <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 min-w-[60vw] max-w-fit lg:min-w-0 lg:max-w-7xl lg:w-[80vw]">
                <div className="relative flex items-center lg:justify-between px-3 py-2 rounded-full gap-1 bg-card/80 backdrop-blur-xl border border-border shadow-lg dark:shadow-glow-md">

                    {/* Left: Logo + Brand */}
                    <div className="flex items-center gap-1">
                        <div className="px-2 shrink-0">
                            <img src={logoLightBrand} alt="Strata" className="h-8 w-20 object-contain block dark:hidden" />
                            <img src={logoWhite} alt="Strata" className="h-8 w-20 object-contain hidden dark:block" />
                        </div>
                        <div className="w-px h-6 bg-border mx-1"></div>
                        <div className="hidden sm:block px-2">
                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider leading-none">SMART COMPARATOR</div>
                            <div className="text-sm font-bold text-foreground leading-tight">Strata</div>
                        </div>
                    </div>

                    {/* Center: Nav Tabs — same pill style as dealer */}
                    <div className="flex items-center gap-1 mx-auto">
                        {tabs.map(tab => {
                            const isActive = activeTab === tab.name
                            const Icon = tab.icon
                            return (
                                <button
                                    key={tab.name}
                                    onClick={() => onNavigate(tab.page)}
                                    className={`relative flex items-center justify-center h-9 px-3 rounded-full transition-all duration-300 group overflow-hidden ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground'
                                            : 'hover:bg-muted text-muted-foreground'
                                    }`}
                                >
                                    <span className="relative z-10"><Icon className="w-5 h-5" /></span>
                                    <span className={`ml-2 text-sm font-medium whitespace-nowrap transition-all duration-300 ease-in-out ${
                                        isActive ? 'max-w-xs opacity-100' : 'max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100'
                                    }`}>
                                        {tab.name}
                                    </span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        {/* Notifications */}
                        <button
                            onClick={() => setIsActionCenterOpen(!isActionCenterOpen)}
                            className="relative flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-card" />
                        </button>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="flex items-center justify-center h-9 w-9 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                        >
                            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Separator */}
                        <div className="w-px h-6 bg-border mx-1"></div>

                        {/* User */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-muted transition-colors"
                            >
                                <img
                                    src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=80&h=80&fit=crop&crop=face"
                                    alt={displayName}
                                    className="w-8 h-8 rounded-full object-cover border-2 border-border"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                                    }}
                                />
                                <div className="w-8 h-8 rounded-full bg-ai flex items-center justify-center text-white text-xs font-bold hidden">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <div className="text-xs font-semibold text-foreground leading-tight truncate max-w-[100px]">{displayName}</div>
                                    <div className="text-[10px] text-muted-foreground leading-none">{userRole}</div>
                                </div>
                                <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
                            </button>

                            {isUserMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 p-1">
                                        <div className="px-3 py-2 border-b border-border mb-1">
                                            <div className="text-sm font-medium text-foreground">{displayName}</div>
                                            <div className="text-xs text-muted-foreground">{user?.email || 'sara.chen@strata.com'}</div>
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
            </div>

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
