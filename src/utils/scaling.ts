import type { AutoFitSizes, Border, CanvasElementJSON, Padding, Radius, WordStyle } from '../types/canvas';
import { DEFAULT_BORDER_PROPERTIES, FALLBACK_AUTO_FIT_SIZES, THRESHOLD_FOR_NOT_SKEWING } from '../constants';
import { isAudioJSON, isCreativeBoxJSON, isGroupJSON } from './typeGuards';

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

// ============================================================================
// Property Scaling Helpers
// ============================================================================

export const scaleCornerRadius = (cornerRadius: Radius | undefined, scalingRatio: number): Radius => {
	return {
		tl: (cornerRadius?.tl || 0) * scalingRatio,
		tr: (cornerRadius?.tr || 0) * scalingRatio,
		bl: (cornerRadius?.bl || 0) * scalingRatio,
		br: (cornerRadius?.br || 0) * scalingRatio,
	};
};

export const scalePadding = (padding: Padding | undefined, scalingRatio: number): Padding => {
	const p = padding ?? { top: 0, right: 0, bottom: 0, left: 0 };
	return {
		...p,
		top: p.top ? p.top * scalingRatio : 0,
		right: p.right ? p.right * scalingRatio : 0,
		bottom: p.bottom ? p.bottom * scalingRatio : 0,
		left: p.left ? p.left * scalingRatio : 0,
	};
};

export const getScaledBorderJSON = ({
	object,
	scalingRatio,
}: {
	object: CanvasElementJSON;
	scalingRatio: number;
}): { border?: Border } => {
	if (isCreativeBoxJSON(object) || isGroupJSON(object) || isAudioJSON(object)) {
		return {};
	}
	if (!('border' in object) || !object?.border) return {};

	const border = object.border as Border;

	if (!border.strokeWidth) return {};

	return {
		border: {
			...DEFAULT_BORDER_PROPERTIES,
			...border,
			strokeWidth: border.strokeWidth * scalingRatio,
		},
	};
};

export const adaptWordStyleFontSizes = ({
	wordStyle,
	scalingRatio,
}: {
	wordStyle: WordStyle[];
	scalingRatio: number;
}): WordStyle[] => {
	if (!wordStyle || wordStyle.length === 0) {
		return wordStyle;
	}

	return wordStyle.map((style) => {
		if (!style.data?.styles?.fontSize) {
			return style;
		}

		const currentFontSizeUnit = style.data.styles.fontSizeUnit ?? '%';
		const adaptedFontSize =
			currentFontSizeUnit === 'px'
				? Math.round(style.data.styles.fontSize * scalingRatio)
				: style.data.styles.fontSize;

		return {
			...style,
			data: {
				...style.data,
				styles: {
					...style.data.styles,
					fontSize: adaptedFontSize,
					fontSizeUnit: currentFontSizeUnit,
				},
			},
		};
	});
};

export const scaleAutoFitSizes = (
	autoFitSizes: [number | null, number | null] | undefined,
	scalingRatio: number,
	fallbackHeight: number,
): AutoFitSizes => {
	if (autoFitSizes && autoFitSizes.length === 2) {
		return autoFitSizes.map((size) => Math.ceil((size ?? fallbackHeight) * scalingRatio)) as AutoFitSizes;
	}
	return [...FALLBACK_AUTO_FIT_SIZES] as AutoFitSizes;
};
