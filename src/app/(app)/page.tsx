import Link from "next/link";
import { DecayBanner } from "@/components/dashboard/decay-banner";
import { DreamMini } from "@/components/dashboard/dream-mini";
import { Heatmap } from "@/components/dashboard/heatmap";
import { NorthStarCard } from "@/components/dashboard/north-star-card";
import { PrioritiesCard } from "@/components/dashboard/priorities-card";
import { RecapCard } from "@/components/dashboard/recap-card";
import { TodayCard } from "@/components/dashboard/today-card";
import { WhyStarted } from "@/components/dashboard/why-started";
import { getDashboard } from "@/core/dashboard";

export default async function DashboardPage() {
  const data = await getDashboard();
  const dreamTitles = new Map(data.dreams.map((d) => [d.id, d.title]));

  return (
    <div className="space-y-4 motion-safe:animate-[rise_0.3s_ease_both]">
      <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <NorthStarCard profile={data.profile} />
        <TodayCard
          score={data.today.score}
          answered={data.today.answered}
          streak={data.streak.current}
          level={data.level}
        />
      </div>

      <DecayBanner alerts={data.decay} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PrioritiesCard
          priorities={data.priorities}
          suggested={data.suggested}
          dreamTitles={dreamTitles}
        />
        <RecapCard
          bullets={data.today.bullets}
          next={data.today.next}
          date={data.today.date}
        />
      </div>

      <section className="card">
        <div className="flex items-center justify-between">
          <p className="eyebrow">Consistency</p>
          <span className="text-[11.5px] text-faint">
            {data.heatmap.filter((c) => c.score > 0).length} days logged
          </span>
        </div>
        <div className="mt-3">
          <Heatmap cells={data.heatmap} weeks={20} />
        </div>
      </section>

      <WhyStarted dream={data.why} />

      <section>
        <div className="mb-2.5 flex items-center justify-between">
          <p className="eyebrow">The life you&apos;re building</p>
          <Link href="/dreams" className="text-[11.5px] text-faint hover:text-gold-soft">
            All dreams →
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {data.dreams.map((d) => (
            <DreamMini key={d.id} dream={d} />
          ))}
        </div>
      </section>
    </div>
  );
}
