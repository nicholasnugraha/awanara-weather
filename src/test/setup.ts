import { expect, type TestContext, vi } from "vitest";
import "@testing-library/jest-dom/vitest";

// Set up React for JSX
import React from "react";
import { cleanup } from "@testing-library/react";

// Cleanup after each test
afterEach(() => {
  cleanup();
});
