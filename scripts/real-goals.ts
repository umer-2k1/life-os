/**
 * Replaces demo data with the real 2027 goals + licensed cover photos.
 * Run: node --env-file=.env --import tsx scripts/real-goals.ts
 */
import "reflect-metadata";
import { getDataSource } from "../src/db/data-source";
import {
  Dream,
  DreamEmotion,
  Milestone,
  Savings,
} from "../src/db/entities";
import { env } from "../src/lib/env";

type Goal = {
  title: string;
  glyph: string;
  accent: string;
  priority: "low" | "medium" | "high";
  target_date: string | null;
  money_needed: string | null;
  importance: string;
  story: string;
  why: string;
  feeling: string;
  cover: string;
  milestones: string[];
};

const GOALS: Goal[] = [
  {
    title: "16h/Day — Remote Job Sprint",
    glyph: "🔥",
    accent: "linear-gradient(145deg,#2b1410,#0d0503)",
    priority: "high",
    target_date: "2027-02-25",
    money_needed: null,
    importance: "Remote job first. 16 hours a day until it's signed.",
    story: "For the next 3 months I work 16 hours a day on getting the remote job.",
    why: "Getting a remote job is the only thing that changes everything right now.",
    feeling: "Relentless",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/P20RXZ8QAB.jpg",
    milestones: ["16h/day for 7 days straight", "Ship 3 portfolio pieces", "Apply to 20 remote roles", "Sign the offer"],
  },
  {
    title: "Remote Job",
    glyph: "💼",
    accent: "linear-gradient(145deg,#16202b,#070b10)",
    priority: "high",
    target_date: "2026-12-31",
    money_needed: null,
    importance: "A remote salary in dollars changes the ceiling.",
    story: "Get a remote job by December 2026.",
    why: "I refuse to let geography decide my income.",
    feeling: "Free",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/D3OTBIDS9X.jpg",
    milestones: ["Rewrite CV for remote roles", "Apply to 5 roles a week", "Sign an offer"],
  },
  {
    title: "Freelancing & Multiple Income",
    glyph: "💸",
    accent: "linear-gradient(145deg,#1b2414,#0a0f07)",
    priority: "high",
    target_date: null,
    money_needed: null,
    importance: "One paycheck is a single point of failure.",
    story: "Start freelancing and build more than one income stream.",
    why: "I'm done depending on one boss for everything.",
    feeling: "Independent",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMyMDEzNy1pbWFnZS1rd3lzYjNjMy5qcGc.jpg",
    milestones: ["Pick one service to sell", "Land the first paying client", "Reach 3 recurring clients"],
  },
  {
    title: "Car — Toyota Fortuner",
    glyph: "🏎️",
    accent: "linear-gradient(145deg,#3a2f14,#120d04)",
    priority: "high",
    target_date: "2027-06-30",
    money_needed: "1500000000",
    importance: "At least an Alto first. Fortuner is the standard.",
    story: "Get a car — minimum an Alto, the target is a Fortuner.",
    why: "I want to drive something I built, not something I financed forever.",
    feeling: "Inevitable",
    cover:
      "https://upload.wikimedia.org/wikipedia/commons/6/66/2015_Toyota_Fortuner_%28New_Zealand%29.jpg",
    milestones: ["Save the Alto fund", "Reach 50% of the Fortuner target", "Book a test drive"],
  },
  {
    title: "Umrah — 2–3 People",
    glyph: "🕋",
    accent: "linear-gradient(145deg,#14241f,#05100c)",
    priority: "high",
    target_date: "2027-06-01",
    money_needed: "150000000",
    importance: "Success that doesn't include this is incomplete.",
    story: "Perform Umrah with 2–3 people by June.",
    why: "I want to stand in front of the Kaaba with the people I love.",
    feeling: "Peace",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHgxNjAwNjYxLWltYWdlLWt3dnhwN2dqLmpwZw.jpg",
    milestones: ["Passports and documents ready", "Save the full package amount", "Book the June package"],
  },
  {
    title: "Pair of Gold Bangles",
    glyph: "💛",
    accent: "linear-gradient(145deg,#332a12,#100c04)",
    priority: "medium",
    target_date: "2027-03-01",
    money_needed: "60000000",
    importance: "Earned gold, not borrowed shine.",
    story: "Buy a pair of gold bangles.",
    why: "Gold is the proof that the work turned into something real.",
    feeling: "Earned",
    cover:
      "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA0L2JzMzE1LWltYWdlLmpwZw.jpg",
    milestones: ["Save 50%", "Choose the design and weight", "Buy them"],
  },
  {
    title: "PS5 / Gaming PC",
    glyph: "🎮",
    accent: "linear-gradient(145deg,#161a2e,#07090f)",
    priority: "low",
    target_date: "2027-12-31",
    money_needed: "40000000",
    importance: "A reward, not an escape.",
    story: "Get a PS5 or build a gaming PC.",
    why: "I'll buy it with money that already did its job.",
    feeling: "Reward",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/BA8GFCHSCB.jpg",
    milestones: ["Decide PS5 vs PC", "Save the full amount", "Buy it with zero guilt"],
  },
  {
    title: "MacBook — M1/M2, 32GB, 1TB",
    glyph: "💻",
    accent: "linear-gradient(145deg,#1a2430,#070b0f)",
    priority: "medium",
    target_date: "2027-03-31",
    money_needed: "45000000",
    importance: "The tool has to stop being the excuse.",
    story: "Upgrade the MacBook to at least M1 or M2, 32GB RAM, 1TB.",
    why: "No more 'my machine can't' — 32GB and 1TB ends that.",
    feeling: "Sharper",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxNDU0Ny1pbWFnZS1rd3lzYmVjYi5qcGc.jpg",
    milestones: ["Save 50%", "Sell the old laptop", "Buy the right spec"],
  },
  {
    title: "iPhone 14 Pro Max",
    glyph: "📱",
    accent: "linear-gradient(145deg,#22232a,#0a0b0f)",
    priority: "medium",
    target_date: "2027-02-28",
    money_needed: "25000000",
    importance: "A flagship I actually own.",
    story: "Buy an iPhone 14 Pro Max for myself by February.",
    why: "No installments. No guilt. Mine.",
    feeling: "Clean",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/X0R5VP6BSB.jpg",
    milestones: ["Save the full amount", "Choose storage and colour", "Buy it outright"],
  },
  {
    title: "iPhone for Mom — 12/13, Pink",
    glyph: "🎁",
    accent: "linear-gradient(145deg,#2a1620,#10060b)",
    priority: "high",
    target_date: "2027-02-28",
    money_needed: "12000000",
    importance: "The first big thing should be for her.",
    story: "Buy Mom an iPhone 12 or 13 in pink.",
    why: "She never asks for anything. This is the first big thing I buy with my own money.",
    feeling: "Grateful",
    cover:
      "https://images.rawpixel.com/editor_1024/cHJpdmF0ZS9zdGF0aWMvaW1hZ2Uvd2Vic2l0ZS8yMDIyLTA0L2xyL2JzMTExLWltYWdlLWt3dng2N2Q0LmpwZw.jpg",
    milestones: ["Save the full amount", "Find a pink 12 or 13", "Give it to her"],
  },
  {
    title: "$5,000 / Month Stable Income",
    glyph: "💰",
    accent: "linear-gradient(145deg,#3a2f14,#0f0c05)",
    priority: "high",
    target_date: null,
    money_needed: null,
    importance: "The number the rest of the life stands on.",
    story: "Reach a stable monthly income of $5,000.",
    why: "I'm done being one bad month away from panic.",
    feeling: "Safe",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/3OEXFDXO6K.jpg",
    milestones: ["First $1,000 month", "Reach $3,000 months", "Hold $5,000 for 3 months"],
  },
  {
    title: "Home Renovation",
    glyph: "🏠",
    accent: "linear-gradient(145deg,#231d18,#0c0906)",
    priority: "medium",
    target_date: "2027-12-31",
    money_needed: "150000000",
    importance: "The house should match the person.",
    story: "Renovate the home.",
    why: "The space I live in should feel like the life I'm building.",
    feeling: "Settled",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvcHUyMzM1MTgwLWltYWdlLWt3dndpYmE1LmpwZw.jpg",
    milestones: ["Plan and budget", "Save 50%", "Start the work"],
  },
  {
    title: "Content Creation Setup",
    glyph: "🎥",
    accent: "linear-gradient(145deg,#1b1a24,#08070d)",
    priority: "medium",
    target_date: "2027-05-31",
    money_needed: "30000000",
    importance: "Buy the minimum, start publishing.",
    story: "Softbox light, podcast mic, phone — a real content setup.",
    why: "Stop waiting for perfect gear. Build the setup and start.",
    feeling: "Ready",
    cover: "https://cdn.stocksnap.io/img-thumbs/960w/NJCWWNF3FM.jpg",
    milestones: ["List the exact gear", "Buy light and mic", "Record the first video"],
  },
  {
    title: "Instagram 100k · YouTube 50k",
    glyph: "📈",
    accent: "linear-gradient(145deg,#201626,#0a0610)",
    priority: "medium",
    target_date: "2027-12-31",
    money_needed: null,
    importance: "Distribution is leverage.",
    story: "Grow Instagram to 100k and YouTube to 50k.",
    why: "Attention is income. Distribution is the multiplier.",
    feeling: "Loud",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvaXMxNjkyMS1pbWFnZS1rejJkeHU4My5qcGc.jpg",
    milestones: ["Post 30 days straight", "Reach 10k on Instagram", "100k IG + 50k YouTube"],
  },
  {
    title: "Northern Areas Trip",
    glyph: "🏔️",
    accent: "linear-gradient(145deg,#142420,#060f0c)",
    priority: "low",
    target_date: "2027-07-31",
    money_needed: "20000000",
    importance: "Memories are part of the life.",
    story: "Visit the northern areas — solo or with family.",
    why: "The life is not only the work. It has to be lived too.",
    feeling: "Alive",
    cover:
      "https://images.rawpixel.com/editor_1024/czNmcy1wcml2YXRlL3Jhd3BpeGVsX2ltYWdlcy93ZWJzaXRlX2NvbnRlbnQvbHIvbnMyMDY3OS1pbWFnZS1rd3lyeGQwaC5qcGc.jpg",
    milestones: ["Choose the route", "Save the budget", "Book and go"],
  },
];

async function main() {
  const ds = await getDataSource();
  const owner = env().OWNER_USER_ID;

  await ds.query("DELETE FROM reports");
  await ds.query("DELETE FROM daily_logs");
  await ds.query("DELETE FROM scores_daily");
  await ds.query("DELETE FROM dreams");
  console.log("cleared reports, logs, scores, dreams");

  const dreams = ds.getRepository(Dream);
  const emotions = ds.getRepository(DreamEmotion);
  const milestones = ds.getRepository(Milestone);
  const savingsRepo = ds.getRepository(Savings);

  let created = 0;
  for (const goal of GOALS) {
    const dream = await dreams.save(
      dreams.create({
        user_id: owner,
        title: goal.title,
        glyph: goal.glyph,
        accent: goal.accent,
        priority: goal.priority,
        status: "active",
        target_date: goal.target_date,
        money_needed: goal.money_needed,
        progress: 0,
        importance_note: goal.importance,
        cover_image_url: goal.cover,
        last_touched_at: null,
      }),
    );
    created += 1;

    await emotions.save(
      emotions.create({
        dream_id: dream.id,
        story: goal.story,
        emotional_reason: goal.why,
        feeling: goal.feeling,
        resurface_weight: goal.priority === "high" ? 2 : 1,
      }),
    );

    let sort = 0;
    for (const title of goal.milestones) {
      await milestones.save(milestones.create({ dream_id: dream.id, title, sort: sort++ }));
    }

    if (goal.money_needed) {
      await savingsRepo.save(
        savingsRepo.create({
          dream_id: dream.id,
          target_amount: goal.money_needed,
          saved_amount: "0",
          currency: env().CURRENCY,
        }),
      );
    }
  }

  console.log(`created ${created} goals`);
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
