import { useState, useRef } from 'react'
import { CloudArrowUpIcon, ClipboardDocumentCheckIcon, XMarkIcon, DocumentTextIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline'
import Navbar from './components/Navbar'
import Breadcrumbs from './components/Breadcrumbs'

interface DocumentConversionProps {
    onLogout: () => void
    onNavigate: (page: string) => void
    onNavigateToWorkspace: () => void
}

interface UploadedFile {
    name: string
    size: string
    pages: number
}

type FieldStatus = 'ok' | 'missing' | 'inconsistent'

interface ExtractedField {
    label: string
    value: string
    status: FieldStatus
}

const EXTRACTED_FIELDS: Record<string, ExtractedField[]> = {
    header: [
        { label: 'ACK Number', value: 'ACK-7839', status: 'ok' },
        { label: 'ACK Date', value: '2026-01-13', status: 'ok' },
        { label: 'Reference PO', value: '', status: 'missing' },
        { label: 'Sales Order #', value: 'SO 1151064-B', status: 'ok' },
        { label: 'Document Type', value: 'Acknowledgment', status: 'ok' },
    ],
    vendor: [
        { label: 'Vendor Name', value: 'Steelcase', status: 'ok' },
        { label: 'Vendor Address', value: '901 44th St SE, Grand Rapids, MI', status: 'ok' },
        { label: 'Sales Rep', value: 'Mark Thompson', status: 'ok' },
        { label: 'Rep Email', value: 'mthompson@steelcase.com', status: 'ok' },
        { label: 'Rep Phone', value: '', status: 'missing' },
    ],
    lineItems: [
        { label: 'Line 1: Description', value: 'Gesture Task Chair', status: 'ok' },
        { label: 'Line 1: SKU', value: 'GES-442-BLK', status: 'ok' },
        { label: 'Line 1: Quantity', value: '8', status: 'ok' },
        { label: 'Line 1: Unit Price', value: '$1,242.00', status: 'ok' },
        { label: 'Line 2: Description', value: 'Migration SE Desk', status: 'ok' },
        { label: 'Line 2: SKU', value: '', status: 'missing' },
        { label: 'Line 2: Quantity', value: '12', status: 'ok' },
        { label: 'Line 2: Unit Price', value: '$1,895', status: 'inconsistent' },
        { label: 'Line 3: Description', value: 'Think V2 Stool', status: 'ok' },
        { label: 'Line 3: Quantity', value: '6', status: 'ok' },
    ],
    pricing: [
        { label: 'Subtotal', value: '$47,826.00', status: 'ok' },
        { label: 'Discount', value: '38%', status: 'ok' },
        { label: 'Tax', value: '', status: 'missing' },
        { label: 'Total', value: '$29,651.92', status: 'inconsistent' },
    ],
    shipping: [
        { label: 'Ship To', value: '1200 Commerce Dr, Suite 400, Dallas, TX', status: 'ok' },
        { label: 'Ship Via', value: 'Steelcase Fleet', status: 'ok' },
        { label: 'Expected Ship Date', value: '2026-02-20', status: 'ok' },
        { label: 'Total', value: 'Prepaid', status: 'ok' },
    ],
}

function FieldRow({ field }: { field: ExtractedField }) {
    const rowCls =
        field.status === 'missing'
            ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/20'
            : field.status === 'inconsistent'
            ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/20'
            : 'border-transparent'

    const valueCls =
        field.status === 'missing'
            ? 'text-red-400 italic'
            : field.status === 'inconsistent'
            ? 'text-amber-600 dark:text-amber-400 font-medium'
            : 'text-foreground'

    return (
        <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${rowCls}`}>
            <span className="text-xs text-muted-foreground">{field.label}</span>
            <span className={`text-xs text-right max-w-[55%] truncate ${valueCls}`}>
                {field.value || '—'}
            </span>
        </div>
    )
}

export default function DocumentConversion({ onLogout, onNavigate, onNavigateToWorkspace }: DocumentConversionProps) {
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files[0]
        if (file?.type === 'application/pdf') simulateUpload(file.name)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) simulateUpload(file.name)
    }

    const simulateUpload = (name: string) => {
        setUploadedFile({ name, size: '2.4 MB', pages: 3 })
    }

    const clearFile = () => {
        setUploadedFile(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                onLogout={onLogout}
                activeTab="DocumentConversion"
                onNavigateToWorkspace={onNavigateToWorkspace}
                onNavigate={onNavigate}
            />

            <div className="pt-28 px-6 pb-8 max-w-7xl mx-auto">
                <Breadcrumbs
                    items={[
                        { label: 'Dashboard', onClick: () => onNavigate('transactions') },
                        { label: 'Document Conversion' },
                    ]}
                />

                <div className="mt-6 grid grid-cols-5 gap-6 items-start">
                    {/* Left Panel — Upload + Extracted Data */}
                    <div className="col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-base font-semibold text-foreground">PDF to SIF Converter</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">Convert your PDF document to SIF format.</p>
                        </div>

                        <div className="px-6 pb-6 space-y-4">
                            {/* File chip (after upload) */}
                            {uploadedFile && (
                                <div className="flex items-center gap-3 px-3 py-2.5 bg-muted rounded-lg border border-border">
                                    <DocumentTextIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-foreground truncate">{uploadedFile.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{uploadedFile.size} · {uploadedFile.pages} pages</p>
                                    </div>
                                    <button onClick={clearFile} className="p-0.5 hover:bg-muted-foreground/10 rounded transition-colors">
                                        <XMarkIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    </button>
                                </div>
                            )}

                            {/* Drop Zone (only shown when no file) */}
                            {!uploadedFile && (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                                    onDragLeave={() => setIsDragging(false)}
                                    onDrop={handleDrop}
                                    className={`rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center gap-3 transition-colors cursor-pointer ${
                                        isDragging
                                            ? 'border-primary bg-primary/5'
                                            : 'border-primary/40 bg-primary/5 hover:border-primary hover:bg-primary/10'
                                    }`}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <CloudArrowUpIcon className="h-8 w-8 text-primary" />
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-foreground">Drag & Drop your file here or browse files</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">or</p>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
                                        className="px-4 py-1.5 text-sm font-medium border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                                    >
                                        Select PDF Files
                                    </button>
                                    <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
                                </div>
                            )}

                            {/* Extracted document preview */}
                            {uploadedFile && (
                                <div className="space-y-1">
                                    {/* Doc header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-bold text-foreground">Steelcase</p>
                                            <p className="text-[10px] text-muted-foreground">Vendor Quota</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-mono font-medium text-foreground">QT-7839</p>
                                            <p className="text-[10px] text-muted-foreground">2026-01-13</p>
                                        </div>
                                    </div>

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pb-1">Document Header</p>
                                    {EXTRACTED_FIELDS.header.map(f => <FieldRow key={f.label} field={f} />)}

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">Vendor Information</p>
                                    {EXTRACTED_FIELDS.vendor.map(f => <FieldRow key={f.label} field={f} />)}

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">Line Items</p>
                                    {EXTRACTED_FIELDS.lineItems.map(f => <FieldRow key={f.label} field={f} />)}

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">Pricing Totals</p>
                                    {EXTRACTED_FIELDS.pricing.map(f => <FieldRow key={f.label} field={f} />)}

                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider pt-3 pb-1">Shipping & Delivery</p>
                                    {EXTRACTED_FIELDS.shipping.map(f => <FieldRow key={f.label} field={f} />)}

                                    <p className="text-[10px] text-muted-foreground text-center pt-4">Extracted by Smart Comparator OCR Engine</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {uploadedFile && (
                            <div className="px-6 pb-6 flex items-center justify-between border-t border-border pt-4">
                                <span className="text-xs text-muted-foreground">Ready to extract files</span>
                                <button className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                    Extract & Validate
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Panel — Validation / Empty state */}
                    <div className="col-span-3 bg-card border border-border rounded-2xl shadow-sm min-h-[400px] flex items-center justify-center">
                        {!uploadedFile ? (
                            <div className="text-center py-16 px-8">
                                <ClipboardDocumentCheckIcon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                                <p className="text-sm font-medium text-foreground">No Document Loaded</p>
                                <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                                    Upload a PDF on the left to extract fields and convert to SIF format.
                                </p>
                            </div>
                        ) : (
                            <div className="w-full h-full p-6 flex flex-col items-center justify-center gap-3">
                                <ExclamationCircleIcon className="h-8 w-8 text-muted-foreground/40" />
                                <p className="text-sm font-medium text-foreground">Click "Extract & Validate" to begin</p>
                                <p className="text-xs text-muted-foreground">Field validation results will appear here.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
