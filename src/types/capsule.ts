import { CanvasElementJSON, CanvasElementWithOverrides } from './canvas';

export type DatabaseVariant = {
	id: string;
	sizes: Record<string, DatabaseSize>;
	objects: Record<string, CanvasElementWithOverrides<CanvasElementJSON>>;
};

export type DatabaseSize = {
	width: number;
	height: number;
	id: string;
	rulers: Record<string, RulerLine>;
	showRulers?: boolean;
	showGrid: boolean;
	grid?: GridOption;
	rulersLocked?: boolean;
	displayName: string;
	videoLength?: number;
};

export const RULER_AXIS = {
	X: 'x',
	Y: 'y',
} as const;

export type RULER_AXIS_TYPE = (typeof RULER_AXIS)[keyof typeof RULER_AXIS];

export type RulerLine = {
	axis: RULER_AXIS_TYPE;
	value: number;
	id: string;
};

export type GridOption = {
	size: number;
	unit: 'PIXEL';
	color: string;
	subdivisions: number;
};

export type SavedCustomDimensions = {
	active: boolean;
	name: string;
	creativeUrl: string;
	thumbnail?: string;
	width?: number;
	height?: number;
	fileName?: string;
	fileNameSource?: 'formula' | 'manual';
};

export type OutputFormat = 'image' | 'video';

export interface ServerCapsule {
	videoLength: number;
	name: string;
	image: string;
	author: string;
	timestamp: string;
	version: number;
	isDeleted: boolean;
	collaborators: string[];
	tags: string[];
	orientation: string;
	videoBackground: string;
	branding: boolean;
	outputFormat: OutputFormat;
	brandPalettes: [];
	capsuleErrors: [];
	withCanvas: boolean;
	creativesOrder: string[];
	_id: string;
	capsuleId: string;
	audio: {
		link: string;
	};
	authorId: string;
	canvasData: {
		metadata: {};
		variant: DatabaseVariant;
	};
	cards: {
		id: string;
		tags: string[];
		type: string;
		groups: [];
		image: string;
		options: [];
		autoTimeBasedOnElements: boolean;
	}[];
	createdAt: string;
	createdUsingStylingPanel: null;
	customDimensions: {
		_id: string;
		width: number;
		height: number;
	};
	exportSettings: {
		quality: string;
	};
	lastModified: string;
	lastModifiedId: string;
	listId: string;
	logoImage: string;
	logoLoop: boolean;
	logoPosition: string;
	logoSize: number;
	metadata: {
		platform: string;
		shareString: string;
		isSaved: boolean;
		name: string;
		assetGroup: string;
		email: string;
	};
	savedCustomDimensions: Record<string, SavedCustomDimensions>;
	shortId: string;
	teamId: string;
	themeId: string;
	title: string;
	updatedAt: string;
	videoBackgroundExtraClasses: string;
	videoIndex: number;
	videoStyling: null;
	videoTemplateRules: null;
	visibility: string;
	newAddedSizes?: Record<string, SavedCustomDimensions>;
	sourceCapsuleId?: string | null;
}
