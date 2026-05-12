import type { DeprecatedDoc } from './types'

// Today is assumed to be 2026-04-23 for relative-time labels.
// Dates chosen to demonstrate all 4 date-filter buckets (7d / 30d / 90d / all).
export const DEPRECATED_DOCS: DeprecatedDoc[] = [
    {
        id: 'OCR-901', name: 'ACK-7842_Steelcase_v1.pdf', vendor: 'Steelcase', type: 'Acknowledgment',
        pages: 2, fields: 35, status: 'deprecated', confidence: 96, inconsistencyCount: 0,
        deprecationReason: 'superseded',
        deprecatedAt: '2026-04-20', deprecatedBy: 'system',
        replacementId: 'ACK-7843', originalStatus: 'processed',
    },
    {
        id: 'OCR-902', name: 'PO-1018_Knoll.pdf', vendor: 'Knoll', type: 'Purchase Order',
        pages: 4, fields: 42, status: 'deprecated', confidence: 87, inconsistencyCount: 4,
        deprecationReason: 'cancelled',
        deprecatedAt: '2026-04-16', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'inconsistencies',
    },
    {
        id: 'OCR-903', name: 'ACK-7820_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment',
        pages: 2, fields: 28, status: 'deprecated', confidence: 78, inconsistencyCount: 0,
        deprecationReason: 'duplicate',
        deprecatedAt: '2026-04-09', deprecatedBy: 'demo.user@example.com',
        originalStatus: 'capturing',
    },
    {
        id: 'OCR-904', name: 'INV-4520_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice',
        pages: 4, fields: 61, status: 'deprecated', confidence: 92, inconsistencyCount: 0,
        deprecationReason: 'vendor_correction',
        deprecatedAt: '2026-04-19', deprecatedBy: 'system',
        replacementId: 'INV-4622', originalStatus: 'processed',
    },
    {
        id: 'OCR-905', name: 'PO-0998_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order',
        pages: 1, fields: 0, status: 'deprecated', confidence: 31, inconsistencyCount: 0,
        deprecationReason: 'failed_processing',
        deprecatedAt: '2026-03-23', deprecatedBy: 'system',
        originalStatus: 'identified',
    },
    {
        id: 'OCR-906', name: 'ACK-7700_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment',
        pages: 1, fields: 12, status: 'deprecated', confidence: 99, inconsistencyCount: 0,
        deprecationReason: 'obsolete',
        deprecatedAt: '2025-10-23', deprecatedBy: 'system',
        originalStatus: 'processed',
    },
]

// Format an ISO date as a friendly relative string. Falls back to absolute.
export function formatRelativeDate(iso: string, now: Date = new Date()): string {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
    const diffMs = now.getTime() - d.getTime()
    const day = 24 * 60 * 60 * 1000
    const days = Math.floor(diffMs / day)
    if (days < 0) return iso
    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) {
        const w = Math.floor(days / 7)
        return `${w} week${w === 1 ? '' : 's'} ago`
    }
    if (days < 365) {
        const m = Math.floor(days / 30)
        return `${m} month${m === 1 ? '' : 's'} ago`
    }
    const y = Math.floor(days / 365)
    return `${y} year${y === 1 ? '' : 's'} ago`
}
