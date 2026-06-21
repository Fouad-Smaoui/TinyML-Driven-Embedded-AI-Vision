#!/usr/bin/env node
/**
 * Self-hosts the MediaPipe FaceLandmarker model + WASM runtime instead of
 * fetching them from Google's CDN at page-load time. Mirrors the root
 * project's models/download_models.py: fetched/copied at setup time,
 * gitignored, not committed as binaries. Runs automatically via
 * `npm install` (postinstall) and is safe to re-run (skips existing files).
 */
import { existsSync, mkdirSync, copyFileSync, createWriteStream } from "node:fs";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import https from "node:https";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const WASM_SRC_DIR = path.join(ROOT, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const WASM_DEST_DIR = path.join(ROOT, "public", "wasm");

const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const MODEL_DEST_DIR = path.join(ROOT, "public", "models");
const MODEL_DEST_FILE = path.join(MODEL_DEST_DIR, "face_landmarker.task");

async function copyWasmRuntime() {
  if (!existsSync(WASM_SRC_DIR)) {
    console.warn(
      `[prepare-models] ${WASM_SRC_DIR} not found — did "npm install @mediapipe/tasks-vision" run?`,
    );
    return;
  }
  mkdirSync(WASM_DEST_DIR, { recursive: true });

  const files = await readdir(WASM_SRC_DIR);
  for (const file of files) {
    const dest = path.join(WASM_DEST_DIR, file);
    if (existsSync(dest)) continue;
    copyFileSync(path.join(WASM_SRC_DIR, file), dest);
    console.log(`[prepare-models] copied ${file} -> public/wasm/`);
  }
}

function downloadModel() {
  return new Promise((resolve, reject) => {
    if (existsSync(MODEL_DEST_FILE)) {
      console.log("[prepare-models] face_landmarker.task already present, skipping download");
      resolve();
      return;
    }
    mkdirSync(MODEL_DEST_DIR, { recursive: true });
    console.log(`[prepare-models] downloading ${MODEL_URL}`);

    const file = createWriteStream(MODEL_DEST_FILE);
    https
      .get(MODEL_URL, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Download failed: HTTP ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", reject);
  });
}

try {
  await copyWasmRuntime();
  await downloadModel();
  console.log("[prepare-models] done.");
} catch (err) {
  console.error("[prepare-models] failed:", err.message);
  console.error(
    "[prepare-models] the dev/build server will still run, but the live demo needs these assets — re-run `npm run prepare-models` once network access is available.",
  );
}
