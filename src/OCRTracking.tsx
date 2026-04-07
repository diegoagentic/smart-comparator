import { useState } from 'react'
import { ScanEye, FileText, AlertTriangle, CheckCircle2, Clock, Upload, Eye, MoreHorizontal, Sparkles, Search, Filter, LayoutGrid, List, ChevronRight, X } from 'lucide-react'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'

const OCR_DOCUMENTS = [
    { id: 'OCR-001', name: 'ACK-7842_AIS.pdf', vendor: 'AIS Furniture', type: 'Acknowledgment', pages: 3, fields: 50, date: 'Today, 2:30 PM', status: 'identified', confidence: null },
    { id: 'OCR-002', name: 'PO-1029_ApexFurniture.pdf', vendor: 'Apex Furniture', type: 'Purchase Order', pages: 5, fields: 82, date: 'Today, 1:15 PM', status: 'capturing', confidence: 78 },
    { id: 'OCR-003', name: 'ACK-7839_Steelcase.pdf', vendor: 'Steelcase', type: 'Acknowledgment', pages: 2, fields: 35, date: 'Yesterday', status: 'discrepancies', confidence: 92, discrepancyCount: 3 },
    { id: 'OCR-004', name: 'INV-4521_HermanMiller.pdf', vendor: 'Herman Miller', type: 'Invoice', pages: 4, fields: 61, date: 'Yesterday', status: 'discrepancies', confidence: 88, discrepancyCount: 5 },
    { id: 'OCR-005', name: 'ACK-7835_Knoll.pdf', vendor: 'Knoll', type: 'Acknowledgment', pages: 2, fields: 28, date: '2 days ago', status: 'processed', confidence: 99 },
    { id: 'OCR-006', name: 'PO-1025_Haworth.pdf', vendor: 'Haworth', type: 'Purchase Order', pages: 3, fields: 45, date: '2 days ago', status: 'processed', confidence: 97 },
    { id: 'OCR-007', name: 'ACK-7831_9to5.pdf', vendor: '9to5 Seating', type: 'Acknowledgment', pages: 1, fields: 12, date: '3 days ago', status: 'processed', confidence: 100 },
]

const COLUMNS = [
    { id: 'identified', label: 'Ingesting', icon: FileText, color: 'text-info', bgColor: 'bg-info-light dark:bg-info/10', borderColor: 'border-info/20' },
    { id: 'capturing', label: 'Pending Review', icon: ScanEye, color: 'text-ai', bgColor: 'bg-ai-light dark:bg-ai/10', borderColor: 'border-ai/20' },
    { id: 'discrepancies', label: 'Awaiting Expert', icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning-light dark:bg-warning/10', borderColor: 'border-warning/20' },
    { id: 'processed', label: 'Reconciled', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success-light dark:bg-success/10', borderColor: 'border-success/20' },
]

interface OCRTrackingProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

export default function OCRTracking({ onLogout, onNavigate }: OCRTrackingProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
    const [showUpload, setShowUpload] = useState(false)
    const [processingDoc, setProcessingDoc] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'all' | 'identified' | 'capturing' | 'discrepancies' | 'processed'>('all')

    const filteredDocs = OCR_DOCUMENTS.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.vendor.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesTab = activeTab === 'all' || d.status === activeTab
        return matchesSearch && matchesTab
    })

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground transition-colors duration-200">
            <Navbar onLogout={onLogout} activeTab="OCR" onNavigateToWorkspace={() => onNavigate('transactions')} onNavigate={onNavigate} />

            {/* Header — matches Transactions style */}
            <div className="pt-24 px-6 pb-4 flex items-center justify-between border-b border-border bg-transparent transition-colors duration-200">
                <Breadcrumbs items={[
                    { label: 'Smart Comparator', onClick: () => onNavigate('transactions') },
                    { label: 'OCR Tracking', active: true }
                ]} />
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowUpload(!showUpload)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:opacity-90"
                    >
                        <Upload className="h-4 w-4" /> +Upload Acknowledgement
                    </button>
                </div>
            </div>

            <div className="flex flex-col p-6 gap-6">
                {/* Upload Zone */}
                {showUpload && (
                    <div className="border-2 border-dashed border-ai/30 dark:border-ai/20 bg-ai-light/30 dark:bg-ai/5 rounded-2xl p-8 text-center transition-all relative">
                        <button onClick={() => setShowUpload(false)} className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted text-muted-foreground"><X className="h-4 w-4" /></button>
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-ai/10 flex items-center justify-center">
                                <Upload className="h-7 w-7 text-ai" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Drop your document here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">Supports PDF, CSV, Excel — PO, ACK, or Invoice documents</p>
                            </div>
                            <button
                                onClick={() => { setShowUpload(false); setProcessingDoc('OCR-NEW'); setTimeout(() => setProcessingDoc(null), 3000); }}
                                className="mt-2 px-6 py-2.5 bg-ai text-white rounded-lg text-sm font-medium hover:bg-ai/90 transition-colors flex items-center gap-2"
                            >
                                <Sparkles className="h-4 w-4" /> Simulate Upload & Process
                            </button>
                        </div>
                    </div>
                )}

                {/* Processing Indicator */}
                {processingDoc && (
                    <div className="bg-ai-light dark:bg-ai/10 border border-ai/20 rounded-xl p-4 flex items-center gap-3 animate-pulse">
                        <div className="w-8 h-8 rounded-lg bg-ai flex items-center justify-center">
                            <ScanEye className="h-4 w-4 text-white animate-spin" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-foreground">Processing document...</p>
                            <p className="text-xs text-muted-foreground">OCR extraction in progress — extracting fields and validating data</p>
                        </div>
                    </div>
                )}

                {/* Tabs + Search + View Toggle — same layout as Transactions */}
                <div className="bg-card p-4 rounded-xl shadow-sm ring-1 ring-zinc-900/5 dark:ring-white/10">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                        {/* Status Tabs */}
                        <div className="flex items-center gap-1">
                            {[
                                { id: 'all', label: 'All', count: OCR_DOCUMENTS.length },
                                { id: 'identified', label: 'Ingesting', count: OCR_DOCUMENTS.filter(d => d.status === 'identified').length },
                                { id: 'capturing', label: 'Pending Review', count: OCR_DOCUMENTS.filter(d => d.status === 'capturing').length },
                                { id: 'discrepancies', label: 'Awaiting Expert', count: OCR_DOCUMENTS.filter(d => d.status === 'discrepancies').length },
                                { id: 'processed', label: 'Reconciled', count: OCR_DOCUMENTS.filter(d => d.status === 'processed').length },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                                        activeTab === tab.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                    }`}
                                >
                                    {tab.label}
                                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
                                        activeTab === tab.id ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                                    }`}>{tab.count}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search + View Toggle */}
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-ai/20 placeholder:text-muted-foreground"
                                />
                            </div>
                            <div className="flex items-center border border-border rounded-lg overflow-hidden">
                                <button onClick={() => setViewMode('kanban')} className={`p-1.5 ${viewMode === 'kanban' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                    <LayoutGrid className="h-4 w-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                    <List className="h-4 w-4" />
                                </button>
                            </div>
                            <button className="p-1.5 border border-border rounded-lg text-muted-foreground hover:bg-muted">
                                <Filter className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Kanban View */}
                {viewMode === 'kanban' && (
                    <div className="grid grid-cols-4 gap-4">
                        {COLUMNS.map(column => {
                            const docs = filteredDocs.filter(d => d.status === column.id)
                            const Icon = column.icon
                            return (
                                <div key={column.id} className="space-y-3">
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${column.bgColor} border ${column.borderColor}`}>
                                        <Icon className={`h-4 w-4 ${column.color}`} />
                                        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                                        <span className="ml-auto text-xs font-bold bg-foreground/10 text-foreground px-1.5 py-0.5 rounded-md">{docs.length}</span>
                                    </div>
                                    <div className="space-y-2 min-h-[200px]">
                                        {docs.map(doc => (
                                            <div
                                                key={doc.id}
                                                onClick={() => setSelectedDoc(selectedDoc === doc.id ? null : doc.id)}
                                                className={`bg-card border rounded-xl p-3 cursor-pointer transition-all hover:shadow-md ${
                                                    selectedDoc === doc.id ? 'border-ai shadow-md' : 'border-border hover:border-ai/30'
                                                }`}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-xs font-bold text-foreground">{doc.id}</span>
                                                    </div>
                                                    <button className="p-1 hover:bg-muted rounded"><MoreHorizontal className="h-3 w-3 text-muted-foreground" /></button>
                                                </div>
                                                <p className="text-sm font-medium text-foreground truncate mb-1">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground mb-2">{doc.vendor} · {doc.type}</p>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">{doc.pages} pages · {doc.fields} fields</span>
                                                    {doc.confidence && (
                                                        <span className={`flex items-center gap-1 font-medium ${
                                                            doc.confidence >= 95 ? 'text-success' : doc.confidence >= 85 ? 'text-warning' : 'text-error'
                                                        }`}>
                                                            <Sparkles className="h-3 w-3" />{doc.confidence}%
                                                        </span>
                                                    )}
                                                </div>
                                                {doc.discrepancyCount && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-error font-medium bg-error-light dark:bg-error/10 px-2 py-1 rounded-md">
                                                        <AlertTriangle className="h-3 w-3" />{doc.discrepancyCount} discrepancies found
                                                    </div>
                                                )}
                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="h-3 w-3" />{doc.date}
                                                </div>
                                                {selectedDoc === doc.id && (
                                                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-ai-light dark:hover:bg-ai/10 text-foreground rounded-lg transition-colors">
                                                            <Eye className="h-3.5 w-3.5" /> View Extracted Fields
                                                        </button>
                                                        {doc.status === 'discrepancies' && (
                                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-warning-light dark:bg-warning/10 text-warning rounded-lg transition-colors hover:bg-warning/20">
                                                                <AlertTriangle className="h-3.5 w-3.5" /> Resolve Discrepancies
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
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                                                doc.status === 'discrepancies' ? 'bg-error-light text-error' :
                                                doc.status === 'capturing' ? 'bg-ai-light text-ai' :
                                                'bg-info-light text-info'
                                            }`}>
                                                {doc.status === 'identified' ? 'Ingesting' : doc.status === 'capturing' ? 'Pending Review' : doc.status === 'discrepancies' ? 'Awaiting Expert' : 'Reconciled'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {doc.confidence ? (
                                                <span className={`text-sm font-medium flex items-center gap-1 ${doc.confidence >= 95 ? 'text-success' : doc.confidence >= 85 ? 'text-warning' : 'text-error'}`}>
                                                    <Sparkles className="h-3 w-3" />{doc.confidence}%
                                                </span>
                                            ) : <span className="text-xs text-muted-foreground">—</span>}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">{doc.date}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Eye className="h-4 w-4" /></button>
                                                <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><MoreHorizontal className="h-4 w-4" /></button>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
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
    )
}
