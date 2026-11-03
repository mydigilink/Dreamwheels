// Blog post bodies: HTML from the rich-text editor (older posts may still be Markdown).
// Always sanitised server-side so only safe tags, styles and YouTube iframes reach the page.
import sanitizeHtml from 'sanitize-html';
import { markdownToHtml } from './markdown';

export const isHtml = (s = '') => /^\s*</.test(s);

const SAFE_STYLE = {
  color: [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
  'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgba?\([\d\s.,%]+\)$/i],
  'font-size': [/^\d{1,2}(\.\d+)?(px|rem|em)$/],
  'text-align': [/^(left|right|center|justify)$/],
  width: [/^\d{1,4}(px|%)$/],
  'min-width': [/^\d{1,4}px$/],
};

export function sanitizePostHtml(html = '') {
  return sanitizeHtml(html, {
    allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'mark', 'span', 'code', 'pre', 'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption', 'table', 'colgroup', 'col', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'iframe'],
    allowedAttributes: {
      '*': ['style'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'colwidth'],
      td: ['colspan', 'rowspan', 'colwidth'],
      mark: ['data-color'],
      div: ['data-youtube-video'],
      iframe: ['src', 'width', 'height', 'allowfullscreen', 'allow', 'frameborder', 'title'],
      ol: ['start'],
    },
    allowedStyles: { '*': SAFE_STYLE },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube-nocookie.com', 'www.youtube.com', 'youtube.com'],
    transformTags: {
      a: (tag, attribs) => ({ tagName: 'a', attribs: attribs.target === '_blank' ? { ...attribs, rel: 'noopener' } : attribs }),
    },
  });
}

export function renderPostHtml(content = '') {
  return isHtml(content) ? sanitizePostHtml(content) : markdownToHtml(content);
}

const strip = (html) => html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"').trim();

/** Adds anchor ids to h2/h3 and returns a table of contents. */
export function withHeadingIds(html) {
  const toc = [];
  const used = new Set();
  const out = html.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g, (m, level, attrs, inner) => {
    const text = strip(inner);
    if (!text) return m;
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'section';
    while (used.has(id)) id += '-2';
    used.add(id);
    toc.push({ id, text, level: Number(level) });
    return `<h${level}${attrs.replace(/\sid="[^"]*"/, '')} id="${id}">${inner}</h${level}>`;
  });
  return { html: out, toc };
}

export function readingMinutes(content = '') {
  const words = strip(isHtml(content) ? content : markdownToHtml(content)).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}
