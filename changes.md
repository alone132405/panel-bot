Redesign the Construction modal and Vault Systems (Bank) page 
for Konoha Bazaar dashboard. Next.js + Tailwind + Framer Motion.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN TOKENS (apply globally)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
--bg:        #07070E
--surface:   #0F0F1A
--elevated:  #161626
--border:    rgba(0,255,178,0.10)
--border2:   rgba(123,94,255,0.15)
--mint:      #00FFB2
--violet:    #7B5EFF
--red:       #FF4D6D
--gold:      #FFB800
--text:      #F0F4FF
--muted:     #6B7A99

Fonts:
  Headings/labels → "DM Sans" weight 500-700
  IDs/codes/values → "JetBrains Mono" weight 400-500
  Page titles → uppercase, letter-spacing: 0.04em

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏗️ CONSTRUCTION MODAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MODAL WRAPPER:
- Full screen overlay: rgba(0,0,0,0.75) backdrop
- Modal card: 
  background: #0F0F1A
  border: 1px solid rgba(123,94,255,0.15)
  border-radius: 18px
  max-width: 860px
  width: 100%
  Framer Motion: scale 0.92 → 1, opacity 0 → 1, 0.3s ease-out on open

MODAL HEADER:
- Background: linear-gradient(135deg, rgba(0,255,178,0.06), rgba(123,94,255,0.04))
- Border-bottom: 1px solid rgba(123,94,255,0.15)
- Padding: 20px 28px
- Left side:
  Icon box: 36x36px, bg rgba(247,151,22,0.15), 
  border 1px solid rgba(247,151,22,0.3), border-radius 10px
  Icon: construction/hammer emoji or Lucide "hammer" in #F79716
  Title: "Construction" DM Sans 18px font-weight 700 #F0F4FF
  Subtitle: "IGG ID: 987303841" JetBrains Mono 11px #6B7A99
- Right side: X close button
  32x32px, bg rgba(255,77,109,0.08), border rgba(255,77,109,0.2)
  border-radius 8px, color #FF4D6D
  hover: bg rgba(255,77,109,0.18)
  Framer Motion: whileHover scale(1.05), whileTap scale(0.95)

TOGGLES ROW (replaces checkboxes):
- Container: bg #161626, border 1px solid rgba(123,94,255,0.15),
  border-radius 12px, padding 16px
  display flex, flex-wrap wrap, gap 8px

- Each toggle chip:
  padding: 7px 14px
  border-radius: 8px
  border: 1px solid rgba(123,94,255,0.15)
  background: rgba(123,94,255,0.06)
  display flex, align-items center, gap 8px
  cursor pointer, user-select none
  Framer Motion: whileTap scale(0.97)
  transition: all 0.18s ease

  Left dot: 8x8px circle, bg #6B7A99, border-radius 50%
  Label: DM Sans 12px font-weight 500, color #6B7A99

  ACTIVE STATE (when checked):
    background: rgba(0,255,178,0.10)
    border-color: rgba(0,255,178,0.30)
    dot → background: #00FFB2
    label → color: #00FFB2

  Items: Auto Build ✓, Upgrade ✓, Lowest Level First ✓,
         Ignore Spam Target ✓, Auto-Rent Second Queue ✓,
         Second Queue (Spam Only) ✗

TOP FIELDS ROW:
- 3-column grid, gap 16px, margin-bottom 24px
- Each field:
  Label: 11px uppercase letter-spacing 0.12em color #6B7A99
  Input:
    background: #161626
    border: 1px solid rgba(123,94,255,0.15)
    border-radius: 10px
    padding: 10px 14px
    color: #F0F4FF
    font: JetBrains Mono 13px
    placeholder color: #6B7A99
    focus: border-color #00FFB2, 
           box-shadow: 0 0 0 3px rgba(0,255,178,0.10)
    transition: 0.2s ease

  Fields: "Spam Target Type", "Building Priority", "Max Building Level"

BUILDING TARGET SECTION:
- Section header row:
  Left accent bar: 3px wide, 18px tall, #00FFB2, border-radius 2px
  Title: "Building Target" DM Sans 13px font-weight 600 #F0F4FF
  (no count badge here — counts go in subsection labels)

- Subsection (Resource Buildings):
  Label row: "RESOURCE BUILDINGS" 11px uppercase muted
  + count badge: "18 locations"
    badge: bg rgba(0,255,178,0.10), border rgba(0,255,178,0.20),
    border-radius 20px, padding 2px 8px, color #00FFB2, 
    font JetBrains Mono 10px
  After label: horizontal line rgba(123,94,255,0.15) extending to right

  Location grid: repeat(6, 1fr), gap 8px
  Each cell:
    Top: "LOC 01" label — JetBrains Mono 10px #6B7A99
    Input:
      bg #161626, border 1px solid rgba(123,94,255,0.10)
      border-radius 8px, padding 7px 10px
      color #F0F4FF, font JetBrains Mono 12px, width 100%
      focus: border-color #7B5EFF, 
             box-shadow 0 0 0 2px rgba(123,94,255,0.15)
    Framer Motion stagger: each input animates in 
    with opacity 0→1, y 8→0, delay i*0.02s

- Subsection (Military Buildings): same pattern, 17 locations

MODAL FOOTER:
- bg #161626, border-top 1px solid rgba(123,94,255,0.15)
- padding: 16px 28px
- Left: tip text 11px #6B7A99
  "Changes sync with your bot " + span "#00FFB2" "in real-time"
- Right: two buttons:
  Close button:
    bg transparent, border 1px solid rgba(123,94,255,0.15)
    border-radius 9px, padding 9px 20px
    color #6B7A99, DM Sans 13px
    hover: border #FF4D6D, color #FF4D6D, 
           bg rgba(255,77,109,0.06)
  
  Save Changes button:
    bg: linear-gradient(135deg, #00FFB2, #7B5EFF)
    border: none, border-radius 9px, padding 9px 22px
    color: #07070E (dark for contrast), DM Sans 13px font-weight 700
    display flex, align-items center, gap 7px
    Save icon (Lucide "save") 14px
    whileHover: scale(1.02), translateY(-1px), opacity 0.92
    whileTap: scale(0.97)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 VAULT SYSTEMS / BANK PAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PAGE LAYOUT:
- Padding: 28px 32px, bg #07070E, min-height 100vh
- Framer Motion page enter: opacity 0→1, y 16→0, 0.4s ease-out

PAGE HEADER (top row, space-between):
LEFT side:
  Eyebrow: row with 16px mint line + "BANK MODULE" 
  10px uppercase letter-spacing 0.3em color #00FFB2
  Title: "VAULT SYSTEMS" DM Sans 24px font-weight 700 
         letter-spacing 0.04em, color #F0F4FF
  Subtitle: "Configure guild bank commands and authorized access"
            13px #6B7A99

RIGHT side (IGG ID chip):
  bg #161626, border 1px solid rgba(123,94,255,0.15)
  border-radius 10px, padding 8px 14px
  display flex, align-items center, gap 8px
  
  Pulsing dot: 7x7px circle, #00FFB2
  CSS animation: scale 1→1.3→1, opacity 1→0.5→1, 2s infinite
  
  Label: "SELECTED IGG ID" 10px uppercase #6B7A99
  Value: "987303841" JetBrains Mono 13px font-weight 600 #F0F4FF
  Chevron: ▾ 12px #6B7A99
  hover: border-color rgba(0,255,178,0.3)

ENABLE CARD:
- bg #0F0F1A, border 1px solid rgba(123,94,255,0.15)
- border-radius 14px, padding 16px 20px, margin-bottom 20px
- display flex, align-items center, justify-content space-between

Left group:
  Icon box: 40x40px, bg rgba(123,94,255,0.12),
  border 1px solid rgba(123,94,255,0.25), border-radius 10px
  Lucide "database" icon 18px color #7B5EFF
  Title: "Enable Guild Bank / Commands" DM Sans 15px font-weight 600
  Subtitle: "Allow bank commands and resource transfers" 12px #6B7A99

Right: Custom toggle switch
  Track: 48x26px, border-radius 13px
  ON state: bg linear-gradient(135deg, #00FFB2, #7B5EFF)
  OFF state: bg #161626, border 1px solid rgba(123,94,255,0.15)
  Thumb: 20x20px circle, white, absolute positioned
  right 3px (ON) / left 3px (OFF), top 3px
  Framer Motion layout animation on thumb position change

SEGMENTED TAB CONTROL:
- Container: bg #161626, border 1px solid rgba(123,94,255,0.15)
  border-radius 12px, padding 4px, display flex, gap 4px
  margin-bottom 20px

Each tab button:
  flex: 1, padding 10px 16px, border-radius 9px
  DM Sans 13px font-weight 500
  display flex, align-items center, justify-content center, gap 7px
  transition all 0.2s

  INACTIVE: bg transparent, color #6B7A99
    hover: bg rgba(255,255,255,0.03), color #F0F4FF

  ACTIVE: bg linear-gradient(135deg, rgba(123,94,255,0.2), rgba(0,255,178,0.10))
    border: 1px solid rgba(123,94,255,0.15)
    color: #F0F4FF
    Framer Motion layoutId="tab-indicator" for sliding animation

  Tab 1: Lucide "users" icon + "Users"
  Tab 2: Lucide "terminal" icon + "Commands" (default active)

OPTIONS PANEL:
- bg #0F0F1A, border 1px solid rgba(123,94,255,0.15)
- border-radius 14px, padding 18px 20px, margin-bottom 20px
- display flex, flex-direction column, gap 14px

Row 1 chips: Chat Commands✓, Mail Commands✓, 
             No Mail Response✗, No Error Mails✗
Row 2 chips: External Guild Commands✓, Ignore Balance✗,
             Auto Delete Mails✗, Use Bag Resources✗

Each option chip (same style as Construction toggles above):
  ON: mint glow | OFF: violet muted

Row 3 — Parameters (inline flex, gap 12px):
  Each: label 11px uppercase #6B7A99 + dark input
  "Buildspam Delay" → 56px wide input
  "Max Send Limit"  → 80px wide input  
  "Max Distance"    → 56px wide input
  "Prefix"          → 44px wide input
  All inputs: bg #161626, border rgba(123,94,255,0.15),
  border-radius 8px, JetBrains Mono 12px, color #F0F4FF
  focus: border #7B5EFF, box-shadow 0 0 0 2px rgba(123,94,255,0.15)

COMMAND TABLE:
Header row (title + search):
  Left: "COMMAND LIST" 11px uppercase letter-spacing 0.2em #6B7A99
  Left accent: 3px x 14px violet bar before text
  
  Right search bar:
    bg #161626, border rgba(123,94,255,0.15), border-radius 8px
    padding 6px 12px, display flex, align-items center, gap 8px
    Lucide "search" icon 13px #6B7A99
    Input: transparent bg, no border, JetBrains Mono 12px #F0F4FF
    placeholder "Search commands..." color #6B7A99
    focus-within: border-color rgba(0,255,178,0.3)

Table:
  width 100%, border-collapse collapse

  THEAD:
    bg #161626, border-bottom 1px solid rgba(123,94,255,0.15)
    TH: padding 10px 16px, 10px uppercase letter-spacing 0.2em
    color #6B7A99, font-weight 500, text-align left

  TBODY rows:
    border-bottom: 1px solid rgba(255,255,255,0.04)
    hover: bg rgba(123,94,255,0.04), transition 0.15s
    Framer Motion stagger: each row opacity 0→1, x -8→0, delay i*0.04s

  TD padding: 12px 16px

  Command column:
    font: JetBrains Mono 13px font-weight 500 #F0F4FF
    letter-spacing 0.04em
    Commands: bal, setacc, food, stone, wood, ore

  Enabled column:
    Checkmark badge: 22x22px
    bg rgba(0,255,178,0.10), border rgba(0,255,178,0.25)
    border-radius 6px, color #00FFB2, font-size 12px
    display inline-flex, align center

  Minimum Rank column:
    <select> styled:
      bg #161626, border 1px solid rgba(123,94,255,0.15)
      border-radius 8px, padding 5px 24px 5px 10px
      color #F0F4FF, font JetBrains Mono 11px
      appearance none, custom SVG chevron arrow in #6B7A99
      Options: Authorized, RANK4, RANK3, RANK2, RANK1
      focus: border-color #7B5EFF

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ ANIMATION RULES (60fps)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Use ONLY transform + opacity (never animate width/height/top/left)
- will-change: transform on actively animating elements only
- Framer Motion for: modal open/close, tab switching (layoutId), 
  row stagger, button interactions
- CSS @keyframes for: pulsing dot, hover glow
- No JS-driven position animations — layout animations only

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Next.js App Router | Tailwind CSS (extend theme with above vars)
Framer Motion | Lucide React | Google Fonts: DM Sans + JetBrains Mono
Keep ALL existing logic/API — only replace JSX + styles