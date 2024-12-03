import React, { useState, useEffect, useCallback } from 'react';
import { 
  ThemeProvider, 
  CssBaseline, 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Paper,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  TextField,
  ListItemSecondaryAction,
} from '@mui/material';
import { 
  IconList, 
  IconHeadset, 
  IconApi,
  IconBrandTabler,
  IconMoon,
  IconSun,
  IconChevronLeft,
  IconChevronRight,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Settings, TranscriptionEntry } from './types';
import TranscriptionTable from './components/TranscriptionTable';
import AudioRecorder from './components/AudioRecorder';
import Notification from './components/Notification';
import useNotification from './hooks/useNotification';
import useSessionManagement from './hooks/useSessionManagement';
import useTranscriptionService from './hooks/useTranscriptionService';
import { loadSettings, saveSettings } from './utils/storage';

const drawerWidth = '25%';

const defaultSettings: Settings = {
  view: {
    fontSize: 'medium',
    showTimestamp: true,
    language: 'en',
  },
  whisper: {
    recognitionLanguage: 'auto',
    requestInterval: 3,
    enableTranslation: false,
    targetLanguage: 'en',
  },
  api: {
    baseUrl: 'https://api.openai.com',
    apiKey: '',
    model: 'whisper-1',
  },
};

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [settings, setSettings] = useState<Settings>(() => loadSettings(defaultSettings));
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [newSessionName, setNewSessionName] = useState('');

  // Dialog states
  const [viewSettingsOpen, setViewSettingsOpen] = useState(false);
  const [whisperSettingsOpen, setWhisperSettingsOpen] = useState(false);
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);

  const { showNotification, notificationProps } = useNotification();
  const {
    sessions,
    currentSession,
    activeSessionId,
    createNewSession,
    addEntryToSession,
    deleteSession,
    renameSession,
    updateSessionDuration,
    setSessionRecordingState,
    getSessionEntries,
    setActiveSessionId,
    updateSessionEntries,
  } = useSessionManagement();

  const handleTranscriptionComplete = useCallback((entry: TranscriptionEntry) => {
    if (activeSessionId) {
      addEntryToSession(activeSessionId, entry);
      showNotification('Transcription completed successfully', 'success');
    }
  }, [activeSessionId, addEntryToSession, showNotification]);

  const handleTranscriptionError = useCallback((error: string) => {
    showNotification(`Transcription failed: ${error}`, 'error');
  }, [showNotification]);

  const { processAudioData } = useTranscriptionService({
    settings,
    onTranscriptionComplete: handleTranscriptionComplete,
    onError: handleTranscriptionError,
  });

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
    },
  });

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    if (currentSession) {
      const interval = setInterval(() => {
        const startTime = new Date(currentSession.startTime);
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const duration = `${hours.toString().padStart(2, '0')}:${minutes
          .toString()
          .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        updateSessionDuration(duration);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [currentSession, updateSessionDuration]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSettingsChange = <T extends keyof Settings, K extends keyof Settings[T]>(
    category: T,
    field: K,
    value: Settings[T][K]
  ) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleRecordingChange = (recording: boolean) => {
    if (recording && !activeSessionId) {
      const newSessionId = createNewSession();
      setActiveSessionId(newSessionId);
    }
    setIsRecording(recording);
    setSessionRecordingState(recording);
  };

  const handleAudioData = async (blob: Blob) => {
    await processAudioData(blob);
  };

  const handleStartEditing = (sessionId: string, currentName: string) => {
    setEditingSessionId(sessionId);
    setNewSessionName(currentName);
  };

  const handleSaveSessionName = () => {
    if (editingSessionId && newSessionName.trim()) {
      renameSession(editingSessionId, newSessionName.trim());
      setEditingSessionId(null);
      setNewSessionName('');
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId);
    showNotification('Session deleted successfully', 'success');
  };

  const handleDeleteEntry = (entryId: string) => {
    if (activeSessionId) {
      const entries = getSessionEntries(activeSessionId);
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      updateSessionEntries(activeSessionId, updatedEntries);
      showNotification('Entry deleted successfully', 'success');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" sx={{ mr: 2 }}>
              <IconBrandTabler />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              WhisperWeb
            </Typography>
            <IconButton color="inherit" onClick={toggleDarkMode}>
              {darkMode ? <IconSun /> : <IconMoon />}
            </IconButton>
            <IconButton color="inherit" onClick={() => setViewSettingsOpen(true)}>
              <IconList />
            </IconButton>
            <IconButton color="inherit" onClick={() => setWhisperSettingsOpen(true)}>
              <IconHeadset />
            </IconButton>
            <IconButton color="inherit" onClick={() => setApiSettingsOpen(true)}>
              <IconApi />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : '64px',
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : '64px',
              boxSizing: 'border-box',
              top: '64px',
              height: 'calc(100% - 128px)',
              transition: theme => theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={toggleDrawer}>
              {drawerOpen ? <IconChevronLeft /> : <IconChevronRight />}
            </IconButton>
          </Box>
          <List>
            {sessions.map((session) => (
              <ListItem 
                key={session.id}
                component="div"
                sx={{ 
                  cursor: 'pointer',
                  bgcolor: session.id === activeSessionId ? 'action.selected' : 'inherit'
                }}
                onClick={() => setActiveSessionId(session.id)}
              >
                {drawerOpen && (
                  <>
                    {editingSessionId === session.id ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <TextField
                          value={newSessionName}
                          onChange={(e) => setNewSessionName(e.target.value)}
                          size="small"
                          fullWidth
                          autoFocus
                          onBlur={handleSaveSessionName}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSaveSessionName();
                            }
                          }}
                        />
                      </Box>
                    ) : (
                      <>
                        <ListItemText 
                          primary={session.name}
                          secondary={new Date(session.timestamp).toLocaleString()} 
                        />
                        <ListItemSecondaryAction>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartEditing(session.id, session.name);
                            }}
                          >
                            <IconEdit size={18} />
                          </IconButton>
                          <IconButton 
                            edge="end" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSession(session.id);
                            }}
                          >
                            <IconTrash size={18} />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </>
                    )}
                  </>
                )}
              </ListItem>
            ))}
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            mb: '64px',
          }}
        >
          <TranscriptionTable
            entries={activeSessionId ? getSessionEntries(activeSessionId) : []}
            showTimestamp={settings.view.showTimestamp}
            enableTranslation={settings.whisper.enableTranslation}
            onCopy={(entry) => {
              navigator.clipboard.writeText(entry.transcription);
              showNotification('Text copied to clipboard', 'success');
            }}
            onDelete={handleDeleteEntry}
            selectedEntries={[]}
            onSelectEntry={() => {}}
          />
        </Box>

        <Paper
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          elevation={3}
        >
          <AudioRecorder
            isRecording={isRecording}
            onRecordingChange={handleRecordingChange}
            requestInterval={settings.whisper.requestInterval}
            onAudioData={handleAudioData}
          />
        </Paper>

        <Dialog open={viewSettingsOpen} onClose={() => setViewSettingsOpen(false)}>
          <DialogTitle>View Settings</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Font Size</InputLabel>
              <Select
                value={settings.view.fontSize}
                onChange={(e) => handleSettingsChange('view', 'fontSize', e.target.value)}
              >
                <MenuItem value="small">Small</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="large">Large</MenuItem>
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.view.showTimestamp}
                  onChange={(e) => handleSettingsChange('view', 'showTimestamp', e.target.checked)}
                />
              }
              label="Show Timestamps"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>System Language</InputLabel>
              <Select
                value={settings.view.language}
                onChange={(e) => handleSettingsChange('view', 'language', e.target.value)}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={whisperSettingsOpen} onClose={() => setWhisperSettingsOpen(false)}>
          <DialogTitle>Whisper Settings</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="normal">
              <InputLabel>Recognition Language</InputLabel>
              <Select
                value={settings.whisper.recognitionLanguage}
                onChange={(e) => handleSettingsChange('whisper', 'recognitionLanguage', e.target.value)}
              >
                <MenuItem value="auto">Auto Detect</MenuItem>
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              margin="normal"
              type="number"
              label="Request Interval (seconds)"
              value={settings.whisper.requestInterval}
              onChange={(e) => handleSettingsChange('whisper', 'requestInterval', Number(e.target.value))}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.whisper.enableTranslation}
                  onChange={(e) => handleSettingsChange('whisper', 'enableTranslation', e.target.checked)}
                />
              }
              label="Enable Translation"
            />
            {settings.whisper.enableTranslation && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Target Language</InputLabel>
                <Select
                  value={settings.whisper.targetLanguage}
                  onChange={(e) => handleSettingsChange('whisper', 'targetLanguage', e.target.value)}
                >
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                </Select>
              </FormControl>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setWhisperSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={apiSettingsOpen} onClose={() => setApiSettingsOpen(false)}>
          <DialogTitle>API Settings</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              margin="normal"
              label="Base URL"
              value={settings.api.baseUrl}
              onChange={(e) => handleSettingsChange('api', 'baseUrl', e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="API Key"
              type="password"
              value={settings.api.apiKey}
              onChange={(e) => handleSettingsChange('api', 'apiKey', e.target.value)}
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Model</InputLabel>
              <Select
                value={settings.api.model}
                onChange={(e) => handleSettingsChange('api', 'model', e.target.value)}
              >
                <MenuItem value="whisper-1">whisper-1</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApiSettingsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        <Notification {...notificationProps} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
