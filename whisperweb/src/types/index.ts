export interface Settings {
  view: {
    fontSize: '12' | '16' | '20';
    showTimestamp: boolean;
    language: string;
  };
  whisper: {
    recognitionLanguage: string;
    requestInterval: number;
    enableTranslation: boolean;
    targetLanguage: string;
  };
  api: {
    baseUrl: string;
    apiKey: string;
    model: string;
  };
}

export interface Session {
  id: string;
  name: string;
  timestamp: string;
  entries: TranscriptionEntry[];
}

export interface TranscriptionEntry {
  id: string;
  timestamp: string;
  transcription: string;
  translation?: string;
}

export interface CurrentSession {
  sessionId: string;
  startTime: string;
  duration: string;
  isRecording: boolean;
}
