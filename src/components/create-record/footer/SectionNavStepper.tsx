import { Fragment } from 'react'
import { ChevronRight } from 'lucide-react'
import type { PaneView } from '../left-rail/PreflightLeftRail'

interface SectionNavStepperProps {
    view: PaneView
    setView: (v: PaneView) => void
}

const STEPS: Array<{ id: PaneView; label: string }> = [
    { id: 'header', label: 'Header' },
    { id: 'lineItems', label: 'Line items' },
    { id: 'extras', label: 'Extras' },
]

export default function SectionNavStepper({ view, setView }: SectionNavStepperProps) {
    const currentIdx = STEPS.findIndex(s => s.id === view)

    return (
        <div className="flex items-center gap-1">
            {STEPS.map((s, i) => {
                const isActive = s.id === view
                return (
                    <Fragment key={s.id}>
                        <button
                            onClick={() => setView(s.id)}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                                isActive
                                    ? 'bg-foreground text-background'
                                    : i < currentIdx
                                        ? 'text-foreground/80 hover:bg-muted'
                                        : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                            <span className={`size-4 inline-flex items-center justify-center rounded-full text-[10px] font-semibold ${
                                isActive
                                    ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900'
                                    : 'bg-muted text-muted-foreground'
                            }`}>
                                {i + 1}
                            </span>
                            {s.label}
                        </button>
                        {i < STEPS.length - 1 && (
                            <ChevronRight className="size-3 text-muted-foreground/40" />
                        )}
                    </Fragment>
                )
            })}
        </div>
    )
}
