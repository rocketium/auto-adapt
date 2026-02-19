import type { CanvasElementJSON, CanvasElementWithOverrides } from './types/canvas';
import type { ServerCapsule } from './types/capsule';
import {
	getAreaPercentageOfElementOnCanvasJSON,
	checkIfElementShouldBeSkewed,
} from './utils/scaling';

// ============================================================================
// Core Adapt Function (ported from frontend getAdaptedObjectsJSON)
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

		checkIfElementShouldBeSkewed({
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

		newObjects[objectId] = object;
	}

	return newObjects;
};
