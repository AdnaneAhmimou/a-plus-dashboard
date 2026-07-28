import Image from "next/image";

export function Logo({ height = 34 }: { height?: number }) {
  return (
    <Image
      src="/brand/logo.png"
      alt="Laboratoire A+"
      height={height}
      width={height * 1.55}
      style={{ height, width: "auto" }}
      priority
    />
  );
}
