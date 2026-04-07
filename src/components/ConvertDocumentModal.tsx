import { useState, useEffect, Fragment } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel, DialogTitle } from '@headlessui/react'
import { X, Sparkles, FileText, ClipboardCheck, CheckCircle2, ArrowRight, Loader2, Package, Truck } from 'lucide-react'

interface ConvertDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    document: {
        id: string
        name: string
        vendor: string
        type: string
    } | null
    onConvert: (docId: string, convertTo: 'po' | 'ack') => void
}

type ConversionStep = 'suggest' | 'processing' | 'complete'

const PROCESSING_STEPS = [
    { label: 'Validating extracted fields...', duration: 800 },
    { label: 'Matching vendor catalog data...', duration: 600 },
    { label: 'Verifying line item integrity...', duration: 700 },
    { label: 'Generating document structure...', duration: 500 },
    { label: 'Applying business rules...', duration: 400 },
    { label: 'Finalizing conversion...', duration: 300 },
]

export default function ConvertDocumentModal({ isOpen, onClose, document, onConvert }: ConvertDocumentModalProps) {
    const [step, setStep] = useState<ConversionStep>('suggest')
    const [selectedType, setSelectedType] = useState<'po' | 'ack'>('po')
    const [processingIdx, setProcessingIdx] = useState(0)
    const [processingComplete, setProcessingComplete] = useState(false)

    // AI suggests based on document type
    const aiSuggestion: 'po' | 'ack' = document?.type === 'Acknowledgment' ? 'ack' : 'po'

    useEffect(() => {
        if (isOpen) {
            setStep('suggest')
            setSelectedType(aiSuggestion)
            setProcessingIdx(0)
            setProcessingComplete(false)
        }
    }, [isOpen, aiSuggestion])

    // Processing animation
    useEffect(() => {
        if (step !== 'processing') return
        if (processingIdx >= PROCESSING_STEPS.length) {
            setProcessingComplete(true)
            const t = setTimeout(() => setStep('complete'), 600)
            return () => clearTimeout(t)
        }
        const t = setTimeout(() => setProcessingIdx(prev => prev + 1), PROCESSING_STEPS[processingIdx].duration)
        return () => clearTimeout(t)
    }, [step, processingIdx])

    const handleConvert = () => {
        setStep('processing')
        setProcessingIdx(0)
    }

    const handleFinish = () => {
        onConvert(document?.id || '', selectedType)
        onClose()
    }

    const generatedId = selectedType === 'po'
        ? `PO-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`
        : `ACK-${Math.floor(Math.random() * 9000) + 1000}`

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                            <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 text-left shadow-2xl transition-all border border-zinc-200 dark:border-zinc-800">

                                {/* Step 1: AI Suggestion */}
                                {step === 'suggest' && (
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-white">Convert Document</DialogTitle>
                                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">AI analyzed your document and suggests a conversion type</p>
                                            </div>
                                            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>

                                        {/* Document Info */}
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3 mb-5 flex items-center gap-3">
                                            <FileText className="h-5 w-5 text-zinc-400" />
                                            <div>
                                                <p className="text-sm font-medium text-zinc-900 dark:text-white">{document?.name}</p>
                                                <p className="text-xs text-zinc-500">{document?.vendor} · {document?.type}</p>
                                            </div>
                                        </div>

                                        {/* AI Suggestion Banner */}
                                        <div className="bg-ai-light dark:bg-ai/10 border border-ai/20 rounded-xl p-3 mb-5 flex items-start gap-2">
                                            <Sparkles className="h-4 w-4 text-ai mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs font-semibold text-ai">AI Recommendation</p>
                                                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                                                    Based on the document content, this appears to be {aiSuggestion === 'po' ? 'a Purchase Order' : 'an Acknowledgment'}.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Type Selection */}
                                        <div className="space-y-2 mb-6">
                                            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Convert to:</p>
                                            {[
                                                { id: 'po' as const, label: 'Purchase Order', desc: 'Create a new PO in Transactions', icon: Package, recommended: aiSuggestion === 'po' },
                                                { id: 'ack' as const, label: 'Acknowledgment', desc: 'Create ACK linked to existing PO', icon: ClipboardCheck, recommended: aiSuggestion === 'ack' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setSelectedType(opt.id)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                                                        selectedType === opt.id
                                                            ? 'border-brand-400 bg-brand-300/10 dark:bg-brand-500/10'
                                                            : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600'
                                                    }`}
                                                >
                                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                                                        selectedType === opt.id ? 'bg-brand-300 dark:bg-brand-500 text-zinc-900' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                                                    }`}>
                                                        <opt.icon className="h-5 w-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm font-semibold text-zinc-900 dark:text-white">{opt.label}</span>
                                                            {opt.recommended && (
                                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-ai text-white">AI Suggested</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">{opt.desc}</p>
                                                    </div>
                                                    {selectedType === opt.id && <CheckCircle2 className="h-5 w-5 text-brand-500 shrink-0" />}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleConvert}
                                            className="w-full py-3 text-sm font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-xl hover:bg-brand-400 dark:hover:bg-brand-600/50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            Convert to {selectedType === 'po' ? 'Purchase Order' : 'Acknowledgment'}
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}

                                {/* Step 2: Processing */}
                                {step === 'processing' && (
                                    <div className="p-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-ai/10 flex items-center justify-center mx-auto mb-4">
                                                <Sparkles className={`h-8 w-8 text-ai ${!processingComplete ? 'animate-pulse' : ''}`} />
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                                {processingComplete ? 'Conversion Complete' : 'Converting Document...'}
                                            </h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                {processingComplete
                                                    ? `${selectedType === 'po' ? 'Purchase Order' : 'Acknowledgment'} created successfully`
                                                    : 'AI is processing your document'
                                                }
                                            </p>
                                        </div>

                                        {/* Progress Steps */}
                                        <div className="space-y-2 mb-4">
                                            {PROCESSING_STEPS.map((ps, i) => (
                                                <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                                                    i < processingIdx ? 'bg-success-light dark:bg-success/10' : i === processingIdx ? 'bg-ai-light dark:bg-ai/10' : 'opacity-40'
                                                }`}>
                                                    {i < processingIdx ? (
                                                        <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                                                    ) : i === processingIdx ? (
                                                        <Loader2 className="h-4 w-4 text-ai shrink-0 animate-spin" />
                                                    ) : (
                                                        <div className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-600 shrink-0" />
                                                    )}
                                                    <span className={`text-xs font-medium ${
                                                        i < processingIdx ? 'text-success' : i === processingIdx ? 'text-ai' : 'text-zinc-400'
                                                    }`}>{ps.label}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Progress bar */}
                                        <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-ai rounded-full transition-all duration-300"
                                                style={{ width: `${(processingIdx / PROCESSING_STEPS.length) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Step 3: Complete */}
                                {step === 'complete' && (
                                    <div className="p-6">
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 className="h-8 w-8 text-success" />
                                            </div>
                                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                                                {selectedType === 'po' ? 'Purchase Order' : 'Acknowledgment'} Created
                                            </h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                                Document has been converted and is ready in Transactions
                                            </p>
                                        </div>

                                        {/* Created Document Card */}
                                        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-6 border border-zinc-200 dark:border-zinc-700">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="h-10 w-10 rounded-xl bg-brand-300 dark:bg-brand-500 text-zinc-900 flex items-center justify-center">
                                                    {selectedType === 'po' ? <Package className="h-5 w-5" /> : <ClipboardCheck className="h-5 w-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white">{generatedId}</p>
                                                    <p className="text-xs text-zinc-500">{document?.vendor}</p>
                                                </div>
                                                <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-success-light text-success">Active</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-xs">
                                                <div><span className="text-zinc-500">Source:</span> <span className="text-zinc-900 dark:text-white font-medium">{document?.name}</span></div>
                                                <div><span className="text-zinc-500">Type:</span> <span className="text-zinc-900 dark:text-white font-medium">{selectedType === 'po' ? 'Purchase Order' : 'Acknowledgment'}</span></div>
                                                <div><span className="text-zinc-500">Status:</span> <span className="text-success font-medium">Order Received</span></div>
                                                <div><span className="text-zinc-500">Synced:</span> <span className="text-zinc-900 dark:text-white font-medium">Strata + OrderBahn</span></div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={handleFinish}
                                            className="w-full py-3 text-sm font-bold bg-brand-300 dark:bg-brand-500 text-zinc-900 rounded-xl hover:bg-brand-400 dark:hover:bg-brand-600/50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                                        >
                                            View in Transactions
                                            <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
