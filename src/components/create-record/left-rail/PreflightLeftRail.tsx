import type { PreflightSummary, RecordType } from '../types'
import ProgressRing from './ProgressRing'
import SegmentedBar from './SegmentedBar'
import StatusLegend from './StatusLegend'
import SectionNavButton from './SectionNavButton'

export type PaneView = 'header' | 'lineItems' | 'extras'

interface PreflightLeftRailProps {
    recordType: RecordType
    documentId: string
    vendor: string
    summary: PreflightSummary
    view: PaneView
    setView: (v: PaneView) => void
    headerCounts: { resolved: number; total: number; issues: number }
    lineCounts: { resolved: number; total: number; rows: number; issues: number }
    extrasIncludedCount: number
}

export default function PreflightLeftRail({
    recordType,
    documentId,
    vendor,
    summary,
    view,
    setView,
    headerCounts,
    lineCounts,
    extrasIncludedCount,
}: PreflightLeftRailProps) {
    const pct = Math.round((summary.resolved / (summary.total || 1)) * 100)
    const recordTypeLabel = recordType === 'PO' ? 'Purchase order' : 'Acknowledgement'

    return (
        <div className="h-full w-[300px] shrink-0 border-r border-border bg-gradient-to-b from-muted/40 to-muted/20 flex flex-col">
            {/* Brand block */}
            <div className="px-5 pt-5 pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground">
                        Create record
                    </span>
                </div>
                <div className="mt-1.5 text-[19px] font-medium tracking-tight text-foreground leading-tight">
                    {recordTypeLabel}
                </div>
                <div className="mt-0.5 text-[12px] text-muted-foreground">
                    {vendor} · <span className="font-mono text-foreground/80">{documentId}</span>
                </div>
            </div>

            {/* Progress block */}
            <div className="px-5 py-5 border-b border-border">
                <div className="flex items-center gap-4">
                    <ProgressRing pct={pct} />
                    <div className="flex-1 min-w-0">
                        <div className="text-[12.5px] font-medium text-foreground">Preflight</div>
                        <div className="text-[11.5px] text-muted-foreground mt-0.5">
                            {summary.resolved} of {summary.total} ready
                        </div>
                        <div className="mt-2">
                            <SegmentedBar summary={summary} />
                        </div>
                    </div>
                </div>

                <div className="mt-4">
                    <StatusLegend summary={summary} />
                </div>
            </div>

            {/* Section nav */}
            <nav className="px-3 py-3 flex-1 overflow-y-auto scrollbar-minimal">
                <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-muted-foreground px-2 pb-2">
                    Sections
                </div>
                <SectionNavButton
                    active={view === 'header'}
                    onClick={() => setView('header')}
                    title="Header fields"
                    sub={`${headerCounts.resolved}/${headerCounts.total} ready`}
                    warn={headerCounts.issues}
                />
                <SectionNavButton
                    active={view === 'lineItems'}
                    onClick={() => setView('lineItems')}
                    title="Line items"
                    sub={`${lineCounts.rows} rows · ${lineCounts.resolved}/${lineCounts.total} ready`}
                    warn={lineCounts.issues}
                />
                <SectionNavButton
                    active={view === 'extras'}
                    onClick={() => setView('extras')}
                    title="Extra fields"
                    sub={`${extrasIncludedCount} included`}
                />
            </nav>
        </div>
    )
}
