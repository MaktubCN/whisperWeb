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
  IconPlus,
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
    baseUrl: '',  // User needs to input their API endpoint
    apiKey: '',   // User needs to input their API key
    model: 'whisper-1',
  },
};

function App() {
  // ... (state and hooks remain the same)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
          {/* ... (AppBar content remains the same) */}
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: drawerOpen ? 'space-between' : 'center',
            alignItems: 'center',
            p: 1 
          }}>
            <IconButton 
              onClick={handleCreateNewSession}
              sx={{ visibility: drawerOpen ? 'visible' : 'hidden' }}
            >
              <IconPlus />
            </IconButton>
            <IconButton onClick={toggleDrawer}>
              {drawerOpen ? <IconChevronLeft /> : <IconChevronRight />}
            </IconButton>
          </Box>
          {/* ... (Drawer content remains the same) */}
        </Drawer>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            mt: '64px',
            mb: '64px',
            width: `calc(100% - ${drawerOpen ? drawerWidth : '64px'})`,
            transition: theme => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
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

        {/* Settings Dialogs */}
        {/* ... (Settings Dialogs remain the same) */}

        <Notification {...notificationProps} />
      </Box>
    </ThemeProvider>
  );
}

export default App;
