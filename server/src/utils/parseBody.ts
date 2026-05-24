/** Normalize multipart/form fields from multer */
export function parseFormBody(body: Record<string, unknown>): Record<string, unknown> {
  const result = { ...body };

  if (result.isOpen !== undefined) {
    result.isOpen = result.isOpen === 'true' || result.isOpen === true;
  }
  if (result.isAvailable !== undefined) {
    result.isAvailable = result.isAvailable === 'true' || result.isAvailable === true;
  }
  if (result.isPopular !== undefined) {
    result.isPopular = result.isPopular === 'true' || result.isPopular === true;
  }
  if (result.deliveryTime !== undefined) {
    result.deliveryTime = Number(result.deliveryTime);
  }
  if (result.minimumOrder !== undefined) {
    result.minimumOrder = Number(result.minimumOrder);
  }
  if (result.deliveryFee !== undefined) {
    result.deliveryFee = Number(result.deliveryFee);
  }
  if (result.price !== undefined) {
    result.price = Number(result.price);
  }
  if (result.rating !== undefined) {
    result.rating = Number(result.rating);
  }

  // cuisine[] or comma-separated cuisine string
  if (result.cuisine) {
    if (Array.isArray(result.cuisine)) {
      result.cuisine = result.cuisine;
    } else if (typeof result.cuisine === 'string') {
      result.cuisine = result.cuisine.split(',').map((s) => s.trim()).filter(Boolean);
    }
  } else if (body['cuisine[]']) {
    result.cuisine = Array.isArray(body['cuisine[]'])
      ? body['cuisine[]']
      : [body['cuisine[]']];
  }

  if (result.tags && typeof result.tags === 'string') {
    result.tags = result.tags.split(',').map((s) => s.trim()).filter(Boolean);
  }

  return result;
}
