# @rocketium/auto-adapt

Layout adaptation engine for auto-sizing canvas elements across different dimensions. Ports the proven frontend auto-adapt algorithm to a reusable package for use in both client and server environments.

## Overview

`@rocketium/auto-adapt` intelligently adapts canvas layouts from one size to another. Given a set of canvas elements (text, images, shapes, groups, SVGs) designed for one dimension, it produces a proportionally adapted layout for a target dimension while preserving alignment, edge-snapping, and visual hierarchy.

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
