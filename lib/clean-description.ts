/**
 * Strip promotional / spam content from channel descriptions.
 * Patterns are matched per-channel or generically.
 */

const CHANNEL_STRIPS: Record<string, (RegExp | string)[]> = {
  anthony_chaffee_md: [
    /✅\s*Stone and Spear Skincare.*?(?:off|$)/is,
  ],
  jeremy_ethier: [
    /Get your personalized training and nutrition plan here:.*$/im,
  ],
  kurzgesagt: [
    /For updates on our videos and other news from the kurzgesagt universe.*$/im,
  ],
  dr_william_li: [
    /Learn more at DrWilliamLi\.com/i,
  ],
  bright_insight: [
    /Help support me by contributing to my Locals or Patreon:.*$/im,
  ],
  dr_brad_stanfield: [
    /Full guide \(free\) found here:.*$/is,
  ],
  foundmyfitness: [
    /Go deeper at foundmyfitness\.com.*$/is,
  ],
  graham_stephan: [
    /So Subscribe!.*$/is,
  ],
  unchartedx: [
    /Please consider the value-for-value model.*$/im,
  ],
  ken_d_berry_md: [
    /Download your free PHD guidebook.*$/is,
  ],
  geocosmic_rex: [
    /Please subscribe and share\s*!?/i,
  ],
  history_with_kayleigh: [
    /Email:.*$/is,
    /Wanna do a Collab\?.*$/im,
  ],
};

// Generic patterns to strip from any channel
const GENERIC_STRIPS: RegExp[] = [
  // URLs on their own line
  /^https?:\/\/\S+$/gm,
  // "Subscribe" CTAs
  /(?:please\s+)?subscribe\s+(?:and\s+)?(?:share|like|hit).*$/im,
  // Patreon/donation links
  /(?:patreon|locals|buymeacoffee|ko-fi)\.com\/\S+/gi,
  // Trailing whitespace and multiple newlines (3+)
  /\n{3,}/g,
];

export function cleanDescription(slug: string, raw: string): string {
  if (!raw) return "";

  let text = raw;

  // Apply channel-specific strips
  const channelPatterns = CHANNEL_STRIPS[slug];
  if (channelPatterns) {
    for (const pattern of channelPatterns) {
      if (typeof pattern === "string") {
        text = text.replace(pattern, "");
      } else {
        text = text.replace(pattern, "");
      }
    }
  }

  // Apply generic strips
  for (const pattern of GENERIC_STRIPS) {
    text = text.replace(pattern, "");
  }

  // Clean up trailing/leading whitespace and excessive newlines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
