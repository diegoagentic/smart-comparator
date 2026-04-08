import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
    XMarkIcon,
    ArrowUpOnSquareIcon,
    PencilSquareIcon,
    ArrowRightIcon
} from '@heroicons/react/24/outline'
import AckImportFlow, { type AckFormData } from './forms/AckImportFlow'
import AckCreationForm from './forms/AckCreationForm'

interface AcknowledgementUploadModalProps {
    isOpen: boolean
    onClose: () => void
}

const ackOptions = [
    {
        id: 'import',
        title: 'Import Files',
        description: 'Upload vendor acknowledgement PDFs or SIF files. We\'ll automatically parse line items, match against POs, and flag exceptions.',
        icon: ArrowUpOnSquareIcon,
        actionLabel: 'Upload Files',
        estimatedTime: '1-3 minutes',
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        darkColor: 'dark:text-blue-400',
        darkBgColor: 'dark:bg-blue-900/30'
    },
    {
        id: 'manual',
        title: 'Manual Creation',
        description: 'Enter acknowledgement details manually — vendor info, line items, and shipping. Best for phone confirmations or non-standard formats.',
        icon: PencilSquareIcon,
        actionLabel: 'Start Manual Entry',
        estimatedTime: '5-10 minutes',
        color: 'text-zinc-600',
        bgColor: 'bg-zinc-100',
        darkColor: 'dark:text-zinc-400',
        darkBgColor: 'dark:bg-zinc-800'
    }
]

export default function AcknowledgementUploadModal({ isOpen, onClose }: AcknowledgementUploadModalProps) {
    const [step, setStep] = useState<'selection' | 'import' | 'manual' | 'form'>('selection')
    const [initialFormData, setInitialFormData] = useState<Partial<AckFormData> | undefined>(undefined)

    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setStep('selection')
                setInitialFormData(undefined)
            }, 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    const handleOptionClick = (id: string) => {
        if (id === 'import') setStep('import')
        else if (id === 'manual') {
            setInitialFormData(undefined)
            setStep('form')
        }
    }

    const handleImportComplete = (data: AckFormData) => {
        setInitialFormData(data)
        setStep('form')
    }

    const handleFormSubmit = (data: AckFormData) => {
        console.log('Acknowledgement Created:', data)
        setTimeout(() => onClose(), 1500)
    }

    const getModalSize = () => {
        if (step === 'form' || step === 'import') return 'sm:max-w-6xl h-[90vh]'
        return 'sm:max-w-3xl'
    }

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                    leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className={`relative transform overflow-hidden rounded-2xl bg-white dark:bg-zinc-950 text-left shadow-2xl transition-all border border-border w-full ${getModalSize()}`}>
                                {step === 'selection' && (
                                    <div className="absolute right-6 top-6 z-10">
                                        <button type="button" className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none" onClick={onClose}>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>
                                )}

                                {step === 'selection' ? (
                                    <div className="p-8">
                                        <div className="max-w-2xl">
                                            <Dialog.Title as="h3" className="text-2xl font-brand font-bold text-foreground mb-2">
                                                Upload Acknowledgement
                                            </Dialog.Title>
                                            <p className="text-sm text-muted-foreground mb-6">
                                                Choose how you would like to process this vendor acknowledgement. Select the option that best fits your workflow.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {ackOptions.map((option) => (
                                                <div
                                                    key={option.id}
                                                    onClick={() => handleOptionClick(option.id)}
                                                    className="group relative flex flex-col p-6 rounded-2xl border border-border bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
                                                >
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className={`h-12 w-12 rounded-xl ${option.bgColor} ${option.color} ${option.darkBgColor} ${option.darkColor} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}>
                                                            <option.icon className="h-6 w-6" />
                                                        </div>
                                                        <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border border-zinc-200 dark:border-zinc-700">
                                                            {option.estimatedTime}
                                                        </span>
                                                    </div>

                                                    <h4 className="text-lg font-bold text-foreground mb-1">{option.title}</h4>
                                                    <p className="text-sm text-muted-foreground mb-6 line-clamp-3">{option.description}</p>

                                                    <div className="mt-auto">
                                                        <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-foreground/10 hover:border-foreground text-foreground font-medium transition-all group-hover:bg-foreground group-hover:text-background text-sm">
                                                            <span>{option.actionLabel}</span>
                                                            <ArrowRightIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : step === 'import' ? (
                                    <AckImportFlow
                                        onImportComplete={handleImportComplete}
                                        onCancel={() => setStep('selection')}
                                    />
                                ) : (
                                    <AckCreationForm
                                        initialData={initialFormData}
                                        onSubmit={handleFormSubmit}
                                        onCancel={() => setStep('selection')}
                                    />
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
