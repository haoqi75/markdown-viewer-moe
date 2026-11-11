export type ThemeName = 'pink' | 'blue' | 'green' | 'purple' | 'white' | 'yellow';

export interface AliasMap {
    [name: string]: string;
}

export interface MoeConfig {
    type?: string;
    title?: string;
    logo?: {
        text?: string;
        sub?: string;
    };
    logoImage?: string;
    icon?: {
        svg?: string;
        ico?: string;
        apple?: string;
    };
    footer?: string;
    mascot?: string;
    defaultUrl?: string;
    aliases?: AliasMap;
    tocWelcome?: string;
    toolsUrl?: string;
    headInject?: string;
    bodyInject?: string;
    logoSubUseDocTitle?: boolean;
    theme?: ThemeName | string;
    version?: string;
    gitHash?: string;
    errorMascot?: string;
    loadingMascot?: string;
}

export interface TocHeading {
    id: string;
    level: number;
    text: string;
    element: HTMLElement;
}

export interface TocApi {
    init(): void;
    generate(): void;
    scrollToHeading(id: string, pushState?: boolean): void;
    open(): void;
    close(): void;
    toggle(): void;
    getHeadings(): TocHeading[];
    startScrollSpy(): void;
}

export interface RendererApi {
    load(): Promise<void>;
    resolveUrl(): string;
}

export interface MoeGlobal {
    CONFIG: MoeConfig;
    TOC: TocApi;
    Renderer: RendererApi;
}

declare global {
    interface Window {
        __CONFIG__?: MoeConfig;
        __MOE?: MoeGlobal;
    }
}

export {};
