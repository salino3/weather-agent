import { Context } from "grammy";

/**
 * Sanitizes and cleans input text to prevent Prompt Injection attacks
 * and mitigate malicious or control characters.
 */
export function sanitizeInput(text: string, maxLength: number = 500): string {
  if (!text) return "";

  return (
    text
      // 1. Normalize Unicode (NFC) to collapse equivalent characters
      .normalize("NFC")
      // 2. Remove invisible control characters (ASCII 0-31 & 127-159) except basic line breaks and tabs
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
      // 3. Remove invisible Unicode formatting characters (such as Zero-Width Space \u200B)
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      // 4. Prevent role simulation (system/developer instructions or delimiter tags)
      .replace(/(system:|developer:|assistant:|human:|user:)/gi, "")
      // 5. Neutralize typical Prompt Injection / Jailbreak phrases
      .replace(
        /(ignore\s+(all\s+)?previous\s+instructions|forget\s+(all\s+)?prior\s+instructions|you\s+are\s+now\s+in\s+DAN\s+mode)/gi,
        "[redacted_instruction]",
      )
      // 6. Collapse excessive consecutive line breaks or spaces
      .replace(/\n{3,}/g, "\n\n")
      .trim()
      // 7. Truncate to maximum character length
      .slice(0, maxLength)
  );
}

export function getLanguage(ctx: Context): "it" | "es" | "en" {
  const langCode = ctx.from?.language_code;
  if (langCode?.startsWith("it")) return "it";
  if (langCode?.startsWith("es")) return "es";
  return "en"; // Fallback di default per tutte le altre lingue
}
