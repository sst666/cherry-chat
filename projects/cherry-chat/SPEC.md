# CherryChat — Specification

## Overview

CherryChat is a browser-based AI chat client built with React + TypeScript + Vite. It connects to any OpenAI-compatible or Anthropic API endpoint, stores all data in `localStorage`, and supports text, image, and PDF attachments.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v3 |
| Icons | lucide-react |
| PDF rendering | pdfjs-dist |
| State | React Context + useReducer |
| Persistence | localStorage |

---

## localStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `bywlai-settings` | `ApiConfig` | API endpoint, key, default model |
| `bywlai-conversations` | `Conversation[]` | All conversations |
| `bywlai-current-conv-id` | `string` | Active conversation ID |
| `bywlai-recent-models` | `string[]` | Up to 5 recently used models |

---

## Data Types (`src/types.ts`)

```ts
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  images?: string[];   // base64 data URLs (images + PDF pages)
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;       // auto-set from first user message (50 chars)
  messages: Message[];
  model: string;
  createdAt: number;
  updatedAt: number;
}

interface ApiConfig {
  endpoint: string;    // e.g. https://api.anthropic.com
  apiKey: string;
  model: string;       // default model
}
```

---

## Component Tree

```
App
└── ChatProvider (context)
    ├── Sidebar
    │   └── conversation list items
    ├── ChatArea
    │   ├── top bar: ModelSelector + settings button
    │   ├── MessageList
    │   │   └── MessageBubble (per message)
    │   └── InputArea
    └── SettingsPanel (modal overlay)
```

---

## Components

### `ChatContext` (`src/context/ChatContext.tsx`)

Central state via `useReducer`. Exposes:
- `state` — full app state
- `dispatch` — action dispatcher
- `currentConversation` — derived from `state.currentConvId`
- `sendMessage(content, images?)` — builds API request, streams response, updates state

Actions: `SET_CONFIG`, `NEW_CONVERSATION`, `SELECT_CONVERSATION`, `DELETE_CONVERSATION`, `RENAME_CONVERSATION`, `ADD_MESSAGE`, `SET_LOADING`, `TOGGLE_SETTINGS`, `SET_SEARCH`, `ADD_RECENT_MODEL`, `SET_MODEL`.

### `Sidebar`

- Fixed 280 px left panel, `bg-[#f9fafb]`
- Header: logo + settings gear button
- "New Chat" button (indigo gradient)
- Search input filters conversation list
- Conversation items: title + timestamp, delete on hover
- Active item: `bg-[#f5f3ff] text-[#4f46e5]`

### `ModelSelector`

- Searchable dropdown, no external props (reads/writes via `ChatContext`)
- Sections: "最近使用" (recent, from `bywlai-recent-models`) then all available models
- On select: dispatches `SET_MODEL` + `ADD_RECENT_MODEL`
- Click outside closes dropdown

Available model list (built-in):
```
claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5-20251001,
claude-3-5-sonnet-20241022, claude-3-5-haiku-20241022,
claude-3-opus-20240229, gpt-4o, gpt-4o-mini, gpt-4-turbo,
o1-preview, o1-mini, gemini-1.5-pro, gemini-1.5-flash
```

### `ChatArea`

- Flex column filling remaining width
- Top bar (`h-14`): `ModelSelector` left, settings icon button right
- Body: `MessageList` (flex-1, scrollable)
- Empty state: centered "Welcome to CherryChat" when no conversation or no messages
- No-API-key state: centered "请先配置API" message
- Bottom: `InputArea`

### `MessageList`

- Maps `currentConversation.messages` → `MessageBubble`
- Loading indicator: 3 bouncing dots at bottom when `isLoading`
- Auto-scrolls to bottom on new message via `useEffect` + `scrollIntoView`

### `MessageBubble`

Props: `{ message: Message, conversationId: string }`

**User bubble**
- Right-aligned, `max-w-[72%]`
- Background: gradient `#4f46e5 → #6366f1`, white text
- `rounded-2xl rounded-br-md`

**Assistant bubble**
- Left-aligned, `max-w-[72%]`
- `bg-white`, dark text, `shadow-sm`
- `rounded-2xl rounded-bl-md`

**Hover actions** (`opacity-0 group-hover:opacity-100`):
- Edit (Edit3 icon) — enters inline edit mode
- Delete (Trash2 icon) — removes message from conversation
- Regenerate (RefreshCw icon, assistant only) — re-sends last user message

**Edit mode**: inline `<textarea>` replacing content, Cancel / Send buttons below.

**Attachments**:
- Images: `max-w-[200px] rounded-lg` grid
- PDF pages: same grid with page-number badge overlay (`absolute bottom-1 right-1`)

**Regenerate button**: shown below the last assistant message only.

### `InputArea`

- Sticky bottom bar, `bg-white border-t`
- Attachment preview row above textarea (thumbnails with × remove)
- Textarea: `resize-none`, 1–5 rows auto-grow, `Enter` sends, `Shift+Enter` newline
- Left buttons: image upload (📎), PDF upload (📄)
- Send button: indigo gradient, disabled when content empty or `isLoading`
- Image upload: `accept="image/*"`, reads as base64 data URL
- PDF upload: `accept="application/pdf"`, calls `usePdf().pdfToImages`, appends pages as images

---

## API Integration

Endpoint: `POST {config.endpoint}/v1/messages`

Headers:
```
Content-Type: application/json
Authorization: Bearer {apiKey}
anthropic-version: 2023-06-01
```

Body:
```json
{
  "model": "...",
  "max_tokens": 4096,
  "messages": [
    { "role": "user", "content": "..." },
    ...
  ]
}
```

For messages with images, `content` becomes an array:
```json
[
  { "type": "text", "text": "..." },
  { "type": "image_url", "image_url": { "url": "data:image/png;base64,..." } }
]
```

Response: `data.content[0].text`

---

## Styling Conventions

- Primary: `#4f46e5` (indigo-600), hover `#4338ca`
- Text primary: `#111827`, secondary: `#6b7280`
- Border: `#e5e7eb`
- Background: `#f9fafb` (sidebar), `#fafafa` (message area), `#ffffff` (panels)
- Gradients: `linear-gradient(135deg, #4f46e5, #6366f1)`
- Focus ring: `focus:ring-2 focus:ring-[#4f46e5]/30`
- Transitions: `transition-colors` / `transition-all`
