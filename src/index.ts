/**
 * @rocketium/auto-adapt - Layout adaptation engine for canvas elements across dimensions
 */
export {
	generateBaseLayoutForSize,
	buildNewCapsule,
	getAdaptedObjectsJSON,
	resolveObjectsForSize,
	applyAdaptedAsOverrides,
	mergeLayoutFromReference,
	mergeLayoutFromReferenceObjects,
} from './adapter';
export {
	findClosestSizeWithMatches,
	findClosestSizeObjectsWithMatches,
	findBestReferenceSize,
	getNormalizedSizeValue,
	getEuclideanDistanceBetweenSizes,
} from './utils/sizeMatching';
export {
	getValuesWithoutSkewingJSON,
	getAreaPercentageOfElementOnCanvasJSON,
	checkIfElementShouldBeSkewed,
	getScaledBorderJSON,
	adaptWordStyleFontSizes,
	scaleCornerRadius,
	scalePadding,
	scaleAutoFitSizes,
} from './utils/scaling';
export {
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
export * from './types';
