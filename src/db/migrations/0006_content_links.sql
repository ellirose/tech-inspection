ALTER TABLE "case_study" ADD COLUMN "outcomes" jsonb;--> statement-breakpoint
ALTER TABLE "case_study" ADD COLUMN "industry_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "case_study" ADD COLUMN "service_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "case_study" ADD COLUMN "method_keys" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "service_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "faq" ADD COLUMN "method_keys" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "industry" ADD COLUMN "service_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "industry" ADD COLUMN "method_keys" jsonb DEFAULT '[]'::jsonb NOT NULL;