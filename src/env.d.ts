/// <reference types="vite/client" />

declare const __APP_VERSION__: string;

declare module 'prismjs' {
  const Prism: {
    highlightAllUnder(element: Element): void;
  };
  export default Prism;
}

declare module 'prismjs/components/*';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}
