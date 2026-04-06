import { useState } from 'react'
import { ScanSearch, FileText, AlertTriangle, CheckCircle2, Clock, Upload, Eye, MoreHorizontal, Sparkles } from 'lucide-react'
import Navbar from './components/Navbar'

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
    { id: 'identified', label: 'Identificado', icon: FileText, color: 'text-info', bgColor: 'bg-info-light dark:bg-info/10' },
    { id: 'capturing', label: 'En Captura', icon: ScanSearch, color: 'text-ai', bgColor: 'bg-ai-light dark:bg-ai/10' },
    { id: 'discrepancies', label: 'Discrepancias', icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning-light dark:bg-warning/10' },
    { id: 'processed', label: 'Procesado', icon: CheckCircle2, color: 'text-success', bgColor: 'bg-success-light dark:bg-success/10' },
]

interface OCRTrackingProps {
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

export default function OCRTracking({ onLogout, onNavigate }: OCRTrackingProps) {
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null)

    return (
        <div className="flex flex-col min-h-screen bg-background font-sans text-foreground">
            <Navbar onLogout={onLogout} activeTab="OCR" onNavigateToWorkspace={() => onNavigate('transactions')} onNavigate={onNavigate} />

            <div className="pt-24 px-6 pb-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">OCR Tracking</h1>
                            <p className="text-muted-foreground text-sm mt-1">Track document processing pipeline — upload, extract, validate, and process</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-lg font-medium text-sm hover:bg-brand-400 dark:hover:bg-brand-600/50 transition-colors shadow-sm">
                            <Upload className="h-4 w-4" />
                            Upload Document
                        </button>
                    </div>

                    {/* Pipeline Kanban */}
                    <div className="grid grid-cols-4 gap-4">
                        {COLUMNS.map(column => {
                            const docs = OCR_DOCUMENTS.filter(d => d.status === column.id)
                            const Icon = column.icon
                            return (
                                <div key={column.id} className="space-y-3">
                                    {/* Column Header */}
                                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${column.bgColor}`}>
                                        <Icon className={`h-4 w-4 ${column.color}`} />
                                        <span className={`text-sm font-semibold ${column.color}`}>{column.label}</span>
                                        <span className="ml-auto text-xs font-bold bg-foreground/10 text-foreground px-1.5 py-0.5 rounded-md">{docs.length}</span>
                                    </div>

                                    {/* Cards */}
                                    <div className="space-y-2">
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
                                                            <Sparkles className="h-3 w-3" />
                                                            {doc.confidence}%
                                                        </span>
                                                    )}
                                                </div>

                                                {doc.discrepancyCount && (
                                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-error font-medium bg-error-light dark:bg-error/10 px-2 py-1 rounded-md">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {doc.discrepancyCount} discrepancies found
                                                    </div>
                                                )}

                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {doc.date}
                                                </div>

                                                {/* Expanded detail */}
                                                {selectedDoc === doc.id && (
                                                    <div className="mt-3 pt-3 border-t border-border space-y-2">
                                                        <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-muted hover:bg-ai-light dark:hover:bg-ai/10 text-foreground rounded-lg transition-colors">
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View Extracted Fields
                                                        </button>
                                                        {doc.status === 'discrepancies' && (
                                                            <button className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium bg-warning-light dark:bg-warning/10 text-warning rounded-lg transition-colors hover:bg-warning/20">
                                                                <AlertTriangle className="h-3.5 w-3.5" />
                                                                Resolve Discrepancies
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
                </div>
            </div>
        </div>
    )
}
