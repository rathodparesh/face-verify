import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
Object.defineProperty(globalThis, "ResizeObserver", { value: class { observe() {} disconnect() {} } });
Object.defineProperty(globalThis.URL, "createObjectURL", { value: vi.fn(() => "blob:test") });
Object.defineProperty(globalThis.URL, "revokeObjectURL", { value: vi.fn() });
