import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react'
import { X, CheckCircle2, AlertTriangle } from 'lucide-react'
import PreflightLeftRail, { type PaneView } from './left-rail/PreflightLeftRail'
import ModalFooter from './footer/ModalFooter'
import HeaderFieldsPane from './panes/HeaderFieldsPane'
import LineItemsPane from './panes/LineItemsPane'
import ExtrasPane from './panes/ExtrasPane'
import PublishingOverlay from './states/PublishingOverlay'
import PublishedView, { type PublishResult } from './states/PublishedView'
import { getPreflightForDoc } from './mockPreflightData'
import { usePreflight } from './usePreflight'
import type { RecordType, ExtraField } from './types'

export type { RecordType } from './types'

export interface CreateRecordDoc {
    id: string
    name: string
    vendor: string
    type: string
}

interface CreateRecordModalProps {
    isOpen: boolean
    onClose: () => void
    document: CreateRecordDoc | null
    recordType: RecordType
    onCreated?: (recordId: string) => void
}

const VIEW_TITLES: Record<PaneView, string> = {
    header: 'Header fields',
    lineItems: 'Line items',
    extras: 'Extra fields',
}

export default function CreateRecordModal({
    isOpen,
    onClose,
    document,
    recordType,
    onCreated,
}: CreateRecordModalProps) {
    const [view, setView] = useState<PaneView>('header')
    const preflight = useMemo(
        () => (document ? getPreflightForDoc(document) : null),
        [document]
    )
    const preflightSafe = preflight ?? {
        recordType,
        environment: 'qa' as const,
        sections: [],
        lineItems: [],
        extras: [],
    }
    const {
        summary,
        headerCounts,
        lineCounts,
        overrideCount,
        fieldState,
        setFS,
    } = usePreflight(preflightSafe)

    // Extras live in their own local state since users toggle include/edit values.
    // Re-seeded whenever the source preflight changes (= different document).
    const [extras, setExtras] = useState<ExtraField[]>([])
    useEffect(() => {
        if (preflight) setExtras(preflight.extras.map(x => ({ ...x })))
    }, [preflight])

    // Terminal states: publishing spinner → result success view
    const [publishing, setPublishing] = useState(false)
    const [result, setResult] = useState<PublishResult | null>(null)

    // Reset terminal state whenever the modal closes or document changes
    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setPublishing(false)
                setResult(null)
                setView('header')
            }, 200)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    if (!document || !preflight) return null

    const extrasIncludedCount = extras.filter(x => x.included).length

    const handleCreate = () => {
        if (publishing) return
        setPublishing(true)
        setTimeout(() => {
            const recordId = `${recordType === 'PO' ? 'PO' : 'ACK'}-${Math.floor(Math.random() * 9000) + 1000}`
            // fields saved = resolved + ai_suggested (committed) + included extras
            const fieldsSaved = summary.resolved + extras.filter(x => x.included).length
            const fieldsDropped = summary.unmapped
            setResult({
                recordId,
                fieldsSaved,
                fieldsDropped,
                lineCount: preflight.lineItems.length,
                environment: preflight.environment,
            })
            setPublishing(false)
        }, 1400)
    }

    const handleViewRecord = () => {
        if (result) onCreated?.(result.recordId)
        onClose()
    }

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-[200]" onClose={onClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/40 backdrop-blur-md" />
                </TransitionChild>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-6">
                        <TransitionChild
                            as={Fragment}
                            enter="ease-out duration-260" enterFrom="opacity-0 translate-y-2 scale-[0.995]" enterTo="opacity-100 translate-y-0 scale-100"
                            leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-[0.995]"
                        >
                            <DialogPanel className="relative w-full max-w-[1120px] h-[760px] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden flex">
                                {publishing && <PublishingOverlay />}

                                {result ? (
                                    <PublishedView
                                        result={result}
                                        recordType={recordType}
                                        vendor={document.vendor}
                                        onClose={onClose}
                                        onViewRecord={handleViewRecord}
                                    />
                                ) : (
                                    <>
                                <PreflightLeftRail
                                    recordType={recordType}
                                    documentId={document.id}
                                    vendor={document.vendor}
                                    summary={summary}
                                    view={view}
                                    setView={setView}
                                    headerCounts={headerCounts}
                                    lineCounts={lineCounts}
                                    extrasIncludedCount={extrasIncludedCount}
                                />

                                <div className="flex-1 min-w-0 flex flex-col">
                                    <header className="h-16 px-6 flex items-center justify-between border-b border-border">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-300 dark:bg-brand-500 text-zinc-900 px-2.5 py-1 text-[11px] font-semibold">
                                                <span className="size-1.5 rounded-full bg-zinc-900" />
                                                REVIEW & CREATE
                                            </span>
                                            <h1 className="text-[16px] font-medium tracking-tight text-foreground truncate">
                                                {VIEW_TITLES[view]}
                                            </h1>
                                            {summary.valid ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 dark:bg-green-500/15 text-green-700 dark:text-green-400 px-2 py-0.5 text-[10.5px] font-medium">
                                                    <CheckCircle2 className="size-3" /> Ready to create
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 px-2 py-0.5 text-[10.5px] font-medium">
                                                    <AlertTriangle className="size-3" />
                                                    {summary.requiredUnresolved > 0
                                                        ? `${summary.requiredUnresolved} required left`
                                                        : 'Action needed'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {overrideCount > 0 && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-muted text-foreground/80 px-2.5 py-1 text-[11px] font-medium">
                                                    {overrideCount} {overrideCount === 1 ? 'change' : 'changes'}
                                                </span>
                                            )}
                                            <button
                                                onClick={onClose}
                                                className="inline-flex items-center justify-center size-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                                aria-label="Close"
                                            >
                                                <X className="size-4" />
                                            </button>
                                        </div>
                                    </header>

                                    <div className="flex-1 overflow-y-auto px-6 py-5 scrollbar-minimal">
                                        {view === 'header' && (
                                            <HeaderFieldsPane
                                                preflight={preflight}
                                                fieldState={fieldState}
                                                setFS={setFS}
                                            />
                                        )}
                                        {view === 'lineItems' && (
                                            <LineItemsPane
                                                preflight={preflight}
                                                fieldState={fieldState}
                                                setFS={setFS}
                                            />
                                        )}
                                        {view === 'extras' && (
                                            <ExtrasPane
                                                extras={extras}
                                                setExtras={setExtras}
                                            />
                                        )}
                                    </div>

                                    <ModalFooter
                                        view={view}
                                        setView={setView}
                                        canCreate={summary.valid}
                                        onCancel={onClose}
                                        onCreate={handleCreate}
                                    />
                                </div>
                                    </>
                                )}
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
