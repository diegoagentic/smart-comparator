import { useState, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, AlertTriangle, ChevronDown, ChevronUp, Check, Pencil, Sparkles, FileText } from 'lucide-react'

interface DiscrepancyItem {
    id: string
    ackNumber: string
    vendor: string
    linesScanned: number
    totalAmount: string
    discrepancies: {
        lineNumber: number
        itemName: string
        sku: string
        poSpec: string
        ackValue: string
        ackStatus: string // e.g. "Unit Price Missing", "Quantity Mismatch"
        fields: {
            name: string
            value: string
            isMissing: boolean
            aiSuggestion?: string
        }[]
        quantity: number
        unitPrice: { current: number; suggested: number; isMissing: boolean }
        total: number
    }[]
}

interface ResolveDiscrepancyModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        discrepancyCount: number
    } | null
    onResolve?: (docId: string) => void
}

// Mock discrepancy data matching Figma design
const MOCK_DISCREPANCIES: DiscrepancyItem = {
    id: 'ACK-9237',
    ackNumber: 'Acknowledgement-9237',
    vendor: 'AIS',
    linesScanned: 50,
    totalAmount: '$65,439.09',
    discrepancies: [
        {
            lineNumber: 41,
            itemName: 'Steel Hinge Model S-45',
            sku: 'SH-S45-BLK',
            poSpec: 'Unit Price: $3.50 ea',
            ackValue: 'Unit Price Missing',
            ackStatus: 'Unit Price Missing',
            fields: [
                { name: 'Quantity', value: '150', isMissing: false },
                { name: 'Unit Price', value: '0.00', isMissing: true, aiSuggestion: '3.50' },
                { name: 'Total', value: '0.00', isMissing: false },
            ],
            quantity: 150,
            unitPrice: { current: 0, suggested: 3.50, isMissing: true },
            total: 0,
        },
        {
            lineNumber: 28,
            itemName: 'Drawer Slide Kit DS-200',
            sku: 'DS-200-SS',
            poSpec: 'Quantity: 75',
            ackValue: 'Quantity: 60',
            ackStatus: 'Quantity Mismatch',
            fields: [
                { name: 'Quantity', value: '60', isMissing: false, aiSuggestion: '75' },
                { name: 'Unit Price', value: '12.80', isMissing: false },
                { name: 'Total', value: '768.00', isMissing: false },
            ],
            quantity: 60,
            unitPrice: { current: 12.80, suggested: 12.80, isMissing: false },
            total: 768,
        },
        {
            lineNumber: 15,
            itemName: 'Cabinet Lock Assembly CL-100',
            sku: 'CL-100-CHR',
            poSpec: 'SKU: CL-100-CHR',
            ackValue: 'SKU Missing',
            ackStatus: 'SKU Missing',
            fields: [
                { name: 'Quantity', value: '200', isMissing: false },
                { name: 'Unit Price', value: '4.25', isMissing: false },
                { name: 'Total', value: '850.00', isMissing: false },
            ],
            quantity: 200,
            unitPrice: { current: 4.25, suggested: 4.25, isMissing: false },
            total: 850,
        },
    ]
}

export default function ResolveDiscrepancyModal({ isOpen, onClose, document, onResolve }: ResolveDiscrepancyModalProps) {
    const [expandedItem, setExpandedItem] = useState<number>(0)
    const [resolvedItems, setResolvedItems] = useState<Set<number>>(new Set())
    const [showWarning, setShowWarning] = useState(true)

    const data = MOCK_DISCREPANCIES

    const handleAcceptSuggestion = (discIdx: number) => {
        setResolvedItems(prev => new Set([...prev, discIdx]))
    }

    const allResolved = resolvedItems.size === data.discrepancies.length

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-card text-left align-middle shadow-xl transition-all border border-border">

                                {/* Header */}
                                <div className="p-6 border-b border-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <DialogTitle as="h3" className="text-xl font-bold text-foreground">
                                                Resolve Item Discrepancy
                                            </DialogTitle>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                Review the issue and confirm the correct information
                                            </p>
                                        </div>
                                        <button onClick={onClose} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                                            <X className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content — scrollable */}
                                <div className="max-h-[70vh] overflow-y-auto">
                                    <div className="p-6 space-y-4">
                                        {/* Warning Banner */}
                                        {showWarning && (
                                            <div className="flex items-start gap-3 p-3 bg-warning-light dark:bg-warning/10 border border-warning/20 rounded-xl">
                                                <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-foreground">Warning</p>
                                                    <p className="text-xs text-muted-foreground">Our AI couldn't confidently extract all data for these items.</p>
                                                </div>
                                                <button onClick={() => setShowWarning(false)} className="p-1 text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
                                            </div>
                                        )}

                                        {/* Discrepancy Items — Accordion */}
                                        {data.discrepancies.map((disc, idx) => {
                                            const isExpanded = expandedItem === idx
                                            const isResolved = resolvedItems.has(idx)

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`border rounded-2xl overflow-hidden transition-all ${
                                                        isResolved
                                                            ? 'border-success/30 bg-success-light/30 dark:bg-success/5'
                                                            : 'border-error/30 bg-error-light/30 dark:bg-error/5'
                                                    }`}
                                                >
                                                    {/* Accordion Header */}
                                                    <button
                                                        onClick={() => setExpandedItem(isExpanded ? -1 : idx)}
                                                        className="w-full flex items-center justify-between p-4 text-left"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                                                isResolved ? 'bg-success' : 'bg-error'
                                                            }`}>
                                                                {isResolved ? <Check className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-foreground">{data.ackNumber} — {data.vendor}</p>
                                                                <p className="text-xs text-muted-foreground">{data.linesScanned} lines scanned | {data.totalAmount}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {!isResolved && (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-error text-white flex items-center gap-1">
                                                                    <AlertTriangle className="h-3 w-3" /> Discrepancy
                                                                </span>
                                                            )}
                                                            {isResolved && (
                                                                <span className="text-xs font-semibold px-2 py-1 rounded-md bg-success text-white flex items-center gap-1">
                                                                    <Check className="h-3 w-3" /> Resolved
                                                                </span>
                                                            )}
                                                            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                                                        </div>
                                                    </button>

                                                    {/* Expanded Content */}
                                                    {isExpanded && (
                                                        <div className="px-4 pb-4 space-y-4">
                                                            {/* Discrepancy Detail */}
                                                            <div className="bg-error-light dark:bg-error/10 border border-error/20 rounded-xl p-3">
                                                                <p className="text-sm font-semibold text-error">
                                                                    Line {disc.lineNumber}: {disc.itemName} - {disc.sku}
                                                                </p>
                                                                <div className="flex justify-between mt-1">
                                                                    <span className="text-xs text-muted-foreground">PO Spec: <strong className="text-foreground">{disc.poSpec}</strong></span>
                                                                    <span className="text-xs text-error font-medium">Acknowledgement: <strong>{disc.ackStatus}</strong></span>
                                                                </div>
                                                            </div>

                                                            {/* Fields */}
                                                            <div className="grid grid-cols-2 gap-3">
                                                                {disc.fields.map((field, fIdx) => (
                                                                    <div key={fIdx} className={`space-y-1 ${field.name === 'Total' ? 'col-span-2' : ''}`}>
                                                                        <div className="flex items-center gap-2">
                                                                            <label className={`text-xs font-semibold ${field.isMissing ? 'text-error' : 'text-muted-foreground'}`}>
                                                                                {field.name} {field.isMissing && '(Missing)'}
                                                                            </label>
                                                                            {field.aiSuggestion && (
                                                                                <span className="text-[10px] text-ai font-medium flex items-center gap-1">
                                                                                    <Sparkles className="h-3 w-3" /> AI Suggestion
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <div className={`flex items-center gap-2 ${field.isMissing ? '' : ''}`}>
                                                                            <div className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${
                                                                                field.isMissing
                                                                                    ? 'border-error/30 bg-error-light/50 dark:bg-error/5 text-error'
                                                                                    : 'border-border bg-muted/50 text-foreground'
                                                                            }`}>
                                                                                {field.aiSuggestion && field.isMissing ? (
                                                                                    <span className="flex items-center gap-2">
                                                                                        <span className="text-muted-foreground line-through">$ {field.value}</span>
                                                                                        <span className="text-foreground">→</span>
                                                                                        <span className="text-foreground font-bold">$ {field.aiSuggestion}</span>
                                                                                    </span>
                                                                                ) : field.name === 'Total' ? (
                                                                                    `$ ${field.value}`
                                                                                ) : (
                                                                                    field.value
                                                                                )}
                                                                            </div>
                                                                            {field.aiSuggestion && !isResolved && (
                                                                                <div className="flex gap-1">
                                                                                    <button
                                                                                        onClick={() => handleAcceptSuggestion(idx)}
                                                                                        className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold bg-success text-white rounded-lg hover:bg-success/90 transition-colors"
                                                                                    >
                                                                                        <Check className="h-3 w-3" /> Accept
                                                                                    </button>
                                                                                    <button className="flex items-center gap-1 px-2.5 py-2 text-xs font-semibold bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors">
                                                                                        <Pencil className="h-3 w-3" /> Edit
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        {field.isMissing && <p className="text-[10px] text-error">This field is required</p>}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-border flex items-center justify-end gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2.5 text-sm font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                                    >
                                        Save as Draft
                                    </button>
                                    <button
                                        onClick={() => { onResolve?.(document?.id || ''); onClose(); }}
                                        disabled={!allResolved}
                                        className={`px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 ${
                                            allResolved
                                                ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900 hover:bg-brand-400 dark:hover:bg-brand-600/50'
                                                : 'bg-muted text-muted-foreground cursor-not-allowed'
                                        }`}
                                    >
                                        Resolve Discrepancies
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
