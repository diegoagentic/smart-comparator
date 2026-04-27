import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import {
    X, FileText, Building2, Truck, Package, DollarSign, MapPin,
    ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Sparkles, ZoomIn, ZoomOut
} from 'lucide-react'
import FieldReviewModal from './FieldReviewModal'

// ─── Types ────────────────────────────────────────────────────
interface DocumentPreviewModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        type: string
        fields: number
        confidence: number | null
        status?: string
        discrepancyCount?: number
    } | null
    onResolve?: (id: string) => void
}

interface ExtractedField {
    name: string
    value: string
    confidence: number
    status: 'valid' | 'inconsistent' | 'missing'
    highlight?: boolean
}

interface FieldGroup {
    id: string
    label: string
    icon: typeof FileText
    fields: ExtractedField[]
}

// ─── Mock extracted fields per document type ──────────────────
const ACK_FIELDS: FieldGroup[] = [
    {
        id: 'header', label: 'Document Header', icon: FileText,
        fields: [
            { name: 'ACK Number', value: 'ACK-7839', confidence: 99, status: 'valid' },
            { name: 'ACK Date', value: '2026-01-13', confidence: 97, status: 'valid' },
            { name: 'Reference PO', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Sales Order #', value: 'SO 1151064-B', confidence: 94, status: 'valid' },
            { name: 'Document Type', value: 'Acknowledgment', confidence: 98, status: 'valid' },
        ]
    },
    {
        id: 'vendor', label: 'Vendor Information', icon: Building2,
        fields: [
            { name: 'Vendor Name', value: 'Steelcase', confidence: 99, status: 'valid' },
            { name: 'Vendor Address', value: '901 44th St SE, Grand Rapids, MI', confidence: 93, status: 'valid' },
            { name: 'Sales Rep', value: 'Mark Thompson', confidence: 88, status: 'valid' },
            { name: 'Rep Email', value: 'mthompson@steelcase.com', confidence: 85, status: 'valid' },
            { name: 'Rep Phone', value: '', confidence: 0, status: 'missing', highlight: true },
        ]
    },
    {
        id: 'line_items', label: 'Line Items', icon: Package,
        fields: [
            { name: 'Line 1: Description', value: 'Gesture Task Chair', confidence: 96, status: 'valid' },
            { name: 'Line 1: SKU', value: 'GES-442-BLK', confidence: 94, status: 'valid' },
            { name: 'Line 1: Quantity', value: '8', confidence: 97, status: 'valid' },
            { name: 'Line 1: Unit Price', value: '$1,242.00', confidence: 95, status: 'valid' },
            { name: 'Line 2: Description', value: 'Migration SE Desk', confidence: 92, status: 'valid' },
            { name: 'Line 2: SKU', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Line 2: Quantity', value: '12', confidence: 98, status: 'valid' },
            { name: 'Line 2: Unit Price', value: '$1,895.00', confidence: 91, status: 'inconsistent', highlight: true },
            { name: 'Line 3: Description', value: 'Think V2 Stool', confidence: 89, status: 'valid' },
            { name: 'Line 3: Quantity', value: '6', confidence: 96, status: 'valid' },
        ]
    },
    {
        id: 'pricing', label: 'Pricing & Totals', icon: DollarSign,
        fields: [
            { name: 'Subtotal', value: '$47,826.00', confidence: 93, status: 'valid' },
            { name: 'Discount', value: '38%', confidence: 90, status: 'valid' },
            { name: 'Tax', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Total', value: '$29,651.92', confidence: 88, status: 'inconsistent', highlight: true },
        ]
    },
    {
        id: 'logistics', label: 'Shipping & Delivery', icon: Truck,
        fields: [
            { name: 'Ship To', value: '1200 Commerce Dr, Suite 400, Dallas TX', confidence: 95, status: 'valid' },
            { name: 'Ship Via', value: 'Steelcase Fleet', confidence: 91, status: 'valid' },
            { name: 'Expected Ship Date', value: '2026-02-20', confidence: 87, status: 'valid' },
            { name: 'Freight Terms', value: 'Prepaid', confidence: 84, status: 'inconsistent', highlight: true },
        ]
    },
]

const PO_FIELDS: FieldGroup[] = [
    {
        id: 'header', label: 'Document Header', icon: FileText,
        fields: [
            { name: 'PO Number', value: 'PO-1029', confidence: 99, status: 'valid' },
            { name: 'PO Date', value: '2025-12-15', confidence: 98, status: 'valid' },
            { name: 'Order Status', value: 'Active', confidence: 96, status: 'valid' },
            { name: 'Payment Terms', value: 'Net 30', confidence: 94, status: 'valid' },
        ]
    },
    {
        id: 'vendor', label: 'Vendor', icon: Building2,
        fields: [
            { name: 'Vendor Name', value: 'Apex Furniture', confidence: 99, status: 'valid' },
            { name: 'Contact', value: 'Lisa Chen', confidence: 91, status: 'valid' },
            { name: 'Email', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Phone', value: '(469) 555-0188', confidence: 87, status: 'valid' },
        ]
    },
    {
        id: 'line_items', label: 'Line Items', icon: Package,
        fields: [
            { name: 'Line 1: Ergonomic Task Chair', value: 'Qty: 125 @ $376.75', confidence: 96, status: 'valid' },
            { name: 'Line 1: SKU', value: 'SKU-OFF-2025-002', confidence: 98, status: 'valid' },
            { name: 'Line 2: Standing Desk 60x30', value: 'Qty: 50 @ $892.00', confidence: 94, status: 'valid' },
            { name: 'Line 2: SKU', value: '', confidence: 0, status: 'missing', highlight: true },
            { name: 'Line 3: Monitor Arm Dual', value: 'Qty: 125 @ $189.00', confidence: 93, status: 'valid' },
        ]
    },
    {
        id: 'pricing', label: 'Pricing', icon: DollarSign,
        fields: [
            { name: 'Subtotal', value: '$117,518.75', confidence: 95, status: 'valid' },
            { name: 'Discount', value: '45%', confidence: 88, status: 'inconsistent', highlight: true },
            { name: 'Total', value: '$64,635.31', confidence: 90, status: 'valid' },
        ]
    },
    {
        id: 'logistics', label: 'Shipping', icon: Truck,
        fields: [
            { name: 'Ship To', value: '800 W Campbell Rd, Richardson TX', confidence: 97, status: 'valid' },
            { name: 'Expected Delivery', value: '2026-01-30', confidence: 85, status: 'valid' },
            { name: 'Freight Terms', value: 'FOB Destination', confidence: 92, status: 'valid' },
        ]
    },
]

// ─── Confidence color ─────────────────────────────────────────
const confColor = (c: number) => {
    if (c >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
    if (c >= 75) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
}

// ─── Document Mock Preview ────────────────────────────────────
function DocumentMockPreview({ fields, vendor, docName, docType }: { fields: FieldGroup[]; vendor: string; docName: string; docType: string }) {
    const [zoom, setZoom] = useState(100)
    const allFields = fields.flatMap(g => g.fields)

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 shrink-0">
                <span className="text-xs font-semibold text-zinc-500">{docName}</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.max(80, z - 10))} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"><ZoomOut className="h-3.5 w-3.5" /></button>
                    <span className="text-[10px] font-mono text-zinc-400 w-8 text-center">{zoom}%</span>
                    <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500"><ZoomIn className="h-3.5 w-3.5" /></button>
                </div>
            </div>

            {/* Simulated Document */}
            <div className="flex-1 overflow-y-auto p-6 bg-zinc-100 dark:bg-zinc-950" style={{ scrollbarWidth: 'thin' }}>
                <div className="mx-auto bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 p-8 font-mono text-xs leading-relaxed"
                     style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', maxWidth: '560px' }}>

                    {/* Document header */}
                    <div className="flex justify-between items-start mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-700">
                        <div>
                            <p className="text-lg font-bold text-zinc-900 dark:text-white font-sans">{vendor}</p>
                            <p className="text-zinc-500 mt-1">{docType}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-zinc-900 dark:text-white">{allFields.find(f => f.name.includes('Number'))?.value || docName}</p>
                            <p className="text-zinc-500">{allFields.find(f => f.name.includes('Date'))?.value || ''}</p>
                        </div>
                    </div>

                    {/* Render each group as a document section */}
                    {fields.map(group => (
                        <div key={group.id} className="mb-5">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 font-sans">{group.label}</p>
                            <div className="space-y-1">
                                {group.fields.map((field, i) => (
                                    <div key={i} className={`flex justify-between py-1 px-2 rounded ${
                                        field.highlight
                                            ? field.status === 'missing'
                                                ? 'bg-red-50 dark:bg-red-500/10 ring-1 ring-red-300 dark:ring-red-700'
                                                : 'bg-amber-50 dark:bg-amber-500/10 ring-1 ring-amber-300 dark:ring-amber-700'
                                            : ''
                                    }`}>
                                        <span className="text-zinc-500">{field.name}</span>
                                        <span className={`font-medium ${
                                            field.status === 'missing' ? 'text-red-400 italic' :
                                            field.status === 'inconsistent' ? 'text-amber-600 dark:text-amber-400' :
                                            'text-zinc-900 dark:text-white'
                                        }`}>
                                            {field.value || '—'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Footer */}
                    <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-700 text-center">
                        <p className="text-zinc-400 text-[10px]">Extracted by Smart Comparator OCR Engine</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

// ─── Field Group Card (reused pattern from InputsTab) ─────────
function FieldGroupPanel({ group, defaultOpen = false }: { group: FieldGroup; defaultOpen?: boolean }) {
    const [open, setOpen] = useState(defaultOpen)
    const Icon = group.icon
    const validCount = group.fields.filter(f => f.status === 'valid').length
    const issueCount = group.fields.filter(f => f.status !== 'valid').length

    return (
        <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
            <button onClick={() => setOpen(!open)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors text-left">
                <div className="h-7 w-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 shrink-0">
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-semibold text-zinc-900 dark:text-white">{group.label}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-zinc-500">{validCount}/{group.fields.length}</span>
                        {issueCount > 0 && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <AlertCircle className="h-2.5 w-2.5" /> {issueCount}
                            </span>
                        )}
                    </div>
                </div>
                {open ? <ChevronDown className="h-3.5 w-3.5 text-zinc-400" /> : <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />}
            </button>
            {open && (
                <div className="border-t border-zinc-200/50 dark:border-zinc-700/50 divide-y divide-zinc-100 dark:divide-zinc-800">
                    {group.fields.map((field, i) => (
                        <div key={i} className={`flex items-center gap-2 px-3 py-2 ${
                            field.status === 'missing' ? 'bg-red-50/50 dark:bg-red-500/5' :
                            field.status === 'inconsistent' ? 'bg-amber-50/50 dark:bg-amber-500/5' : ''
                        }`}>
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                                field.status === 'valid' ? 'bg-green-500' :
                                field.status === 'inconsistent' ? 'bg-amber-500' : 'bg-red-500'
                            }`} />
                            <div className="flex-1 min-w-0">
                                <span className="text-[11px] text-zinc-500">{field.name}</span>
                                <p className={`text-xs font-medium truncate ${
                                    field.status === 'missing' ? 'text-red-400 italic' :
                                    field.status === 'inconsistent' ? 'text-amber-600 dark:text-amber-400' :
                                    'text-zinc-900 dark:text-white'
                                }`}>
                                    {field.value || 'Not found'}
                                </p>
                            </div>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${confColor(field.confidence)}`}>
                                {field.confidence > 0 ? `${field.confidence}%` : '—'}
                            </span>
                            {field.status === 'valid' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />}
                            {field.status === 'inconsistent' && <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                            {field.status === 'missing' && <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Main Modal ───────────────────────────────────────────────
export default function DocumentPreviewModal({ isOpen, onClose, document, onResolve }: DocumentPreviewModalProps) {
    if (!document) return null

    const isAck = document.type === 'Acknowledgment'
    const fieldGroups = isAck ? ACK_FIELDS : PO_FIELDS
    const allFields = fieldGroups.flatMap(g => g.fields)
    const validCount = allFields.filter(f => f.status === 'valid').length
    const totalCount = allFields.length
    const pct = Math.round((validCount / totalCount) * 100)

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-6xl h-[85vh] transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800 flex flex-col">

                                {/* Header */}
                                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-ai/10 flex items-center justify-center">
                                            <Sparkles className="h-5 w-5 text-ai" />
                                        </div>
                                        <div>
                                            <DialogTitle as="h3" className="text-lg font-bold text-zinc-900 dark:text-white">
                                                Document Review
                                            </DialogTitle>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                                {document.vendor} — {document.name}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {/* Summary stats */}
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> {validCount} valid</span>
                                            <span className="flex items-center gap-1.5"><AlertCircle className="h-3.5 w-3.5 text-amber-500" /> {totalCount - validCount} issues</span>
                                        </div>
                                        <div className="flex items-center gap-2" title="Document Progress">
                                            <div className="w-20 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">{pct}%</span>
                                        </div>
                                        <button onClick={onClose} className="p-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors" title="Close">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Split Pane */}
                                <div className="flex-1 grid grid-cols-5 min-h-0">
                                    {/* Left: Document Preview (3/5) */}
                                    <div className="col-span-3 border-r border-zinc-200 dark:border-zinc-800 flex flex-col min-h-0">
                                        <DocumentMockPreview
                                            fields={fieldGroups}
                                            vendor={document.vendor}
                                            docName={document.name}
                                            docType={document.type}
                                        />
                                    </div>

                                    {/* Right: Extracted Fields or Field Review (2/5) */}
                                    <div className="col-span-2 flex flex-col min-h-0 bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800">
                                        {(document.status === 'capturing' || document.status === 'discrepancies' || document.status === 'in_progress' || document.status === 'processed') ? (
                                            <FieldReviewModal 
                                                document={document} 
                                                onResolve={onResolve} 
                                                onClose={onClose} 
                                            />
                                        ) : (
                                            <>
                                                <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 shrink-0">
                                                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Extracted Fields</h4>
                                                    <p className="text-[10px] text-zinc-400 mt-0.5">{totalCount} fields · {document.fields} from document</p>
                                                </div>
                                                <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ scrollbarWidth: 'thin' }}>
                                                    {fieldGroups.map((group, i) => (
                                                        <FieldGroupPanel key={group.id} group={group} defaultOpen={i === 0} />
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
