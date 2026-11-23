import type { ReactNode } from "react";

function inline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? (
      <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

export function ReportBody({ markdown }: { markdown: string }) {
  const lines = markdown.split("\n");
  const out: ReactNode[] = [];
  let list: string[] = [];

  const flush = () => {
    if (!list.length) return;
    out.push(
      <ul key={`ul-${out.length}`} className="my-2 space-y-1">
        {list.map((item, i) => (
          <li key={i} className="flex gap-2 text-[13px] leading-snug text-muted">
            <span aria-hidden className="mt-1.5 h-1 w-1 flex-none rounded-full bg-gold" />
            <span>{inline(item)}</span>
          </li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.startsWith("- ")) {
      list.push(line.slice(2));
      continue;
    }
    flush();
    if (line.startsWith("# ")) {
      out.push(
        <h2 key={out.length} className="mt-2 font-display text-xl">{line.slice(2)}</h2>,
      );
    } else if (line.startsWith("## ")) {
      out.push(
        <h3 key={out.length} className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.14em] text-gold-soft">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.trim()) {
      out.push(
        <p key={out.length} className="mt-1.5 text-[13px] leading-relaxed text-muted">
          {inline(line)}
        </p>,
      );
    }
  }
  flush();
  return <div>{out}</div>;
}
