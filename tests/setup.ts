import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
export const mockServer = setupServer();
beforeAll(() => mockServer.listen({ onUnhandledFrame: "error" }));
afterEach(() => mockServer.resetHandlers());
afterAll(() => mockServer.close());
