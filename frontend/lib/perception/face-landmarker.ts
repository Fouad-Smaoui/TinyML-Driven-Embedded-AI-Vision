/**
 * Loads MediaPipe's FaceLandmarker entirely client-side: WASM runtime and
 * `.task` model are both self-hosted (see scripts/prepare-models.mjs) rather
 * than fetched from Google's CDN at runtime — no third-party network
 * dependency on the page recruiters will scrutinize most.
 *
 * Tries the GPU (WebGL) delegate first and falls back to CPU if GPU
 * initialization fails (e.g. no WebGL2, locked-down browser). The selected
 * delegate is surfaced so the UI can show which backend is actually running.
 */
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export type InferenceDelegate = "GPU" | "CPU";

export interface FaceLandmarkerHandle {
  landmarker: FaceLandmarker;
  delegate: InferenceDelegate;
}

const WASM_BASE_PATH = "/wasm";
const MODEL_ASSET_PATH = "/models/face_landmarker.task";

let cached: Promise<FaceLandmarkerHandle> | null = null;

/** Singleton loader — MediaPipe initialization is expensive, do it once per page. */
export function loadFaceLandmarker(): Promise<FaceLandmarkerHandle> {
  if (!cached) {
    cached = initialize().catch((err) => {
      cached = null; // allow retry on next call rather than caching a permanent failure
      throw err;
    });
  }
  return cached;
}

async function initialize(): Promise<FaceLandmarkerHandle> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_BASE_PATH);

  try {
    const landmarker = await createLandmarker(fileset, "GPU");
    return { landmarker, delegate: "GPU" };
  } catch (gpuError) {
    console.warn("[face-landmarker] GPU delegate unavailable, falling back to CPU:", gpuError);
    const landmarker = await createLandmarker(fileset, "CPU");
    return { landmarker, delegate: "CPU" };
  }
}

function createLandmarker(
  fileset: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: InferenceDelegate,
) {
  return FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: MODEL_ASSET_PATH,
      delegate,
    },
    runningMode: "VIDEO",
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
  });
}
