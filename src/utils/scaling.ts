import type { CanvasElementJSON } from '../types/canvas';
import { THRESHOLD_FOR_NOT_SKEWING } from '../constants';

// ============================================================================
// Numeric Property Accessors
// ============================================================================

export const num = (obj: CanvasElementJSON, key: string, fallback = 0): number => {
	if (key in obj) {
		const val = (obj as Record<string, unknown>)[key];
		return typeof val === 'number' ? val : fallback;
	}
	return fallback;
};

// ============================================================================
// Area & Skew Checks
// ============================================================================

export const getAreaPercentageOfElementOnCanvasJSON = ({
	element,
	canvasDimensions,
}: {
	element: CanvasElementJSON;
	canvasDimensions: { height: number; width: number };
}): number => {
	const canvasWidth = typeof canvasDimensions.width === 'number' ? canvasDimensions.width : 0;
	const canvasHeight = typeof canvasDimensions.height === 'number' ? canvasDimensions.height : 0;

	// No `?? 1` for scaleX — matches frontend behavior where undefined scaleX produces NaN,
	// causing the skew check to return false (NaN > threshold is false).
	const elementWidth = ('width' in element ? element.width : 1) * ('scaleX' in element ? element.scaleX! : 1);
	const elementHeight =
		('height' in element ? element.height : 1) * ('scaleY' in element ? element.scaleY ?? 1 : 1);
	const elementTop = 'top' in element ? element.top : 0;
	const elementLeft = 'left' in element ? element.left : 0;

	const elementRight = elementLeft + elementWidth;
	const elementBottom = elementTop + elementHeight;

	const canvasArea = canvasWidth * canvasHeight;
	if (canvasArea === 0) {
		return 0;
	}

	const intersectionWidth = Math.min(elementRight, canvasWidth) - Math.max(elementLeft, 0);
	const intersectionHeight = Math.min(elementBottom, canvasHeight) - Math.max(elementTop, 0);
	const intersectionArea = Math.max(intersectionWidth, 0) * Math.max(intersectionHeight, 0);

	return Math.round((intersectionArea / canvasArea) * 100);
};

export const checkIfElementShouldBeSkewed = ({
	areaPercentage,
	referenceLengths,
	type,
}: {
	areaPercentage: number;
	referenceLengths: {
		left: number;
		top: number;
		width: number;
		height: number;
		canvasWidth: number;
		canvasHeight: number;
	};
	type: string;
}): boolean => {
	if (type === 'GROUP') return false;
	if (areaPercentage > THRESHOLD_FOR_NOT_SKEWING) return true;

	const spansFullWidth =
		Math.floor(referenceLengths.left) <= 0 && Math.floor(referenceLengths.width) >= referenceLengths.canvasWidth;
	const spansFullHeight =
		Math.floor(referenceLengths.top) <= 0 && Math.floor(referenceLengths.height) >= referenceLengths.canvasHeight;

	return spansFullWidth || spansFullHeight;
};
