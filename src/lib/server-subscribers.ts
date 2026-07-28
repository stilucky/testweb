import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, join } from "path";
import type { EmailCampaign, Subscriber } from "@/store/subscriberStore";

export type SubscriberSettings = {
  subscribers: Subscriber[];
  emailCampaigns: EmailCampaign[];
};

export const SUBSCRIBERS_FILE =
  process.env.LUNELLE_SUBSCRIBERS_FILE ||
  join(/*turbopackIgnore: true*/ process.cwd(), "public", "uploads", "subscribers.json");

export async function readSubscriberSettings(): Promise<SubscriberSettings | null> {
  try {
    const raw = await readFile(SUBSCRIBERS_FILE, "utf8");
    const data = JSON.parse(raw) as Partial<SubscriberSettings>;

    if (!Array.isArray(data.subscribers) || !Array.isArray(data.emailCampaigns)) return null;
    return {
      subscribers: data.subscribers,
      emailCampaigns: data.emailCampaigns,
    };
  } catch {
    return null;
  }
}

export async function writeSubscriberSettings(settings: SubscriberSettings) {
  await mkdir(dirname(SUBSCRIBERS_FILE), { recursive: true });
  await writeFile(SUBSCRIBERS_FILE, JSON.stringify(settings, null, 2), "utf8");
  return settings;
}
