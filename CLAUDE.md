# Smart Comparator — Session Context

## Quick Start
- `cd strata-projects/smart-comparator/app && npx vite --port 8090`
- Login: same as UI-Dealer demo (diego.zuluaga@agiledreamteam.com / Novent@90)

## Reference Projects (read for style/structure matching)
- **UI-Dealer (Transactions reference):** `../config-evolution/UI-Dealer/src/Transactions.tsx` — THE source of truth for layout, containers, card styles, kanban structure
- **UI-Dealer Navbar:** `../config-evolution/UI-Dealer/src/components/Navbar.tsx` — pill-style tabs, rounded-full, logo imports
- **Strata DS tokens:** `src/styles/tokens/variables.css` + `variables-dark.css`
- **Strata DS app:** `../../Strata Design System/strata-ds` (localhost:5173) — ColorsView, IconsView
- **Figma CLI:** `../../figma-cli-main` — `node src/index.js connect` then `node src/index.js var list`

## Figma Files
- UI-Reps: `figma.com/design/hLWaKzrBDQljFWpo5w7r3W/UI-Reps`
- Expert Hub: `figma.com/design/jOuwROGmb7WojWjVS7DpRU/Expert-Hub` (has Resolve Discrepancy modals)

## Design Rules
- Icons: Lucide React ONLY (https://lucide.dev)
- Brand CTA: `bg-brand-300 dark:bg-brand-500 text-zinc-900`
- Cards: `bg-card dark:bg-zinc-800 border border-border rounded-2xl shadow-sm`
- Status colors: success=#098400, warning=#b27d00, info=#2164d1, error=#d20322, ai=#8b5cf6
- NEVER brand-300/400 as text color on white backgrounds

## Current Priority: OCR Page Layout
The OCR page (`src/OCRTracking.tsx`) needs to replicate the EXACT container hierarchy from Transactions:
1. Navbar (fixed top)
2. Breadcrumbs bar (pt-24 px-6 border-b)
3. Main tabs (Purchase Orders / Acknowledgments style → for OCR not needed but spacing must match)
4. Card container (`bg-card p-4 rounded-xl shadow-sm ring-1 ring-zinc-900/5`) with title + subtabs + search/filters inside
5. Kanban grid INSIDE the card container (not outside)
6. Cards: `bg-card dark:bg-zinc-800 border border-border rounded-2xl shadow-sm`
7. Hover: `hover:shadow-md`
8. Selected: `border-brand-400/50 ring-1 ring-brand-400/20 shadow-lg`

## PRD Terms (use these labels)
- Pipeline states: Ingesting → Pending Review → Awaiting Expert → Reconciled
- Upload button: "+Upload Acknowledgement"
- Comparison: "PO Spec" vs "ACK Value"
- Resolution: "Save as Draft" + "Resolve All" (NO Skip button)

## Docs
- `docs/PROJECT_PLAN.md` — full plan
- `docs/TRANSCRIPT_ANALYSIS.md` — meeting analysis
- `docs/IMPLEMENTATION_PLAN.md` — phased execution
- `docs/PRD_KEY_EXTRACTIONS.md` — PRD field mapping and rules
- `docs/DIAGNOSTIC.md` — file audit (what to keep/delete/build)
- `docs/FIGMA_COMPONENT_REFERENCE.md` — Expert Hub modal designs
- `docs/OCR_FLOW_ANALYSIS.md` — OCR pipeline from Rey's diagrams

## User Preferences
- Communicate in Spanish
- Commits in English
- NO auto-push
- Small focused changes
