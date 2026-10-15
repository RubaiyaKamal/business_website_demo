import { Fragment } from "react";

type Block =
  | { type: "h2" | "h3" | "p" | "quote"; text: string }
  | { type: "ul" | "ol"; items: string[] };

const UL_ITEM = /^[-*]\s+/;
const OL_ITEM = /^\d+\.\s+/;

/** Parse plain text (paragraphs separated by blank lines) into render blocks. */
function parseBlocks(text: string): Block[] {
  const chunks = text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk): Block => {
    const lines = chunk.split("\n").map((line) => line.trim());

    if (lines.every((line) => UL_ITEM.test(line))) {
      return { type: "ul", items: lines.map((line) => line.replace(UL_ITEM, "")) };
    }
    if (lines.every((line) => OL_ITEM.test(line))) {
      return { type: "ol", items: lines.map((line) => line.replace(OL_ITEM, "")) };
    }
    if (lines.length === 1 && lines[0]?.startsWith("### ")) {
      return { type: "h3", text: lines[0].slice(4) };
    }
    if (lines.length === 1 && lines[0]?.startsWith("## ")) {
      return { type: "h2", text: lines[0].slice(3) };
    }
    if (lines.every((line) => line.startsWith("> "))) {
      return { type: "quote", text: lines.map((line) => line.slice(2)).join(" ") };
    }
    return { type: "p", text: lines.join(" ") };
  });
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        switch (block.type) {
          case "h2":
            return <h2 key={key}>{block.text}</h2>;
          case "h3":
            return <h3 key={key}>{block.text}</h3>;
          case "ul":
            return (
              <ul key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{item}</li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={key}>
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{item}</li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={key}>
                <Fragment>{block.text}</Fragment>
              </blockquote>
            );
          default:
            return <p key={key}>{block.text}</p>;
        }
      })}
    </div>
  );
}
