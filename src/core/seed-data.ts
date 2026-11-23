/**
 * The 8 starter dreams. Neutral, editable, no invented personal secrets.
 * Money is in minor units (paisa).
 */
export type SeedDream = {
  title: string;
  glyph: string;
  accent: string;
  priority: "low" | "medium" | "high";
  target_date: string | null;
  money_needed: string | null;
  progress: number;
  importance_note: string;
  story: string;
  emotional_reason: string;
  feeling: string;
  milestones: string[];
};

export const SEED_DREAMS: SeedDream[] = [
  {
    title: "Dream Car",
    glyph: "🏎️",
    accent: "linear-gradient(145deg,#3a2f14,#120d04)",
    priority: "high",
    target_date: "2027-12-01",
    money_needed: "800000000",
    progress: 12,
    importance_note: "Proof that the work paid off.",
    story: "The car I promised myself when nobody was watching.",
    emotional_reason:
      "I don't want the car. I want to pull up in it and know I built the life that paid for it.",
    feeling: "Inevitable",
    milestones: ["Save 25% of the target", "Pick the exact spec", "Book a test drive"],
  },
  {
    title: "Umrah",
    glyph: "🕋",
    accent: "linear-gradient(145deg,#14241f,#05100c)",
    priority: "high",
    target_date: "2027-02-18",
    money_needed: "60000000",
    progress: 20,
    importance_note: "Not optional. A debt to myself.",
    story: "Stand in front of the Kaaba with the people I love.",
    emotional_reason:
      "Everything I chase means nothing if I don't stand there at least once with a clear heart.",
    feeling: "Peace",
    milestones: ["Save the full amount", "Get the passport ready", "Book the package"],
  },
  {
    title: "PlayStation 5",
    glyph: "🎮",
    accent: "linear-gradient(145deg,#161a2e,#07090f)",
    priority: "low",
    target_date: "2026-01-15",
    money_needed: "15000000",
    progress: 85,
    importance_note: "Small reward, earned not given.",
    story: "A reward I want to buy with money I actually earned.",
    emotional_reason: "I want to press buy and feel zero guilt because it came from the work.",
    feeling: "Reward",
    milestones: ["Save the full amount", "Buy it without touching savings"],
  },
  {
    title: "Gaming PC",
    glyph: "🖥️",
    accent: "linear-gradient(145deg,#2a142e,#0d0511)",
    priority: "medium",
    target_date: "2026-06-01",
    money_needed: "45000000",
    progress: 8,
    importance_note: "Build it, don't finance it.",
    story: "The setup I keep designing in my head.",
    emotional_reason: "Every part should feel like a receipt from months of discipline.",
    feeling: "Earned",
    milestones: ["Pick the parts list", "Save 50%", "Buy and build"],
  },
  {
    title: "Laptop Upgrade",
    glyph: "💻",
    accent: "linear-gradient(145deg,#1a2430,#070b0f)",
    priority: "medium",
    target_date: "2026-03-01",
    money_needed: "35000000",
    progress: 30,
    importance_note: "The tool that makes the money.",
    story: "A machine that stops being the excuse.",
    emotional_reason: "I can't blame slow hardware for slow progress anymore.",
    feeling: "Sharper",
    milestones: ["Decide the model", "Save the full amount", "Migrate everything"],
  },
  {
    title: "Financial Growth",
    glyph: "💰",
    accent: "linear-gradient(145deg,#3a2f14,#0f0c05)",
    priority: "high",
    target_date: null,
    money_needed: "1000000000",
    progress: 18,
    importance_note: "The North Star in practice.",
    story: "Income that doesn't depend on mood or motivation.",
    emotional_reason: "I'm done being one bad month away from panic.",
    feeling: "Free",
    milestones: ["First 100k month", "Six months of runway", "One income stream automated"],
  },
  {
    title: "Personal Development",
    glyph: "🧠",
    accent: "linear-gradient(145deg,#142a24,#060f0c)",
    priority: "high",
    target_date: null,
    money_needed: null,
    progress: 22,
    importance_note: "The person has to grow into the life.",
    story: "Become someone who doesn't need to be pushed.",
    emotional_reason: "The goal isn't the money. It's never being the weakest person in the room again.",
    feeling: "Disciplined",
    milestones: ["Read 12 books", "90-day training streak", "Wake before 7 for a month"],
  },
  {
    title: "Career & Skills",
    glyph: "🚀",
    accent: "linear-gradient(145deg,#1a1430,#080611)",
    priority: "high",
    target_date: "2026-12-31",
    money_needed: null,
    progress: 35,
    importance_note: "Skill compounds faster than anything else.",
    story: "Be undeniable at what I do.",
    emotional_reason: "I want to be the person people can't afford to lose.",
    feeling: "Undeniable",
    milestones: ["Ship 3 portfolio projects", "Land 2 paying clients", "Speak at one event"],
  },
];
