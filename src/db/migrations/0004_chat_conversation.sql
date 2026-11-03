CREATE TABLE "chat_conversation" (
	"id" uuid PRIMARY KEY NOT NULL,
	"lang" text NOT NULL,
	"page" text,
	"messages" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"lead_reference" text,
	"model" text NOT NULL,
	"input_tokens" integer DEFAULT 0 NOT NULL,
	"cached_tokens" integer DEFAULT 0 NOT NULL,
	"output_tokens" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "chat_conversation_updated_at_idx" ON "chat_conversation" USING btree ("updated_at");