// useTranscriptionService.ts
import { useState, useCallback } from 'react';
import { Settings, TranscriptionEntry } from '../types';
import { processTranscriptionWithTranslation } from '../services/translationService';

interface UseTranscriptionServiceProps {
  settings: Settings;
  onTranscriptionComplete: (entry: TranscriptionEntry) => void;
  onError: (error: string) => void;
}

const useTranscriptionService = ({
  settings,
  onTranscriptionComplete,
  onError,
}: UseTranscriptionServiceProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processAudioData = useCallback(
    async (blob: Blob) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        const formData = new FormData();
        formData.append('file', blob, 'audio.wav');
        formData.append('model', settings.api.model);

        if (settings.whisper.recognitionLanguage !== 'auto') {
          formData.append('language', settings.whisper.recognitionLanguage);
        }

        const response = await fetch(`${settings.api.baseUrl}/v1/audio/transcriptions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${settings.api.apiKey}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const data = await response.json();
        const transcriptionResult: TranscriptionEntry = {
          id: Date.now().toString(),
          timestamp: new Date().toLocaleTimeString(),
          transcription: data.text,
        };

        // Handle translation if enabled
        if (settings.whisper.enableTranslation) {
          try {
            const { translation } = await processTranscriptionWithTranslation(
              data.text,
              settings.whisper.targetLanguage,
              settings.api.apiKey,
              settings.api.baseUrl
            );
            transcriptionResult.translation = translation;
          } catch (error) {
            console.error('Translation error:', error);
            transcriptionResult.translation = 'Translation failed';
          }
        }

        onTranscriptionComplete(transcriptionResult);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        onError(errorMessage);
      } finally {
        setIsProcessing(false);
      }
    },
    [settings, onTranscriptionComplete, onError] // Removed isProcessing from dependencies
  );

  return {
    processAudioData,
    isProcessing,
  };
};

export default useTranscriptionService;
  