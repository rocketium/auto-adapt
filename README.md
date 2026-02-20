# @rocketium/auto-adapt

Layout adaptation engine for auto-sizing canvas elements across different dimensions. Ports the proven frontend auto-adapt algorithm to a reusable package for use in both client and server environments.

## Overview

`@rocketium/auto-adapt` intelligently adapts canvas layouts from one size to another. Given a set of canvas elements (text, images, shapes, groups, SVGs) designed for one dimension, it produces a proportionally adapted layout for a target dimension while preserving alignment, edge-snapping, and visual hierarchy.

### Key Features

- **Closest-size matching** -- finds the best reference size from available sizes using aspect-ratio + Euclidean distance scoring
- **Smart skew detection** -- decides whether to stretch (skew) or proportionally scale each element based on its canvas coverage
- **Per-element-type adaptation** -- specialized handling for text (font sizes, word styles, autofit), images (crop offsets, scale), shapes (SVG, rounded-rect, path), and groups (recursive child adaptation)
- **Edge-aware positioning** -- preserves alignment to canvas edges and centering
- **Override system** -- stores adapted layouts as per-size overrides on the original objects, keeping the base variant untouched

## Installation

```bash
npm install @rocketium/auto-adapt
```

**For local development** (before publishing):

```bash
npm install ../auto-adapt
```

### Peer Dependencies

| Package | Version | Required |
|---------|---------|----------|
| `@types/fabric` | `^5.3.9` | Optional (compile-time only) |

The package uses `@types/fabric` for canvas element type definitions. If you're consuming typed APIs, ensure it's installed as a devDependency.

## Quick Start

```typescript
import { generateBaseLayoutForSize } from '@rocketium/auto-adapt';

const newCapsule = generateBaseLayoutForSize({
  originalCapsule,       // ServerCapsule with existing sizes and objects
  capsuleId: 'abc123',
  creativeId: null,      // null = auto-detect best reference size
  sizeId: 'new-size-id',
  sizeToGenerate: '300x250',
  sizeName: 'Medium Rectangle',
  sizeCategory: 'Display',
});
```

## API Reference

### `generateBaseLayoutForSize(params)`

Main entry point. Generates a complete adapted capsule for a target size.

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `originalCapsule` | `ServerCapsule` | Source capsule with canvas data, sizes, and objects |
| `capsuleId` | `string` | ID of the capsule being adapted |
| `creativeId` | `string \| null` | Reference size ID to adapt from. Pass `null` to auto-detect the closest match |
| `sizeId` | `string` | ID for the new size entry |
| `sizeToGenerate` | `string` | Target dimensions as `"WIDTHxHEIGHT"` (e.g. `"1080x1080"`) |
| `sizeName` | `string?` | Display name for the new size |
| `sizeCategory` | `string?` | Category label for the new size |

**Returns:** `ServerCapsule` -- a deep copy of the original capsule with the new size added, objects adapted as overrides, and metadata updated.

---

### `getAdaptedObjectsJSON(params)`

Core adaptation algorithm. Adapts a flat record of canvas elements from one size to another.

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `adaptSize` | `string` | Target dimensions (`"WIDTHxHEIGHT"`) |
| `objects` | `Record<string, CanvasElementJSON>` | Source elements keyed by ID |
| `closestSize` | `string` | Reference dimensions (`"WIDTHxHEIGHT"`) |

**Returns:** `Record<string, CanvasElementJSON>` -- adapted elements.

---

### `findClosestSizeWithMatches(params)`

Finds the closest matching size from a list, with match-quality scores.

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `availableSizes` | `string[]` | Array of dimension strings |
| `adaptSize` | `string` | Target dimension string |

**Returns:** `{ closestSize: string; sortedMatches: Record<string, number> }` -- best match and percentage scores for all sizes.

---

### `findBestReferenceSize(availableSizes, targetSize)`

Finds the best reference size ID from a sizes record.

**Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `availableSizes` | `Record<string, { width: number; height: number }>` | Available sizes keyed by ID |
| `targetSize` | `string` | Target dimension string |

**Returns:** `string` -- the key of the best matching size.

---

### Utility Exports

| Function | Description |
|----------|-------------|
| `resolveObjectsForSize(objects, sizeId)` | Flatten overrides for a specific size into base objects |
| `applyAdaptedAsOverrides(originals, adapted, sizeId)` | Store adapted objects as overrides on originals |
| `getNormalizedSizeValue(sizeValue)` | Normalize named sizes (`"square"` -> `"720x720"`) |
| `getEuclideanDistanceBetweenSizes({ size1, size2 })` | Distance between two size strings |

### Type Guard Exports

| Function | Checks for |
|----------|------------|
| `isTextJSON(object)` | `TextContainerJSON` |
| `isImageJSON(object)` | `ImageContainerJSON` |
| `isShapeJSON(object)` | `PathJSON \| RoundedRectJSON \| SvgJSON` |
| `isSVGContainerJSON(object)` | `SvgJSON` |
| `isRoundedRectJSON(object)` | `RoundedRectJSON` |
| `isGroupJSON(object)` | `GroupContainerJSON` |
| `isCreativeBoxJSON(object)` | Creative box elements |
| `isAudioJSON(object)` | Audio elements |

## Algorithm

### Size Matching

Uses a weighted scoring system combining:
- **Aspect ratio similarity** (90% weight) -- prefers sizes with matching proportions
- **Euclidean distance** (10% weight) -- tiebreaks with absolute dimension proximity

### Element Adaptation

For each element, the algorithm decides between two paths:

1. **Skew path** -- stretches the element to fill proportionally. Used when:
   - Element covers >90% of the canvas area
   - Element spans the full width or full height of the canvas
   - Groups are excluded from skewing

2. **Non-skew path** -- proportionally scales while preserving position. Uses:
   - Edge alignment detection (snaps to nearest edge within 1px threshold)
   - Horizontal centering detection (area-based left/right balance)
   - Quadrant-based positioning for non-centered, non-edge-aligned elements

### Per-Type Handling

| Type | Special Handling |
|------|-----------------|
| **Text** | Scales fontSize, wordStyle font sizes (px only), autoFitSizes, padding, wordSpacing |
| **Image** | Scales imageScale, imageLeft/imageTop offsets, cornerRadius |
| **SVG** | Same as image + colorMap passthrough |
| **RoundedRect** | Scales cornerRadius |
| **Path/Shape** | Scales scaleX/scaleY instead of width/height |
| **Group** | Recursively adapts all children with group-relative scaling |
| **CreativeBox** | Resized to target dimensions (canvas background) |
| **Audio** | Passed through unchanged |

## Project Structure

```
src/
├── index.ts               # Public API exports
├── adapter.ts             # Core adapt logic + entry function
├── constants.ts           # Thresholds and defaults
├── types/
│   ├── index.ts           # Type barrel exports
│   ├── canvas.ts          # Canvas element type definitions
│   └── capsule.ts         # ServerCapsule type
└── utils/
    ├── sizeMatching.ts    # Size comparison and closest-match algorithms
    ├── scaling.ts         # Element scaling, border, padding helpers
    └── typeGuards.ts      # Runtime type guards for canvas elements
```

## Development

```bash
# Install dependencies
npm install

# Type check
npm run typecheck

# Build (CJS + ESM + .d.ts)
npm run build

# Lint
npm run lint

# Format
npm run format
```

For local linking: `npm install ../auto-adapt` from a consumer project.

## License

MIT
