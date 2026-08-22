export const MAX_VIDEO_FILE_MB = 200;

export type VideoCleanResult = {
  blob: Blob;
  mime: "video/mp4" | "video/webm";
  extension: "mp4" | "webm";
  width: number;
  height: number;
  duration: number;
  thumbnail?: string;
};

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Could not read video thumbnail."));
    reader.readAsDataURL(blob);
  });
}

export function createVideoThumbnail(blob: Blob): Promise<string | undefined> {
  const url = URL.createObjectURL(blob);
  return new Promise((resolve) => {
    const video = document.createElement("video");
    let settled = false;
    const finish = (thumbnail?: string) => {
      if (settled) return;
      settled = true;
      URL.revokeObjectURL(url);
      resolve(thumbnail);
    };
    const timeout = window.setTimeout(() => finish(), 8_000);

    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(0.15, Math.max(0, video.duration / 2));
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (!context || !canvas.width || !canvas.height) {
        window.clearTimeout(timeout);
        finish();
        return;
      }
      context.drawImage(video, 0, 0);
      window.clearTimeout(timeout);
      finish(canvas.toDataURL("image/jpeg", 0.82));
    };
    video.onerror = () => {
      window.clearTimeout(timeout);
      finish();
    };
    video.src = url;
  });
}

type FFmpegEngine = import("@ffmpeg/ffmpeg").FFmpeg;
type FFmpegConstructor = new () => FFmpegEngine;

let runtimePromise: Promise<FFmpegConstructor> | undefined;
let enginePromise: Promise<FFmpegEngine> | undefined;

function loadRuntime() {
  if (!runtimePromise) {
    runtimePromise = new Promise<FFmpegConstructor>((resolve, reject) => {
      const scope = window as Window & { FFmpegWASM?: { FFmpeg?: FFmpegConstructor } };
      if (scope.FFmpegWASM?.FFmpeg) {
        resolve(scope.FFmpegWASM.FFmpeg);
        return;
      }
      const script = document.createElement("script");
      script.src = "/ffmpeg/ffmpeg.js";
      script.async = true;
      script.onload = () => {
        if (scope.FFmpegWASM?.FFmpeg) resolve(scope.FFmpegWASM.FFmpeg);
        else reject(new Error("The local FFmpeg runtime did not initialize."));
      };
      script.onerror = () => reject(new Error("The local FFmpeg runtime could not be loaded."));
      document.head.appendChild(script);
    }).catch((error) => {
      runtimePromise = undefined;
      throw error;
    });
  }
  return runtimePromise;
}

async function getEngine() {
  if (!enginePromise) {
    enginePromise = loadRuntime()
      .then(async (FFmpeg) => {
        const engine = new FFmpeg();
        await engine.load({
          coreURL: "/ffmpeg/ffmpeg-core.js",
          wasmURL: "/ffmpeg/ffmpeg-core.wasm",
        });
        return engine;
      })
      .catch((error) => {
        enginePromise = undefined;
        throw new Error(`Could not start the local video engine: ${String(error)}`);
      });
  }
  return enginePromise;
}

/** Remux a video without re-encoding so its video and audio quality remain unchanged. */
export async function cleanVideo(file: File, onProgress: (progress: number) => void): Promise<VideoCleanResult> {
  const engine = await getEngine();
  const nonce = crypto.randomUUID();
  const sourceExtension = file.name.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase() || "video";
  const inputName = `input-${nonce}.${sourceExtension}`;
  const isWebM = sourceExtension === "webm";
  const outputExtension = isWebM ? "webm" : "mp4";
  const outputMime = isWebM ? "video/webm" : "video/mp4";
  const outputName = `output-${nonce}.${outputExtension}`;
  const thumbnailName = `thumbnail-${nonce}.jpg`;
  const progress = ({ progress: value }: { progress: number }) => onProgress(Math.max(0, Math.min(1, value)));
  const logs: string[] = [];
  const log = ({ message }: { message: string }) => {
    if (message.trim()) logs.push(message.trim());
    if (logs.length > 20) logs.shift();
  };

  engine.on("progress", progress);
  engine.on("log", log);
  try {
    onProgress(0.01);
    await engine.writeFile(inputName, new Uint8Array(await file.arrayBuffer()));
    const exitCode = await engine.exec([
      "-i",
      inputName,
      "-map_metadata",
      "-1",
      "-map_chapters",
      "-1",
      "-map",
      "0:v:0",
      "-map",
      "0:a?",
      "-c",
      "copy",
      ...(isWebM ? [] : ["-movflags", "+faststart"]),
      outputName,
    ]);
    if (exitCode !== 0) {
      const detail = logs.slice(-3).join(" ");
      throw new Error(detail ? `FFmpeg could not clean this video without quality loss: ${detail}` : "FFmpeg could not clean this video without quality loss.");
    }

    const output = await engine.readFile(outputName);
    if (typeof output === "string") throw new Error("FFmpeg returned an invalid video.");
    const dimensions = [...logs]
      .reverse()
      .map((message) => message.match(/\b(\d{2,5})x(\d{2,5})\b/))
      .find((match) => match !== null);
    const duration = logs
      .map((message) => message.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)/))
      .find((match) => match !== null);
    let thumbnail: string | undefined;
    try {
      const thumbnailExitCode = await engine.exec([
        "-ss",
        "0",
        "-i",
        outputName,
        "-frames:v",
        "1",
        "-vf",
        "scale=320:-2",
        "-q:v",
        "3",
        thumbnailName,
      ]);
      if (thumbnailExitCode === 0) {
        const image = await engine.readFile(thumbnailName);
        if (typeof image !== "string") {
          thumbnail = await toDataUrl(new Blob([Uint8Array.from(image).buffer], { type: "image/jpeg" }));
        }
      }
    } catch {
      // The cleaned video is still valid; the UI has a video-icon fallback.
    }
    onProgress(1);
    return {
      blob: new Blob([Uint8Array.from(output).buffer], { type: outputMime }),
      mime: outputMime,
      extension: outputExtension,
      width: dimensions ? Number(dimensions[1]) : 0,
      height: dimensions ? Number(dimensions[2]) : 0,
      duration: duration ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]) : 0,
      thumbnail,
    };
  } finally {
    engine.off("progress", progress);
    engine.off("log", log);
    await Promise.allSettled([engine.deleteFile(inputName), engine.deleteFile(outputName), engine.deleteFile(thumbnailName)]);
  }
}
