# Smart Comparator — Session Context

## Quick Start
- `cd strata-projects/smart-comparator/app && npx vite --port 8090`
- Login: same as UI-Dealer demo (diego.zuluaga@agiledreamteam.com / Novent@90)
- **GitHub:** https://github.com/diegoagentic/smart-comparator
- **Vercel:** https://app-nine-gamma-59.vercel.app
- **Local:** localhost:8090

## What Was Built (this session)
1. **DS Alignment** — 28 Figma tokens synced, ~1700 violations fixed across Strata DS + UI-Dealer
2. **Smart Comparator bootstrapped** from UI-Dealer demo (153→47 files)
3. **Navbar** — "SMART COMPARATOR | Strata", 2 tabs (OCR + Transactions), Strata logo
4. **Transactions** — PO + ACK tabs only, no Quotes/Metrics/Projects/Charts
5. **OCR Tracking** — Kanban (Ingesting→Pending Review→Awaiting Expert→Reconciled)
6. **Resolve Discrepancy Modal** — accordion items, AI suggestions, Accept/Edit, Save as Draft + Resolve
7. **Convert Document Modal** — AI suggests PO/ACK, processing animation, creates card in Transactions
8. **Action Center** — reduced (no Payments/Shipping/Chat/Warranty)
9. **Quick Actions** — only Create PO, Upload ACK, Compare PO vs ACK

## NEXT TASK: "Inputs" Tab in Detail Pages
Replace "AI Assistant" tab with "Inputs" tab showing PO/ACK schema fields.

**Schema reference:** `docs/PO_ACK_FIELD_REFERENCE.md` (save the user's field docs there)

**PO fields to show:** poInfo (poNumber, poDate, orderStatus, expectedDeliveryDate, paymentTerms), vendor (name, address, contact, email, phone), shipping (shipToAddress, shippingTerms, freightTerms), lineItems (productNumber, quantity, productCost, etc.), project, financials

**ACK fields to show:** ackInfo (acknowledgementNumber, acknowledgementDate, acknowledgedShipDate, poNumber, orderNumber, etc.), vendorAndBillTo, contactAndEmails, productAndFurniture, processing, locationAndShipping, approvalsAndNotes, lineItems

**Design approach:** Group fields by category with icons, show required vs optional, status indicators per field

## Reference Projects
- **UI-Dealer:** `../config-evolution/UI-Dealer` (main branch has DS alignment, demo branch is source)
- **Strata DS:** `../../Strata Design System/strata-ds` (IconsView, ColorsView updated)
- **Expert Hub:** `../config-evolution/expert-hub` (has comparison modals in Figma)
- **Figma CLI:** `../../figma-cli-main` (patched for Windows, CDP port 9222)

## Figma Files
- **Smart Comparator:** `figma.com/design/bLeX57v3oBF7jO6tt2vdr8/Smart-Comparator` (node 9:1968 = Resolve modal)
- **UI-Reps:** `figma.com/design/hLWaKzrBDQljFWpo5w7r3W/UI-Reps` (34 variables)
- **Expert Hub:** `figma.com/design/jOuwROGmb7WojWjVS7DpRU/Expert-Hub` (Resolve modals, Compare Products)

## Design Rules
- Icons: **Lucide React** ONLY (https://lucide.dev)
- Brand CTA: `bg-brand-300 dark:bg-brand-500 text-zinc-900`
- Cards: `bg-card dark:bg-zinc-800 border border-border rounded-2xl shadow-sm`
- Status: success=#098400, warning=#b27d00, info=#2164d1, error=#d20322, ai=#8b5cf6
- NEVER brand-300/400 as text on white (contrast FAIL)
- Page layout: `pt-24 px-4 max-w-7xl mx-auto space-y-6`
- Detail pages: same `max-w-7xl mx-auto` for header + content

## PRD Terms
- Pipeline states: Ingesting → Pending Review → Awaiting Expert → Reconciled
- Upload: "+Upload Acknowledgement"
- Comparison: "PO Spec" vs "ACK Value"
- Resolution: "Save as Draft" + "Resolve" (NO Skip)
- Expert-first resolution model

## Commits (20+ on main)
Latest: `59f95c0` — detail page margins aligned

## User Preferences
- Communicate in **Spanish**
- Commits in **English**
- NO auto-push
- Small focused changes
