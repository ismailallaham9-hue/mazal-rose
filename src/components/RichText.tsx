import Link from "next/link";
import type { ReactNode } from "react";
import { clsx } from "@/lib/clsx";

const INLINE_PATTERN =
  /\[([^\]]+)\]\(([^)\s]+)\)|\[(big|small|serif|sans|bronze)\]([\s\S]*?)\[\/\3\]/g;

const STYLE_CLASSES: Record<string, string> = {
  big: "text-lg md:text-xl",
  small: "text-sm",
  serif: "font-serif text-[1.08em]",
  sans: "font-sans",
  bronze: "text-bronze",
};

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
  return <>{renderInlineText(text)}</>;
}

function renderInlineText(text: string, keyPrefix = "inline") {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const [fullMatch, label, href, style, styledText] = match;
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }

    if (label && href && isSafeHref(href)) {
      const className = "link-underline text-bronze hover:text-bronze-deep";
      if (href.startsWith("/") || href.startsWith("#")) {
        parts.push(
          <Link key={`${keyPrefix}-${href}-${index}`} href={href} className={className}>
            {label}
          </Link>,
        );
      } else {
        parts.push(
          <a
            key={`${keyPrefix}-${href}-${index}`}
            href={href}
            className={className}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {label}
          </a>,
        );
      }
    } else if (style && styledText) {
      parts.push(
        <span key={`${keyPrefix}-${style}-${index}`} className={STYLE_CLASSES[style]}>
          {renderInlineText(styledText, `${keyPrefix}-${style}-${index}`)}
        </span>,
      );
    } else {
      parts.push(fullMatch);
    }

    lastIndex = index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function richBlocks(text: string) {
  const blocks: { type: "p" | "h1" | "h2" | "h3"; text: string }[] = [];
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let paragraph: string[] = [];

  function flushParagraph() {
    const joined = paragraph.join("\n").trim();
    if (joined) blocks.push({ type: "p", text: joined });
    paragraph = [];
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: `h${heading[1].length}` as "h1" | "h2" | "h3",
        text: heading[2].trim(),
      });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

export function RichBody({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const blocks = richBlocks(text);
  if (!blocks.length) return null;

  return (
    <div className={clsx("space-y-5", className)}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "h1") {
          return (
            <h1 key={key} className="pt-3 font-serif text-4xl leading-tight text-ink md:text-5xl">
              {renderInlineText(block.text, key)}
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2 key={key} className="pt-3 font-serif text-3xl leading-tight text-ink md:text-4xl">
              {renderInlineText(block.text, key)}
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3 key={key} className="pt-2 font-serif text-2xl leading-snug text-ink">
              {renderInlineText(block.text, key)}
            </h3>
          );
        }
        return (
          <p key={key} className="text-base leading-relaxed text-ink-soft">
            {renderInlineText(block.text, key)}
          </p>
        );
      })}
    </div>
  );
}
