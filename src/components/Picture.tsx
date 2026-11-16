import { h } from "../lib/jsx";
import { getImage, srcset, pick } from "../lib/images";

interface Props {
  name: string;
  alt: string;
  sizes: string;
  /** Hero images load eagerly with high priority; everything else is lazy */
  priority?: boolean;
  className?: string;
  /** Media query at which the narrow crop is used, e.g. "(max-width: 899px)" */
  narrowMedia?: string;
}

export function Picture({ name, alt, sizes, priority = false, className, narrowMedia = "(max-width: 899px)" }: Props) {
  const img = getImage(name);
  const m = img.main;
  return (
    <picture className={className}>
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
  );
}
