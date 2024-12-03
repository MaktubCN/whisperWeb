import { useState, useCallback, useEffect } from 'react';
import { Session, TranscriptionEntry, CurrentSession } from '../types';
import { 
  loadSessions, 
  saveSessions, 
  loadCurrentSession, 
  saveCurrentSession 
} from '../utils/storage';

const useSessionManagement = () => {
  const [sessions, setSessions] = useState<Session[]>(() => loadSessions());
  const [currentSession, setCurrentSession] = useState<CurrentSession | null>(() => loadCurrentSession());
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => currentSession?.sessionId || null
  );

  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    if (currentSession) {
      saveCurrentSession(currentSession);
    }
  }, [currentSession]);

  const createNewSession = useCallback(() => {
    const newSession: Session = {
      id: Date.now().toString(),
      name: `Session ${sessions.length + 1}`,
      timestamp: new Date().toISOString(),
      entries: [],
    };

    setSessions(prev => [...prev, newSession]);
    setActiveSessionId(newSession.id);
    setCurrentSession({
      sessionId: newSession.id,
      startTime: new Date().toISOString(),
      duration: '00:00:00',
      isRecording: false,
    });

    return newSession.id;
  }, [sessions]);

  const addEntryToSession = useCallback((
    sessionId: string,
    entry: TranscriptionEntry
  ) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          entries: [...session.entries, entry],
        };
      }
      return session;
    }));
  }, []);

  const updateSessionEntries = useCallback((
    sessionId: string,
    entries: TranscriptionEntry[]
  ) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          entries,
        };
      }
      return session;
    }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setCurrentSession(null);
    }
  }, [activeSessionId]);

  const renameSession = useCallback((sessionId: string, newName: string) => {
    setSessions(prev => prev.map(session => {
      if (session.id === sessionId) {
        return {
          ...session,
          name: newName,
        };
      }
      return session;
    }));
  }, []);

  const updateSessionDuration = useCallback((duration: string) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        duration,
      } : null);
    }
  }, [currentSession]);

  const setSessionRecordingState = useCallback((isRecording: boolean) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        isRecording,
      } : null);
    }
  }, [currentSession]);

  const getSessionEntries = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    return session?.entries || [];
  }, [sessions]);

  const getCurrentSession = useCallback(() => {
    if (!activeSessionId) return null;
    return sessions.find(s => s.id === activeSessionId) || null;
  }, [sessions, activeSessionId]);

  return {
    sessions,
    currentSession,
    activeSessionId,
    createNewSession,
    addEntryToSession,
    updateSessionEntries,
    deleteSession,
    renameSession,
    updateSessionDuration,
    setSessionRecordingState,
    getSessionEntries,
    getCurrentSession,
    setActiveSessionId,
  };
};

export default useSessionManagement;
