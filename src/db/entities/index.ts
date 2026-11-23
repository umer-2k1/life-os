export { Profile } from "./profile.entity";
export { Dream, type Priority, type DreamStatus } from "./dream.entity";
export { DreamEmotion } from "./dream-emotion.entity";
export { DreamImage } from "./dream-image.entity";
export { Milestone } from "./milestone.entity";
export { Savings } from "./savings.entity";
export { SavingsEntry } from "./savings-entry.entity";
export { DailyLog, type InputKind } from "./daily-log.entity";
export { Activity, type Relevance, type KanbanColumn } from "./activity.entity";
export { Reflection } from "./reflection.entity";
export { Report, type ReportKind } from "./report.entity";
export { ScoreDaily } from "./score-daily.entity";
export { AiSettings } from "./ai-settings.entity";
export { NotificationPrefs } from "./notification-prefs.entity";
export { TelegramLink } from "./telegram-link.entity";

import { Profile } from "./profile.entity";
import { Dream } from "./dream.entity";
import { DreamEmotion } from "./dream-emotion.entity";
import { DreamImage } from "./dream-image.entity";
import { Milestone } from "./milestone.entity";
import { Savings } from "./savings.entity";
import { SavingsEntry } from "./savings-entry.entity";
import { DailyLog } from "./daily-log.entity";
import { Activity } from "./activity.entity";
import { Reflection } from "./reflection.entity";
import { Report } from "./report.entity";
import { ScoreDaily } from "./score-daily.entity";
import { AiSettings } from "./ai-settings.entity";
import { NotificationPrefs } from "./notification-prefs.entity";
import { TelegramLink } from "./telegram-link.entity";

export const ENTITIES = [
  Profile,
  Dream,
  DreamEmotion,
  DreamImage,
  Milestone,
  Savings,
  SavingsEntry,
  DailyLog,
  Activity,
  Reflection,
  Report,
  ScoreDaily,
  AiSettings,
  NotificationPrefs,
  TelegramLink,
];
