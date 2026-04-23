import type { FieldResolution } from '../types'
import { TONE } from './tone'

interface ResolutionPillProps {
    resolution: FieldResolution
}

export default function ResolutionPill({ resolution }: ResolutionPillProps) {
    const t = TONE[resolution]
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${t.pill}`}>
            <span className={`inline-block size-1.5 rounded-full ${t.dot}`} />
            {t.label}
        </span>
    )
}
