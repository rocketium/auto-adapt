import type { fabric } from 'fabric';
import type { IGradientOptions, IObjectOptions, IPatternOptions } from 'fabric/fabric-impl';

// ============================================================================
// Utility Types
// ============================================================================

export type Prettify<T> = {
	[P in keyof T]: T[P];
};

// ============================================================================
// Primitive Types
// ============================================================================

export type Radius = {
	tl?: number;
	tr?: number;
	bl?: number;
	br?: number;
};

export type AutoFitSizes = [number, number];

export type Scale =
	| { scale: number; scaleX?: never; scaleY?: never }
	| { scale?: never; scaleX: number; scaleY: number };

export type ObjectFit = 'fill' | 'fit' | 'crop';
export type TextCase = 'uppercase' | 'lowercase' | 'titlecase' | 'none';
export type FontStyle = 'normal' | 'italic' | 'oblique';
export type ORIGIN_X = 'left' | 'center' | 'right';
export type ORIGIN_Y = 'top' | 'middle' | 'bottom';

export type FontMetaData = {
	fontId: string;
	fontUrl: string;
};

export type ObjectPosition =
	| 'top-left'
	| 'top-center'
	| 'top-right'
	| 'center-left'
	| 'center'
	| 'center-right'
	| 'bottom-left'
	| 'bottom-center'
	| 'bottom-right'
	| 'custom';

export type Padding = {
	all?: number;
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
};

// ============================================================================
// Border & Fill Types
// ============================================================================

export type BorderPosition = 'center' | 'inside' | 'outside';

export type Border = {
	color?: string;
	style?: 'dashed' | 'solid';
	top?: number;
	right?: number;
	bottom?: number;
	left?: number;
	position?: BorderPosition;
	dashWidth?: number;
	dashGap?: number;
	dashCap?: string;
	stroke?: string;
	strokeWidth?: number;
	strokeDashArray?: number[];
};

export type FillOptions = IGradientOptions | IPatternOptions | string;
export type SerializedFillType = string | IPatternOptions | IGradientOptions;
export type SerializedFabricShadow = Pick<fabric.Shadow, 'color' | 'blur' | 'offsetX' | 'offsetY'>;

export type SerializedImageFilter = {
	brightness?: number;
	saturation?: number;
	contrast?: number;
	invert?: boolean;
	blur?: number;
};

export type ColorMap = {
	[key: string]: FillOptions;
};
