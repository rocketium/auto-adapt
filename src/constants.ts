import type { AutoFitSizes } from './types/canvas';

export const FALLBACK_AUTO_FIT_SIZES: AutoFitSizes = [1, Infinity];
export const THRESHOLD_FOR_NOT_SKEWING = 90;
export const ASPECT_RATIO_WEIGHT = 0.9;
export const SCALE_DISTANCE_WEIGHT = 0.1;
export const MIN_MATCH_PERCENTAGE = 20;
export const MAX_MATCH_PERCENTAGE = 100;
export const DEFAULT_BORDER_PROPERTIES = {
	stroke: 'rgba(0, 0, 0, 1)',
	strokeWidth: 0,
	strokeDashArray: [0, 0] as number[],
};
