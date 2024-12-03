  interface TranslationResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export async function translateText(
  text: string,
  targetLanguage: string,
  apiKey: string,
  baseUrl: string
): Promise<string> {
  try {
    const prompt = `Translate the text into ${targetLanguage}; No further explanation is needed.: ${text}`;
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Translation failed: ${response.statusText}`);
    }

    const data: TranslationResponse = await response.json();
    return data.choices[0].message.content.trim();
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
