import Link from "next/link";
import type { ReactNode } from "react";

const LINK_PATTERN = /\[([^\]]+)\]\(([^)\s]+)\)/g;

function isSafeHref(href: string) {
  return (
    href.startsWith("/") ||
    href.startsWith("#") ||
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export function RichText({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(LINK_PATTERN)) {
    const [fullMatch, label, href] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    if (isSafeHref(href)) {
      const className = "link-underline text-bronze hover:text-bronze-deep";
      if (href.startsWith("/") || href.startsWith("#")) {
        parts.push(
          <Link key={`${href}-${index}`} href={href} className={className}>
            {label}
          </Link>,
        );
      } else {
        parts.push(
          <a
            key={`${href}-${index}`}
            href={href}
            className={className}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {label}
          </a>,
        );
      }
    } else {
      parts.push(fullMatch);
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}
