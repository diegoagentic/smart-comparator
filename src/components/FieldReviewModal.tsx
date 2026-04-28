import { useState, Fragment } from 'react'
import {
    X, AlertTriangle, ChevronDown, ChevronUp, Check, Pencil, Sparkles,
    FileText, DollarSign, Truck, ClipboardList, Zap, Info
} from 'lucide-react'

interface FieldReviewModalProps {
    isOpen?: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        inconsistencyCount: number
    } | null
    onResolve?: (docId: string) => void
}

interface ReviewField {
    id: string
    name: string
    category: 'header' | 'line_item' | 'pricing' | 'logistics'
    extractedValue: string
    expectedValue?: string
    aiSuggestion?: string
    confidence: number
    status: 'valid' | 'inconsistent' | 'missing'
    reason?: string
}

const CATEGORY_META: Record<string, { label: string; icon: typeof FileText; color: string }> = {
    header: { label: 'Header Fields', icon: FileText, color: 'text-blue-600 dark:text-blue-400' },
    line_item: { label: 'Line Items', icon: ClipboardList, color: 'text-indigo-600 dark:text-indigo-400' },
    pricing: { label: 'Pricing', icon: DollarSign, color: 'text-green-600 dark:text-green-400' },
    logistics: { label: 'Logistics', icon: Truck, color: 'text-amber-600 dark:text-amber-400' },
}

const MOCK_FIELDS: ReviewField[] = [
    // Header
    { id: 'f1', name: 'Vendor Name', category: 'header', extractedValue: 'AIS Furniture', confidence: 99, status: 'valid' },
    { id: 'f2', name: 'Document Number', category: 'header', extractedValue: 'ACK-7839', confidence: 97, status: 'valid' },
    { id: 'f3', name: 'Reference PO', category: 'header', extractedValue: '', expectedValue: 'ORD-2055', aiSuggestion: 'ORD-2055', confidence: 91, status: 'missing', reason: 'Field not found in extracted data. AI matched by vendor + date correlation.' },
    { id: 'f4', name: 'ACK Date', category: 'header', extractedValue: '2026-01-13', confidence: 98, status: 'valid' },
    // Line Items
    { id: 'f5', name: 'Line 1: Product SKU', category: 'line_item', extractedValue: '', expectedValue: 'T-RCR306029HLG2', aiSuggestion: 'T-RCR306029HLG2', confidence: 85, status: 'missing', reason: 'SKU field blank in scan. AI inferred from product description "TBL, REC, 30Dx60Wx29H".' },
    { id: 'f6', name: 'Line 1: Quantity', category: 'line_item', extractedValue: '4', confidence: 99, status: 'valid' },
    { id: 'f7', name: 'Line 1: Unit Price', category: 'line_item', extractedValue: '479.18', confidence: 96, status: 'valid' },
    { id: 'f8', name: 'Line 2: Product SKU', category: 'line_item', extractedValue: 'X-BBFPFS182812', confidence: 97, status: 'valid' },
    { id: 'f9', name: 'Line 2: Quantity', category: 'line_item', extractedValue: '6', expectedValue: '4', aiSuggestion: '4', confidence: 88, status: 'inconsistent', reason: 'OCR extracted "6" but PO specifies qty 4. Possible scan error on handwritten correction.' },
    { id: 'f10', name: 'Line 3: Finish Code', category: 'line_item', extractedValue: 'LG2', expectedValue: 'LG2-Loft Gray', aiSuggestion: 'LG2-Loft Gray', confidence: 95, status: 'inconsistent', reason: 'Abbreviated code extracted. AI mapped to full finish name from vendor catalog.' },
    // Pricing
    { id: 'f11', name: 'Subtotal', category: 'pricing', extractedValue: '$25,398.72', confidence: 94, status: 'valid' },
    { id: 'f12', name: 'Tax Amount', category: 'pricing', extractedValue: '', expectedValue: '$2,095.39', aiSuggestion: '$2,095.39', confidence: 82, status: 'missing', reason: 'Tax line not parsed. AI calculated from subtotal × 8.25% (TX rate).' },
    { id: 'f13', name: 'Discount %', category: 'pricing', extractedValue: '62%', confidence: 97, status: 'valid' },
    // Logistics
    { id: 'f14', name: 'Ship To Address', category: 'logistics', extractedValue: '1200 Commerce Dr, Suite 400, Dallas, TX 75201', confidence: 96, status: 'valid' },
    { id: 'f15', name: 'Expected Ship Date', category: 'logistics', extractedValue: '', expectedValue: '2026-02-15', aiSuggestion: '2026-02-15', confidence: 78, status: 'missing', reason: 'Ship date not found in document. AI estimated from vendor standard lead time (4 weeks).' },
    { id: 'f16', name: 'Freight Terms', category: 'logistics', extractedValue: 'Prepaid', expectedValue: 'Prepaid & Add', aiSuggestion: 'Prepaid & Add', confidence: 90, status: 'inconsistent', reason: 'Partial match — OCR missed "& Add" portion. Common truncation in scanned PDFs.' },
]

const confidenceColor = (c: number) => {
    if (c >= 90) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10'
    if (c >= 75) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10'
}

const statusDot = (s: ReviewField['status']) => {
    if (s === 'valid') return 'bg-green-500'
    if (s === 'inconsistent') return 'bg-amber-500'
    return 'bg-red-500'
}

export default function FieldReviewModal({ isOpen, onClose, document, onResolve }: FieldReviewModalProps) {
    const [resolvedFields, setResolvedFields] = useState<Set<string>>(new Set())
    const [expandedField, setExpandedField] = useState<string | null>(null)
    const [activeCategory, setActiveCategory] = useState<string>('all')

    const issueFields = MOCK_FIELDS.filter(f => f.status !== 'valid')
    const totalIssues = issueFields.length
    const resolvedCount = resolvedFields.size
    const allResolved = resolvedCount >= totalIssues

    const categories = ['all', ...Array.from(new Set(MOCK_FIELDS.map(f => f.category)))]
    const displayFields = activeCategory === 'all'
        ? MOCK_FIELDS
        : MOCK_FIELDS.filter(f => f.category === activeCategory)

    const handleAccept = (fieldId: string) => {
        setResolvedFields(prev => new Set([...prev, fieldId]))
        setExpandedField(null)
    }

    const handleAutoValidate = () => {
        const highConfidence = issueFields.filter(f => f.confidence >= 90 && !resolvedFields.has(f.id))
        highConfidence.forEach((f, i) => {
            setTimeout(() => {
                setResolvedFields(prev => new Set([...prev, f.id]))
            }, i * 200)
        })
    }

    const handleResolveAll = () => {
        onResolve?.(document?.id || '')
        onClose()
    }

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 shrink-0 min-h-0">
            {/* Header */}
            <div className="px-4 py-3 shrink-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                            Field Review
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                            Validate extracted fields
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-2 flex items-center gap-3" title="Document Progress">
                    <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-green-500 rounded-full transition-all duration-500"
                            style={{ width: `${totalIssues > 0 ? (resolvedCount / totalIssues) * 100 : 100}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                        {resolvedCount}/{totalIssues} resolved
                    </span>
                </div>

                {/* Stats + Auto-validate */}
                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px]">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-green-500" /> {MOCK_FIELDS.filter(f => f.status === 'valid').length}</span>
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" /> {MOCK_FIELDS.filter(f => f.status === 'inconsistent').length}</span>
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-500" /> {MOCK_FIELDS.filter(f => f.status === 'missing').length}</span>
                    </div>
                    {!allResolved && (
                        <button
                            onClick={handleAutoValidate}
                            className="flex items-center gap-1.5 px-2 py-1 text-[9px] font-bold bg-ai-light dark:bg-ai/20 text-ai rounded hover:bg-ai/20 transition-colors uppercase tracking-wider"
                        >
                            <Zap className="h-2.5 w-2.5" /> Auto-resolve
                        </button>
                    )}
                </div>

                {/* Category Tabs */}
                <div className="mt-2 flex gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-md overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={`px-2 py-1 text-[10px] font-medium rounded transition-colors whitespace-nowrap ${activeCategory === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                        All ({MOCK_FIELDS.length})
                    </button>
                    {Object.entries(CATEGORY_META).map(([key, meta]) => {
                        const issues = MOCK_FIELDS.filter(f => f.category === key && f.status !== 'valid').length
                        return (
                            <button
                                key={key}
                                onClick={() => setActiveCategory(key)}
                                className={`px-2 py-1 text-[10px] font-medium rounded transition-colors flex items-center gap-1 whitespace-nowrap ${activeCategory === key ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                            >
                                <meta.icon className="h-2.5 w-2.5" />
                                <span className="hidden sm:inline">{meta.label}</span>
                                {issues > 0 && <span className="text-[8px] px-1 py-0.5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 font-bold ml-0.5">{issues}</span>}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Scrollable field list */}
            <div className="flex-1 overflow-y-auto px-4 py-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#d4d4d8 transparent' }}>
                <div className="space-y-2 pb-2">
                    {displayFields.map(field => {
                        const isExpanded = expandedField === field.id
                        const isResolved = resolvedFields.has(field.id)
                        const isIssue = field.status !== 'valid'
                        
                        return (
                            <div
                                key={field.id}
                                className={`border rounded-lg overflow-hidden transition-all ${
                                    isResolved ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-500/5 opacity-70' :
                                    field.status === 'missing' ? 'border-red-200 dark:border-red-800 bg-red-50/20 dark:bg-red-500/5' :
                                    field.status === 'inconsistent' ? 'border-amber-200 dark:border-amber-800 bg-amber-50/20 dark:bg-amber-500/5' :
                                    'border-zinc-200 dark:border-zinc-700'
                                }`}
                            >
                                {/* Field row */}
                                <button
                                    onClick={() => isIssue && !isResolved ? setExpandedField(isExpanded ? null : field.id) : null}
                                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${isIssue && !isResolved ? 'hover:bg-zinc-50/50 dark:hover:bg-white/5 cursor-pointer' : 'cursor-default'}`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isResolved ? 'bg-green-500' : statusDot(field.status)}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-xs font-semibold text-zinc-900 dark:text-white truncate">{field.name}</span>
                                            {isResolved && <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-green-500 text-white uppercase">Valid</span>}
                                            {!isResolved && field.status === 'missing' && <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-red-500 text-white uppercase">Missing</span>}
                                            {!isResolved && field.status === 'inconsistent' && <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500 text-white uppercase">Mismatch</span>}
                                        </div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono truncate">
                                                {field.extractedValue || <span className="italic text-red-400">empty</span>}
                                            </span>
                                            {field.aiSuggestion && !isResolved && (
                                                <span className="text-[10px] text-zinc-400">→</span>
                                            )}
                                            {field.aiSuggestion && !isResolved && (
                                                <span className="text-[10px] font-semibold text-ai font-mono truncate">{field.aiSuggestion}</span>
                                            )}
                                        </div>
                                    </div>
                                    {isIssue && !isResolved && (
                                        isExpanded ? <ChevronUp className="h-3 w-3 text-zinc-400 shrink-0" /> : <ChevronDown className="h-3 w-3 text-zinc-400 shrink-0" />
                                    )}
                                </button>

                                {/* Expanded detail */}
                                {isExpanded && !isResolved && (
                                    <div className="px-3 pb-3 space-y-2 border-t border-zinc-200/50 dark:border-zinc-700/50 mt-1 pt-2">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="p-2 rounded bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                                                <p className="text-[9px] font-bold text-zinc-500 uppercase mb-0.5">Extracted</p>
                                                <p className={`text-[11px] font-mono break-words ${field.extractedValue ? 'text-zinc-900 dark:text-white' : 'text-red-400 italic'}`}>
                                                    {field.extractedValue || 'None'}
                                                </p>
                                            </div>
                                            <div className="p-2 rounded bg-ai/5 border border-ai/20">
                                                <p className="text-[9px] font-bold text-ai uppercase mb-0.5 flex items-center gap-1">
                                                    <Sparkles className="h-2.5 w-2.5" /> Suggestion
                                                </p>
                                                <p className="text-[11px] font-mono font-semibold text-zinc-900 dark:text-white break-words">
                                                    {field.aiSuggestion || field.expectedValue || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        {field.reason && (
                                            <div className="flex items-start gap-1 p-1.5 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded">
                                                <Info className="h-3 w-3 text-blue-500 shrink-0 mt-0.5" />
                                                <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">{field.reason}</p>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 pt-1">
                                            <button
                                                onClick={() => handleAccept(field.id)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold bg-green-500 text-white rounded hover:bg-green-600 transition-colors uppercase tracking-wider"
                                            >
                                                <Check className="h-3 w-3" /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleAccept(field.id)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] font-bold border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-300 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors uppercase tracking-wider"
                                            >
                                                Keep Extracted
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex flex-col gap-2 shrink-0">
                <div className="text-[10px] text-zinc-500 font-medium text-center">
                    {MOCK_FIELDS.length} fields · {totalIssues} need review
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-3 py-1.5 text-xs font-bold border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors uppercase tracking-wider"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleResolveAll}
                        disabled={!allResolved}
                        className={`flex-1 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors uppercase tracking-wider ${
                            allResolved
                                ? 'bg-[#C3E433] dark:bg-[#C3E433] text-zinc-900 hover:bg-[#C3E433]/80 shadow-sm'
                                : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                        }`}
                    >
                        Validate
                    </button>
                </div>
            </div>
        </div>
    )
}
