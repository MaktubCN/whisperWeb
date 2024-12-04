// AudioRecorder.tsx
import React, { useEffect, useRef } from 'react';
import { Box, IconButton } from '@mui/material';
import { IconPlayerPlay, IconPlayerPause, IconDownload } from '@tabler/icons-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  requestInterval: number;
  onAudioData: (blob: Blob) => void;
  darkMode: boolean;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onRecordingChange,
  requestInterval,
  onAudioData,
  darkMode,
}) => {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef<boolean>(isRecording);

  useEffect(() => {
    isRecordingRef.current = isRecording;

    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      stopRecording();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (isRecordingRef.current && event.data.size > 0) {
          chunksRef.current.push(event.data);
          const blob = new Blob([event.data], { type: 'audio/wav' });
          onAudioData(blob);
        }
      };

      mediaRecorder.start();

      // Set up interval for regular audio chunks
      intervalRef.current = setInterval(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.start();
        }
      }, requestInterval * 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      onRecordingChange(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Stop all tracks to release microphone access
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
  };

  const handleDownload = () => {
    if (chunksRef.current.length === 0) return;

    const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${new Date().toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <IconButton
        color="inherit"
        onClick={() => onRecordingChange(!isRecording)}
        sx={{
          backgroundColor: darkMode ? '#FFFFFF' : '#000000',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          '&:hover': {
            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
          },
          marginLeft: 2,
        }}
      >
        {isRecording ? (
          <IconPlayerPause color={darkMode ? '#000000' : '#FFFFFF'} />
        ) : (
          <IconPlayerPlay color={darkMode ? '#000000' : '#FFFFFF'} />
        )}
      </IconButton>
      <IconButton onClick={handleDownload} disabled={chunksRef.current.length === 0}>
        <IconDownload />
      </IconButton>
    </Box>
  );
};

export default AudioRecorder;
