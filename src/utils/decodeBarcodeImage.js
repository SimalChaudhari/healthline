import { Platform } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { scanFromURLAsync } from 'expo-camera';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'];

const ZXING_HINTS = new Map([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.CODE_128,
      BarcodeFormat.QR_CODE,
    ],
  ],
  [DecodeHintType.TRY_HARDER, true],
]);

function cleanBarcodeData(raw) {
  const text = String(raw || '').trim();
  const digits = text.replace(/\D/g, '');
  return digits || text;
}

function loadWebImage(uri) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = uri;
  });
}

function boostContrast(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    const gray = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const v = gray > 140 ? 255 : 0;
    px[i] = v;
    px[i + 1] = v;
    px[i + 2] = v;
  }
  ctx.putImageData(data, 0, 0);
}

function drawToCanvas(img, { cropRatio = 1, invert = false, maxEdge = 2400, contrast = false } = {}) {
  const longest = Math.max(img.naturalWidth, img.naturalHeight, 1);
  const scale = maxEdge / longest;
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, 0, 0, w, h);

  if (cropRatio < 1) {
    const cw = Math.max(1, Math.round(w * cropRatio));
    const ch = Math.max(1, Math.round(h * cropRatio));
    const cx = Math.round((w - cw) / 2);
    const cy = Math.round((h - ch) / 2);
    const crop = document.createElement('canvas');
    crop.width = cw;
    crop.height = ch;
    const cctx = crop.getContext('2d');
    cctx.imageSmoothingEnabled = false;
    cctx.drawImage(canvas, cx, cy, cw, ch, 0, 0, cw, ch);
    if (contrast) boostContrast(cctx, cw, ch);
    if (invert) invertCanvas(cctx, cw, ch);
    return crop;
  }

  if (contrast) boostContrast(ctx, w, h);
  if (invert) invertCanvas(ctx, w, h);
  return canvas;
}

function invertCanvas(ctx, w, h) {
  const data = ctx.getImageData(0, 0, w, h);
  const px = data.data;
  for (let i = 0; i < px.length; i += 4) {
    px[i] = 255 - px[i];
    px[i + 1] = 255 - px[i + 1];
    px[i + 2] = 255 - px[i + 2];
  }
  ctx.putImageData(data, 0, 0);
}

function sliceCanvasHorizontal(canvas, strips = 10) {
  const slices = [];
  const h = canvas.height;
  const stripH = Math.max(32, Math.round(h / Math.max(3, strips - 2)));

  for (let i = 0; i < strips; i += 1) {
    const y = Math.min(Math.round(i * (h - stripH) / Math.max(1, strips - 1)), h - stripH);
    const slice = document.createElement('canvas');
    slice.width = canvas.width;
    slice.height = stripH;
    const ctx = slice.getContext('2d');
    ctx.drawImage(canvas, 0, y, canvas.width, stripH, 0, 0, canvas.width, stripH);
    slices.push(slice);
  }

  return slices;
}

async function detectWebBarcodeDetector(source) {
  if (typeof globalThis.BarcodeDetector !== 'function') return null;

  const detector = new globalThis.BarcodeDetector({
    formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'],
  });

  try {
    const results = await detector.detect(source);
    const raw = results?.[0]?.rawValue;
    if (raw) return cleanBarcodeData(raw);
  } catch {
    /* try next strategy */
  }

  return null;
}

async function tryZxingOnWebSource(reader, source) {
  try {
    if (source instanceof HTMLCanvasElement) {
      const result = await reader.decodeFromCanvas(source);
      const text = result?.getText?.();
      if (text) return cleanBarcodeData(text);
      return null;
    }

    if (source instanceof HTMLImageElement) {
      const result = await reader.decodeFromImageElement(source);
      const text = result?.getText?.();
      if (text) return cleanBarcodeData(text);
      return null;
    }

    if (typeof source === 'string') {
      const result = await reader.decodeFromImageUrl(source);
      const text = result?.getText?.();
      if (text) return cleanBarcodeData(text);
    }
  } catch {
    /* try next strategy */
  }

  return null;
}

async function decodeWebUri(uri) {
  const img = await loadWebImage(uri);
  const reader = new BrowserMultiFormatReader(ZXING_HINTS);

  const canvasVariants = [
    drawToCanvas(img, { cropRatio: 1, maxEdge: 3200 }),
    drawToCanvas(img, { cropRatio: 1, maxEdge: 3200, contrast: true }),
    drawToCanvas(img, { cropRatio: 0.95 }),
    drawToCanvas(img, { cropRatio: 0.85, contrast: true }),
    drawToCanvas(img, { cropRatio: 0.7 }),
    drawToCanvas(img, { cropRatio: 0.95, invert: true }),
    drawToCanvas(img, { cropRatio: 1, maxEdge: 4800, contrast: true }),
  ];

  const sources = [uri, img, ...canvasVariants];

  for (const source of sources) {
    const nativeHit = await detectWebBarcodeDetector(source);
    if (nativeHit) return nativeHit;
  }

  for (const source of sources) {
    const zxingHit = await tryZxingOnWebSource(reader, source);
    if (zxingHit) return zxingHit;
  }

  for (const canvas of canvasVariants) {
    for (const slice of sliceCanvasHorizontal(canvas)) {
      const nativeHit = await detectWebBarcodeDetector(slice);
      if (nativeHit) return nativeHit;

      const zxingHit = await tryZxingOnWebSource(reader, slice);
      if (zxingHit) return zxingHit;
    }
  }

  return null;
}

async function buildManipulatedCandidates(uri) {
  const uris = [uri];

  for (const width of [1600, 2400, 3200, 4800]) {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width } }],
        { format: ImageManipulator.SaveFormat.PNG, compress: 1 },
      );
      if (result?.uri && !uris.includes(result.uri)) uris.push(result.uri);
    } catch {
      /* skip resize variant */
    }
  }

  return uris;
}

async function decodeNativeUri(uri) {
  const candidates = await buildManipulatedCandidates(uri);

  for (const candidate of candidates) {
    try {
      const results = await scanFromURLAsync(candidate, BARCODE_TYPES);
      const hit = results?.find((r) => r?.data);
      if (hit?.data) return cleanBarcodeData(hit.data);
    } catch {
      /* try next candidate */
    }
  }

  return null;
}

export async function decodeBarcodeFromImageUri(uri) {
  if (!uri) throw new Error('No image selected');

  let data = null;

  if (Platform.OS === 'web') {
    data = await decodeWebUri(uri);
    if (!data) {
      const candidates = await buildManipulatedCandidates(uri);
      for (const candidate of candidates) {
        if (candidate === uri) continue;
        data = await decodeWebUri(candidate);
        if (data) break;
      }
    }
  } else {
    data = await decodeNativeUri(uri);
  }

  if (!data) {
    throw new Error(
      'No barcode found. Upload a clear photo with the black bars centered, straight, and in focus — crop tight to the barcode if needed.',
    );
  }

  return { data, type: 'unknown' };
}
