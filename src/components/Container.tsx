import { clsx } from "@/lib/clsx";

/** Centered content column with consistent gutters. */
export function Container({
  className,
  children,
  as: Tag = "div",
}: {
  className?: string;
  children: React.ReactNode;
  as?: React.ElementType;
}) {
  return (
    <Tag className={clsx("mx-auto w-full max-w-7xl px-6 md:px-10", className)}>
      {children}
    </Tag>
  );
}
