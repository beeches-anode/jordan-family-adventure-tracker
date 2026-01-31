import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../firebase-config', () => ({
  db: {},
  storage: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'mock-id' })),
  deleteDoc: vi.fn(() => Promise.resolve()),
  updateDoc: vi.fn(() => Promise.resolve()),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn((q, opts, onNext) => {
    // If called with 3 args (query, options, callback), use 3rd arg
    const callback = typeof opts === 'function' ? opts : onNext;
    if (callback) {
      callback({
        docs: [],
        metadata: { fromCache: false },
      });
    }
    return vi.fn(); // unsubscribe
  }),
  getDocsFromServer: vi.fn(() => Promise.resolve({ docs: [] })),
  Timestamp: { fromDate: (d: Date) => ({ toDate: () => d }) },
  serverTimestamp: vi.fn(() => new Date()),
}));

// Mock sessionStorage and localStorage
const createStorageMock = () => {
  const store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { Object.keys(store).forEach(k => delete store[k]); }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
};

Object.defineProperty(window, 'sessionStorage', { value: createStorageMock() });
Object.defineProperty(window, 'localStorage', { value: createStorageMock() });
