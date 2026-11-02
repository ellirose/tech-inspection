// Content model (project design document §13.5). Translatable text is stored as { es, pt, en } JSON
// with Spanish required, matching the L10n type the front end already uses.
// Admin accounts (user, session, account, verification, two_factor) follow Better Auth's model.
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { L10n, L10nList } from "@/i18n/config";

export const publishStatus = pgEnum("publish_status", ["draft", "published"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by"),
};

/** Shared columns of every editable content table. */
const contentColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  status: publishStatus("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
};

// --- Site-wide settings ------------------------------------------------------

export type SiteSettings = {
  company: {
    name: string;
    short: string;
    address: string;
    country: L10n;
    mapsUrl: string;
    phone: string;
    phoneHref: string;
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
    emailHseq: string;
    hours: L10n;
  };
  founded: number;
  years: number;
  platformUrl: string;
  keyPartner: { name: string; since: number };
};

/** One row (id "site"): company data (NAP), contact lines, TI-QMS URL. */
export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("site"),
  data: jsonb("data").$type<SiteSettings>().notNull(),
  ...timestamps,
});

// --- Methods and services ----------------------------------------------------

export const method = pgTable("method", {
  ...contentColumns,
  key: text("key").notNull().unique(),
  slug: text("slug").notNull().unique(),
  code: text("code").notNull(),
  name: jsonb("name").$type<L10n>().notNull(),
  tagline: jsonb("tagline").$type<L10n>().notNull(),
  intro: jsonb("intro").$type<L10n>().notNull(),
  body: jsonb("body").$type<L10n>().notNull(),
  advantages: jsonb("advantages").$type<L10nList>().notNull(),
  detects: jsonb("detects").$type<L10nList>().notNull(),
  steps: jsonb("steps").$type<{ title: L10n; text: L10n }[]>().notNull(),
  cover: text("cover").notNull(),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  video: jsonb("video").$type<{ src: string; poster: string } | null>(),
  seoTitle: jsonb("seo_title").$type<L10n | null>(),
  seoDescription: jsonb("seo_description").$type<L10n | null>(),
});

export const service = pgTable("service", {
  ...contentColumns,
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  image: text("image").notNull(),
  gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
  name: jsonb("name").$type<L10n>().notNull(),
  short: jsonb("short").$type<L10n>().notNull(),
  body: jsonb("body").$type<[L10n, L10n]>().notNull(),
  scope: jsonb("scope").$type<L10nList>().notNull(),
  /** Copy written by the team as a placeholder; the client still has to confirm it. */
  needsReview: boolean("needs_review").notNull().default(false),
  seoTitle: jsonb("seo_title").$type<L10n | null>(),
  seoDescription: jsonb("seo_description").$type<L10n | null>(),
});

export const serviceMethod = pgTable(
  "service_method",
  {
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
    methodId: uuid("method_id")
      .notNull()
      .references(() => method.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.methodId] })],
);

export const industry = pgTable("industry", {
  ...contentColumns,
  slug: text("slug").notNull().unique(),
  name: jsonb("name").$type<L10n>().notNull(),
  intro: jsonb("intro").$type<L10n>().notNull(),
  components: jsonb("components").$type<L10nList>().notNull(),
  image: text("image"),
  seoTitle: jsonb("seo_title").$type<L10n | null>(),
  seoDescription: jsonb("seo_description").$type<L10n | null>(),
});

export const serviceIndustry = pgTable(
  "service_industry",
  {
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
    industryId: uuid("industry_id")
      .notNull()
      .references(() => industry.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.serviceId, t.industryId] })],
);

// --- Trust: certifications, clients, cases, figures ---------------------------

export const certificationKind = pgEnum("certification_kind", ["system", "personnel"]);

export const certification = pgTable("certification", {
  ...contentColumns,
  key: text("key").notNull().unique(),
  kind: certificationKind("kind").notNull().default("system"),
  code: text("code").notNull(),
  /** Text running around the badge (system certifications only). */
  ring: text("ring"),
  title: jsonb("title").$type<L10n>().notNull(),
  body: jsonb("body").$type<L10n>().notNull(),
  certifier: text("certifier"),
  certificateNumber: text("certificate_number"),
  scope: jsonb("scope").$type<L10n | null>(),
  issueDate: date("issue_date"),
  expiryDate: date("expiry_date"),
  /** Official seal; stays empty until the certifier's usage manual has been followed. */
  sealMediaId: uuid("seal_media_id").references(() => media.id, { onDelete: "set null" }),
  pdfUrl: text("pdf_url"),
  usageNotes: text("usage_notes"),
});

export const client = pgTable("client", {
  ...contentColumns,
  name: text("name").notNull(),
  logo: text("logo").notNull(),
  square: boolean("square").notNull().default(false),
  /** The client confirmed its logo may be shown. */
  showLogo: boolean("show_logo").notNull().default(false),
});

export const caseStudy = pgTable("case_study", {
  ...contentColumns,
  slug: text("slug").notNull().unique(),
  title: jsonb("title").$type<L10n>().notNull(),
  clientName: text("client_name"),
  sector: jsonb("sector").$type<L10n | null>(),
  industryId: uuid("industry_id").references(() => industry.id, { onDelete: "set null" }),
  challenge: jsonb("challenge").$type<L10n>().notNull(),
  solution: jsonb("solution").$type<L10n>().notNull(),
  results: jsonb("results").$type<{ value: string; label: L10n }[]>().notNull().default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  publishPermission: boolean("publish_permission").notNull().default(false),
});

export const caseStudyService = pgTable(
  "case_study_service",
  {
    caseStudyId: uuid("case_study_id")
      .notNull()
      .references(() => caseStudy.id, { onDelete: "cascade" }),
    serviceId: uuid("service_id")
      .notNull()
      .references(() => service.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.caseStudyId, t.serviceId] })],
);

export const faq = pgTable("faq", {
  ...contentColumns,
  question: jsonb("question").$type<L10n>().notNull(),
  answer: jsonb("answer").$type<L10n>().notNull(),
  category: text("category").notNull().default("general"),
  serviceId: uuid("service_id").references(() => service.id, { onDelete: "set null" }),
  showOnHome: boolean("show_on_home").notNull().default(false),
});

/** Experience counters (home hero). */
export const stat = pgTable("stat", {
  ...contentColumns,
  value: integer("value").notNull(),
  prefix: text("prefix"),
  suffix: text("suffix"),
  label: jsonb("label").$type<L10n>().notNull(),
});

// --- Company: people, contact lines, documents ---------------------------------

export const teamMember = pgTable("team_member", {
  ...contentColumns,
  name: text("name").notNull(),
  role: jsonb("role").$type<L10n>().notNull(),
  bio: jsonb("bio").$type<L10n | null>(),
  photo: text("photo"),
  email: text("email"),
  isLeadership: boolean("is_leadership").notNull().default(false),
});

/** Customer-service directory on the contact page. */
export const contactChannel = pgTable("contact_channel", {
  ...contentColumns,
  role: jsonb("role").$type<L10n>().notNull(),
  scope: jsonb("scope").$type<L10n>().notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
});

export const documentKind = pgEnum("document_kind", ["policy", "accountability"]);

/** Downloadable HSEQ documents (policies, IMS scope, accountability reports). */
export const companyDocument = pgTable("company_document", {
  ...contentColumns,
  kind: documentKind("kind").notNull(),
  code: text("code").notNull(),
  title: jsonb("title").$type<L10n>().notNull(),
  fileUrl: text("file_url").notNull(),
  version: text("version"),
  year: integer("year"),
  thumbnail: text("thumbnail"),
});

// --- Fixed page sections ---------------------------------------------------------

/** Editable blocks of fixed pages (home, deck-derived sections) as typed JSON, keyed by block name. */
export const pageBlock = pgTable("page_block", {
  key: text("key").primaryKey(),
  data: jsonb("data").notNull(),
  status: publishStatus("status").notNull().default("published"),
  ...timestamps,
});

// --- Media and redirects -------------------------------------------------------------

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  storageKey: text("storage_key").notNull().unique(),
  url: text("url").notNull(),
  mime: text("mime").notNull(),
  sizeBytes: integer("size_bytes").notNull(),
  width: integer("width"),
  height: integer("height"),
  /** Spanish alt text, required for images (design document §9.3). */
  alt: text("alt"),
  caption: text("caption"),
  uploadedBy: text("uploaded_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const redirect = pgTable("redirect", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromPath: text("from_path").notNull().unique(),
  toPath: text("to_path").notNull(),
  statusCode: integer("status_code").notNull().default(308),
  active: boolean("active").notNull().default(true),
  ...timestamps,
});

// --- Leads -----------------------------------------------------------------------------

export const leadSource = pgEnum("lead_source", ["form_quote", "form_contact", "chatbot"]);
export const leadUrgency = pgEnum("lead_urgency", ["scheduled", "priority", "urgent"]);
export const leadChannel = pgEnum("lead_channel", ["email", "phone", "whatsapp"]);
export const leadStatus = pgEnum("lead_status", ["new", "contacted", "quoted", "won", "lost"]);

export type LeadAttribution = {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referrer?: string;
  landingPage?: string;
  submittedFrom?: string;
  device?: string;
};

/** Every lead regardless of origin (design document §11.3). */
export const lead = pgTable(
  "lead",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Short reference shown to the requester, e.g. TI-A8C9EC0B. */
    reference: text("reference").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    source: leadSource("source").notNull(),
    lang: text("lang").notNull().default("es"),
    services: jsonb("services").$type<string[]>().notNull().default([]),
    methods: jsonb("methods").$type<string[]>().notNull().default([]),
    industry: text("industry"),
    component: text("component"),
    quantity: text("quantity"),
    location: text("location"),
    city: text("city"),
    urgency: leadUrgency("urgency"),
    description: text("description"),
    attachments: jsonb("attachments").$type<{ key: string; name: string; size: number; mime: string }[]>().notNull().default([]),
    name: text("name").notNull(),
    company: text("company"),
    role: text("role"),
    email: text("email"),
    phone: text("phone"),
    preferredChannel: leadChannel("preferred_channel"),
    consent: boolean("consent").notNull().default(false),
    consentAt: timestamp("consent_at", { withTimezone: true }),
    attribution: jsonb("attribution").$type<LeadAttribution>().notNull().default({}),
    status: leadStatus("status").notNull().default("new"),
    assignedTo: text("assigned_to"),
  },
  (t) => [index("lead_created_at_idx").on(t.createdAt), index("lead_status_idx").on(t.status)],
);

/** Status changes and internal notes on a lead. */
export const leadEvent = pgTable(
  "lead_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    leadId: uuid("lead_id")
      .notNull()
      .references(() => lead.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    fromStatus: leadStatus("from_status"),
    toStatus: leadStatus("to_status"),
    note: text("note"),
    createdBy: text("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("lead_event_lead_idx").on(t.leadId)],
);

// --- Admin accounts ----------------------------------------------------------------------------
// Tables and field names are the ones Better Auth expects (src/lib/auth); the password hash lives in
// `account`, the TOTP secret and backup codes (encrypted by Better Auth) in `two_factor`.

export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  /** super_admin | editor | sales (src/lib/auth/roles.ts). */
  role: text("role").notNull().default("editor"),
  /** Deactivated users cannot sign in and lose their sessions. */
  active: boolean("active").notNull().default(true),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  /** Consecutive wrong passwords; reaching the limit sets lockedUntil. */
  failedLoginCount: integer("failed_login_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    token: text("token").notNull().unique(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    password: text("password"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

/** One-time tokens: setup and reset links (stored hashed), pending two-factor challenges. */
export const verification = pgTable(
  "verification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const twoFactor = pgTable(
  "two_factor",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    verified: boolean("verified").default(true),
    failedVerificationCount: integer("failed_verification_count").default(0),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
  },
  (t) => [index("two_factor_user_idx").on(t.userId), index("two_factor_secret_idx").on(t.secret)],
);

// --- Audit ---------------------------------------------------------------------------------

/** Who did what (design document §14.4): sign-ins, account changes and, from stage 4, every edit. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id"),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    diff: jsonb("diff"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_entity_idx").on(t.entity, t.entityId), index("audit_log_created_at_idx").on(t.createdAt)],
);

// --- Rate limiting ---------------------------------------------------------------------------

/** Fixed-window counters for public endpoints. Keys hold a hash of the visitor's IP, never the IP. */
export const rateLimit = pgTable("rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
});
