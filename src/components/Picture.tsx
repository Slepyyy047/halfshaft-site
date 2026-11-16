import { h } from "../lib/jsx";
import { getImage, srcset, pick } from "../lib/images";

interface Props {
  name: string;
  alt: string;
  sizes: string;
  /** The hero image loads eagerly with high priority; everything else is lazy */
  priority?: boolean;
  className?: string;
  /** Media query at which the narrow crop is used */
  narrowMedia?: string;
  /** Slot name for swapping in the owner's own photo later */
  slot?: string;
  /** What the owner's photo for this slot should show */
  slotAlt?: string;
  /** object-position, e.g. "50% 40%" */
  focus?: string;
}

/** A photograph in a slot (patterns.md § A photograph in a slot) */
export function Picture({ name, alt, sizes, priority = false, className, narrowMedia = "(max-width: 59.99rem)", slot, slotAlt, focus }: Props) {
  const img = getImage(name);
  const m = img.main;
  return (
    <figure className={["photo", className].filter(Boolean).join(" ")} data-slot={slot ?? name} data-alt={slotAlt ?? alt} style={focus ? { "--focus": focus } : undefined}>
      <picture>
        {img.narrow ? (
          <source media={narrowMedia} type="image/webp" srcset={srcset(img.narrow)} sizes="100vw" width={img.narrow.width} height={img.narrow.height} />
        ) : null}
        <source type="image/webp" srcset={srcset(m)} sizes={sizes} />
        <img
          src={pick(m, 1200)}
          alt={alt}
          width={m.width}
          height={m.height}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchpriority={priority ? "high" : undefined}
        />
      </picture>
    </figure>
  );
}
