import { asset } from "@/lib/paths";

/**
 * Official project logo, normalized to 128×128 in /public/logos/{id}.png.
 * Standard format across the app: square tile with 4 px corners
 * and a hairline border; the size is set by the caller.
 */
export function ProjectLogo({
  id,
  size = 32,
  className = "",
}: {
  id: string;
  size?: number;
  className?: string;
}) {
  return (
    <img
      src={asset(`logos/${id}.png`)}
      alt=""
      loading="lazy"
      width={size}
      height={size}
      className={`logo-tile ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
