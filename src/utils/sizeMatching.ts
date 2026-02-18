import { ASPECT_RATIO_WEIGHT, MAX_MATCH_PERCENTAGE, MIN_MATCH_PERCENTAGE, SCALE_DISTANCE_WEIGHT } from '../constants';
import { DatabaseSize } from '../types/capsule';

export const getNormalizedSizeValue = (sizeValue: string): string => {
	switch (sizeValue) {
		case 'square':
			return '720x720';
		case 'landscape':
			return '1280x720';
		case 'portrait':
			return '720x1280';
		default:
			return sizeValue;
	}
};

const getEuclideanDistanceBetweenPoints = ({
	x1,
	y1,
	x2,
	y2,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
}): number => {
	const widthDifference = x2 - x1;
	const heightDifference = y2 - y1;
	return Math.sqrt(widthDifference * widthDifference + heightDifference * heightDifference);
};

export const getEuclideanDistanceBetweenSizes = ({ size1, size2 }: { size1: string; size2: string }): number => {
	const firstSize = getNormalizedSizeValue(size1);
	const secondSize = getNormalizedSizeValue(size2);
	const [firstSizeWidth, firstSizeHeight] = firstSize.split('x').map(Number);
	const [secondSizeWidth, secondSizeHeight] = secondSize.split('x').map(Number);
	return getEuclideanDistanceBetweenPoints({
		x1: firstSizeWidth ?? 0,
		y1: firstSizeHeight ?? 0,
		x2: secondSizeWidth ?? 0,
		y2: secondSizeHeight ?? 0,
	});
};

// ============================================================================
// Shared scoring logic
// ============================================================================

type SizeInput = { key: string; width: number; height: number };
type ScoredSize = SizeInput & { matchPercentage: number };

/**
 * Core scoring algorithm used by both string-based and object-based size matching.
 * Computes a weighted score (90% aspect ratio similarity + 10% euclidean distance)
 * for each candidate size relative to the target, and returns scored results
 * sorted descending by matchPercentage.
 */
const computeSizeMatchScores = (sizes: SizeInput[], adaptSize: string): ScoredSize[] => {
	const [adaptWidth, adaptHeight] = getNormalizedSizeValue(adaptSize).split('x').map(Number);
	const adaptRatio = adaptWidth / adaptHeight;

	const sizeDistanceMap = new Map<string, { aspectRatioDistance: number; euclideanDistance: number }>();

	for (const size of sizes) {
		const ratio = size.width / size.height;
		if (isNaN(ratio) || isNaN(adaptRatio)) continue;

		const aspectRatioDistance = Math.abs(adaptRatio - ratio);
		const euclideanDistance = getEuclideanDistanceBetweenPoints({
			x1: adaptWidth,
			y1: adaptHeight,
			x2: size.width,
			y2: size.height,
		});

		sizeDistanceMap.set(size.key, { aspectRatioDistance, euclideanDistance });
	}

	const maxAspectRatioDistance = Math.max(...Array.from(sizeDistanceMap.values()).map((v) => v.aspectRatioDistance));
	const maxEuclideanDistance = Math.max(...Array.from(sizeDistanceMap.values()).map((v) => v.euclideanDistance));

	const scored: ScoredSize[] = [];

	for (const size of sizes) {
		const distances = sizeDistanceMap.get(size.key);
		if (!distances) {
			scored.push({ ...size, matchPercentage: MIN_MATCH_PERCENTAGE });
			continue;
		}

		const normalizedAspectRatio =
			maxAspectRatioDistance === 0 ? 1 : 1 - distances.aspectRatioDistance / maxAspectRatioDistance;
		const normalizedEuclidean =
			maxEuclideanDistance === 0 ? 1 : 1 - distances.euclideanDistance / maxEuclideanDistance;

		const rawScore = normalizedAspectRatio * ASPECT_RATIO_WEIGHT + normalizedEuclidean * SCALE_DISTANCE_WEIGHT;
		const matchPercentage = Math.round(
			Math.max(MIN_MATCH_PERCENTAGE, Math.min(MAX_MATCH_PERCENTAGE, rawScore * 100)),
		);

		scored.push({ ...size, matchPercentage });
	}

	scored.sort((a, b) => b.matchPercentage - a.matchPercentage);
	return scored;
};

/**
 * Finds the closest match among string-based sizes (e.g. ['720x720', '1080x1920']).
 * Returns the single best match and all sorted match percentages.
 */
export const findClosestSizeWithMatches = ({
	availableSizes,
	adaptSize,
}: {
	availableSizes: string[];
	adaptSize: string;
}): { closestSize: string; sortedMatches: Record<string, number> } => {
	const sizeInputs: SizeInput[] = availableSizes.map((s) => {
		const normalized = getNormalizedSizeValue(s);
		const [width, height] = normalized.split('x').map(Number);
		return { key: s, width, height };
	});

	const scored = computeSizeMatchScores(sizeInputs, adaptSize);

	// Determine closest by primary aspect-ratio distance, secondary euclidean distance
	const [adaptWidth, adaptHeight] = getNormalizedSizeValue(adaptSize).split('x').map(Number);
	const adaptRatio = adaptWidth / adaptHeight;

	let closestSize = availableSizes[0];
	let minAspectRatioDistance = Number.MAX_VALUE;
	let minEuclideanDistance = Number.MAX_VALUE;

	for (const input of sizeInputs) {
		const ratio = input.width / input.height;
		if (isNaN(ratio) || isNaN(adaptRatio)) continue;

		const aspectRatioDistance = Math.abs(adaptRatio - ratio);
		const euclideanDistance = getEuclideanDistanceBetweenPoints({
			x1: adaptWidth,
			y1: adaptHeight,
			x2: input.width,
			y2: input.height,
		});

		if (
			aspectRatioDistance < minAspectRatioDistance ||
			(aspectRatioDistance === minAspectRatioDistance && euclideanDistance < minEuclideanDistance)
		) {
			minAspectRatioDistance = aspectRatioDistance;
			minEuclideanDistance = euclideanDistance;
			closestSize = input.key;
		}
	}

	return {
		closestSize,
		sortedMatches: scored.reduce(
			(acc, { key, matchPercentage }) => {
				acc[key] = matchPercentage;
				return acc;
			},
			{} as Record<string, number>,
		),
	};
};

/**
 * Finds closest matches among size objects (Record<sizeId, DatabaseSize>).
 * Returns enriched size objects with _id and matchPercentage, sorted descending.
 */
export const findClosestSizeObjectsWithMatches = ({
	availableSizes,
	adaptSize,
}: {
	availableSizes: Record<string, DatabaseSize>;
	adaptSize: string;
}): (DatabaseSize & { _id: string; matchPercentage: number })[] => {
	if (Object.keys(availableSizes).length === 0) {
		return [];
	}

	const sizeInputs: SizeInput[] = Object.entries(availableSizes).map(([key, sizeObj]) => ({
		key,
		width: sizeObj.width,
		height: sizeObj.height,
	}));

	const scored = computeSizeMatchScores(sizeInputs, adaptSize);

	return scored.map((s) => ({
		_id: s.key,
		...availableSizes[s.key],
		matchPercentage: s.matchPercentage,
	}));
};

/**
 * Find the best reference size from available size objects.
 * Returns the sizeId (key) of the best match.
 */
export const findBestReferenceSize = (availableSizes: Record<string, DatabaseSize>, targetSize: string): string => {
	const sizeKeys = Object.keys(availableSizes);
	if (sizeKeys.length === 1) {
		return sizeKeys[0];
	}
	try {
		const sortedMatches = findClosestSizeObjectsWithMatches({
			availableSizes,
			adaptSize: targetSize,
		});

		return sortedMatches[0]?._id || sizeKeys[0];
	} catch (error) {
		console.warn('Error finding closest size, using first available:', error);
		return sizeKeys[0];
	}
};
