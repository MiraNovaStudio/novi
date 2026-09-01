# Changelog — 2026-09-01 07:42

## Ad hoc: Image editor canvas extend (crop handles grow the canvas)

### Summary
The image editor's crop squares could only shrink the bitmap. Dragging a
handle outward now extends the canvas; new pixels are fully transparent and
existing alpha is copied unchanged (Paint-style canvas resize).

### Files Changed

| File | Change |
|------|--------|
| `src/core/image/image-utils.ts` | `computeCropHandleDrag` no longer clamps resize to the current image; `cropImage` accepts regions outside the source and draws onto a transparent PNG canvas; added `computeCropCanvasLayout` + `MAX_IMAGE_DIMENSION` |
| `src/renderer/components/ImageEditor.ts` | Live preview grows the frame (and offsets the image when padding left/top); checkerboard in the new padding |
| `src/tests/core-0.8.0/image-editor-zoom-crop.test.ts` | Extend-direction math, layout helper, cropImage validation |
| `src/tests/core-0.8.0/image-editor-crop-handles.test.ts` | Outward east/west/north handle drags commit an extended canvas |

### Rationale
Handles were documented as mspaint canvas-resize but the math and `cropImage`
rejected anything past the current bounds (`x < 0` or region larger than the
source). Extending is the missing half of that interaction; filling with
transparency (not white) keeps PNG/WebP/AVIF alpha intact.

### Test Results
- `npm test`: 64 suites, 968 tests, 100% pass.

### Commit
TBD
