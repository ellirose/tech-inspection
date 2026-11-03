CREATE TYPE "public"."certification_kind" AS ENUM('system', 'personnel');--> statement-breakpoint
CREATE TYPE "public"."document_kind" AS ENUM('policy', 'accountability');--> statement-breakpoint
CREATE TYPE "public"."lead_channel" AS ENUM('email', 'phone', 'whatsapp');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('form_quote', 'form_contact', 'chatbot');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'quoted', 'won', 'lost');--> statement-breakpoint
CREATE TYPE "public"."lead_urgency" AS ENUM('scheduled', 'priority', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."publish_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"diff" jsonb,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "case_study" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"slug" text NOT NULL,
	"title" jsonb NOT NULL,
	"client_name" text,
	"sector" jsonb,
	"industry_id" uuid,
	"challenge" jsonb NOT NULL,
	"solution" jsonb NOT NULL,
	"results" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"publish_permission" boolean DEFAULT false NOT NULL,
	CONSTRAINT "case_study_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "case_study_service" (
	"case_study_id" uuid NOT NULL,
	"service_id" uuid NOT NULL,
	CONSTRAINT "case_study_service_case_study_id_service_id_pk" PRIMARY KEY("case_study_id","service_id")
);
--> statement-breakpoint
CREATE TABLE "certification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"key" text NOT NULL,
	"kind" "certification_kind" DEFAULT 'system' NOT NULL,
	"code" text NOT NULL,
	"ring" text,
	"title" jsonb NOT NULL,
	"body" jsonb NOT NULL,
	"certifier" text,
	"certificate_number" text,
	"scope" jsonb,
	"issue_date" date,
	"expiry_date" date,
	"seal_media_id" uuid,
	"pdf_url" text,
	"usage_notes" text,
	CONSTRAINT "certification_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "client" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"name" text NOT NULL,
	"logo" text NOT NULL,
	"square" boolean DEFAULT false NOT NULL,
	"show_logo" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "company_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"kind" "document_kind" NOT NULL,
	"code" text NOT NULL,
	"title" jsonb NOT NULL,
	"file_url" text NOT NULL,
	"version" text,
	"year" integer,
	"thumbnail" text
);
--> statement-breakpoint
CREATE TABLE "contact_channel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"role" jsonb NOT NULL,
	"scope" jsonb NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faq" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"question" jsonb NOT NULL,
	"answer" jsonb NOT NULL,
	"category" text DEFAULT 'general' NOT NULL,
	"service_id" uuid,
	"show_on_home" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "industry" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"slug" text NOT NULL,
	"name" jsonb NOT NULL,
	"intro" jsonb NOT NULL,
	"components" jsonb NOT NULL,
	"image" text,
	"seo_title" jsonb,
	"seo_description" jsonb,
	CONSTRAINT "industry_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "lead" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"source" "lead_source" NOT NULL,
	"lang" text DEFAULT 'es' NOT NULL,
	"services" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"methods" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"industry" text,
	"component" text,
	"quantity" text,
	"location" text,
	"city" text,
	"urgency" "lead_urgency",
	"description" text,
	"attachments" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"name" text NOT NULL,
	"company" text,
	"role" text,
	"email" text,
	"phone" text,
	"preferred_channel" "lead_channel",
	"consent" boolean DEFAULT false NOT NULL,
	"consent_at" timestamp with time zone,
	"attribution" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_to" text,
	CONSTRAINT "lead_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
CREATE TABLE "lead_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_id" uuid NOT NULL,
	"type" text NOT NULL,
	"from_status" "lead_status",
	"to_status" "lead_status",
	"note" text,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"storage_key" text NOT NULL,
	"url" text NOT NULL,
	"mime" text NOT NULL,
	"size_bytes" integer NOT NULL,
	"width" integer,
	"height" integer,
	"alt" text,
	"caption" text,
	"uploaded_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_storage_key_unique" UNIQUE("storage_key")
);
--> statement-breakpoint
CREATE TABLE "method" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"key" text NOT NULL,
	"slug" text NOT NULL,
	"code" text NOT NULL,
	"name" jsonb NOT NULL,
	"tagline" jsonb NOT NULL,
	"intro" jsonb NOT NULL,
	"body" jsonb NOT NULL,
	"advantages" jsonb NOT NULL,
	"detects" jsonb NOT NULL,
	"steps" jsonb NOT NULL,
	"cover" text NOT NULL,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"video" jsonb,
	"seo_title" jsonb,
	"seo_description" jsonb,
	CONSTRAINT "method_key_unique" UNIQUE("key"),
	CONSTRAINT "method_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "page_block" (
	"key" text PRIMARY KEY NOT NULL,
	"data" jsonb NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "redirect" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_path" text NOT NULL,
	"to_path" text NOT NULL,
	"status_code" integer DEFAULT 308 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	CONSTRAINT "redirect_from_path_unique" UNIQUE("from_path")
);
--> statement-breakpoint
CREATE TABLE "service" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"slug" text NOT NULL,
	"icon" text NOT NULL,
	"image" text NOT NULL,
	"gallery" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"name" jsonb NOT NULL,
	"short" jsonb NOT NULL,
	"body" jsonb NOT NULL,
	"scope" jsonb NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"seo_title" jsonb,
	"seo_description" jsonb,
	CONSTRAINT "service_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "service_industry" (
	"service_id" uuid NOT NULL,
	"industry_id" uuid NOT NULL,
	CONSTRAINT "service_industry_service_id_industry_id_pk" PRIMARY KEY("service_id","industry_id")
);
--> statement-breakpoint
CREATE TABLE "service_method" (
	"service_id" uuid NOT NULL,
	"method_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "service_method_service_id_method_id_pk" PRIMARY KEY("service_id","method_id")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'site' NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
CREATE TABLE "stat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"value" integer NOT NULL,
	"prefix" text,
	"suffix" text,
	"label" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_member" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "publish_status" DEFAULT 'published' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" text,
	"name" text NOT NULL,
	"role" jsonb NOT NULL,
	"bio" jsonb,
	"photo" text,
	"email" text,
	"is_leadership" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "case_study" ADD CONSTRAINT "case_study_industry_id_industry_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_service" ADD CONSTRAINT "case_study_service_case_study_id_case_study_id_fk" FOREIGN KEY ("case_study_id") REFERENCES "public"."case_study"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "case_study_service" ADD CONSTRAINT "case_study_service_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certification" ADD CONSTRAINT "certification_seal_media_id_media_id_fk" FOREIGN KEY ("seal_media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faq" ADD CONSTRAINT "faq_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_event" ADD CONSTRAINT "lead_event_lead_id_lead_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."lead"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_industry" ADD CONSTRAINT "service_industry_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_industry" ADD CONSTRAINT "service_industry_industry_id_industry_id_fk" FOREIGN KEY ("industry_id") REFERENCES "public"."industry"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_method" ADD CONSTRAINT "service_method_service_id_service_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."service"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_method" ADD CONSTRAINT "service_method_method_id_method_id_fk" FOREIGN KEY ("method_id") REFERENCES "public"."method"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint
CREATE INDEX "lead_created_at_idx" ON "lead" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "lead_status_idx" ON "lead" USING btree ("status");--> statement-breakpoint
CREATE INDEX "lead_event_lead_idx" ON "lead_event" USING btree ("lead_id");