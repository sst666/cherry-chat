import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import type { Message, Conversation, ApiConfig } from '../types';

const LS_SETTINGS = 'bywlai-settings';
const LS_CONVERSATIONS = 'bywlai-conversations';
const LS_CURRENT_ID = 'bywlai-current-conv-id';
const LS_RECENT_MODELS = 'bywlai-recent-models';
const LS_FAVORITE_MODELS = 'bywlai-favorite-models';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

interface State {
  conversations: Conversation[];
  currentConvId: string | null;
  config: ApiConfig;
  recentModels: string[];
  favoriteModels: string[];
  models: string[];
  isLoading: boolean;
  settingsOpen: boolean;
  searchQuery: string;
}

type Action =
  | { type: 'SET_CONFIG'; payload: ApiConfig }
  | { type: 'NEW_CONVERSATION' }
  | { type: 'SELECT_CONVERSATION'; payload: string }
  | { type: 'DELETE_CONVERSATION'; payload: string }
  | { type: 'RENAME_CONVERSATION'; payload: { id: string; title: string } }
  | { type: 'ADD_MESSAGE'; payload: { convId: string; message: Message } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'ADD_RECENT_MODEL'; payload: string }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'SET_MODELS'; payload: string[] }
  | { type: 'TOGGLE_FAVORITE_MODEL'; payload: string };

function createConversation(model: string): Conversation {
  const now = Date.now();
  return {
    id: generateId(),
    title: 'New Conversation',
    messages: [],
    model,
    createdAt: now,
    updatedAt: now,
  };
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CONFIG': {
      saveJson(LS_SETTINGS, action.payload);
      return { ...state, config: action.payload };
    }
    case 'NEW_CONVERSATION': {
      const conv = createConversation(state.config.model);
      const conversations = [conv, ...state.conversations];
      saveJson(LS_CONVERSATIONS, conversations);
      saveJson(LS_CURRENT_ID, conv.id);
      return { ...state, conversations, currentConvId: conv.id };
    }
    case 'SELECT_CONVERSATION': {
      saveJson(LS_CURRENT_ID, action.payload);
      return { ...state, currentConvId: action.payload };
    }
    case 'DELETE_CONVERSATION': {
      const conversations = state.conversations.filter(
        (c) => c.id !== action.payload
      );
      saveJson(LS_CONVERSATIONS, conversations);
      let currentConvId = state.currentConvId;
      if (currentConvId === action.payload) {
        currentConvId = conversations[0]?.id ?? null;
        saveJson(LS_CURRENT_ID, currentConvId);
      }
      return { ...state, conversations, currentConvId };
    }
    case 'RENAME_CONVERSATION': {
      const conversations = state.conversations.map((c) =>
        c.id === action.payload.id ? { ...c, title: action.payload.title } : c
      );
      saveJson(LS_CONVERSATIONS, conversations);
      return { ...state, conversations };
    }
    case 'ADD_MESSAGE': {
      const conversations = state.conversations.map((c) => {
        if (c.id !== action.payload.convId) return c;
        const messages = [...c.messages, action.payload.message];
        const title =
          c.title === 'New Conversation' &&
          action.payload.message.role === 'user'
            ? action.payload.message.content.slice(0, 50) ||
              'New Conversation'
            : c.title;
        return { ...c, messages, title, updatedAt: Date.now() };
      });
      saveJson(LS_CONVERSATIONS, conversations);
      return { ...state, conversations };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, settingsOpen: !state.settingsOpen };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'ADD_RECENT_MODEL': {
      const recentModels = [
        action.payload,
        ...state.recentModels.filter((m) => m !== action.payload),
      ].slice(0, 8);
      saveJson(LS_RECENT_MODELS, recentModels);
      return { ...state, recentModels };
    }
    case 'SET_MODEL': {
      const config = { ...state.config, model: action.payload };
      saveJson(LS_SETTINGS, config);
      const conversations = state.conversations.map((c) =>
        c.id === state.currentConvId ? { ...c, model: action.payload } : c
      );
      saveJson(LS_CONVERSATIONS, conversations);
      return { ...state, config, conversations };
    }
    case 'SET_MODELS':
      return { ...state, models: action.payload };
    case 'TOGGLE_FAVORITE_MODEL': {
      const fav = state.favoriteModels.includes(action.payload)
        ? state.favoriteModels.filter((m) => m !== action.payload)
        : [...state.favoriteModels, action.payload];
      saveJson(LS_FAVORITE_MODELS, fav);
      return { ...state, favoriteModels: fav };
    }
    default:
      return state;
  }
}

interface ChatContextValue {
  state: State;
  dispatch: React.Dispatch<Action>;
  currentConversation: Conversation | null;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  fetchModels: (endpoint?: string, apiKey?: string) => Promise<string[]>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => {
    const config = loadJson<ApiConfig>(LS_SETTINGS, {
      endpoint: 'https://api.bywlai.cn',
      apiKey: '',
      model: 'claude-sonnet-4-6',
    });
    const conversations = loadJson<Conversation[]>(LS_CONVERSATIONS, []);
    const savedId = loadJson<string | null>(LS_CURRENT_ID, null);
    const currentConvId =
      savedId && conversations.find((c) => c.id === savedId)
        ? savedId
        : conversations[0]?.id ?? null;
    const recentModels = loadJson<string[]>(LS_RECENT_MODELS, []);
    const favoriteModels = loadJson<string[]>(LS_FAVORITE_MODELS, []);
    return {
      conversations,
      currentConvId,
      config,
      recentModels,
      favoriteModels,
      models: [],
      isLoading: false,
      settingsOpen: !config.apiKey,
      searchQuery: '',
    };
  });

  const currentConversation =
    state.conversations.find((c) => c.id === state.currentConvId) ?? null;

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!state.currentConvId) return;

      const userMsg: Message = {
        id: generateId(),
        role: 'user',
        content,
        images,
        timestamp: Date.now(),
      };

      dispatch({
        type: 'ADD_MESSAGE',
        payload: { convId: state.currentConvId, message: userMsg },
      });
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const conv = state.conversations.find(
          (c) => c.id === state.currentConvId
        );
        const history = conv ? [...conv.messages, userMsg] : [userMsg];

        const apiMessages = history.map((m) => {
          if (m.images && m.images.length > 0) {
            const contentParts: unknown[] = m.images.map((img) => ({
              type: 'image_url',
              image_url: { url: img },
            }));
            if (m.content) {
              contentParts.unshift({ type: 'text', text: m.content });
            }
            return { role: m.role, content: contentParts };
          }
          return { role: m.role, content: m.content };
        });

        const model = conv?.model ?? state.config.model;
        const endpoint = state.config.endpoint.replace(/\/$/, '');

        const res = await fetch(`${endpoint}/v1/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${state.config.apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 4096,
            messages: apiMessages,
          }),
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`API error ${res.status}: ${err}`);
        }

        const data = await res.json();
        const text: string = data?.choices?.[0]?.message?.content ?? '';

        const assistantMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: text,
          timestamp: Date.now(),
        };

        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            convId: state.currentConvId!,
            message: assistantMsg,
          },
        });

        dispatch({ type: 'ADD_RECENT_MODEL', payload: model });
      } catch (err) {
        const errorMsg: Message = {
          id: generateId(),
          role: 'assistant',
          content: `Error: ${err instanceof Error ? err.message : String(err)}`,
          timestamp: Date.now(),
        };
        dispatch({
          type: 'ADD_MESSAGE',
          payload: { convId: state.currentConvId!, message: errorMsg },
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.currentConvId, state.conversations, state.config]
  );

  const fetchModels = useCallback(
    async (endpoint?: string, apiKey?: string): Promise<string[]> => {
      const ep = endpoint ?? state.config.endpoint;
      const key = apiKey ?? state.config.apiKey;
      if (!key || !ep) return [];
      try {
        const res = await fetch(`${ep.replace(/\/$/, '')}/v1/models`, {
          headers: { Authorization: `Bearer ${key}` },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let list: string[] = [];
        if (Array.isArray(data.data)) {
          list = data.data.map((m: { id: string }) => m.id);
        } else if (Array.isArray(data.models)) {
          list = data.models.map((m: { id: string }) => m.id);
        } else if (Array.isArray(data)) {
          list = data.map(
            (m: string | { id: string }) =>
              typeof m === 'string' ? m : m.id
          );
        }
        dispatch({ type: 'SET_MODELS', payload: list });
        return list;
      } catch {
        return [];
      }
    },
    [state.config]
  );

  return (
    <ChatContext.Provider
      value={{
        state,
        dispatch,
        currentConversation,
        sendMessage,
        fetchModels,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx)
    throw new Error('useChatContext must be used within ChatProvider');
  return ctx;
}
