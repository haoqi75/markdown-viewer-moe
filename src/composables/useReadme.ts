import { marked } from 'marked';
import readmeRaw from '../../README.md?raw';
import { enhanceCallouts } from '../utils/markdown';

marked.setOptions({
  gfm: true,
  breaks: false,
});

const readmeImageBase = import.meta.env.MODE === 'release'
  ? 'https://raw.githubusercontent.com/haoqi75/markdown-viewer-moe/refs/heads/main/images/'
  : './images/';

function rewriteReadmeImages(markdown: string): string {
  return markdown
    .replace(/(!\[[^\]]*\]\()images\//g, `$1${readmeImageBase}`)
    .replace(/src=(["'])images\//g, `src=$1${readmeImageBase}`);
}

const readmeSource = rewriteReadmeImages(readmeRaw);
const readmeHtml = enhanceCallouts(marked.parse(readmeSource, { async: false }) as string);

export function useReadme() {
  return {
    html: readmeHtml,
    source: readmeSource,
  };
}
