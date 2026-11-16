/**
 * Minimal JSX → HTML string runtime for static rendering.
 * No virtual DOM, no hydration: components are plain functions returning Html.
 */

export class Html {
  constructor(public readonly value: string) {}
  toString() {
    return this.value;
  }
}

export type Child = Html | string | number | boolean | null | undefined | Child[];
type Props = Record<string, unknown> & { children?: Child };
export type Component<P = {}> = (props: P & { children?: Child }) => Html;

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const RENAME: Record<string, string> = { className: "class", htmlFor: "for", tabIndex: "tabindex", viewBox: "viewBox" };

export const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function renderChildren(c: Child): string {
  if (c === null || c === undefined || c === false || c === true) return "";
  if (Array.isArray(c)) return c.map(renderChildren).join("");
  if (c instanceof Html) return c.value;
  return escape(String(c));
}

function attrName(k: string) {
  if (RENAME[k]) return RENAME[k];
  // strokeWidth -> stroke-width for SVG, ariaLabel is not used (use aria-label directly)
  if (/^(stroke|fill|font|text|clip|stop)[A-Z]/.test(k)) return k.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase());
  return k;
}

function renderAttrs(props: Props): string {
  let out = "";
  for (const [k, v] of Object.entries(props)) {
    if (k === "children" || k === "dangerouslySetInnerHTML") continue;
    if (v === false || v === null || v === undefined) continue;
    const name = attrName(k);
    if (v === true) {
      out += ` ${name}`;
      continue;
    }
    if (k === "style" && typeof v === "object") {
      const css = Object.entries(v as Record<string, string | number>)
        .map(([p, val]) => `${p.startsWith("--") ? p : p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase())}:${val}`)
        .join(";");
      out += ` style="${escape(css)}"`;
      continue;
    }
    out += ` ${name}="${escape(String(v))}"`;
  }
  return out;
}

export function h(tag: string | Component<any>, props: Props | null, ...children: Child[]): Html {
  const p: Props = { ...(props ?? {}) };
  if (children.length) p.children = children.length === 1 ? children[0] : children;
  if (typeof tag === "function") return tag(p);
  const inner =
    (p.dangerouslySetInnerHTML as { __html: string } | undefined)?.__html ?? renderChildren(p.children as Child);
  if (VOID.has(tag)) return new Html(`<${tag}${renderAttrs(p)}>`);
  return new Html(`<${tag}${renderAttrs(p)}>${inner}</${tag}>`);
}

export function Fragment(props: { children?: Child }): Html {
  return new Html(renderChildren(props.children as Child));
}

export const raw = (s: string) => new Html(s);

declare global {
  namespace JSX {
    type Element = Html;
    interface IntrinsicElements {
      [name: string]: Record<string, unknown>;
    }
    interface ElementChildrenAttribute {
      children: {};
    }
  }
}
