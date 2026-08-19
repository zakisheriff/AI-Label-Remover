export type Faq = { q: string; a: string };

/** Answer-engine friendly: every answer opens with a direct, quotable sentence. */
export const faqs: Faq[] = [
  {
    q: "What is an AI label remover?",
    a: "An AI label remover is a tool that strips the provenance metadata inside an image file — C2PA content credentials, XMP generator tags, IPTC attribution, EXIF software fields and PNG text chunks. Those records are what Instagram, Facebook, TikTok and Pinterest read on upload before attaching an “AI info” or “Made with AI” badge. AI Label Remover does this entirely in your browser, with no account and no upload.",
  },
  {
    q: "How do I remove the AI label from a photo before posting on Instagram?",
    a: "Drop the image into the tool on this page, let it re-encode the file, download the cleaned copy, and upload that copy instead of the original. Instagram reads file-level provenance metadata at upload time, so a file that no longer carries C2PA or XMP AI tags no longer gives the automatic labeller anything to match on.",
  },
  {
    q: "Why does Instagram say “AI info” on my real photo?",
    a: "Because an editing step wrote AI provenance metadata into the file, not because the whole picture was judged synthetic. Photoshop Generative Fill, Lightroom AI Denoise, AI background removal, AI sky replacement and CapCut exports all embed C2PA or XMP markers, and Meta’s automatic system labels any upload that carries them. This is the most common false positive creators run into.",
  },
  {
    q: "Are my images uploaded to a server?",
    a: "No. Every step — inspection, decoding, re-encoding and download — runs in your own browser using the File and Canvas APIs. Your photos never leave your device, there is no queue, and nothing is stored or logged. You can disconnect from the internet after the page loads and the tool still works.",
  },
  {
    q: "Which metadata does AI Label Remover strip?",
    a: "All of it. Re-encoding produces a brand-new file containing only pixels, which removes C2PA content credentials, XMP packets (prompts, seeds, generator names), IPTC attribution fields, the full EXIF block including GPS coordinates, device serial numbers and timestamps, JPEG comment segments, and PNG tEXt, iTXt and zTXt chunks written by Stable Diffusion or ComfyUI.",
  },
  {
    q: "Which AI generators does it work with?",
    a: "Every generator that writes metadata: Midjourney, DALL·E and ChatGPT Image, Google Gemini and Imagen, Adobe Firefly, Photoshop Generative Fill, Stable Diffusion, ComfyUI, Leonardo AI, Ideogram, Runway ML, Grok, Meta AI, Canva and CapCut. The cleaning step is format-level, so a generator does not need to be on that list for its metadata to be removed.",
  },
  {
    q: "Can it remove an invisible watermark like SynthID?",
    a: "No, and no metadata tool can. SynthID and similar watermarks are encoded into the pixels themselves rather than into the file’s metadata, so they survive re-encoding. The same applies to visual AI classifiers, which judge the picture rather than the file. This tool addresses the metadata trigger only.",
  },
  {
    q: "Will cleaning reduce my image quality?",
    a: "Not visibly. Images are re-encoded at 92% quality by default, which is above the point where JPEG artefacts become noticeable, and you can raise it to 100% or choose lossless PNG output. Dimensions are always preserved exactly.",
  },
  {
    q: "What does the “reset fingerprint” option do?",
    a: "It shifts a scattered subset of pixel values by ±1 RGB, which is invisible to the eye but changes the perceptual hash of the file. Platforms and reverse-image search use that hash to match a new upload against copies of the same image seen before, so resetting it stops a cleaned file being linked back to an earlier labelled version.",
  },
  {
    q: "Can it remove a label from a post that is already live?",
    a: "No. Once a platform has attached a label to a published post, that label lives in the platform’s records, not in your file. Some platforms let you appeal or remove the label from the post’s settings; otherwise the reliable route is to delete the post and re-upload the cleaned file. This tool is for upload preparation.",
  },
  {
    q: "Is it legal to remove AI metadata from my images?",
    a: "Removing metadata from files you own is legal in general, and is the same operation every social platform already performs on your uploads. What it does not do is remove your disclosure obligations: where a platform’s terms or a regulation such as the EU AI Act requires you to declare AI-generated content, you must still declare it. Use this to fix false positives and protect privacy, not to misrepresent synthetic media.",
  },
  {
    q: "What file formats and sizes are supported?",
    a: "JPG, PNG, WebP, AVIF and HEIC, up to 15MB per file, in batches of up to 30 images. AVIF and HEIC sources are exported as PNG or JPEG because browsers decode those formats but do not encode them. Animated GIF is not supported.",
  },
];

export const removedItems = [
  {
    title: "C2PA content credentials",
    body: "The signed provenance manifest written by Firefly, ChatGPT Image, Gemini and Photoshop. This is the single record Meta’s automatic labeller trusts most.",
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
    title: "Perceptual fingerprint",
    body: "Optional ±1 RGB dithering changes the hash used to match your upload against earlier copies of the same image across the web.",
  },
];

export const steps = [
  {
    title: "Drop your image",
    body: "The file is read into browser memory with the File API. No network request is made — you can watch the network tab stay empty.",
  },
  {
    title: "Inspect what is inside",
    body: "The file’s container is parsed on the spot to list every C2PA, XMP, EXIF, IPTC and PNG-chunk record it carries, and to name the generator that wrote them.",
  },
  {
    title: "Decode and re-encode",
    body: "The picture is decoded to raw pixels and encoded into a brand-new file. Metadata cannot survive that round trip, so every hidden record is gone in one pass.",
  },
  {
    title: "Download and post",
    body: "You get a clean file with identical dimensions, optionally with a reset fingerprint and placeholder camera EXIF, ready to upload anywhere.",
  },
];
