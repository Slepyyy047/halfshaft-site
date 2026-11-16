import { h, raw } from "../lib/jsx";
import paths from "../../assets/brand/logo-paths.json";

/** Inline lockup: mark in brand teal, wordmark in currentColor */
export function Logo({ className = "logo" }: { className?: string }) {
  return (
    <svg className={className} viewBox={`0 0 ${paths.width} 48`} role="img" aria-label="Halfshaft" focusable="false">
      <g fill="var(--teal)">{raw(paths.mark)}</g>
      <path
        fill="currentColor"
        transform={`translate(${paths.wordX} ${24 - 17 / 2}) scale(${paths.wordScale})`}
        d={paths.word}
      />
    </svg>
  );
}

export function Mark({ className = "mark" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <g fill="currentColor">{raw(paths.mark)}</g>
    </svg>
  );
}
