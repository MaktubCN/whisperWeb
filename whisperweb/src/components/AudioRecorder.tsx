import React, { useEffect, useRef, useState } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import { IconPlayerPlay, IconPlayerPause, IconDownload } from '@tabler/icons-react';

interface AudioRecorderProps {
  isRecording: boolean;
  onRecordingChange: (recording: boolean) => void;
  requestInterval: number;
  onAudioData: (blob: Blob) => void;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onRecordingChange,
  requestInterval,
  onAudioData,
}) => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState<string>('00:00:00');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }

    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (startTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - startTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setDuration(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          const blob = new Blob([event.data], { type: 'audio/wav' });
          onAudioData(blob);
        }
      };

      mediaRecorder.start();
      setStartTime(new Date());

      // Set up interval for regular audio chunks
      intervalRef.current = setInterval(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, requestInterval * 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      onRecordingChange(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      setStartTime(null);
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
      <Typography variant="body2">
        Start Time: {startTime ? startTime.toLocaleTimeString() : '--:--:--'}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <IconButton
          color={isRecording ? 'secondary' : 'primary'}
          onClick={() => onRecordingChange(!isRecording)}
        >
          {isRecording ? <IconPlayerPause /> : <IconPlayerPlay />}
        </IconButton>
        <IconButton onClick={handleDownload} disabled={chunksRef.current.length === 0}>
          <IconDownload />
        </IconButton>
      </Box>
      <Typography variant="body2">Duration: {duration}</Typography>
    </Box>
  );
};

export default AudioRecorder;
