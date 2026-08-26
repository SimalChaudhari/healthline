import * as ImageManipulator from 'expo-image-manipulator';

const MAX_EDGE = 1280;
const QUALITY = 0.72;
/** ~900KB raw ≈ safer for OpenRouter free vision models */
const MAX_BASE64_CHARS = 1_200_000;

/**
 * Resize + JPEG-compress a camera/gallery photo and return base64 for AI vision.
 * Fixes common failures: missing base64, huge payloads, HEIC/PNG quirks.
 */
export async function prepareMealImage(uri) {
  if (!uri) {
    throw new Error('No image to process');
  }

  let result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_EDGE } }],
    {
      compress: QUALITY,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: true,
    },
  );

  if (!result.base64) {
    throw new Error('Could not read image data. Try another photo.');
  }

  if (result.base64.length > MAX_BASE64_CHARS) {
    result = await ImageManipulator.manipulateAsync(
      result.uri || uri,
      [{ resize: { width: 960 } }],
      {
        compress: 0.55,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      },
    );
  }

  if (!result.base64) {
    throw new Error('Could not compress image for AI. Try a clearer photo.');
  }

  return {
    uri: result.uri,
    base64: stripDataUrlPrefix(result.base64),
    mimeType: 'image/jpeg',
  };
}

export function stripDataUrlPrefix(base64 = '') {
  const raw = String(base64).trim();
  const marker = 'base64,';
  const idx = raw.indexOf(marker);
  if (idx >= 0) return raw.slice(idx + marker.length);
  return raw;
}
