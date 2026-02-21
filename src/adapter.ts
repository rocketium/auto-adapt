import type { CanvasElementJSON, CanvasElementWithOverrides } from './types/canvas';
import type { ServerCapsule } from './types/capsule';
import { findBestReferenceSize } from './utils/sizeMatching';
import {
	isTextJSON,
	isImageJSON,
	isVideoJSON,
	isShapeJSON,
	isSVGContainerJSON,
	isRoundedRectJSON,
	isGroupJSON,
	isCreativeBoxJSON,
	isAudioJSON,
} from './utils/typeGuards';
import {
	num,
	getAreaPercentageOfElementOnCanvasJSON,
	checkIfElementShouldBeSkewed,
	getValuesWithoutSkewingJSON,
	getScaledBorderJSON,
	adaptTextNoSkew,
	adaptImageNoSkew,
	adaptSvgNoSkew,
	adaptRoundedRectNoSkew,
	adaptShapeNoSkew,
	adaptTextSkew,
	adaptImageSkew,
	adaptSvgSkew,
	adaptRoundedRectSkew,
	adaptShapeSkew,
	adaptGroupChildText,
	adaptGroupChildImage,
	adaptGroupChildSvg,
	adaptGroupChildRoundedRect,
	adaptGroupChildShape,
} from './utils/scaling';

// ============================================================================
// Core Adapt Function (ported from frontend getAdaptedObjectsJSON)
// Adapts canvas elements from reference size to target size with skew/non-skew paths
// ============================================================================

export const getAdaptedObjectsJSON = ({
	adaptSize,
	objects,
	closestSize,
}: {
	adaptSize: string;
	objects: Record<string, CanvasElementJSON>;
	closestSize: string;
}): Record<string, CanvasElementJSON> => {
	const [adaptWidth, adaptHeight] = adaptSize.split('x').map(Number);
	const [closestWidth, closestHeight] = closestSize.split('x').map(Number);

	const widthRatio = adaptWidth / closestWidth;
	const heightRatio = adaptHeight / closestHeight;
	const scalingRatio = Math.min(widthRatio, heightRatio);

	const newObjects: Record<string, CanvasElementJSON> = {};

	for (const objectId of Object.keys(objects)) {
		const object = objects[objectId];

		if (object.dataType === 'CREATIVE_BOX') {
			newObjects[objectId] = {
				...object,
				height: adaptHeight,
				width: adaptWidth,
			};
			continue;
		}

		if (object.dataType === 'AUDIO') {
			newObjects[objectId] = object;
			continue;
		}

		getAreaPercentageOfElementOnCanvasJSON({
			element: object,
			canvasDimensions: { width: closestWidth, height: closestHeight },
		});
		const areaPercentage = getAreaPercentageOfElementOnCanvasJSON({
			element: object,
			canvasDimensions: { width: closestWidth, height: closestHeight },
		});

		const shouldSkew = checkIfElementShouldBeSkewed({
			areaPercentage,
			referenceLengths: {
				left: object.left ?? 0,
				top: object.top ?? 0,
				width: object.width ?? 1,
				height: object.height ?? 1,
				canvasWidth: closestWidth,
				canvasHeight: closestHeight,
			},
			type: object.dataType,
		});

		// ---- NON-SKEW PATH ----
		if (!shouldSkew) {
			const values = getValuesWithoutSkewingJSON({ closestSize, adaptSize, object });

			if (values.left === 0 && values.height === 0 && values.top === 0 && values.width === 0) {
				throw new Error('Invalid values');
			}

			if ('groupPath' in object && object.groupPath) {
				continue;
			}

			if (isTextJSON(object)) {
				newObjects[objectId] = adaptTextNoSkew(object, values, scalingRatio, closestHeight);
				continue;
			}

			if (isImageJSON(object)) {
				newObjects[objectId] = adaptImageNoSkew(object, values, scalingRatio, widthRatio, heightRatio);
				continue;
			}

			if (isShapeJSON(object)) {
				if (isSVGContainerJSON(object)) {
					newObjects[objectId] = adaptSvgNoSkew(object, values, scalingRatio, widthRatio, heightRatio);
					continue;
				}
				if (isRoundedRectJSON(object)) {
					newObjects[objectId] = adaptRoundedRectNoSkew(object, values, scalingRatio);
					continue;
				}
				newObjects[objectId] = adaptShapeNoSkew(object, values, scalingRatio);
				continue;
			}

			if (isGroupJSON(object)) {
				newObjects[objectId] = {
					...object,
					left: values.left,
					top: values.top,
					width: values.width,
					height: values.height,
				};

				for (const groupObjectId of object.objects) {
					const groupObject = objects[groupObjectId];
					if (!groupObject) continue;

					if (isTextJSON(groupObject)) {
						newObjects[groupObjectId] = adaptGroupChildText(
							groupObject,
							scalingRatio,
							closestHeight,
						);
						continue;
					}
					if (isImageJSON(groupObject)) {
						newObjects[groupObjectId] = adaptGroupChildImage(groupObject, scalingRatio);
						continue;
					}
					if (isShapeJSON(groupObject)) {
						if (isSVGContainerJSON(groupObject)) {
							newObjects[groupObjectId] = adaptGroupChildSvg(groupObject, scalingRatio);
							continue;
						}
						if (isRoundedRectJSON(groupObject)) {
							newObjects[groupObjectId] = adaptGroupChildRoundedRect(
								groupObject,
								scalingRatio,
							);
							continue;
						}
						newObjects[groupObjectId] = adaptGroupChildShape(groupObject, scalingRatio);
						continue;
					}
				}
				continue;
			}
		}

		// ---- SKEW PATH ----
		if (isTextJSON(object)) {
			newObjects[objectId] = adaptTextSkew(object, widthRatio, heightRatio, scalingRatio, closestHeight);
			continue;
		}

		if (isImageJSON(object)) {
			newObjects[objectId] = adaptImageSkew(object, widthRatio, heightRatio, scalingRatio);
			continue;
		}

		if (isShapeJSON(object)) {
			if (isSVGContainerJSON(object)) {
				newObjects[objectId] = adaptSvgSkew(object, widthRatio, heightRatio, scalingRatio);
				continue;
			}
			if (isRoundedRectJSON(object)) {
				newObjects[objectId] = adaptRoundedRectSkew(object, widthRatio, heightRatio, scalingRatio);
				continue;
			}
			newObjects[objectId] = adaptShapeSkew(object, widthRatio, heightRatio, scalingRatio);
			continue;
		}

		newObjects[objectId] = {
			...object,
			left: num(object, 'left') * widthRatio,
			top: num(object, 'top') * heightRatio,
			width: num(object, 'width', 1) * widthRatio,
			height: num(object, 'height', 1) * heightRatio,
			...getScaledBorderJSON({ object, scalingRatio }),
		} as CanvasElementJSON;
	}

	return newObjects;
};

// ============================================================================
// Overrides Resolution
// ============================================================================

/**
 * Resolve CanvasElementWithOverrides to flat CanvasElementJSON for a given sizeId.
 * Applies overrides[sizeId] onto the base object.
 */
export const resolveObjectsForSize = (
	objects: Record<string, CanvasElementWithOverrides<CanvasElementJSON>>,
	sizeId: string,
): Record<string, CanvasElementJSON> => {
	const resolved: Record<string, CanvasElementJSON> = {};
	for (const [id, obj] of Object.entries(objects)) {
		const sizeOverrides = obj.overrides?.[sizeId] || {};
		const { overrides: _overrides, zIndex: _zIndex, ...base } = obj as Record<string, unknown>;
		resolved[id] = { ...base, ...sizeOverrides } as CanvasElementJSON;
	}
	return resolved;
};

/**
 * Convert adapted flat objects back to overrides on the original objects.
 * For each layer, the adapted result is stored as overrides[newSizeId].
 */
export const applyAdaptedAsOverrides = (
	originalObjects: Record<string, CanvasElementWithOverrides<CanvasElementJSON>>,
	adaptedObjects: Record<string, CanvasElementJSON>,
	newSizeId: string,
): Record<string, CanvasElementWithOverrides<CanvasElementJSON>> => {
	const result = JSON.parse(JSON.stringify(originalObjects)) as Record<
		string,
		CanvasElementWithOverrides<CanvasElementJSON>
	>;

	for (const [layerId, adapted] of Object.entries(adaptedObjects)) {
		if (!result[layerId]) continue;

		const existingOverrides = result[layerId].overrides || {};
		result[layerId].overrides = {
			...existingOverrides,
			[newSizeId]: {
				...adapted,
				zIndex: result[layerId].overrides?.[newSizeId]?.zIndex ?? result[layerId].zIndex ?? 0,
			} as Partial<CanvasElementJSON> & { zIndex: number },
		};
	}

	return result;
};

// ============================================================================
// Layout-Only Merge (for vector similarity flow)
// ============================================================================

const LAYOUT_KEYS_COMMON = ['left', 'top', 'width', 'height', 'angle', 'visible'] as const;
const LAYOUT_KEYS_TEXT_EXTRA = ['fontSize', 'autoFitSizes', 'padding', 'wordSpacing'] as const;
const LAYOUT_KEYS_IMAGE_VIDEO_EXTRA = ['imageScale', 'imageLeft', 'imageTop', 'objectFit', 'imageOriginX', 'imageOriginY'] as const;
const LAYOUT_KEYS_SVG_EXTRA = ['imageScale', 'imageLeft', 'imageTop', 'scaleX', 'scaleY', 'objectFit', 'imageOriginX', 'imageOriginY'] as const;
const LAYOUT_KEYS_PATH = ['left', 'top', 'angle', 'visible', 'scaleX', 'scaleY'] as const;

/**
 * Get the list of layout/positioning property keys for a given element type.
 * These are the only properties that should be taken from a reference layout
 * (e.g. output capsule from vector search) while preserving all styling/branding
 * from the base object.
 */
const getLayoutKeysForElement = (element: CanvasElementJSON): readonly string[] => {
	if (isCreativeBoxJSON(element) || isAudioJSON(element)) {
		return [];
	}
	if (isTextJSON(element)) {
		return [...LAYOUT_KEYS_COMMON, ...LAYOUT_KEYS_TEXT_EXTRA];
	}
	if (isImageJSON(element) || isVideoJSON(element)) {
		return [...LAYOUT_KEYS_COMMON, ...LAYOUT_KEYS_IMAGE_VIDEO_EXTRA];
	}
	if (isShapeJSON(element)) {
		if (isSVGContainerJSON(element)) {
			return [...LAYOUT_KEYS_COMMON, ...LAYOUT_KEYS_SVG_EXTRA];
		}
		if (isRoundedRectJSON(element)) {
			return LAYOUT_KEYS_COMMON;
		}
		return LAYOUT_KEYS_PATH;
	}
	if (isGroupJSON(element)) {
		return LAYOUT_KEYS_COMMON;
	}
	return LAYOUT_KEYS_COMMON;
};

/**
 * Merge only layout/positioning properties from a reference object onto a base object.
 *
 * Used in the vector similarity flow: the base object comes from base-layout-adapt
 * of the INPUT capsule (preserving all styling, branding, content), while the
 * reference provides the spatial arrangement from the OUTPUT capsule.
 *
 * Properties transferred per type:
 * - All:         left, top, width, height, angle, visible
 * - Text:        + fontSize, autoFitSizes, padding, wordSpacing
 * - Image/Video: + imageScale, imageLeft, imageTop
 * - SVG:         + imageScale, imageLeft, imageTop, scaleX, scaleY
 * - Path:        left, top, scaleX, scaleY, angle, visible (no width/height)
 * - Group:       left, top, width, height, angle, visible (children handled separately)
 * - CreativeBox/Audio: no merge (pass-through)
 */
export const mergeLayoutFromReference = (
	base: CanvasElementJSON,
	layoutReference: CanvasElementJSON,
): CanvasElementJSON => {
	if (isCreativeBoxJSON(base) || isAudioJSON(base)) {
		return base;
	}

	const layoutKeys = getLayoutKeysForElement(base);
	const merged = { ...base } as Record<string, unknown>;
	const ref = layoutReference as Record<string, unknown>;

	for (const key of layoutKeys) {
		if (ref[key] !== undefined) {
			merged[key] = ref[key];
		}
	}

	return merged as CanvasElementJSON;
};

/**
 * Batch version: merges layout from reference objects onto base objects.
 * For each layer, if a matching reference exists, layout properties are taken from it;
 * otherwise the base-adapted object is kept as-is.
 */
export const mergeLayoutFromReferenceObjects = (
	baseObjects: Record<string, CanvasElementJSON>,
	referenceObjects: Record<string, CanvasElementJSON>,
): Record<string, CanvasElementJSON> => {
	const merged: Record<string, CanvasElementJSON> = {};
	for (const [layerId, baseObj] of Object.entries(baseObjects)) {
		if (referenceObjects[layerId]) {
			merged[layerId] = mergeLayoutFromReference(baseObj, referenceObjects[layerId]);
		} else {
			merged[layerId] = baseObj;
		}
	}
	return merged;
};

// ============================================================================
// Capsule Construction
// ============================================================================

/**
 * Builds a new ServerCapsule with an added size. Handles canvasData.variant.sizes,
 * savedCustomDimensions, newAddedSizes, and creativesOrder.
 */
export const buildNewCapsule = ({
	originalCapsule,
	updatedObjects,
	sizeId,
	referenceCreativeId,
	sizeToGenerate,
	sizeName,
	sizeCategory,
	videoLength,
}: {
	originalCapsule: ServerCapsule;
	updatedObjects: Record<string, CanvasElementWithOverrides<CanvasElementJSON>>;
	sizeId: string;
	referenceCreativeId: string;
	sizeToGenerate: string;
	sizeName?: string;
	sizeCategory?: string;
	videoLength?: number;
}): ServerCapsule => {
	const [widthOfNewSize, heightOfNewSize] = sizeToGenerate.split('x').map(Number);

	const canvasData = JSON.parse(JSON.stringify(originalCapsule.canvasData));
	canvasData.variant.objects = updatedObjects;

	canvasData.variant.sizes[sizeId] = {
		width: widthOfNewSize,
		height: heightOfNewSize,
		id: sizeId,
		displayName: sizeName || sizeToGenerate,
		rulers: [],
		...(videoLength !== undefined && { videoLength }),
	};

	const creativesOrder = originalCapsule.creativesOrder;
	const finalCreativesOrder =
		creativesOrder && creativesOrder.length > 0
			? [...creativesOrder, sizeId]
			: [referenceCreativeId, sizeId];

	const newSizeData = {
		name: sizeName || sizeToGenerate,
		width: widthOfNewSize,
		height: heightOfNewSize,
		active: true,
		thumbnail: '',
		creativeUrl: '',
		...(sizeCategory && { category: sizeCategory }),
	};

	return {
		...originalCapsule,
		canvasData,
		savedCustomDimensions: {
			...originalCapsule.savedCustomDimensions,
			[sizeId]: newSizeData,
		},
		newAddedSizes: {
			...originalCapsule.newAddedSizes,
			[sizeId]: newSizeData,
		},
		creativesOrder: finalCreativesOrder,
	};
};

// ============================================================================
// Top-Level Entry Function
// ============================================================================

/**
 * Generate a base layout for a new size.
 *
 * Takes the original capsule and target size params, returns a new ServerCapsule
 * with the adapted layout. Follows the frontend's getAdaptedObjectsJSON logic exactly.
 */
export const generateBaseLayoutForSize = ({
	originalCapsule,
	capsuleId,
	creativeId,
	sizeId,
	sizeToGenerate,
	sizeName,
	sizeCategory,
}: {
	originalCapsule: ServerCapsule;
	capsuleId: string;
	creativeId: string | null;
	sizeId: string;
	sizeToGenerate: string;
	sizeName?: string;
	sizeCategory?: string;
}): ServerCapsule => {
	const availableSizes = originalCapsule.canvasData.variant?.sizes;

	if (!availableSizes || Object.keys(availableSizes).length === 0) {
		throw new Error(`No sizes available in capsule: ${capsuleId}`);
	}

	let referenceCreativeId: string;

	if (creativeId && availableSizes[creativeId]) {
		referenceCreativeId = creativeId;
		console.log(`[BaseLayoutAdapter] Using provided reference size: ${referenceCreativeId}`);
	} else {
		referenceCreativeId = findBestReferenceSize(availableSizes, sizeToGenerate);
		console.log(
			`[BaseLayoutAdapter] Found best reference size: ${referenceCreativeId} for target: ${sizeToGenerate}`,
		);

		if (creativeId && !availableSizes[creativeId]) {
			console.warn(
				`[BaseLayoutAdapter] Provided creativeId ${creativeId} not found, using ${referenceCreativeId}`,
			);
		}
	}

	const currentSize = availableSizes[referenceCreativeId];
	const closestSize = `${currentSize.width}x${currentSize.height}`;
	const variantObjects = originalCapsule.canvasData.variant.objects;

	const resolvedObjects = resolveObjectsForSize(variantObjects, referenceCreativeId);

	const adaptedObjects = getAdaptedObjectsJSON({
		adaptSize: sizeToGenerate,
		objects: resolvedObjects,
		closestSize,
	});

	const updatedObjects = applyAdaptedAsOverrides(variantObjects, adaptedObjects, sizeId);

	return buildNewCapsule({
		originalCapsule,
		updatedObjects,
		sizeId,
		referenceCreativeId,
		sizeToGenerate,
		sizeName,
		sizeCategory,
		videoLength: currentSize?.videoLength,
	});
};
