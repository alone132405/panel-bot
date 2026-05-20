Redesign the "Vault Systems — Bank Module" dashboard page from scratch. It's a game bot management UI with two tabs: Authorized Users and Command Settings. Dark theme, fully responsive, premium feel.



🎨 Visual Identity:
— Dark theme: page bg #080A0F, surface cards #0F1218, elevated panels #161B25, borders 1px rgba(255,255,255,0.07)
— Primary accent: electric violet #7C5CFC; secondary accent: cyan-green #00E5A0 (used for active toggles and live indicators only)
— Danger: #FF4D6A; Warning: #F59E0B
— Typography: Inter or Geist — 13px muted uppercase tracking labels, 15px body, 22px section headings, 700 weight for data values
— No gradients, no glow blobs — flat dark surfaces with razor-thin borders only. Accent color used sparingly for interactive states.



🖥️ Page Structure (Desktop 1280px+):
Top header bar (full width, sticky):
— Left: vault/shield icon + "VAULT SYSTEMS" in bold caps, 18px
— Right: "Selected IGG ID" dropdown styled as a dark pill with the ID number + chevron icon; subtle border on hover
— Below header: breadcrumb label "BANK MODULE" in 11px uppercase cyan-green with a 3px left border accent
Page heading block:
— Large "Vault Systems" h1 + muted subtitle "Configure guild bank commands and authorized access"
Enable toggle card (full width):
— Elevated card with database icon on the left in a soft violet icon chip
— "Enable Guild Bank / Commands" bold title + muted subtitle on the right
— Large pill toggle switch on the far right — off = dark gray, on = glowing cyan-green with animated thumb slide
Tab switcher:
— Two-tab segmented control: "👥 Authorized Users" | "> Command Settings"
— Active tab: filled with rgba(124,92,252,0.15) bg + violet bottom border 2px + white label
— Inactive: muted label, no bg, hover shows subtle bg
— Full-width, border around the group, 12px border-radius



👥 Authorized Users Tab — Redesign:
Action toolbar (below tabs):
— Left cluster: "＋ Add User" (violet filled button) + "🗑 Clear" (danger ghost button with red border)
— Right cluster: two toggle pill switches — "Use Balance" and "Bypass Rss Limit" — each with label to the left, toggle on the right; group them inside a subtle card chip
— Toolbar has a bottom divider line
Empty state panel (large content area):
— Centered vertically in a dark inset card with subtle dashed 1px border
— Animated vault/database icon (soft pulse or gentle float animation, CSS keyframes)
— Bold heading "No users authorized yet" + muted helper text
— Single CTA button "＋ Add First User" in violet — on hover: slight scale up 1.03 + brightness increase
When users exist (populated state):
— Replace empty state with a data table inside the card
— Columns: Avatar circle (initials) | IGG ID | Username | Role badge | Actions (edit / remove icon buttons)
— Row hover: subtle bg highlight rgba(255,255,255,0.03)
— Role badges: colored pills (e.g. Admin = violet, Officer = amber, Member = gray)
— Sortable column headers with sort icon



⚙️ Command Settings Tab — Redesign:
Replace raw checkboxes and plain text inputs with a structured card grid layout:
Section 1 — Command Toggles (card):
— 2×2 grid of toggle rows: Chat Commands, Mail Commands, No Mail Response, No Error Mails
— Each row: icon chip (relevant icon) + label + description (muted, 12px) + toggle switch on right
— Full-width card with section header "Command Behavior" in muted uppercase label
Section 2 — Guild Settings (card):
— Same toggle row layout: External Guild Commands, Ignore Balance, Auto Delete Mails, Use Bag Resources
Section 3 — Limits & Delays (card):
— Inline row of labeled stepper/input fields: "Max Send Limit", "Max Distance", "Buildspam Delay", "Prefix"
— Each field: label above, dark input chip below with monospace font for values
— Inputs styled as flat dark chips: bg #0F1218, border rgba(255,255,255,0.1), focus ring violet 2px
Section 4 — Commands Table (card, full width):
— Header row: "Command" | "Enabled" | "Minimum Rank" | search icon (right)
— Search expands inline on click with a smooth width animation
— "Enabled" column: green checkmark badge or red dash — no plain text
— "Minimum Rank" column: custom styled dropdown — dark pill with rank name + chevron
— Alternating row subtle bg for readability; row hover highlight
— Sticky header as user scrolls



💾 Footer / Save Bar:
— Sticky at page bottom, full width, semi-transparent dark bg with backdrop blur 12px
— Left: pulsing green dot + "Changes save automatically" or "Unsaved changes" in amber when dirty state
— Right: "Reset to Defaults" ghost button + "Save Changes" filled violet button with save icon
— When saving: button shows spinner + "Saving…" → then checkmark + "Saved!" for 2s before resetting


📱 Prompt 2 — Responsive Behavior


Make the Vault Systems page fully responsive across all breakpoints:



🖥️ Desktop (1280px+): Full layout as described above. Table shows all columns. Settings cards in 2-col grid side by side.



💻 Laptop (1024px–1279px):
— Page max-width 960px, centered with 24px side padding
— Settings cards remain 2-col but tighter gap
— Command table: hide "Minimum Rank" column behind a row-expand click — tap row to see full details
— Toolbar: "Add User" + "Clear" stay visible; toggles move to a collapsed ⋯ overflow menu



📟 Tablet (768px–1023px):
— Full-width layout, 20px side padding
— Tab switcher shrinks to icon-only pills on narrow viewports, labels shown on hover/focus tooltip
— Settings cards collapse to single column stack
— Command table: 2 visible columns (Command + Enabled), tap row to expand a detail drawer below it showing Minimum Rank + edit options
— Action toolbar wraps to 2 rows: buttons on top, toggles on bottom
— IGG ID selector moves below the main heading (not in the top-right corner)



📱 Mobile (320px–767px):
— Page becomes full-screen, no modal — native scrollable page
— Header bar: logo/title left, IGG ID as a small tappable pill below it
— Tab switcher becomes full-width segmented control, each tab 50% width, icon + short label
— "Enable Guild Bank" card stacks icon + title + toggle vertically (icon top, title mid, toggle bottom-right)
— Authorized Users tab: action toolbar as a floating action button (FAB) — violet ＋ circle bottom-right; "Clear" accessible from long-press or ⋯ menu
— Empty state centered, icon smaller (48px), button full-width
— Command Settings tab: all sections become accordion cards — tap section header to expand/collapse; chevron rotates 180°; 200ms smooth height animation
— Inputs inside settings: full-width, 48px tap height minimum, numeric keypad auto-triggered for number fields
— Command table replaced with a card list — each command is a card with name + enabled badge + rank selector, vertically stacked
— Save bar: single full-width "Save Changes" button pinned to bottom, 56px tall, safe area inset respected

