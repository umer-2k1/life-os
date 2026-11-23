import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { DreamCard } from "@/components/dreams/dream-card";
import { getDream, listDreams } from "@/core/dreams";
import { AppError } from "@/core/errors";
import type { Dream } from "@/db/entities";
import { DreamDetail } from "./dream-detail";
import { DreamForm } from "./dream-form";

export const metadata: Metadata = { title: "Dreams" };

export default async function DreamsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const openId = typeof params.open === "string" ? params.open : null;
  const isNew = params.new === "1";
  const isEdit = params.edit === "1";

  const dreams = await listDreams({});

  let openDream: Dream | null = null;
  if (openId) {
    try {
      openDream = await getDream(openId);
    } catch (err) {
      if (!(err instanceof AppError)) throw err;
    }
  }

  return (
    <div className="motion-safe:animate-[rise_0.3s_ease_both]">
      <header className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Dreams</p>
          <h1 className="mt-1 font-display text-2xl">The life you&apos;re building</h1>
          <p className="mt-1 text-[12.5px] text-muted">
            {dreams.filter((d) => d.status === "active").length} active · touch one today.
          </p>
        </div>
        <Button asChild variant="gold" size="sm">
          <Link href="/dreams?new=1">
            <Plus size={14} aria-hidden /> Add dream
          </Link>
        </Button>
      </header>

      {dreams.length === 0 ? (
        <div className="card py-12 text-center">
          <p className="font-display text-xl text-gold-soft">No dreams yet.</p>
          <p className="mt-2 text-[13px] text-muted">
            Start with the one that scares you the most.
          </p>
          <Button asChild variant="gold" className="mt-4">
            <Link href="/dreams?new=1">Add your first dream</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(215px,1fr))] gap-3.5">
          {dreams.map((dream) => (
            <DreamCard key={dream.id} dream={dream} href={`/dreams?open=${dream.id}`} />
          ))}
        </div>
      )}

      <Sheet
        open={isNew}
        title="New dream"
        closeHref="/dreams"
      >
        <DreamForm />
      </Sheet>

      {openDream ? (
        <Sheet
          open={!isEdit}
          title={openDream.title}
          closeHref="/dreams"
        >
          <DreamDetail dream={openDream} />
        </Sheet>
      ) : null}

      {openDream && isEdit ? (
        <Sheet open title="Edit dream" closeHref={`/dreams?open=${openDream.id}`}>
          <DreamForm
            initial={{
              id: openDream.id,
              title: openDream.title,
              priority: openDream.priority,
              status: openDream.status,
              target_date: openDream.target_date ?? null,
              money_needed: openDream.money_needed ?? null,
              progress: openDream.progress,
              importance_note: openDream.importance_note ?? null,
              cover_image_url: openDream.cover_image_url ?? null,
              glyph: openDream.glyph ?? null,
              story: openDream.emotion?.story ?? null,
              emotional_reason: openDream.emotion?.emotional_reason ?? null,
              feeling: openDream.emotion?.feeling ?? null,
            }}
          />
        </Sheet>
      ) : null}
    </div>
  );
}
