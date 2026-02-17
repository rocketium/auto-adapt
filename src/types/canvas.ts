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

// ============================================================================
// Element Constants & Enums
// ============================================================================

export const CANVAS_EDITOR_ELEMENT = {
	TEXT: 'TEXT',
	SHAPE: 'SHAPE',
	IMAGE: 'IMAGE',
	GROUP: 'GROUP',
	CREATIVE_BOX: 'CREATIVE_BOX',
	VIDEO: 'VIDEO',
	AUDIO: 'AUDIO',
	CANVAS_MASK: 'CANVAS_MASK',
} as const;

export type CANVAS_EDITOR_ELEMENT_TYPE = (typeof CANVAS_EDITOR_ELEMENT)[keyof typeof CANVAS_EDITOR_ELEMENT];

export enum CreativeElementCategory {
	HERO_IMAGE = 'HERO_IMAGE',
	PRODUCT_IMAGE = 'PRODUCT_IMAGE',
	BACKGROUND = 'BACKGROUND',
	LOGO = 'LOGO',
	ICON = 'ICON',
	HEADLINE = 'HEADLINE',
	SUBHEADLINE = 'SUBHEADLINE',
	BODY_COPY = 'BODY_COPY',
	PRICE = 'PRICE',
	CTA = 'CTA',
	TERMS_CONDITIONS = 'TERMS_CONDITIONS',
	REVIEWS_TESTIMONIALS = 'REVIEWS_TESTIMONIALS',
	WARRANTY_INFO = 'WARRANTY_INFO',
	BADGE = 'BADGE',
	NEW_PRODUCT_LABEL = 'NEW_PRODUCT_LABEL',
	OTHER = 'OTHER',
}

// ============================================================================
// Layer & Group Types
// ============================================================================

export type LayerRules = {
	editingLocked?: boolean;
	maxCharCount?: number;
};

export type GroupPath = string | null;

// ============================================================================
// Word Style Types
// ============================================================================

export enum WORD_STYLE_TYPE {
	WORD_STYLE = 'WORD_STYLE',
	MISSING_GLYPH = 'MISSING_GLYPH',
	VARIABLES = 'VARIABLES',
}

export type WordStyleStyles = {
	fontFamily?: string;
	fontSize?: number;
	fontSizeUnit?: 'px' | '%';
	fontWeight?: string | number;
	fontStyle?: FontStyle;
	textDecoration?: string;
	textAlign?: string;
	textBackgroundColor?: string;
	fill?: string;
	stroke?: string;
	strokeWidth?: number;
	deltaY?: number;
	linethrough?: boolean;
	underline?: boolean;
	subscript?: boolean;
	superscript?: boolean;
	linethroughOffset?: number;
	underlineOffset?: number;
	offsets?: {
		linethrough?: number;
		underline?: number;
		overline?: number;
	};
};

export type WordStyle = {
	id: string;
	type?: WORD_STYLE_TYPE;
	variableId?: string;
	fontMetaDataWS?: {
		fontId?: string;
		fontUrl?: string;
		name?: string;
	} | null;
	data: {
		start: number;
		end: number;
		styles: WordStyleStyles;
	};
};

export type WordStyles = Array<WordStyle>;

// ============================================================================
// Animation Types (inlined from Animations module)
// ============================================================================

export type Point = {
	x: number;
	y: number;
};

export type TranslateKeyframes = {
	id: string;
	offset: number;
	x: number;
	y: number;
	P1?: Point;
	P2?: Point;
};

export type ScaleKeyframes = {
	id: string;
	offset: number;
	scaleX: number;
	scaleY: number;
};

export type RotateKeyframes = {
	id: string;
	offset: number;
	angle: number;
};

export type OpacityKeyframes = {
	id: string;
	offset: number;
	opacity: number;
};

export type AnimationTrack = {
	translate?: TranslateKeyframes[];
	scale?: ScaleKeyframes[];
	rotate?: RotateKeyframes[];
	opacity?: OpacityKeyframes[];
};

export type AnimationReference = Partial<{
	coordinates: Point;
	origin: Point;
	scale: Point;
	rotate: number;
	opacity: number;
	track: AnimationTrack;
	originalReference: AnimationReference;
}>;

export enum TextAnimationType {
	CHARACTER = 'character',
	WORD = 'word',
	LINE = 'line',
}

export enum AnimationSpecialCase {
	TYPING_EFFECT = 'typing-effect',
	NONE = 'none',
}

export type TextAnimationKeyframe = {
	offset: number;
	y?: number;
	opacity?: number;
};

export type TextAnimation = {
	_id: string;
	type: TextAnimationType;
	clipped?: boolean;
	reverse?: boolean;
	specialCase?: AnimationSpecialCase | null;
	name: string;
	keyframes: TextAnimationKeyframe[];
	start: number;
	end: number;
	loop?: number;
};
