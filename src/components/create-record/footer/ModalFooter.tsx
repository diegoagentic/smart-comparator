import { ArrowRight } from 'lucide-react'
import SectionNavStepper from './SectionNavStepper'
import type { PaneView } from '../left-rail/PreflightLeftRail'

interface ModalFooterProps {
    view: PaneView
    setView: (v: PaneView) => void
    canCreate: boolean
    onCancel: () => void
    onCreate: () => void
}

export default function ModalFooter({ view, setView, canCreate, onCancel, onCreate }: ModalFooterProps) {
    return (
        <footer className="h-[72px] px-6 flex items-center justify-between border-t border-border bg-muted/30">
            <SectionNavStepper view={view} setView={setView} />
            <div className="flex items-center gap-2">
                <button
                    onClick={onCancel}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted px-4 py-2 text-[13px] font-medium text-foreground transition-colors"
                >
                    Cancel
                </button>
                <button
                    disabled={!canCreate}
                    onClick={onCreate}
                    className={`inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-[13px] font-semibold transition ${
                        canCreate
                            ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600/80 shadow-[0_6px_20px_-4px_rgba(198,228,51,0.7)]'
                            : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                >
                    Create Record
                    <ArrowRight className="size-3.5" />
                </button>
            </div>
        </footer>
    )
}
