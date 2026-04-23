import { useMemo, useState } from 'react'
import { Archive } from 'lucide-react'
import type { DeprecatedDoc } from './types'
import { DATE_PRESETS } from './types'
import DeprecatedCard from './DeprecatedCard'
import DeprecatedFilters, { EMPTY_FILTERS } from './DeprecatedFilters'

interface DeprecatedGridProps {
    docs: DeprecatedDoc[]
    onPreview: (doc: DeprecatedDoc) => void
}

export default function DeprecatedGrid({ docs, onPreview }: DeprecatedGridProps) {
    const [filters, setFilters] = useState(EMPTY_FILTERS)

    const filtered = useMemo(() => {
        const now = new Date()
        const preset = DATE_PRESETS.find(p => p.id === filters.datePreset)
        const cutoff = preset?.days ? new Date(now.getTime() - preset.days * 24 * 60 * 60 * 1000) : null
        const q = filters.search.trim().toLowerCase()

        return docs.filter(d => {
            // Search
            if (q) {
                const haystack = `${d.name} ${d.vendor} ${d.id}`.toLowerCase()
                if (!haystack.includes(q)) return false
            }
            // Reason filter (multi-select; empty = no filter)
            if (filters.reasons.size > 0 && !filters.reasons.has(d.deprecationReason)) return false
            // Date filter
            if (cutoff) {
                const dt = new Date(d.deprecatedAt)
                if (dt < cutoff) return false
            }
            return true
        })
    }, [docs, filters])

    return (
        <div>
            <DeprecatedFilters
                state={filters}
                onChange={setFilters}
                showingCount={filtered.length}
                totalCount={docs.length}
            />

            {filtered.length === 0 ? (
                <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
                    <Archive className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-sm font-medium text-foreground mb-1">No archived documents</p>
                    <p className="text-xs text-muted-foreground">
                        {docs.length === 0
                            ? 'No documents have been deprecated yet.'
                            : 'No archived documents match the active filters.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map(d => (
                        <DeprecatedCard key={d.id} doc={d} onPreview={onPreview} />
                    ))}
                </div>
            )}
        </div>
    )
}
