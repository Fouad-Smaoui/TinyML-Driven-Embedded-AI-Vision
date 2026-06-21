import { test, expect } from "@playwright/test";

// MediaPipe/TFLite log informational lines through the console "error" level
// (XNNPACK delegate setup, GL context info) — benign and expected, not a sign
// of a broken page. Anything else is a real error worth failing the test on.
const BENIGN_CONSOLE_PATTERNS = [/xnnpack/i, /tensorflow lite/i, /gl_context/i, /gl version/i];

test.describe("live demo page", () => {
  test("loads the model, requests the camera, and starts reporting live metrics", async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      if (BENIGN_CONSOLE_PATTERNS.some((pattern) => pattern.test(msg.text()))) return;
      consoleErrors.push(msg.text());
    });

    await page.goto("/demo");

    await expect(page.getByRole("heading", { name: "Live edge inference demo" })).toBeVisible();

    // Model load can take a moment (WASM + ~4MB model fetch from public/).
    await expect(page.getByRole("button", { name: "Enable camera" })).toBeVisible({
      timeout: 20_000,
    });

    await page.getByRole("button", { name: "Enable camera" }).click();

    // Chromium is launched with --use-fake-device-for-media-stream (see
    // playwright.config.ts), so this exercises the real getUserMedia path
    // against a synthetic camera feed rather than mocking the pipeline.
    await expect(page.getByText(/Live · running on/i)).toBeVisible({ timeout: 20_000 });

    const fpsCard = page.getByTestId("metrics-panel");
    await expect(fpsCard).toBeVisible();

    // FPS should move off the placeholder once frames are actually flowing.
    await expect(fpsCard).not.toContainText("—", { timeout: 15_000 });

    expect(consoleErrors).toEqual([]);
  });
});
