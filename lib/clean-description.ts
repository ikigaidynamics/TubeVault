/**
 * Strip promotional / spam content from channel descriptions.
 * Patterns are matched per-channel or generically.
 */

const CHANNEL_STRIPS: Record<string, (RegExp | string)[]> = {
  anthony_chaffee_md: [
    /✅[\s\S]*?(?:off|$)/i,
  ],
  jeremy_ethier: [
    /Get your personalized training and nutrition plan here:[\s\S]*$/i,
  ],
  kurzgesagt: [
    /For updates on our videos and other news from the kurzgesagt universe[\s\S]*$/i,
  ],
  dr_william_li: [
    /Learn more at DrWilliamLi\.com/i,
  ],
  bright_insight: [
    /Help support me by contributing to my Locals or Patreon:[\s\S]*$/i,
  ],
  dr_brad_stanfield: [
    /Full guide \(free\) found here:[\s\S]*$/i,
  ],
  foundmyfitness: [
    /Go deeper at foundmyfitness\.com[\s\S]*$/i,
  ],
  graham_stephan: [
    /So Subscribe![\s\S]*$/i,
  ],
  unchartedx: [
    /Please consider the value-for-value model[\s\S]*$/i,
  ],
  ken_d_berry_md: [
    /Download your free PHD guidebook[\s\S]*$/i,
  ],
  geocosmic_rex: [
    /Please subscribe and share\s*!?/i,
  ],
  history_with_kayleigh: [
    /Email:[\s\S]*$/i,
    /Wanna do a Collab\?[\s\S]*$/i,
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
