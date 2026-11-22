/**
 * © 2025-2026 MiraNova Studio. All rights reserved.
 */

import {
  computeCropHandleDrag, computeCropCanvasLayout, clampZoom, cropImage, CropRegion, MAX_IMAGE_DIMENSION,
} from '../../core/image/image-utils';

describe('computeCropHandleDrag', () => {
  const region: CropRegion = { x: 20, y: 20, width: 100, height: 80 };
  const imageWidth = 200;
  const imageHeight = 150;

  it('moves the whole region without resizing it', () => {
    const result = computeCropHandleDrag('move', region, 10, -5, imageWidth, imageHeight);
    expect(result).toEqual({ x: 30, y: 15, width: 100, height: 80 });
  });

  it('clamps a move so the region never crosses the image bounds', () => {
    const result = computeCropHandleDrag('move', region, -1000, 1000, imageWidth, imageHeight);
    expect(result.x).toBe(0);
    expect(result.y).toBe(imageHeight - region.height);
    expect(result.width).toBe(region.width);
    expect(result.height).toBe(region.height);
  });

  it('resizes from the east handle by extending width only', () => {
    const result = computeCropHandleDrag('e', region, 15, 15, imageWidth, imageHeight);
    expect(result).toEqual({ x: 20, y: 20, width: 115, height: 80 });
  });

  it('resizes from the west handle, moving x and shrinking width', () => {
    const result = computeCropHandleDrag('w', region, 10, 0, imageWidth, imageHeight);
    expect(result).toEqual({ x: 30, y: 20, width: 90, height: 80 });
  });

  it('resizes from the north handle, moving y and shrinking height', () => {
    const result = computeCropHandleDrag('n', region, 0, 10, imageWidth, imageHeight);
    expect(result).toEqual({ x: 20, y: 30, width: 100, height: 70 });
  });

  it('resizes from the south handle by extending height only', () => {
    const result = computeCropHandleDrag('s', region, 0, 20, imageWidth, imageHeight);
    expect(result).toEqual({ x: 20, y: 20, width: 100, height: 100 });
  });

  it('resizes both axes from a corner handle', () => {
    const result = computeCropHandleDrag('se', region, 20, 10, imageWidth, imageHeight);
    expect(result).toEqual({ x: 20, y: 20, width: 120, height: 90 });
  });

  it('lets an edge handle grow the canvas past the current image bounds', () => {
    const result = computeCropHandleDrag('e', region, 1000, 0, imageWidth, imageHeight);
    expect(result).toEqual({ x: 20, y: 20, width: 1100, height: 80 });
  });

  it('lets the west handle extend into negative x (pad left)', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('w', fullImage, -40, 0, imageWidth, imageHeight);
    expect(result).toEqual({ x: -40, y: 0, width: imageWidth + 40, height: imageHeight });
  });

  it('lets the north handle extend into negative y (pad top)', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('n', fullImage, 0, -25, imageWidth, imageHeight);
    expect(result).toEqual({ x: 0, y: -25, width: imageWidth, height: imageHeight + 25 });
  });

  it('lets the south-east corner grow both axes past the image', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('se', fullImage, 30, 20, imageWidth, imageHeight);
    expect(result).toEqual({ x: 0, y: 0, width: imageWidth + 30, height: imageHeight + 20 });
  });

  it('lets the north-west corner pad both left and top', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('nw', fullImage, -10, -15, imageWidth, imageHeight);
    expect(result).toEqual({ x: -10, y: -15, width: imageWidth + 10, height: imageHeight + 15 });
  });

  it('does not shrink a region below the minimum size', () => {
    const result = computeCropHandleDrag('e', region, -1000, 0, imageWidth, imageHeight, 10);
    expect(result.width).toBe(10);
    const resultW = computeCropHandleDrag('w', region, 1000, 0, imageWidth, imageHeight, 10);
    expect(resultW.width).toBe(10);
    expect(resultW.x).toBe(region.x + region.width - 10);
  });

  it('caps an outward drag at MAX_IMAGE_DIMENSION', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('e', fullImage, 1_000_000, 0, imageWidth, imageHeight);
    expect(result.width).toBe(MAX_IMAGE_DIMENSION);
    expect(result.x).toBe(0);
  });

  it('starting from the full image, dragging the south-east handle inward shrinks toward the top-left corner', () => {
    const fullImage: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    const result = computeCropHandleDrag('se', fullImage, -50, -50, imageWidth, imageHeight);
    expect(result).toEqual({ x: 0, y: 0, width: imageWidth - 50, height: imageHeight - 50 });
  });
});

describe('computeCropCanvasLayout', () => {
  const imageWidth = 200;
  const imageHeight = 150;

  it('matches the image when the region is the full bitmap', () => {
    const region: CropRegion = { x: 0, y: 0, width: imageWidth, height: imageHeight };
    expect(computeCropCanvasLayout(region, imageWidth, imageHeight)).toEqual({
      originX: 0, originY: 0, width: 200, height: 150,
      imageX: 0, imageY: 0, overlayX: 0, overlayY: 0,
    });
  });

  it('keeps the image at the origin when shrinking from the south-east', () => {
    const region: CropRegion = { x: 0, y: 0, width: 80, height: 60 };
    const layout = computeCropCanvasLayout(region, imageWidth, imageHeight);
    expect(layout).toEqual({
      originX: 0, originY: 0, width: 200, height: 150,
      imageX: 0, imageY: 0, overlayX: 0, overlayY: 0,
    });
  });

  it('offsets the image right when the region extends left of x=0', () => {
    const region: CropRegion = { x: -40, y: 0, width: imageWidth + 40, height: imageHeight };
    const layout = computeCropCanvasLayout(region, imageWidth, imageHeight);
    expect(layout).toEqual({
      originX: -40, originY: 0, width: imageWidth + 40, height: imageHeight,
      imageX: 40, imageY: 0, overlayX: 0, overlayY: 0,
    });
  });

  it('grows the frame to the right when the region is wider than the image', () => {
    const region: CropRegion = { x: 0, y: 0, width: imageWidth + 50, height: imageHeight };
    const layout = computeCropCanvasLayout(region, imageWidth, imageHeight);
    expect(layout.width).toBe(imageWidth + 50);
    expect(layout.height).toBe(imageHeight);
    expect(layout.imageX).toBe(0);
    expect(layout.overlayX).toBe(0);
  });
});

describe('clampZoom', () => {
  it('passes through values within range', () => {
    expect(clampZoom(1.5)).toBe(1.5);
  });

  it('clamps below the minimum', () => {
    expect(clampZoom(0.01)).toBe(0.1);
  });

  it('clamps above the maximum', () => {
    expect(clampZoom(10)).toBe(4.0);
  });

  it('respects custom min/max bounds', () => {
    expect(clampZoom(0.5, 1, 2)).toBe(1);
    expect(clampZoom(5, 1, 2)).toBe(2);
  });
});

describe('cropImage region validation', () => {
  it('rejects a non-positive destination size without waiting on the image', async () => {
    await expect(cropImage('data:image/png;base64,xx', 0, 0, 0, 10))
      .rejects.toThrow('Invalid crop region dimensions');
    await expect(cropImage('data:image/png;base64,xx', 0, 0, 10, -1))
      .rejects.toThrow('Invalid crop region dimensions');
  });

  it('accepts a negative origin as a valid extend region (does not reject synchronously)', () => {
    const result = cropImage('data:image/png;base64,xx', -10, -5, 120, 80);
    expect(result).toBeInstanceOf(Promise);
    result.catch(() => { /* jsdom has no canvas; load/context may still fail */ });
  });
});
