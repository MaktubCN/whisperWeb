  // App.tsx
  import { useState, useEffect, useCallback, useRef } from 'react';

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
    Backdrop,
  } from '@mui/material';
  import {
    IconSettings,
    IconKey,
    IconMoon,
    IconSun,
    IconChevronLeft,
    IconEdit,
    IconTrash,
    IconPlus,
    IconEye,
    IconEyeOff,
    IconCopy,
    IconMenu2,
  } from '@tabler/icons-react';
  import '@fontsource/inter/400.css';
  import '@fontsource/inter/500.css';
  import '@fontsource/inter/600.css';
  import '@fontsource/inter/700.css';

  import { Settings, TranscriptionEntry } from './types';
  import TranscriptionTable from './components/TranscriptionTable';
  import AudioRecorder from './components/AudioRecorder';
  import Notification from './components/Notification';
  import useNotification from './hooks/useNotification';
  import useSessionManagement from './hooks/useSessionManagement';
  import useTranscriptionService from './hooks/useTranscriptionService';
  import { loadSettings, saveSettings } from './utils/storage';

  const drawerWidth = 240;

  const defaultSettings: Settings = {
    view: {
      fontSize: '16',
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [settings, setSettings] = useState<Settings>(() => loadSettings(defaultSettings));
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
    const [newSessionName, setNewSessionName] = useState('');

    // Dialog states
    const [whisperSettingsOpen, setWhisperSettingsOpen] = useState(false);
    const [apiSettingsOpen, setApiSettingsOpen] = useState(false);

    // Focus Mode State
    const [focusMode, setFocusMode] = useState(true);

    const { showNotification, notificationProps } = useNotification();
    const {
      sessions,
      currentSession,
      activeSessionId,
      createNewSession,
      addEntryToSession,
      deleteSession,
      renameSession,
      setSessionRecordingState,
      getSessionEntries,
      setActiveSessionId,
      updateSessionEntries,
    } = useSessionManagement();

    // New State for Recording Start Time and Duration
    const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
    const [recordingDuration, setRecordingDuration] = useState<string>('00:00:00');

    const handleTranscriptionComplete = useCallback(
      (entry: TranscriptionEntry) => {
        if (activeSessionId) {
          addEntryToSession(activeSessionId, entry);
          // showNotification('Transcription completed successfully', 'success');
        }
      },
      [activeSessionId, addEntryToSession]
    );

    const handleTranscriptionError = useCallback(
      (error: string) => {
        showNotification(`Transcription failed: ${error}`, 'error');
      },
      [showNotification]
    );

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
        background: {
          default: darkMode ? '#09090B' : '#F6F8F7',
          paper: darkMode ? '#09090B' : '#F6F8F7',
        },
        text: {
          primary: darkMode ? '#F6F8F7' : '#000000',
          secondary: darkMode ? '#F6F8F7' : '#000000',
        },
      },
      typography: {
        fontFamily: 'Inter, sans-serif',
      },
    });

    useEffect(() => {
      saveSettings(settings);
    }, [settings]);

    // Effect to Update Recording Duration
    useEffect(() => {
      let interval: NodeJS.Timeout | null = null;

      if (isRecording && recordingStartTime) {
        interval = setInterval(() => {
          const now = new Date();
          const diff = now.getTime() - recordingStartTime.getTime();
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setRecordingDuration(
            `${hours.toString().padStart(2, '0')}:${minutes
              .toString()
              .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          );
        }, 1000);
      } else {
        setRecordingDuration('00:00:00');
      }

      return () => {
        if (interval) clearInterval(interval);
      };
    }, [isRecording, recordingStartTime]);

    // Auto-select or create session on initial load
    useEffect(() => {
      if (sessions.length > 0) {
        const latestSession = sessions[sessions.length - 1];
        setActiveSessionId(latestSession.id);
      } else {
        const newSessionId = createNewSession();
        setActiveSessionId(newSessionId);
      }
    }, [sessions, createNewSession, setActiveSessionId]);

    useEffect(() => {
      const urlParams = new URLSearchParams(window.location.search);
      const baseUrl = urlParams.get('base_url');
      const apiKey = urlParams.get('api_key');
      const model = urlParams.get('model');

      let updated = false;

      setSettings((prevSettings) => {
        const newSettings = { ...prevSettings };
        if (baseUrl) {
          newSettings.api.baseUrl = baseUrl;
          updated = true;
        }
        if (apiKey) {
          newSettings.api.apiKey = apiKey;
          updated = true;
        }
        if (model) {
          newSettings.api.model = model;
          updated = true;
        }
        return newSettings;
      });

      if (updated) {
        showNotification('Successfully updated parameters from the URL', 'success');
        // 移除 URL 中的查询参数
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 仅在组件初次渲染时执行

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
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    };

    const handleRecordingChange = (recording: boolean) => {
      if (recording && !activeSessionId) {
        const newSessionId = createNewSession();
        setActiveSessionId(newSessionId);
      }

      setIsRecording(recording);
      setSessionRecordingState(recording);

      if (recording) {
        // Set Recording Start Time
        setRecordingStartTime(new Date());
      } else {
        setRecordingStartTime(null);
      }
    };

    const handleAudioData = async (blob: Blob) => {
      // Prevent processing if not recording
      if (!isRecording) return;
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

    const handleDeleteEntries = (entryIds: string[]) => {
      if (activeSessionId) {
        const entries = getSessionEntries(activeSessionId);
        const updatedEntries = entries.filter((entry) => !entryIds.includes(entry.id));
        updateSessionEntries(activeSessionId, updatedEntries);
        showNotification('Entries deleted successfully', 'success');
        setSelectedEntries([]);
      }
    };

    const handleCopyEntries = (entryIds: string[]) => {
      if (activeSessionId) {
        const entries = getSessionEntries(activeSessionId);
        const selectedEntriesText = entries
          .filter((entry) => entryIds.includes(entry.id))
          .map((entry) => entry.transcription)
          .join('\n');
        navigator.clipboard.writeText(selectedEntriesText);
        showNotification('Selected entries copied to clipboard', 'success');
      }
    };

    // Handle Adding New Transcription
    const handleAddNewTranscription = () => {
      const newSessionId = createNewSession();
      setActiveSessionId(newSessionId);
      setIsRecording(false);
    };

    // Selection State
    const [selectedEntries, setSelectedEntries] = useState<string[]>([]);

    const handleSelectEntry = (id: string) => {
      setSelectedEntries((prevSelected) =>
        prevSelected.includes(id) ? prevSelected.filter((entryId) => entryId !== id) : [...prevSelected, id]
      );
    };

    // Reference to the TranscriptionTable
    const transcriptionTableRef = useRef<HTMLDivElement | null>(null);

    // Get entries length safely
    const entries = activeSessionId ? getSessionEntries(activeSessionId) : [];
    const entriesLength = entries.length;

    // Use useEffect to ensure scrolling happens after DOM updates
    useEffect(() => {
      if (focusMode && transcriptionTableRef.current) {
        transcriptionTableRef.current.scrollTop = transcriptionTableRef.current.scrollHeight;
      }
    }, [entriesLength, focusMode]);

    // Toggle Focus Mode
    const toggleFocusMode = () => {
      setFocusMode(!focusMode);
    };

    // Action Bar Visibility
    const hasSelectedEntries = selectedEntries.length > 0;

    // Get Recording Start Time and Duration for Footer
    const startTime = recordingStartTime ? recordingStartTime.toLocaleTimeString() : '--:--:--';
    const duration = recordingDuration;

    const [customModel, setCustomModel] = useState<string>('');

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', height: '100vh', flexDirection: 'column' }}>
          {/* AppBar */}
          <AppBar
            position="fixed"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: darkMode ? '#000000' : '#F6F8F7',
              color: darkMode ? '#F6F8F7' : '#000000',
              boxShadow: 'none',
              borderBottom: '1px solid',
              borderColor: darkMode ? '#F6F8F7' : '#000000',
            }}
          >
            <Toolbar>
              {/* Sidebar Toggle Button */}
              <IconButton edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
                <IconMenu2 />
              </IconButton>
              {/* Centered WhisperWeb Text */}
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1, textAlign: 'center', color: darkMode ? '#F6F8F7' : '#000000', fontWeight: 'bold' }}
              >
                Whisper Web
              </Typography>
              {/* Right-side Icons */}
              <IconButton color="inherit" onClick={toggleDarkMode}>
                {darkMode ? <IconSun /> : <IconMoon />}
              </IconButton>
              <IconButton color="inherit" onClick={() => setWhisperSettingsOpen(true)}>
                <IconSettings />
              </IconButton>
              <IconButton color="inherit" onClick={() => setApiSettingsOpen(true)}>
                <IconKey />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              mt: '64px',
              mb: '64px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Floating Action Bar for Selected Entries */}
            {hasSelectedEntries && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: theme.palette.background.paper,
                  zIndex: theme.zIndex.appBar + 1,
                  p: 1,
                  display: 'flex',
                  gap: 1,
                  boxShadow: theme.shadows[4],
                  borderRadius: 1,
                }}
              >
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconCopy />}
                  onClick={() => handleCopyEntries(selectedEntries)}
                >
                  Copy
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<IconTrash />}
                  onClick={() => handleDeleteEntries(selectedEntries)}
                >
                  Delete
                </Button>
              </Box>
            )}

            {/* Container for TranscriptionTable */}
            <Box sx={{ flexGrow: 1, width: '100%', overflow: 'hidden' }}>
              <TranscriptionTable
                entries={entries}
                showTimestamp={settings.view.showTimestamp}
                enableTranslation={settings.whisper.enableTranslation}
                selectedEntries={selectedEntries}
                onSelectEntry={handleSelectEntry}
                transcriptionTableRef={transcriptionTableRef}
                fontSize={settings.view.fontSize}
              />
            </Box>
          </Box>

          {/* Footer with Audio Recorder */}
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              px: 2,
              zIndex: (theme) => theme.zIndex.drawer + 1,
              boxShadow: 'none',
              borderTop: '1px solid',
              borderColor: darkMode ? '#F6F8F7' : '#000000',
            }}
          >
            {isRecording ? (
              <>
                {/* Start Time on the Left */}
                <Typography variant="body1" sx={{ flexGrow: 1 }}>
                  Start: {startTime}
                </Typography>

                {/* Centered Focus Mode and Play Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton color="inherit" onClick={toggleFocusMode}>
                    {focusMode ? <IconEye /> : <IconEyeOff />}
                  </IconButton>
                  <AudioRecorder
                    isRecording={isRecording}
                    onRecordingChange={handleRecordingChange}
                    requestInterval={settings.whisper.requestInterval}
                    onAudioData={handleAudioData}
                    darkMode={darkMode} // 添加了 darkMode 属性
                  />
                </Box>

                {/* Duration on the Right */}
                <Typography variant="body1" sx={{ flexGrow: 1, textAlign: 'right' }}>
                  Duration: {duration}
                </Typography>
              </>
            ) : (
              // When not recording, center the focus mode and play buttons
              <Box sx={{ display: 'flex', alignItems: 'center', margin: '0 auto' }}>
                <IconButton color="inherit" onClick={toggleFocusMode}>
                  {focusMode ? <IconEye /> : <IconEyeOff />}
                </IconButton>
                <AudioRecorder
                  isRecording={isRecording}
                  onRecordingChange={handleRecordingChange}
                  requestInterval={settings.whisper.requestInterval}
                  onAudioData={handleAudioData}
                  darkMode={darkMode} // 添加了 darkMode 属性
                />
              </Box>
            )}
          </Paper>

          {/* Drawer (Sidebar) */}
          <Drawer
            variant="temporary"
            open={drawerOpen}
            onClose={toggleDrawer}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              '& .MuiDrawer-paper': {
                width: drawerWidth,
                boxSizing: 'border-box',
              },
            }}
          >
            {/* Drawer Header */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton onClick={toggleDrawer}>
                <IconChevronLeft />
              </IconButton>
            </Box>
            {/* Add New Transcription Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
              <IconButton color="inherit" onClick={handleAddNewTranscription} title="Add New Transcription">
                <IconPlus />
              </IconButton>
            </Box>
            {/* Sessions List */}
            <List>
              {sessions.map((session) => (
                <ListItem
                  key={session.id}
                  component="div"
                  sx={{
                    cursor: 'pointer',
                    bgcolor: session.id === activeSessionId ? 'action.selected' : 'inherit',
                  }}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    toggleDrawer();
                  }}
                >
                  {editingSessionId === session.id ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <TextField
                          fullWidth
                          margin="normal"
                          type="number"
                          label="Request Interval (seconds)"
                          value={settings.whisper.requestInterval}
                          onChange={(e) =>
                            handleSettingsChange('whisper', 'requestInterval', Number(e.target.value))
                          }
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
                          size="small"
                          aria-label="edit"
                        >
                          <IconEdit size={18} />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          size="small"
                          color="error"
                          aria-label="delete"
                        >
                          <IconTrash size={18} />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
          </Drawer>

          {/* Backdrop when the drawer is open */}
          <Backdrop open={drawerOpen} onClick={toggleDrawer} sx={{ zIndex: (theme) => theme.zIndex.drawer - 1 }} />

          {/* Combined Settings Dialog */}
          <Dialog open={whisperSettingsOpen} onClose={() => setWhisperSettingsOpen(false)}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              View Settings
            </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Font Size</InputLabel>
                <Select
                  value={settings.view.fontSize}
                  onChange={(e) => handleSettingsChange('view', 'fontSize', e.target.value as any)}
                >
                  <MenuItem value="12">12</MenuItem>
                  <MenuItem value="16">16</MenuItem>
                  <MenuItem value="20">20</MenuItem>
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
              <br></br><br></br>
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Whisper Settings
              </Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Recognition Language</InputLabel>
                <Select
                  value={settings.whisper.recognitionLanguage}
                  onChange={(e) =>
                    handleSettingsChange('whisper', 'recognitionLanguage', e.target.value as any)
                  }
                >
                  <MenuItem value="auto">Auto Detect</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="zh">Chinese</MenuItem>
                  <MenuItem value="es">Spanish</MenuItem>
                  <MenuItem value="fr">French</MenuItem>
                  <MenuItem value="de">German</MenuItem>
                  <MenuItem value="ja">Japanese</MenuItem>
                  <MenuItem value="ko">Korean</MenuItem>
                  <MenuItem value="ru">Russian</MenuItem>
                  <MenuItem value="ar">Arabic</MenuItem>
                  <MenuItem value="pt">Portuguese</MenuItem>
                  <MenuItem value="it">Italian</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                margin="normal"
                type="number"
                label="Request Interval (seconds)"
                value={settings.whisper.requestInterval}
                onChange={(e) =>
                  handleSettingsChange('whisper', 'requestInterval', Number(e.target.value))
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.whisper.enableTranslation}
                    onChange={(e) =>
                      handleSettingsChange('whisper', 'enableTranslation', e.target.checked)
                    }
                  />
                }
                label="Enable Translation"
              />
              {settings.whisper.enableTranslation && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Target Language</InputLabel>
                  <Select
                    value={settings.whisper.targetLanguage}
                    onChange={(e) =>
                      handleSettingsChange('whisper', 'targetLanguage', e.target.value as any)
                    }
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

          {/* API Settings Dialog */}
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
                  onChange={(e) => handleSettingsChange('api', 'model', e.target.value as any)}
                >
                  <MenuItem value="whisper-1">whisper-1</MenuItem>
                  <MenuItem value="openai/whisper-large-v2">openai/whisper-large-v2</MenuItem>
                  <MenuItem value="custom">Custom Model</MenuItem>
                </Select>
              </FormControl>

              {settings.api.model === 'custom' && (
                <TextField
                  fullWidth
                  margin="normal"
                  label="Enter Custom Model Name"
                  value={customModel}
                  onChange={(e) => setCustomModel(e.target.value)}
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setApiSettingsOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>

          {/* Notification Component */}
          <Notification {...notificationProps} />
        </Box>
      </ThemeProvider>
    );
  }
  export default App;
