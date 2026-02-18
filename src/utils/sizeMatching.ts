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
