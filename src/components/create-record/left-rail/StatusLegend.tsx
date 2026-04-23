import type { PreflightSummary } from '../types'

interface StatusLegendProps {
    summary: PreflightSummary
}

interface LegendRowProps {
    color: string
    label: string
    count: number
}

function LegendRow({ color, label, count }: LegendRowProps) {
    return (
        <div className="flex items-center gap-1.5 min-w-0">
            <span className={`size-2 rounded-full shrink-0 ${color}`} />
            <span className="text-muted-foreground truncate">{label}</span>
            <span className="ml-auto text-muted-foreground/60 font-mono">{count}</span>
        </div>
    )
}

export default function StatusLegend({ summary }: StatusLegendProps) {
    return (
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px]">
            <LegendRow color="bg-green-500 dark:bg-green-400" label="Ready" count={summary.resolved} />
            <LegendRow color="bg-amber-500 dark:bg-amber-400" label="Low conf." count={summary.aiUncertain} />
            <LegendRow color="bg-amber-500 dark:bg-amber-400" label="Partial" count={summary.partial} />
            <LegendRow color="bg-red-500 dark:bg-red-400" label="Missing" count={summary.unresolved} />
            <LegendRow color="bg-red-500 dark:bg-red-400" label="Bad format" count={summary.coercionErrors} />
            <LegendRow color="bg-zinc-300 dark:bg-zinc-700" label="Not sent" count={summary.unmapped} />
        </div>
    )
}
