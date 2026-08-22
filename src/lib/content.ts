export type Faq = { q: string; a: string };

/** Answer-engine friendly: every answer opens with a direct, quotable sentence. */
export const faqs: Faq[] = [
  {
    q: "What is an AI label remover?",
    a: "An AI label remover is a metadata cleaner that strips file-level provenance records such as C2PA content credentials, XMP generator tags, IPTC attribution, EXIF software fields and video container tags. Platforms may use those records when applying AI disclosures. AI Label Remover cleans supported photos and videos entirely in your browser, with no account and no upload.",
  },
  {
    q: "How do I remove the AI label from a photo before posting on Instagram?",
    a: "Drop the image into the tool, let it strip the file metadata, download the cleaned copy, and upload that copy instead of the original. Default JPG, PNG and WebP cleaning does not recompress the image. This removes file-level provenance such as C2PA and XMP, but cannot guarantee Instagram’s result because platforms may use additional signals.",
  },
  {
    q: "Why does Instagram say “AI info” on my real photo?",
    a: "One possible reason is that an editing step wrote AI provenance metadata into the file, not that the whole picture was judged synthetic. Tools such as Photoshop Generative Fill or other AI-assisted editors may embed C2PA or XMP markers that platforms can inspect. Classifiers, watermarks and platform-side history can also affect labels.",
  },
  {
    q: "Are my images uploaded to a server?",
    a: "No. Every step — inspection, lossless metadata removal, remuxing and download — runs in your own browser using native file APIs and WebAssembly. Your photos and videos never leave your device, there is no server-side queue, and nothing is stored or logged. After the FFmpeg engine has loaded, processing needs no upload connection.",
  },
  {
    q: "Which image metadata does AI Label Remover strip?",
    a: "The cleaner removes C2PA content credentials, XMP packets (prompts, seeds and generator names), IPTC attribution fields, EXIF including GPS, serial numbers and timestamps, JPEG comments, and PNG text chunks written by Stable Diffusion or ComfyUI. In Auto mode it preserves the original JPG, PNG or WebP encoded image data.",
  },
  {
    q: "Which AI generators does it work with?",
    a: "Every generator that writes metadata: Midjourney, DALL·E and ChatGPT Image, Google Gemini and Imagen, Adobe Firefly, Photoshop Generative Fill, Stable Diffusion, ComfyUI, Leonardo AI, Ideogram, Runway ML, Grok, Meta AI, Canva and CapCut. The cleaning step is format-level, so a generator does not need to be on that list for its metadata to be removed.",
  },
  {
    q: "Can it remove an invisible watermark like SynthID?",
    a: "No, and no metadata tool can promise that. Invisible watermarks may be encoded into image pixels, video frames or audio rather than file metadata, so they can survive re-encoding. The same applies to AI classifiers, which judge the content rather than the container. This tool addresses file-level metadata triggers only.",
  },
  {
    q: "Will cleaning reduce my image quality?",
    a: "No. JPG, PNG and WebP metadata is removed without recompressing the encoded image, so pixels, dimensions and visual quality remain unchanged. AVIF and HEIC fall back to a lossless PNG export.",
  },
  {
    q: "Can it remove a label from a post that is already live?",
    a: "No. Once a platform has attached a label to a published post, that label lives in the platform’s records, not in your file. Some platforms let you appeal or remove the label from the post’s settings; otherwise the reliable route is to delete the post and re-upload the cleaned file. This tool is for upload preparation.",
  },
  {
    q: "Is it legal to remove AI metadata from my images?",
    a: "Laws vary by location and context, but cleaning metadata from files you own is commonly allowed. It does not remove disclosure, contract or platform-policy obligations: where rules require you to declare AI involvement, you must still do so. Use the tool for privacy and false-positive troubleshooting, not to misrepresent synthetic media.",
  },
  {
    q: "What file formats and sizes are supported?",
    a: "Images support JPG, PNG, WebP, AVIF and HEIC up to 15MB each. Videos support MP4, MOV, M4V and WebM up to 200MB each. MP4, MOV and M4V produce MP4; WebM stays WebM. Up to 30 mixed files can be queued, although video remuxing runs sequentially. Animated GIF is not supported.",
  },
  {
    q: "How does video metadata cleaning work?",
    a: "The browser loads a local WebAssembly build of FFmpeg and losslessly remuxes the primary video and optional audio stream into a clean container. Source metadata, chapters, attached thumbnails and non-primary streams are not copied, while the encoded video and audio are stream-copied without recompression. The video itself is never uploaded.",
  },
  {
    q: "Will cleaning a video guarantee that its AI label disappears?",
    a: "No. Video cleaning removes file-level metadata and provenance carried by the source container and streams, but a platform can still use invisible watermarks, content classifiers, perceptual matching, account history or an existing post record. The tool therefore reports metadata cleaning, not a guaranteed platform outcome.",
  },
];

export const removedItems = [
  {
    title: "C2PA content credentials",
    body: "A signed provenance manifest that tools such as Firefly, ChatGPT Image, Gemini and Photoshop may embed for machine-readable creation and edit history.",
  },
  {
    title: "XMP packets",
    body: "Generator names, prompts, seeds, sampler settings and edit history, including the digitalSourceType tag that declares an image as trainedAlgorithmicMedia.",
  },
  {
    title: "EXIF & GPS",
    body: "Camera make and model, lens, software field, device serial numbers, capture timestamps and the GPS coordinates that can point at your home address.",
  },
  {
    title: "IPTC attribution",
    body: "The Adobe and agency attribution fields that carry credit, source and AI-disclosure strings alongside copyright data.",
  },
  {
    title: "PNG text chunks",
    body: "tEXt, iTXt and zTXt chunks in which Stable Diffusion, Automatic1111, Forge and ComfyUI store the full generation workflow.",
  },
  {
    title: "Video container metadata",
    body: "Lossless video remuxing leaves source tags, chapters, attached thumbnails, extra streams and container provenance records behind without recompressing video or audio.",
  },
];

export const steps = [
  {
    title: "Drop your media",
    body: "The photo or video is read into browser memory with the File API. Its contents are not sent to an upload endpoint.",
  },
  {
    title: "Inspect what is inside",
    body: "Images are inspected on the spot for C2PA, XMP, EXIF, IPTC and PNG-chunk records. Videos begin a local WebAssembly remuxing job.",
  },
  {
    title: "Clean without quality loss",
    body: "JPG, PNG and WebP metadata is stripped without recompression. Video and audio streams are copied into a clean container without re-encoding.",
  },
  {
    title: "Download and post",
    body: "You get a cleaned image or video download with original visual and audio quality. File-level metadata is removed, but watermarks and classifier signals may remain.",
  },
];
