const CALLOUTS: Record<string, { icon: string; label: string }> = {
  NOTE: { icon: '📝', label: '笔记 (Note)' },
  TIP: { icon: '💡', label: '提示 (Tip)' },
  IMPORTANT: { icon: '📌', label: '重要 (Important)' },
  WARNING: { icon: '⚠️', label: '注意 (Warning)' },
  CAUTION: { icon: '🚫', label: '警告 (Caution)' },
};

/**
 * 将 GitHub Markdown 的 > [!NOTE] 引用转换成带标题的 callout。
 */
export function enhanceCallouts(html: string): string {
  if (typeof document === 'undefined') return html;

  const template = document.createElement('template');
  template.innerHTML = html;

  template.content.querySelectorAll('blockquote').forEach((blockquote) => {
    const firstParagraph = blockquote.querySelector('p');
    if (!firstParagraph) return;

    const match = (firstParagraph.textContent ?? '').match(
      /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i
    );
    if (!match) return;

    const type = match[1].toUpperCase();
    const callout = CALLOUTS[type];
    if (!callout) return;

    const wrapper = document.createElement('div');
    wrapper.className = `callout callout-${type.toLowerCase()}`;
    wrapper.setAttribute('role', 'note');

    const title = document.createElement('p');
    title.className = 'callout-title';
    title.textContent = `${callout.icon} ${callout.label}`;

    firstParagraph.innerHTML = firstParagraph.innerHTML.replace(
      /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i,
      ''
    );

    if (!firstParagraph.textContent?.trim() && !firstParagraph.querySelector('img, code, a, strong, em')) {
      firstParagraph.remove();
    }

    const body = document.createElement('div');
    body.className = 'callout-body';

    while (blockquote.firstChild) {
      body.appendChild(blockquote.firstChild);
    }

    wrapper.append(title, body);
    blockquote.replaceWith(wrapper);
  });

  return template.innerHTML;
}
