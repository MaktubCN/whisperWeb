interface TranslationResponse {
  text: string;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  try {
    const response = await fetch(`${baseUrl}/v1/translations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target_language: targetLanguage,
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    return data.text;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

export async function processTranscriptionWithTranslation(
  transcription: string,
  targetLanguage: string,
  apiKey: string,
  baseUrl: string
): Promise<{ transcription: string; translation: string }> {
  try {
    const translation = await translateText(transcription, targetLanguage, apiKey, baseUrl);
    return {
      transcription,
      translation,
    };
  } catch (error) {
    console.error('Processing error:', error);
    return {
      transcription,
      translation: 'Translation failed',
    };
  }
}
