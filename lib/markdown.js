// Minimal, safe Markdown → HTML for blog posts and descriptions.
// Supports: ## / ### headings, paragraphs, - lists, 1. lists, **bold**, *italic*, [links](url), ![images](url), > quotes.

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const safeUrl = (u) => (/^(https?:\/\/|\/)/.test(u) ? u : '#');

function inline(text) {
  return esc(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_, alt, src) => `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy">`)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, href) => `<a href="${safeUrl(href)}">${t}</a>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

export function markdownToHtml(md = '') {
  const blocks = String(md).replace(/\r\n/g, '\n').split(/\n{2,}/);
  return blocks
    .map((block) => {
      const b = block.trim();
      if (!b) return '';
      if (b.startsWith('### ')) return `<h3>${inline(b.slice(4))}</h3>`;
      if (b.startsWith('## ')) return `<h2>${inline(b.slice(3))}</h2>`;
      if (b.startsWith('> ')) return `<blockquote>${inline(b.replace(/^> ?/gm, ''))}</blockquote>`;
      const lines = b.split('\n');
      if (lines.every((l) => /^[-*] /.test(l))) return `<ul>${lines.map((l) => `<li>${inline(l.slice(2))}</li>`).join('')}</ul>`;
      if (lines.every((l) => /^\d+\. /.test(l))) return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\d+\. /, ''))}</li>`).join('')}</ol>`;
      return `<p>${lines.map(inline).join('<br>')}</p>`;
    })
    .join('\n');
}

export const plainText = (md = '', max = 160) =>
  String(md)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/[#>*_\-!\[\]()]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
