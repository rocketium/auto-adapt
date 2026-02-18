import type {
	CanvasElementJSON,
	GroupContainerJSON,
	ImageContainerJSON,
	PathJSON,
	RoundedRectJSON,
	SvgJSON,
	TextContainerJSON,
} from '../types/canvas';

export const isTextJSON = (object: CanvasElementJSON): object is TextContainerJSON => {
	return object.dataType === 'TEXT';
};

export const isImageJSON = (object: CanvasElementJSON): object is ImageContainerJSON => {
	return object.dataType === 'IMAGE';
};

export const isShapeJSON = (object: CanvasElementJSON): object is PathJSON | RoundedRectJSON | SvgJSON => {
	return object.dataType === 'SHAPE';
};

export const isSVGContainerJSON = (object: CanvasElementJSON): object is SvgJSON => {
	return object?.type === 'svg-container' && object?.dataType === 'SHAPE';
};

export const isRoundedRectJSON = (object: CanvasElementJSON): object is RoundedRectJSON => {
	return object?.type === 'rounded-rect' && object?.dataType === 'SHAPE';
};

export const isGroupJSON = (object: CanvasElementJSON | undefined): object is GroupContainerJSON => {
	return object?.dataType === 'GROUP';
};

export const isCreativeBoxJSON = (object: CanvasElementJSON): boolean => {
	return object?.dataType === 'CREATIVE_BOX';
};

export const isAudioJSON = (object: CanvasElementJSON): boolean => {
	return object?.dataType === 'AUDIO';
};
