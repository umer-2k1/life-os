import type { MigrationInterface, QueryRunner } from "typeorm";

export class Init1795438204251 implements MigrationInterface {
    name = 'Init1795438204251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "profiles" ("id" uuid NOT NULL, "display_name" character varying, "north_star_amount" bigint, "north_star_label" character varying, "identity_line" character varying, "motto" character varying NOT NULL DEFAULT 'Make a shit ton of money. Nobody cares about it.', "timezone" character varying NOT NULL DEFAULT 'Asia/Karachi', "currency" character varying NOT NULL DEFAULT 'PKR', "pin_hash" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8e520eb4da7dc01d0e190447c8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dream_emotions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dream_id" uuid NOT NULL, "story" text, "emotional_reason" text, "feeling" character varying, "voice_note_url" character varying, "resurface_weight" integer NOT NULL DEFAULT '1', CONSTRAINT "REL_fffa5b426a6d8afc74d2f180af" UNIQUE ("dream_id"), CONSTRAINT "PK_ace8ee8a59db89cab81c5d4e3ac" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "dream_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dream_id" uuid NOT NULL, "url" character varying NOT NULL, "caption" character varying, "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_9cf476c62c0d37ca0b73b7ec663" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "milestones" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dream_id" uuid NOT NULL, "title" character varying NOT NULL, "done" boolean NOT NULL DEFAULT false, "done_at" date, "sort" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_0bdbfe399c777a6a8520ff902d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "savings_id" uuid NOT NULL, "amount" bigint NOT NULL, "note" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_56eaf6b74609e5984e882673977" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "savings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "dream_id" uuid NOT NULL, "target_amount" bigint NOT NULL DEFAULT '0', "saved_amount" bigint NOT NULL DEFAULT '0', "currency" character varying NOT NULL DEFAULT 'PKR', "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_53a07f2d003d630bddb26c6da9" UNIQUE ("dream_id"), CONSTRAINT "PK_12862ba6871fc7be04cbd26230c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."dreams_priority_enum" AS ENUM('low', 'medium', 'high')`);
        await queryRunner.query(`CREATE TYPE "public"."dreams_status_enum" AS ENUM('active', 'achieved', 'paused')`);
        await queryRunner.query(`CREATE TABLE "dreams" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "title" character varying NOT NULL, "cover_image_url" character varying, "glyph" character varying, "accent" character varying, "priority" "public"."dreams_priority_enum" NOT NULL DEFAULT 'medium', "importance_note" text, "target_date" date, "money_needed" bigint, "progress" integer NOT NULL DEFAULT '0', "status" "public"."dreams_status_enum" NOT NULL DEFAULT 'active', "last_touched_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b4f37d6173d7b9d9db610860082" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fd225e59284e93e448d0ef28ce" ON "dreams" ("status") `);
        await queryRunner.query(`CREATE TYPE "public"."activities_relevance_enum" AS ENUM('on_track', 'neutral', 'waste')`);
        await queryRunner.query(`CREATE TYPE "public"."activities_kanban_column_enum" AS ENUM('today', 'doing', 'done', 'wasted')`);
        await queryRunner.query(`CREATE TABLE "activities" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "daily_log_id" uuid NOT NULL, "dream_id" uuid, "text" character varying NOT NULL, "relevance" "public"."activities_relevance_enum" NOT NULL DEFAULT 'neutral', "score_delta" integer NOT NULL DEFAULT '0', "time_cost_days" double precision NOT NULL DEFAULT '0', "suggestion" text, "kanban_column" "public"."activities_kanban_column_enum" NOT NULL DEFAULT 'done', "priority" boolean NOT NULL DEFAULT false, "activity_date" date, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reflections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "daily_log_id" uuid NOT NULL, "accomplished" text, "wasted" text, "improve" text, CONSTRAINT "REL_dc179673428f01e87cfd366a9f" UNIQUE ("daily_log_id"), CONSTRAINT "PK_4154d824fef84e88b13fbe26b06" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."daily_logs_input_kind_enum" AS ENUM('voice', 'text', 'mcp', 'web', 'telegram')`);
        await queryRunner.query(`CREATE TABLE "daily_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "log_date" date NOT NULL, "raw_input" text, "input_kind" "public"."daily_logs_input_kind_enum", "score" integer NOT NULL DEFAULT '0', "summary_bullets" text NOT NULL, "trajectory_note" text, "next_action" text, "asked_at" TIMESTAMP WITH TIME ZONE, "last_ping_at" TIMESTAMP WITH TIME ZONE, "answered" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_4a7601932f996cebac7f87ca70e" UNIQUE ("user_id", "log_date"), CONSTRAINT "PK_ea32d6160ba0b85cb14426c50b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."reports_kind_enum" AS ENUM('weekly', 'monthly', 'custom')`);
        await queryRunner.query(`CREATE TABLE "reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "kind" "public"."reports_kind_enum" NOT NULL, "range_start" date NOT NULL, "range_end" date NOT NULL, "content_md" text NOT NULL, "content_json" text, "pdf_url" character varying, "emailed_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "scores_daily" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "day" date NOT NULL, "score" integer NOT NULL DEFAULT '0', "points" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_720fc363dfb082c21e5cf50bfd3" UNIQUE ("user_id", "day"), CONSTRAINT "PK_cc8a471634cdcd521f649f283c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "ai_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "provider_order" text NOT NULL, "selected_model" character varying, "keys" text NOT NULL, "temperature" character varying, CONSTRAINT "PK_b6c95e8fdde441f7e72e1d4f10c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notification_prefs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "daily_ask_time" character varying NOT NULL DEFAULT '00:00', "reask_gap_hours" integer NOT NULL DEFAULT '6', "quiet_start" character varying NOT NULL DEFAULT '00:00', "quiet_end" character varying NOT NULL DEFAULT '06:00', "channels" text NOT NULL, "push_enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_7ab4714e219e6ddf90fa8d8b0e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "telegram_links" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "chat_id" character varying NOT NULL, "username" character varying, "linked_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_15c55465df44f5720fe056b0cbb" UNIQUE ("chat_id"), CONSTRAINT "PK_5d7257e051356ddcbbd767c89b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "dream_emotions" ADD CONSTRAINT "FK_fffa5b426a6d8afc74d2f180af0" FOREIGN KEY ("dream_id") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "dream_images" ADD CONSTRAINT "FK_66a401c450805eb86fce86ddccf" FOREIGN KEY ("dream_id") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "milestones" ADD CONSTRAINT "FK_cc95e369927036d843b9b45f7c2" FOREIGN KEY ("dream_id") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "savings_entries" ADD CONSTRAINT "FK_a66bf05c1b824d7c9d0bcdbdf31" FOREIGN KEY ("savings_id") REFERENCES "savings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "savings" ADD CONSTRAINT "FK_53a07f2d003d630bddb26c6da9b" FOREIGN KEY ("dream_id") REFERENCES "dreams"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "activities" ADD CONSTRAINT "FK_1d40dcd2c72c41018cabfcbb5d5" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reflections" ADD CONSTRAINT "FK_dc179673428f01e87cfd366a9f8" FOREIGN KEY ("daily_log_id") REFERENCES "daily_logs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reflections" DROP CONSTRAINT "FK_dc179673428f01e87cfd366a9f8"`);
        await queryRunner.query(`ALTER TABLE "activities" DROP CONSTRAINT "FK_1d40dcd2c72c41018cabfcbb5d5"`);
        await queryRunner.query(`ALTER TABLE "savings" DROP CONSTRAINT "FK_53a07f2d003d630bddb26c6da9b"`);
        await queryRunner.query(`ALTER TABLE "savings_entries" DROP CONSTRAINT "FK_a66bf05c1b824d7c9d0bcdbdf31"`);
        await queryRunner.query(`ALTER TABLE "milestones" DROP CONSTRAINT "FK_cc95e369927036d843b9b45f7c2"`);
        await queryRunner.query(`ALTER TABLE "dream_images" DROP CONSTRAINT "FK_66a401c450805eb86fce86ddccf"`);
        await queryRunner.query(`ALTER TABLE "dream_emotions" DROP CONSTRAINT "FK_fffa5b426a6d8afc74d2f180af0"`);
        await queryRunner.query(`DROP TABLE "telegram_links"`);
        await queryRunner.query(`DROP TABLE "notification_prefs"`);
        await queryRunner.query(`DROP TABLE "ai_settings"`);
        await queryRunner.query(`DROP TABLE "scores_daily"`);
        await queryRunner.query(`DROP TABLE "reports"`);
        await queryRunner.query(`DROP TYPE "public"."reports_kind_enum"`);
        await queryRunner.query(`DROP TABLE "daily_logs"`);
        await queryRunner.query(`DROP TYPE "public"."daily_logs_input_kind_enum"`);
        await queryRunner.query(`DROP TABLE "reflections"`);
        await queryRunner.query(`DROP TABLE "activities"`);
        await queryRunner.query(`DROP TYPE "public"."activities_kanban_column_enum"`);
        await queryRunner.query(`DROP TYPE "public"."activities_relevance_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fd225e59284e93e448d0ef28ce"`);
        await queryRunner.query(`DROP TABLE "dreams"`);
        await queryRunner.query(`DROP TYPE "public"."dreams_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."dreams_priority_enum"`);
        await queryRunner.query(`DROP TABLE "savings"`);
        await queryRunner.query(`DROP TABLE "savings_entries"`);
        await queryRunner.query(`DROP TABLE "milestones"`);
        await queryRunner.query(`DROP TABLE "dream_images"`);
        await queryRunner.query(`DROP TABLE "dream_emotions"`);
        await queryRunner.query(`DROP TABLE "profiles"`);
    }

}
