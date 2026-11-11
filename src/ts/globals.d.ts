interface MarkedOptions {
    gfm?: boolean;
    breaks?: boolean;
    pedantic?: boolean;
    headerIds?: boolean;
}

declare const marked: {
    parse(markdown: string, options?: MarkedOptions): string;
};

declare const Prism: {
    highlightAll(): void;
} | undefined;
