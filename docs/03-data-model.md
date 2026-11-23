# 03 · Data Model

Postgres (Supabase). Single user, but `user_id` kept for RLS + future. Illustrative schema — refine during build.

## Tables

### `profiles`
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | = auth user id |
| display_name | text | |
| north_star_amount | numeric | target income / net worth |
| north_star_label | text | e.g. "₨ / $ net worth" |
| identity_line | text | "I'm someone who closes clients" |
| motto | text | default: "Make a shit ton of money. Nobody cares about it." |
| timezone | text | for cron windows |
| created_at | timestamptz | |

### `dreams`
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk) | |
| title | text | |
| cover_image_url | text | |
| priority | enum(low,medium,high) | |
| importance_note | text | |
| target_date | date | |
| money_needed | numeric | nullable |
| progress | int | 0–100 |
| status | enum(active,achieved,paused) | |
| last_touched_at | timestamptz | drives decay |
| created_at | timestamptz | |

### `dream_emotions` (the emotional anchor — first-class)
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| dream_id | uuid (fk) | |
| story | text | why I want it |
| emotional_reason | text | raw letter-to-self |
| feeling | text | mood/word |
| voice_note_url | text | optional |
| resurface_weight | int | how often to resurface |

### `dream_images`
| id | uuid | · | dream_id | uuid fk | · | url | text | · | caption | text | · | sort | int |

### `milestones`
| id | uuid | · | dream_id | uuid fk | · | title | text | · | done | bool | · | done_at | date | · | sort | int |

### `savings`
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| dream_id | uuid (fk) | one per money-dream |
| target_amount | numeric | |
| saved_amount | numeric | |
| currency | text | |
| updated_at | timestamptz | |

### `savings_entries` (history)
| id | uuid | · | savings_id | uuid fk | · | amount | numeric | · | note | text | · | created_at | timestamptz |

### `daily_logs` (one per day)
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk) | |
| log_date | date (unique per user) | |
| raw_input | text | transcript of voice/text update |
| input_kind | enum(voice,text,mcp) | |
| score | int | 0–100 (AI) |
| summary_bullets | jsonb | short bullets |
| trajectory_note | text | short |
| asked_at | timestamptz | re-ask state |
| last_ping_at | timestamptz | |
| answered | bool | |
| created_at | timestamptz | |

### `activities` (Kanban cards — parsed from the daily update)
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| daily_log_id | uuid (fk) | |
| dream_id | uuid (fk, nullable) | which goal it serves |
| text | text | short description |
| relevance | enum(on_track,neutral,waste) | green/amber/red |
| score_delta | int | points effect |
| time_cost_days | numeric | "days added to timeline" for waste |
| suggestion | text | short, bullet/keyword |
| column | enum(today,doing,done,wasted) | kanban state |
| created_at | timestamptz | |

### `reflections`
| id | uuid | · | daily_log_id | uuid fk | · | accomplished | text | · | wasted | text | · | improve | text |

### `reports`
| col | type | notes |
|-----|------|-------|
| id | uuid (pk) | |
| user_id | uuid (fk) | |
| kind | enum(weekly,monthly,custom) | |
| range_start | date | |
| range_end | date | |
| content_md | text | report body (markdown) |
| pdf_url | text | stored in Supabase Storage |
| emailed_at | timestamptz | |
| created_at | timestamptz | |

### `scores_daily` (fast heatmap source)
| user_id | uuid | · | day | date | · | score | int | · | points | int |

### `ai_settings`
| col | type | notes |
|-----|------|-------|
| user_id | uuid (pk) | |
| provider_order | jsonb | ["openrouter","groq","grok","deepseek"] |
| selected_model | text | nullable → auto |
| keys | jsonb (encrypted) | per-provider API keys |

### `notification_prefs`
| user_id | uuid | · | daily_ask_time | time | · | reask_gap_hours | int (default 6) | · | quiet_start/quiet_end | time | · | channels | jsonb (telegram/web/email) |

### `telegram_links`
| user_id | uuid | · | chat_id | text | · | linked_at | timestamptz |

## Relationships (quick)
- `dreams 1─* dream_images / milestones / dream_emotions`
- `dreams 1─1 savings 1─* savings_entries`
- `daily_logs 1─* activities`, `1─1 reflections`
- everything owned by `profiles.id` via RLS.

## Derived / computed
- **Decay**: `now - dreams.last_touched_at`.
- **Projected date**: pace from `scores_daily` + progress slope.
- **Streak**: consecutive days with a `daily_log` answered.
- **Heatmap**: `scores_daily`.
