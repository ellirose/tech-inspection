CREATE TABLE "not_found_hit" (
	"path" text PRIMARY KEY NOT NULL,
	"hits" integer DEFAULT 1 NOT NULL,
	"referrer" text,
	"first_seen" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "not_found_hit_last_seen_idx" ON "not_found_hit" USING btree ("last_seen");