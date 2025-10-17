// Multi-language translation service
// Supports 10+ Indian languages using Bhashini API

export interface TranslationResult {
  original_text: string
  translated_text: string
  source_language: string
  target_language: string
  confidence: number
}

const SUPPORTED_LANGUAGES = {
  en: "English",
  hi: "Hindi",
  ta: "Tamil",
  te: "Telugu",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  gu: "Gujarati",
  bn: "Bengali",
  pa: "Punjabi",
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = "en",
): Promise<TranslationResult> {
  try {
    // Using Bhashini API for Indian language support
    const apiKey = process.env.BHASHINI_API_KEY

    if (!apiKey) {
      console.warn("Bhashini API key not configured, using mock translation")
      return getMockTranslationResult(text, sourceLanguage, targetLanguage)
    }

    const response = await fetch("https://api.bhashini.gov.in/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        text,
        source_language: sourceLanguage,
        target_language: targetLanguage,
      }),
    })

    if (!response.ok) {
      console.error("Translation API error:", response.statusText)
      return getMockTranslationResult(text, sourceLanguage, targetLanguage)
    }

    const data = await response.json()
    return {
      original_text: text,
      translated_text: data.translated_text || text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
      confidence: 0.9,
    }
  } catch (error) {
    console.error("Translation error:", error)
    return getMockTranslationResult(text, sourceLanguage, targetLanguage)
  }
}

function getMockTranslationResult(text: string, sourceLanguage: string, targetLanguage: string): TranslationResult {
  return {
    original_text: text,
    translated_text: text,
    source_language: sourceLanguage,
    target_language: targetLanguage,
    confidence: 0.5,
  }
}

export function getLanguageName(code: string): string {
  return SUPPORTED_LANGUAGES[code as keyof typeof SUPPORTED_LANGUAGES] || code
}
