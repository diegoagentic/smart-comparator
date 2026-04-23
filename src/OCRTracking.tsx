import { useState } from 'react'
import { ScanEye, FileText, AlertTriangle, CheckCircle2, Clock, Upload, Download, Eye, MoreHorizontal, Sparkles, Search, Filter, LayoutGrid, List, ChevronRight, ChevronDown, ChevronUp, X, FilePlus2 } from 'lucide-react'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'
import DocumentPreviewModal from './components/DocumentPreviewModal'
import CreateRecordModal, { type RecordType } from './components/create-record/CreateRecordModal'
import { getPreflightForDoc } from './components/create-record/mockPreflightData'
import { preflightHasInconsistencies } from './components/create-record/usePreflight'
import { ToastContainer, useToast } from './components/AuthToast'

const OCR_DOCUMENTS = [
    { id: 'OCR-001', name: 'ACK-7842_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment', pages: 3, fields: 50, date: 'Today, 2:30 PM', status: 'identified', confidence: null, inconsistencyCount: 0 },
    { id: 'OCR-002', name: 'PO-1029_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', pages: 5, fields: 82, date: 'Today, 1:15 PM', status: 'capturing', confidence: 72, inconsistencyCount: 0 },
    { id: 'OCR-003', name: 'ACK-7839_Steelcase.pdf', vendor: 'Steelcase', type: 'Acknowledgment', pages: 2, fields: 35, date: 'Yesterday', status: 'inconsistencies', confidence: 83, inconsistencyCount: 3 },
    { id: 'OCR-004', name: 'INV-4521_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice', pages: 4, fields: 61, date: 'Yesterday', status: 'inconsistencies', confidence: 88, inconsistencyCount: 5 },
    { id: 'OCR-005', name: 'ACK-7835_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', pages: 2, fields: 28, date: '2 days ago', status: 'processed', confidence: 99, inconsistencyCount: 0 },
    { id: 'OCR-006', name: 'PO-1025_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order', pages: 3, fields: 45, date: '2 days ago', status: 'processed', confidence: 97, inconsistencyCount: 0 },
    { id: 'OCR-007', name: 'ACK-7831_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment', pages: 1, fields: 12, date: '3 days ago', status: 'processed', confidence: 100, inconsistencyCount: 0 },
]

const COLUMNS = [
    { id: 'identified', label: 'Ingesting', icon: FileText, color: 'text-info', bg: 'bg-info-light dark:bg-info/10', border: 'border-info/20' },
    { id: 'capturing', label: 'Needs Attention', icon: ScanEye, color: 'text-ai', bg: 'bg-ai-light dark:bg-ai/10', border: 'border-ai/20' },
    { id: 'inconsistencies', label: 'Awaiting Expert', icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning-light dark:bg-warning/10', border: 'border-warning/20' },
    { id: 'processed', label: 'Reconciled', icon: CheckCircle2, color: 'text-success', bg: 'bg-success-light dark:bg-success/10', border: 'border-success/20' },
]

interface OCRTrackingProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onConvertDocument?: (doc: { id: string; vendor: string; name: string; type: 'po' | 'ack'; tab: 'orders' | 'acknowledgments' }) => void;
}

export default function OCRTracking({ onLogout, onNavigate, onConvertDocument }: OCRTrackingProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [processingDoc, setProcessingDoc] = useState<string | null>(null)
    const [createRecordDoc, setCreateRecordDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [previewDoc, setPreviewDoc] = useState<typeof OCR_DOCUMENTS[0] | null>(null)
    const [documents, setDocuments] = useState(OCR_DOCUMENTS)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'identified' | 'capturing' | 'inconsistencies' | 'processed'>('all')
    const { toasts, addToast, dismissToast } = useToast()

    const handleResolve = (docId: string) => {
        setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'processed', inconsistencyCount: 0, confidence: 99 } : d))
    }

    const recordTypeFromDoc = (doc: typeof OCR_DOCUMENTS[0]): RecordType =>
        doc.type === 'Acknowledgment' ? 'ACK' : 'PO'

    const handleCreateRecord = (doc: typeof OCR_DOCUMENTS[0]) => {
        const preflight = getPreflightForDoc(doc)
        if (preflightHasInconsistencies(preflight)) {
            setCreateRecordDoc(doc)
            return
        }
        const recordId = `${recordTypeFromDoc(doc) === 'PO' ? 'PO' : 'ACK'}-${Math.floor(Math.random() * 9000) + 1000}`
        addToast('success', `Record ${recordId} created · ${doc.vendor}`)
    }

    const filteredDocs = documents.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.vendor.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === 'all' || d.status === activeTab
        return matchesSearch && matchesTab
    })

    const counts = {
        all: documents.length,
        identified: OCR_DOCUMENTS.filter(d => d.status === 'identified').length,
        capturing: OCR_DOCUMENTS.filter(d => d.status === 'capturing').length,
        inconsistencies: OCR_DOCUMENTS.filter(d => d.status === 'inconsistencies').length,
        processed: OCR_DOCUMENTS.filter(d => d.status === 'processed').length,
    }

    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-10">

            <Navbar onLogout={onLogout} activeTab="OCR" onNavigateToWorkspace={() => onNavigate('transactions')} onNavigate={onNavigate} />

            {/* Main Content — same structure as Transactions: pt-24 px-4 max-w-7xl mx-auto */}
            <div className="pt-24 px-4 max-w-7xl mx-auto space-y-6">

                {/* Breadcrumbs */}
                <div className="mb-4">
                    <Breadcrumbs items={[
                        { label: 'Smart Comparator', onClick: () => onNavigate('transactions') },
                        { label: 'OCR Tracking' }
                    ]} />
                </div>

                {/* Upload Zone (conditional) */}
                {showUpload && (
                    <div className="border-2 border-dashed border-ai/30 dark:border-ai/20 bg-ai-light/30 dark:bg-ai/5 rounded-2xl p-8 text-center transition-all relative">
                        <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted text-muted-foreground" title="Close"><X className="h-4 w-4" /></button>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-ai/10 flex items-center justify-center"><Upload className="h-7 w-7 text-ai" /></div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Drop your document here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">Supports PDF, CSV, Excel — PO, ACK, or Invoice documents</p>
                            </div>
                            <button onClick={() => { setShowUpload(false); setProcessingDoc('OCR-NEW'); setTimeout(() => setProcessingDoc(null), 3000); }}
                                className="mt-2 px-6 py-2.5 bg-ai text-white rounded-lg text-sm font-medium hover:bg-ai/90 transition-colors flex items-center gap-2">
                                <Sparkles className="h-4 w-4" /> Simulate Upload & Process
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing Indicator */}
                {processingDoc && (
                    <div className="bg-ai-light dark:bg-ai/10 border border-ai/20 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-ai flex items-center justify-center"><ScanEye className="h-4 w-4 text-white animate-spin" /></div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Processing document...</p>
                            <p className="text-xs text-muted-foreground">OCR extraction in progress — extracting fields and validating data</p>
                        </div>
                    </div>
                )}

                {/* ═══ Main Card Container — SAME as Transactions ═══ */}
                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">

                    {/* Header inside card — title + tabs + search + actions */}
                    <div className="p-6 border-b border-border">
                        <div className="flex flex-col gap-6">
                            {/* Top Row: Title + Tabs */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 whitespace-nowrap">
                                    Smart Comparator
                                </h3>
                                <div className="hidden sm:block w-px h-6 bg-border mx-2"></div>
                                {/* Tabs — same style as Transactions */}
                                <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit overflow-x-auto max-w-full">
                                    {[
                                        { id: 'all', label: 'All', count: counts.all },
                                        { id: 'identified', label: 'Ingesting', count: counts.identified },
                                        { id: 'capturing', label: 'Needs Attention', count: counts.capturing },
                                        { id: 'inconsistencies', label: 'Awaiting Expert', count: counts.inconsistencies },
                                        { id: 'processed', label: 'Validated', count: counts.processed },
                                    ].map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-2 outline-none whitespace-nowrap ${
                                                activeTab === tab.id
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'text-muted-foreground hover:bg-brand-300 dark:hover:bg-brand-600/50 hover:text-zinc-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {tab.label}
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full transition-colors ${
                                                activeTab === tab.id ? 'bg-primary-foreground/10 text-primary-foreground' : 'bg-background text-muted-foreground'
                                            }`}>{tab.count}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bottom Row: Search + View Toggle + Actions */}
                            <div className="flex items-center gap-3 flex-wrap">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                                    />
                                </div>
                                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                    <button onClick={() => setViewMode('list')} className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <List className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setViewMode('kanban')} className={`p-2 transition-colors ${viewMode === 'kanban' ? 'bg-zinc-100 dark:bg-zinc-800 text-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <Filter className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content area inside the card */}
                    <div className="p-6">
                        {/* Kanban View */}
                        {viewMode === 'kanban' && (
                            <div className="grid grid-cols-4 gap-4">
                                {COLUMNS.map(column => {
                                    const docs = filteredDocs.filter(d => d.status === column.id)
                                    const Icon = column.icon
                                    return (
                                        <div key={column.id} className="space-y-3">
                                            {/* Column Header */}
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                                                <span className="text-xs font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{docs.length}</span>
                                                <button className="ml-auto p-1 text-muted-foreground hover:text-foreground" title="Column options"><MoreHorizontal className="h-4 w-4" /></button>
                                            </div>
                                            {/* Cards */}
                                            <div className="space-y-3">
                                                {docs.map(doc => (
                                                    <div
                                                        key={doc.id}
                                                        className={`group relative bg-card dark:bg-zinc-800 rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                                                            selectedDoc === doc.id
                                                                ? 'border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg'
                                                                : 'border-border shadow-sm hover:shadow-md'
                                                        }`}
                                                    >
                                                        <div className="p-4">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white dark:ring-zinc-900 ${
                                                                        doc.status === 'processed' ? 'bg-gradient-to-br from-green-500 to-green-700 text-white' :
                                                                        doc.status === 'inconsistencies' ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-white' :
                                                                        doc.status === 'capturing' ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white' :
                                                                        'bg-gradient-to-br from-blue-500 to-blue-700 text-white'
                                                                    }`}>
                                                                        <Icon className="h-4 w-4" />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-foreground">{doc.vendor}</p>
                                                                        <p className="text-[10px] text-muted-foreground font-mono">{doc.id}</p>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-2 mb-3">
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Document</span>
                                                                    <span className="font-medium text-foreground truncate ml-2 max-w-[140px]">{doc.name}</span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-muted-foreground">Fields</span>
                                                                    <span className="font-medium text-foreground">{doc.fields} fields</span>
                                                                </div>
                                                            </div>

                                                            {doc.inconsistencyCount > 0 && (
                                                                <div className="flex items-center gap-1.5 text-xs text-error font-medium bg-error-light dark:bg-error/10 px-2 py-1 rounded-md mb-3">
                                                                    <AlertTriangle className="h-3 w-3" />{doc.inconsistencyCount} inconsistencies
                                                                </div>
                                                            )}

                                                            {/* Status + Date + Actions — matches Transactions card footer */}
                                                            <div className="pt-3 border-t border-border flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    {doc.confidence ? (
                                                                        <span title="Confidence Score" className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                                            doc.confidence > 90 ? 'bg-green-50 text-green-700 dark:bg-green-500/15 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-400/30' :
                                                                            doc.confidence >= 75 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-inset ring-amber-600/20 dark:ring-amber-400/30' :
                                                                            'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300 ring-1 ring-inset ring-red-600/20 dark:ring-red-400/30'
                                                                        }`}>
                                                                            <Sparkles className="h-3 w-3 inline mr-1" />{doc.confidence}%
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-medium text-muted-foreground">{doc.type}</span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    {doc.status !== 'identified' && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setPreviewDoc(doc);
                                                                            }}
                                                                            className="p-1.5 rounded-md text-muted-foreground hover:text-ai hover:bg-ai/10 transition-all group relative"
                                                                            title="Preview Document"
                                                                        >
                                                                            <DocumentTextIcon className="h-4 w-4" />
                                                                        </button>
                                                                    )}
                                                                    {(doc.status === 'identified' || doc.status === 'processed') && (
                                                                        <button
                                                                            onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                                                                            className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
                                                                        >
                                                                            {selectedDoc === doc.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Expanded detail */}
                                                        {selectedDoc === doc.id && (
                                                            <div className="px-4 pb-4 pt-0 space-y-2 border-t border-border">
                                                                {doc.status === 'identified' && (
                                                                    <div className="space-y-2.5 py-1">
                                                                        <span className="text-xs text-muted-foreground font-medium">Ingesting document...</span>
                                                                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                                                            <div className="h-full bg-info rounded-full animate-[ingestProgress_3s_ease-out_forwards]" />
                                                                        </div>
                                                                        <style>{`@keyframes ingestProgress { from { width: 5%; } to { width: 60%; } }`}</style>
                                                                        <p className="text-[10px] text-muted-foreground">Scanning pages and extracting fields...</p>
                                                                    </div>
                                                                )}
                                                                {doc.status === 'processed' && (
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCreateRecord(doc); }}
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg transition-colors hover:bg-brand-400 dark:hover:bg-brand-600/50"
                                                                    >
                                                                        <FilePlus2 className="h-3.5 w-3.5" />
                                                                        Create Record
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {docs.length === 0 && (
                                                    <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                                                        <p className="text-xs text-muted-foreground">No documents</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* List View */}
                        {viewMode === 'list' && (
                            <div className="overflow-hidden rounded-xl border border-border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/30">
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Document</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Vendor</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Type</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Confidence</th>
                                            <th className="text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Date</th>
                                            <th className="text-right text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocs.map(doc => (
                                            <tr key={doc.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <div>
                                                            <div className="text-sm font-medium text-foreground">{doc.name}</div>
                                                            <div className="text-[10px] text-muted-foreground">{doc.id} · {doc.pages} pages · {doc.fields} fields</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">{doc.vendor}</td>
                                                <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground">{doc.type}</span></td>
                                                <td className="px-4 py-3">
                                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${
                                                        doc.status === 'processed' ? 'bg-success-light text-success' :
                                                        doc.status === 'inconsistencies' ? 'bg-error-light text-error' :
                                                        doc.status === 'capturing' ? 'bg-ai-light text-ai' :
                                                        'bg-info-light text-info'
                                                    }`}>
                                                        {doc.status === 'identified' ? 'Ingesting' : doc.status === 'capturing' ? 'Needs Attention' : doc.status === 'inconsistencies' ? 'Awaiting Expert' : 'Reconciled'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    {doc.confidence ? (
                                                        <span title="Confidence Score" className={`text-sm font-medium flex items-center gap-1 ${doc.confidence > 90 ? 'text-success' : doc.confidence >= 75 ? 'text-warning' : 'text-error'}`}>
                                                            <Sparkles className="h-3 w-3" />{doc.confidence}%
                                                        </span>
                                                    ) : <span className="text-xs text-muted-foreground">—</span>}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">{doc.date}</td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground" title="Review Document"><Eye className="h-4 w-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                document={previewDoc ? { id: previewDoc.id, name: previewDoc.name, vendor: previewDoc.vendor, type: previewDoc.type, fields: previewDoc.fields, confidence: previewDoc.confidence, status: previewDoc.status, inconsistencyCount: previewDoc.inconsistencyCount } : null}
                onResolve={handleResolve}
            />

            {/* Create Record Modal (Fase 1: stub shell) */}
            <CreateRecordModal
                isOpen={!!createRecordDoc}
                onClose={() => setCreateRecordDoc(null)}
                document={createRecordDoc}
                recordType={createRecordDoc ? recordTypeFromDoc(createRecordDoc) : 'PO'}
                onCreated={(recordId) => {
                    const doc = createRecordDoc
                    setCreateRecordDoc(null)
                    if (doc) addToast('success', `Record ${recordId} created · ${doc.vendor}`)
                }}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    )
}
