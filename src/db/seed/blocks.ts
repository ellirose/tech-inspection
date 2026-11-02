// Fixed page sections stored in page_block, keyed by block name. The shapes come from the original
// content files; stage 4 replaces these inferred types with Zod schemas shared with the admin forms.
import { home } from "@/content/home";
import {
  closing,
  cover,
  credentials,
  methodsApplied,
  partner,
  process,
  standards,
  timeline,
  timelineIntro,
  tiqms,
  whyBit,
} from "@/content/deck";

/** Home copy without the experience counters, which live in the stat table. */
export const homeBlock = {
  ...home,
  hero: Object.fromEntries(Object.entries(home.hero).filter(([k]) => k !== "stats")) as Omit<typeof home.hero, "stats">,
};

export const blocks = {
  cover,
  timelineIntro,
  timeline,
  credentials,
  whyBit,
  methodsApplied,
  process,
  standards,
  partner,
  tiqms,
  closing,
};

export type PageBlocks = typeof blocks & { home: typeof homeBlock };
export type PageBlockKey = keyof PageBlocks;
