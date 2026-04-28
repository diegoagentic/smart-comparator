import React, { useState, useMemo, Fragment } from 'react';
import { Dialog, Transition, TransitionChild, DialogPanel } from '@headlessui/react';

// =====================================================================
// Icons
// =====================================================================
const Icon = {
  Check:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l5 5 9-11"/></svg>,
  X:       (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M6 18L18 6"/></svg>,
  Sparkle: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>,
  Warn:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 9v4m0 4h.01M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0z"/></svg>,
  Info:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 8h.01M11 12h1v5h1"/></svg>,
  Chevron: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9l6 6 6-6"/></svg>,
  Close:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 6l12 12M6 18L18 6"/></svg>,
  Ban:     (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/></svg>,
  Plus:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14M5 12h14"/></svg>,
  Pencil:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 20h4L20 8l-4-4L4 16v4z"/></svg>,
  Arrow:   (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  Dot:     (p: any) => <svg viewBox="0 0 24 24" fill="currentColor" {...p}><circle cx="12" cy="12" r="4"/></svg>,
  Search:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>,
  Folder:  (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>,
  Refresh: (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 12a9 9 0 0115.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 01-15.5 6.3L3 16M3 21v-5h5"/></svg>,
  Back:    (p: any) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M19 12H5M11 19l-7-7 7-7"/></svg>,
};

// =====================================================================
// Resolution → visual tone
// =====================================================================
const TONE: Record<string, any> = {
  resolved:       { pill: "bg-green-50 text-green-700",       dot: "bg-green-500",  label: "Ready",          ring: "ring-green-200/60" },
  ai_suggested:   { pill: "bg-brand-200 text-zinc-900",       dot: "bg-brand-600",  label: "AI match",       ring: "ring-brand-300/60" },
  ai_uncertain:   { pill: "bg-amber-50 text-amber-700",       dot: "bg-amber-500",  label: "Low confidence", ring: "ring-amber-200/60" },
  partial:        { pill: "bg-amber-50 text-amber-700",       dot: "bg-amber-500",  label: "Partial match",  ring: "ring-amber-200/60" },
  unresolved:     { pill: "bg-red-50 text-red-700",           dot: "bg-red-500",    label: "Needs choice",   ring: "ring-red-200/60" },
  unmapped:       { pill: "bg-zinc-100 text-zinc-600",        dot: "bg-zinc-400",   label: "Not sent",       ring: "ring-zinc-200/60" },
  coercion_error: { pill: "bg-red-50 text-red-700",           dot: "bg-red-500",    label: "Fix value",      ring: "ring-red-200/60" },
};

// =====================================================================
// Mock Data (PREFLIGHT)
// =====================================================================
const PREFLIGHT: any = {
  valid: false,
  recordType: "purchase_order",
  sections: [
    {
      id: "poInfo",
      label: "PO info",
      fields: [
        { dtoPath: "poInfo.orderNumber",  displayName: "Order Number",  targetDataType: "String",  inputValue: "PO-001", resolution: "resolved", resolvedValue: "PO-001", required: true },
        { dtoPath: "poInfo.poIssueDate",  displayName: "PO Issue Date", targetDataType: "Date",    inputValue: "tomorrow", resolution: "coercion_error", reason: "INVALID_DATE", required: true },
        { dtoPath: "poInfo.orderDate",    displayName: "Order Date",    targetDataType: "Date",    inputValue: "2026-01-15", resolution: "resolved", resolvedValue: "2026-01-15" },
        { dtoPath: "poInfo.terms",        displayName: "Terms",         targetDataType: "DropDown",inputValue: "Net 30", resolution: "resolved", resolvedValue: 421,
          knownValues: [{id: 421, label: "Net 30"}, {id: 422, label: "Net 60"}] },
        { dtoPath: "poInfo.requestType",  displayName: "Request Type",  targetDataType: "DropDown",inputValue: "Standrd", resolution: "ai_suggested", suggestion: 612, aiConfidence: 0.94, required: true,
          knownValues: [
            { id: 612, label: "Standard" }, { id: 613, label: "Expedited" },
            { id: 614, label: "Sample" }, { id: 615, label: "Replacement" },
            { id: 616, label: "Warranty" }, { id: 617, label: "Backorder" },
          ] },
      ],
    },
    {
      id: "vendor",
      label: "Vendor",
      fields: [
        { dtoPath: "vendor.vendorId",    displayName: "Vendor",         targetDataType: "DropDown", inputValue: "acm", resolution: "ai_uncertain", suggestion: 99, aiConfidence: 0.51, required: true,
          knownValues: [
            { id: 99,  label: "Acme Corp" },           { id: 100, label: "Acme Industrial" },
            { id: 101, label: "Apex Partners" },       { id: 102, label: "Atlas Supply" },
            { id: 103, label: "Allied Fabricators" },  { id: 104, label: "Anchor Logistics" },
            { id: 105, label: "Andersen & Co." },      { id: 106, label: "Apex Furnishings" },
          ] },
        { dtoPath: "vendor.billToName",  displayName: "Bill To Name",   targetDataType: "String",   inputValue: "Acme Corp \u00b7 AP Dept", resolution: "resolved", resolvedValue: "Acme Corp \u00b7 AP Dept" },
        { dtoPath: "vendor.email",       displayName: "Vendor Email",   targetDataType: "Email",    inputValue: "ap@acme", resolution: "unresolved", reason: "INVALID_EMAIL" },
        { dtoPath: "vendor.phone",       displayName: "Vendor Phone",   targetDataType: "Phone",    inputValue: "+1 (555) 010-0199", resolution: "resolved", resolvedValue: "+1 (555) 010-0199" },
      ],
    },
    {
        id: "shipping",
        label: "Shipping",
        fields: [
          {
            dtoPath: "shipping.shipTo",
            displayName: "Ship To",
            targetDataType: "Object",
            isObject: true,
            children: [
              { dtoPath: "shipping.shipTo.name",       displayName: "Name",        targetDataType: "String", inputValue: "ACME Warehouse", resolution: "resolved", resolvedValue: "ACME Warehouse" },
              { dtoPath: "shipping.shipTo.street",     displayName: "Street",      targetDataType: "String", inputValue: "500 Warehouse Way", resolution: "resolved", resolvedValue: "500 Warehouse Way" },
              { dtoPath: "shipping.shipTo.city",       displayName: "City",        targetDataType: "String", inputValue: "Miami",     resolution: "resolved", resolvedValue: "Miami" },
              { dtoPath: "shipping.shipTo.state",      displayName: "State",       targetDataType: "DropDown", inputValue: "XX", resolution: "unresolved", reason: "VALUE_NOT_IN_LIST",
                knownValues: [
                  { id: 1, label: "FL" }, { id: 2, label: "CA" }, { id: 3, label: "NY" },
                  { id: 4, label: "TX" }, { id: 5, label: "WA" }, { id: 6, label: "IL" },
                ] },
            ],
          },
        ],
      },
  ],
  lineItems: [
    {
      rowIndex: 0,
      fields: [
        { dtoPath: "productNumber",      displayName: "Product Number",      targetDataType: "String",   inputValue: "SKU-1", resolution: "resolved", resolvedValue: "SKU-1", required: true },
        { dtoPath: "productDescription", displayName: "Description",         targetDataType: "String",   inputValue: "Aeron \u2014 Size B, Graphite", resolution: "resolved", resolvedValue: "Aeron \u2014 Size B, Graphite" },
        { dtoPath: "quantity",           displayName: "Qty",                 targetDataType: "Number",   inputValue: 2, resolution: "resolved", resolvedValue: 2, required: true },
        { dtoPath: "productList",        displayName: "List",                targetDataType: "Currency", inputValue: 1295.00, resolution: "resolved", resolvedValue: "1295.00" },
      ],
    },
  ],
};

const EXTRA_FIELDS = [
    { id: "dealer-company", label: "Dealer Company", dataType: "String", value: "Avanto", included: true, required: true },
];

// =====================================================================
// Sub-components
// =====================================================================
function ResolutionPill({ resolution }: { resolution: string }) {
  const t = TONE[resolution] || TONE.unresolved;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${t.pill}`}>
      <span className={`inline-block size-1.5 rounded-full ${t.dot}`}></span>
      {t.label}
    </span>
  );
}

function Eyebrow({ children, trailing }: { children: React.ReactNode; trailing?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3 mt-8 first:mt-0">
      <span className="eyebrow">{children}</span>
      {trailing}
    </div>
  );
}

// ---------------------------------------------------------------------
// Field Row & Body
// ---------------------------------------------------------------------
function FieldRow({ field, state, setState, compact }: any) {
  const effective = state?.effectiveResolution || field.resolution;
  const isLocked = state?.locked;

  return (
    <div className={`field-row rounded-xl border bg-white transition ${isLocked ? "border-green-200" : "border-zinc-200"} hover:border-zinc-300`}>
      <div className={`${compact ? "px-3 pt-2.5 pb-1.5" : "px-4 pt-3.5 pb-2"} flex items-start justify-between gap-4`}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13.5px] font-medium text-zinc-900 truncate">
              {field.displayName}
            </span>
            {field.required && (
              <span className="inline-flex items-center rounded text-[10px] font-semibold text-red-600">REQUIRED</span>
            )}
          </div>
        </div>
        <ResolutionPill resolution={effective} />
      </div>

      <div className={compact ? "px-3 pb-2.5" : "px-4 pb-3"}>
        <FieldBody field={field} state={state} setState={setState} effective={effective} />
      </div>
    </div>
  );
}

function FieldBody({ field, state, setState, effective }: any) {
  const [picking, setPicking] = useState(false);

  // If we have an override, show the override summary with a Reset button
  if (state?.overrideValue != null && effective === "resolved" && field.resolution !== "resolved") {
    return (
      <div className="flex items-center justify-between gap-2 rounded-md bg-green-50/60 border border-green-100 px-2.5 py-1.5">
        <div className="text-[12.5px] text-green-900 truncate font-medium">
          <Icon.Check className="size-3 inline mr-1 -mt-0.5" /> {state.overrideValue}
        </div>
        <button
          onClick={() => setState({ overrideValue: null, locked: false, effectiveResolution: field.resolution })}
          className="text-green-700/70 hover:text-green-900 text-[12px] font-medium shrink-0"
        >
          Reset
        </button>
      </div>
    );
  }

  // Common Layout for Original vs Final Value
  const renderLayout = (input: any, final: React.ReactNode) => (
    <div className="grid grid-cols-2 gap-3 items-center">
      <div className="bg-zinc-50 border border-zinc-100 rounded-lg px-2.5 py-1.5 text-[12.5px] text-zinc-500 truncate font-medium">
        {String(input || "—")}
      </div>
      <div className="min-w-0">
        {final}
      </div>
    </div>
  );

  switch (field.resolution) {
    case "resolved":
      return renderLayout(field.inputValue, <div className="text-[13px] font-bold text-zinc-900 truncate px-1">{String(field.resolvedValue)}</div>);

    case "ai_suggested":
    case "ai_uncertain": {
      const label = (field.knownValues || []).find((kv: any) => kv.id === field.suggestion)?.label || field.suggestion;
      if (picking) {
        return (
            <div className="space-y-2">
                <input 
                    className="w-full rounded-lg border border-zinc-900 bg-white px-3 py-1.5 text-[12.5px] focus:outline-none"
                    placeholder="Search options..."
                    onBlur={() => setPicking(false)}
                />
            </div>
        );
      }
      return (
        <div className="space-y-2">
            {renderLayout(field.inputValue, <div className="text-[13px] font-bold text-zinc-400 italic px-1">Needs review</div>)}
            <div className="mt-2 bg-brand-50 border border-brand-200 rounded-lg p-2.5 flex items-start gap-2.5">
                <div className="size-6 rounded-md bg-brand-300 flex items-center justify-center shrink-0">
                    <Icon.Sparkle className="size-3.5 text-zinc-900" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-zinc-900 leading-tight">
                        Did you mean <span className="font-bold">{label}</span>?
                        <span className="ml-2 text-zinc-400 font-medium">{Math.round(field.aiConfidence * 100)}% conf.</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => setState({ overrideValue: label, locked: true, effectiveResolution: "resolved" })} className="bg-zinc-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm">Accept</button>
                        <button onClick={() => setPicking(true)} className="bg-white border border-zinc-200 text-zinc-700 text-[11px] font-bold px-3 py-1.5 rounded-md shadow-sm">Pick other</button>
                    </div>
                </div>
            </div>
        </div>
      );
    }

    case "unresolved":
    case "coercion_error":
      return renderLayout(field.inputValue, 
        <input 
            autoFocus
            className="w-full rounded-lg border border-zinc-900 bg-white px-2.5 py-1 text-[12.5px] focus:outline-none ring-2 ring-zinc-900/10 font-bold"
            placeholder="Fix value..."
            onChange={(e) => setState({ overrideValue: e.target.value, locked: !!e.target.value, effectiveResolution: e.target.value ? "resolved" : field.resolution })}
        />
      );

    default:
      return renderLayout(field.inputValue, <div className="text-[12.5px] text-zinc-400 italic px-1">Unmapped</div>);
  }
}

// ---------------------------------------------------------------------
// Object Field Group (Recursive)
// ---------------------------------------------------------------------
function ObjectFieldGroup({ field, fieldState, setFS, keyPrefix }: any) {
  const children = field.children || [];
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50/30 overflow-hidden mb-4">
      <div className="px-4 py-3 flex items-center gap-3 border-b border-zinc-100 bg-white">
        <div className="flex items-center justify-center size-8 rounded-lg bg-zinc-100 text-zinc-600 shrink-0">
          <Icon.Folder className="size-4" />
        </div>
        <span className="text-[14px] font-bold text-zinc-900">{field.displayName}</span>
        <span className="text-[11px] text-zinc-400 ml-auto">{children.length} fields</span>
      </div>
      <div className="p-3 space-y-2">
         {children.map((child: any) => (
            <FieldRow
              key={child.dtoPath}
              field={child}
              state={fieldState[`${keyPrefix}:${child.dtoPath}`]}
              setState={setFS(`${keyPrefix}:${child.dtoPath}`)}
              compact
            />
         ))}
      </div>
    </div>
  );
}

// =====================================================================
// Progress & Sidebar
// =====================================================================
function ProgressRing({ pct }: { pct: number }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const o = c - (pct / 100) * c;
  return (
    <div className="ring-wrap">
      <svg width="72" height="72" viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} stroke="#EBECEE" strokeWidth="8" fill="none" />
        <circle
          cx="36" cy="36" r={r}
          stroke="#0B0B0C" strokeWidth="8" fill="none"
          strokeDasharray={c} strokeDashoffset={o}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 400ms cubic-bezier(.2,.7,.2,1)" }}
          transform="rotate(-90 36 36)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[16px] font-bold text-zinc-900 leading-none">{pct}%</span>
        <span className="text-[9px] text-zinc-500 mt-0.5 font-bold tracking-wider uppercase">Ready</span>
      </div>
    </div>
  );
}

function SegmentedBar({ summary }: any) {
  const total = summary.total || 1;
  const seg = (count: number, cls: string) => (
    <span className={cls} style={{ width: `${(count / total) * 100}%` }} />
  );
  return (
    <div className="seg">
      {summary.resolved > 0 && seg(summary.resolved, "bg-green-500")}
      {summary.aiUncertain > 0 && seg(summary.aiUncertain, "bg-amber-400")}
      {summary.unresolved > 0 && seg(summary.unresolved, "bg-red-500")}
      {summary.unmapped > 0 && seg(summary.unmapped, "bg-zinc-300")}
    </div>
  );
}

// =====================================================================
// Main Component
// =====================================================================
interface CreateRecordModalProps {
    isOpen: boolean
    onClose: () => void
    document: any
    onConvert: (docId: string, convertTo: 'po' | 'ack') => void
}

export default function CreateRecordModal({ isOpen, onClose, document, onConvert }: CreateRecordModalProps) {
  const [fieldState, setFieldState] = useState<any>({});
  const [view, setView] = useState("document");
  
  // Flatten preflight for calculations
  const flat = useMemo(() => {
      const out: any[] = [];
      PREFLIGHT.sections.forEach((s: any) => {
          s.fields.forEach((f: any) => {
              if (f.isObject) f.children.forEach((c: any) => out.push({...c, key: `h:${s.id}:${f.dtoPath}:${c.dtoPath}`}));
              else out.push({...f, key: `h:${s.id}:${f.dtoPath}`});
          });
      });
      return out;
  }, []);

  const summary = useMemo(() => {
    const counts = { total: flat.length, resolved: 0, unresolved: 0, aiUncertain: 0, unmapped: 0 };
    flat.forEach(f => {
        const st = fieldState[f.key];
        const r = (st && st.effectiveResolution) || f.resolution;
        if (r === "resolved") counts.resolved++;
        else if (r === "unresolved" || r === "coercion_error") counts.unresolved++;
        else if (r === "ai_suggested" || r === "ai_uncertain") counts.aiUncertain++;
        else if (r === "unmapped") counts.unmapped++;
    });
    return { ...counts, valid: counts.unresolved === 0 && counts.aiUncertain === 0 };
  }, [fieldState, flat]);

  const pct = Math.round((summary.resolved / summary.total) * 100);

  const setFS = (key: string) => (patch: any) =>
    setFieldState((prev: any) => ({ ...prev, [key]: { ...(prev[key] || {}), ...patch } }));

  if (!document) return null;

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 modal-backdrop" />
        </TransitionChild>

        <div className="fixed inset-0 flex items-center justify-center p-6">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 scale-95"
            enterTo="opacity-100 translate-y-0 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 scale-100"
            leaveTo="opacity-0 translate-y-4 scale-95"
          >
            <DialogPanel className="anim-fadeup relative w-full max-w-[960px] h-[85vh] rounded-[24px] bg-white shadow-[0_30px_80px_-20px_rgba(11,11,12,0.35)] overflow-hidden flex flex-col text-zinc-900">
              
              <div className="flex-1 overflow-y-auto scroll-polish">
                {/* Header Section */}
                <div className="px-10 pt-10 pb-6 space-y-6 bg-white">
                  {/* Top Row: Title, Avatar, Close */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <h2 className="text-[28px] font-bold text-zinc-900 tracking-tight">OrderBahn — Purchase Order</h2>
                    </div>
                    <button onClick={onClose} className="p-2 -mr-2 text-zinc-400 hover:text-zinc-900 transition-colors">
                      <Icon.Close className="size-7" />
                    </button>
                  </div>

                  {/* Subtitle */}
                  <div className="text-[16px] text-zinc-500 font-medium -mt-4">
                    Draft PO-001 | Created Apr 22, 2026
                  </div>

                  {/* Warning Banner */}
                  <div className="bg-amber-50/40 border border-amber-100/60 rounded-2xl p-4 flex items-start gap-3">
                    <Icon.Warn className="size-5 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[14px] text-amber-800/90 font-medium leading-normal">
                      Review how your data maps into OrderBahn. Fields that match automatically are shown, while others need your confirmation.
                    </p>
                  </div>

                  {/* Progress Section */}
                  <div className="bg-zinc-50/50 border border-zinc-100 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-[18px] font-bold text-zinc-900">Preflight</span>
                        <span className="text-[14px] text-zinc-400 font-medium">42/50 ready</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-bold text-zinc-900">84%</span>
                        <span className="text-[12px] text-zinc-400 font-medium">ready</span>
                      </div>
                    </div>
                    <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full transition-all duration-500" style={{ width: '84%' }} />
                    </div>
                  </div>

                  {/* Stepper & Refresh */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-6">
                      <button 
                        onClick={() => setView("document")}
                        className="flex items-center gap-3 group"
                      >
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${view === "document" ? "bg-[#e2f373] text-zinc-900" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"}`}>1</div>
                        <span className={`text-[16px] font-bold transition-colors ${view === "document" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"}`}>Header Fields</span>
                      </button>
                      <Icon.Arrow className="size-5 text-zinc-300" />
                      <button 
                        onClick={() => setView("lineItems")}
                        className="flex items-center gap-3 group"
                      >
                        <div className={`size-8 rounded-full flex items-center justify-center font-bold text-[14px] transition-colors ${view === "lineItems" ? "bg-[#e2f373] text-zinc-900" : "bg-zinc-100 text-zinc-400 group-hover:bg-zinc-200"}`}>2</div>
                        <span className={`text-[16px] font-bold transition-colors ${view === "lineItems" ? "text-zinc-900" : "text-zinc-400 group-hover:text-zinc-600"}`}>Line Items</span>
                      </button>
                    </div>
                    <button className="flex items-center gap-2 bg-[#e2f373] hover:bg-[#d6f22e] text-zinc-900 px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all shadow-sm active:scale-95">
                      <Icon.Refresh className="size-4" />
                      Refresh
                    </button>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="px-10 py-8 bg-[#fbfbfb] border-t border-zinc-100">
                    {view === "document" ? (
                        <div className="max-w-2xl mx-auto space-y-2">
                             {PREFLIGHT.sections.map((section: any) => (
                                <div key={section.id}>
                                    <Eyebrow>{section.label}</Eyebrow>
                                    <div className="grid grid-cols-1 gap-2.5">
                                        {section.fields.map((f: any) => {
                                            if (f.isObject) return <ObjectFieldGroup key={f.dtoPath} field={f} fieldState={fieldState} setFS={setFS} keyPrefix={`h:${section.id}:${f.dtoPath}`} />;
                                            return (
                                                <FieldRow
                                                    key={f.dtoPath}
                                                    field={f}
                                                    state={fieldState[`h:${section.id}:${f.dtoPath}`]}
                                                    setState={setFS(`h:${section.id}:${f.dtoPath}`)}
                                                />
                                            );
                                        })}
                                    </div>
                                </div>
                             ))}
                             
                             {/* Extra Fields */}
                             <Eyebrow trailing={<span className="text-[11px] text-zinc-400 font-medium">Catalog-level passthrough</span>}>Extra fields</Eyebrow>
                             <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-4 text-[12.5px] text-zinc-500 mb-6 flex gap-3 items-start">
                                <Icon.Info className="size-5 text-indigo-500 shrink-0 mt-0.5" />
                                <div>Fields outside the standard schema. Forwarded as-is without auto-matching.</div>
                             </div>
                             {EXTRA_FIELDS.map(x => (
                                <div key={x.id} className="rounded-xl border border-zinc-200 bg-white p-4 flex items-center justify-between shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="strata-check size-4 border-2 border-zinc-300 rounded checked:bg-zinc-900"></div>
                                        <span className="text-[13.5px] font-bold text-zinc-900">{x.label}</span>
                                    </div>
                                    <div className="text-[13px] font-medium text-zinc-500">{x.value}</div>
                                </div>
                             ))}
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-4xl mx-auto">
                            <div className="rounded-xl border border-zinc-200 overflow-hidden shadow-xl bg-white">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-zinc-50 border-b border-zinc-200">
                                        <tr>
                                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Product</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-center">Qty</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest text-right">Unit Price</th>
                                            <th className="px-6 py-4 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {PREFLIGHT.lineItems.map((li: any) => (
                                            <tr key={li.rowIndex} className="hover:bg-zinc-50/50 transition-colors cursor-pointer">
                                                <td className="px-6 py-5">
                                                    <div className="text-[14px] font-bold text-zinc-900">
                                                        {li.fields.find((f: any) => f.dtoPath === "productNumber")?.inputValue}
                                                    </div>
                                                    <div className="text-[12px] text-zinc-500 font-medium mt-1">{li.fields.find((f: any) => f.dtoPath === "productDescription")?.inputValue}</div>
                                                </td>
                                                <td className="px-6 py-5 text-[14px] font-bold text-zinc-900 text-center">{li.fields.find((f: any) => f.dtoPath === "quantity")?.inputValue}</td>
                                                <td className="px-6 py-5 text-[14px] font-bold text-zinc-900 text-right tabular-nums">
                                                    ${Number(li.fields.find((f: any) => f.dtoPath === "productList")?.inputValue).toFixed(2)}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm"><Icon.Check className="size-3.5" /> Ready</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
              </div>

              <footer className="h-[88px] px-10 flex items-center justify-between border-t border-zinc-200 bg-[#FAFAFA] shrink-0">
                <div className="flex items-center gap-8">
                  <button onClick={onClose} className="text-[14px] font-bold text-zinc-500 hover:text-zinc-900 transition-colors">Cancel</button>
                  <div className="h-5 w-px bg-zinc-200" />
                  <button className="text-[12px] font-bold text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-[0.15em]">Save Draft</button>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    disabled={!summary.valid}
                    onClick={() => onConvert(document.id, 'po')}
                    className={`h-[54px] px-10 rounded-full font-bold text-[15px] flex items-center gap-3 transition-all active:scale-[0.97] shadow-xl ${summary.valid ? "bg-[#e2f373] hover:bg-[#d6f22e] text-zinc-900 shadow-[#e2f373]/30" : "bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none"}`}
                  >
                    Publish to Orderbahn
                    <Icon.Arrow className="size-4.5" />
                  </button>
                </div>
              </footer>

            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
