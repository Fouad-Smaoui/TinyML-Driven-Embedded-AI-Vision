import { afterEach, describe, expect, it, vi } from "vitest";
import { sendPerfPing } from "@/lib/metrics/backend-ping";

const PAYLOAD = { fps: 30, inferenceMs: 12, trackingMs: 0.5, delegate: "GPU" as const };

describe("sendPerfPing", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns 'ok' for a fast successful response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
    );

    const status = await sendPerfPing(PAYLOAD);
    expect(status).toBe("ok");
  });

  it("returns 'unreachable' on a non-2xx response, without throwing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 500 })));

    await expect(sendPerfPing(PAYLOAD)).resolves.toBe("unreachable");
  });

  it("returns 'unreachable' when the network request itself rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("network error")));

    await expect(sendPerfPing(PAYLOAD)).resolves.toBe("unreachable");
  });

  it("sends the snake_case payload shape the backend expects", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await sendPerfPing(PAYLOAD);

    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body as string);
    expect(body).toEqual({
      fps: 30,
      inference_ms: 12,
      tracking_ms: 0.5,
      delegate: "GPU",
    });
  });

  it("treats an aborted/timed-out fetch as unreachable, not a thrown error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new DOMException("Aborted", "AbortError")));

    await expect(sendPerfPing(PAYLOAD)).resolves.toBe("unreachable");
  });
});
