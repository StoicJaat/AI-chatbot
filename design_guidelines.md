# AI Chatbot Design Guidelines

## Design Approach

**Selected Approach:** Design System (Material Design via MUI)

**Justification:** This is a utility-focused conversational interface where clarity, efficiency, and usability are paramount. Material Design provides robust chat-specific patterns with excellent visual feedback systems ideal for real-time interactions.

**Reference Inspiration:** ChatGPT, Claude, and Linear's clean minimalist approach to content-focused interfaces.

---

## Core Design Elements

### A. Typography

**Font Family:** Inter (primary), Roboto (fallback)
- **Headings:** 600 weight
  - H1: 2rem (32px) - App title/branding
  - H2: 1.5rem (24px) - Section headers
  - H3: 1.25rem (20px) - Subsection headers
- **Body Text:** 400 weight
  - Regular: 0.938rem (15px) - Chat messages
  - Small: 0.813rem (13px) - Timestamps, metadata
  - Tiny: 0.75rem (12px) - Helper text
- **Chat Messages:** 
  - User messages: 500 weight, 0.938rem
  - AI responses: 400 weight, 0.938rem
  - Code blocks: "Fira Code" or "Monaco" monospace, 0.875rem

### B. Layout System

**Spacing Primitives:** Tailwind units of 1, 2, 3, 4, 6, 8, 12, 16
- **Micro spacing:** 1-2 units (4-8px) - Icon gaps, inline elements
- **Component spacing:** 3-4 units (12-16px) - Message padding, input padding
- **Section spacing:** 6-8 units (24-32px) - Between major UI sections
- **Macro spacing:** 12-16 units (48-64px) - Page margins, container padding

**Container Structure:**
- **Full Application:** 100vh height, flex column
- **Chat Container:** Flex-1 (takes remaining space), max-width: 900px centered
- **Sidebar (if implemented):** Fixed 280px width on desktop, full-width drawer on mobile
- **Input Area:** Fixed bottom, full-width with same max-width constraint as chat

---

## C. Component Library

### 1. Layout Components

**Main Application Shell:**
- Three-section vertical layout: Header (64px fixed) + Chat Area (flex-1) + Input Area (auto height)
- Optional left sidebar: Conversation history (280px fixed width, collapsible on mobile)
- Responsive breakpoint: Sidebar converts to drawer menu below 768px

**Chat Container:**
- Centered column, max-width 900px with 16px horizontal padding
- Auto-scroll to bottom on new messages
- Subtle scroll indicator when not at bottom
- Message grouping: 12px gap between different senders, 4px gap for consecutive messages from same sender

### 2. Navigation Components

**Top Header:**
- Fixed position, 64px height, full-width
- Left: App logo/title + hamburger menu (mobile)
- Center: Current chat title (truncate with ellipsis)
- Right: Settings icon, user profile menu
- Shadow/border separator from content below

**Sidebar Navigation (Desktop):**
- "New Chat" button at top (full-width, 48px height)
- Scrollable conversation history list
- Each item: 44px min-height, 12px padding, truncated title with timestamp
- Hover state with subtle background change
- Active conversation highlighted

### 3. Chat Message Components

**Message Bubble Structure:**
- **User Messages:**
  - Aligned right (ml-auto), max-width 85%
  - Padding: 12px 16px
  - Rounded corners: 16px 16px 4px 16px
  - Typography: 500 weight, 15px
  
- **AI Messages:**
  - Aligned left (mr-auto), max-width 85%
  - Padding: 12px 16px
  - Rounded corners: 16px 16px 16px 4px
  - Typography: 400 weight, 15px
  - Optional AI avatar (32px circle) positioned 8px left of message

**Message Metadata:**
- Timestamp: 12px size, positioned 4px below message
- Status indicators (sending/sent/error): 16px icons, inline with timestamp

**Code Block Component:**
- Full-width within message bubble
- Header bar: Language label + copy button (32px height)
- Code area: Monospace font, 14px, padding 12px
- Syntax highlighting via library (Prism.js or highlight.js)
- Rounded corners: 8px

**Markdown Support:**
- Bold, italic, lists, blockquotes
- Inline code: monospace, subtle background, 2px padding
- Links: underlined on hover, external link icon

### 4. Input Components

**Chat Input Area:**
- Fixed bottom position, full-width
- Container: max-width 900px centered, 16px horizontal padding
- Multi-line textarea (auto-expand up to 200px max-height)
- Padding: 16px inside
- Border radius: 24px
- Minimum height: 56px (single line)

**Input Controls:**
- Send button: 40px circle, positioned bottom-right inside textarea, 8px margin
- Icon-only button (paper plane or arrow icon)
- Disabled state when input empty or sending

**Input Footer:**
- Character/token counter (if applicable): 12px text, 8px below input
- Quick actions bar: Attach file button, voice input (optional) - 40px each

### 5. Feedback Components

**Loading States:**
- AI thinking indicator: Three animated dots, 8px each, 4px gap
- Positioned same as AI message, subtle pulsing animation
- Message sending: Spinner (20px) at bottom-right of user message

**Error States:**
- Error message banner: 48px height, full-width, 12px padding
- Icon (24px) + error text + retry/dismiss actions
- Positioned above input area

**Empty States:**
- Centered in chat area
- Icon (64px) + heading + descriptive text + suggested prompts
- Suggested prompts: Pill-shaped buttons, 40px height, 12px horizontal padding

### 6. Modal/Overlay Components

**Settings Modal:**
- Centered overlay, 90vw width max 600px
- Header: 64px with title + close button
- Body: Scrollable sections with 24px padding
- Form inputs: 48px height, 12px padding
- Save/Cancel buttons at bottom (fixed)

**Conversation Management:**
- Delete confirmation: 400px centered dialog
- Share conversation: QR code + link copy interface

---

## D. Responsive Behavior

**Mobile (< 768px):**
- Sidebar converts to slide-out drawer
- Chat messages: max-width 95%
- Input area: full-width with 12px horizontal padding
- Header: Simplified to hamburger + title + profile

**Tablet (768px - 1024px):**
- Sidebar: Collapsible, 240px when open
- Chat container: max-width 800px
- Standard desktop layout with compressed spacing

**Desktop (> 1024px):**
- Full layout with persistent sidebar
- Chat container: max-width 900px
- Generous spacing (16px margins)

---

## E. Animations

**Use Sparingly:**
- Message entry: Subtle fade-in + slide-up (200ms ease-out)
- Typing indicator: Pulsing dots animation
- Sidebar expand/collapse: 300ms ease-in-out
- NO scroll animations, NO parallax effects

---

## Images

**No hero images or decorative imagery required.** This is a functional chat interface focused on conversation. The only images are:
- App logo/branding in header (SVG, max 40px height)
- Optional AI avatar icon (32px circle, positioned left of AI messages)
- Empty state illustration (SVG, 120px max-width, centered)