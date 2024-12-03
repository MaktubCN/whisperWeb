// TranscriptionTable.tsx
import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Checkbox,
  Typography,
} from '@mui/material';
import { IconCopy, IconTrash } from '@tabler/icons-react';

export interface TranscriptionEntry {
  id: string;
  timestamp: string;
  transcription: string;
  translation?: string;
}

interface TranscriptionTableProps {
  entries: TranscriptionEntry[];
  showTimestamp: boolean;
  enableTranslation: boolean;
  onCopy: (entry: TranscriptionEntry) => void;
  onDelete: (id: string) => void;
  selectedEntries: string[];
  onSelectEntry: (id: string) => void;
}

const TranscriptionTable: React.FC<TranscriptionTableProps> = ({
  entries,
  showTimestamp,
  enableTranslation,
  onCopy,
  onDelete,
  selectedEntries,
  onSelectEntry,
}) => {
  return (
    <TableContainer component={Paper} sx={{ width: '100%' }}>
      <Table sx={{ tableLayout: 'fixed' }}>
        {/* Removed TableHead to eliminate headers */}
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={enableTranslation ? 5 : 4} align="center">
                <Typography variant="body2" color="textSecondary">
                  No transcriptions yet. Click the play button to start recording.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => (
              <TableRow key={entry.id} selected={selectedEntries.includes(entry.id)}>
                <TableCell padding="checkbox" sx={{ width: '40px' }}>
                  <Checkbox
                    checked={selectedEntries.includes(entry.id)}
                    onChange={() => onSelectEntry(entry.id)}
                  />
                </TableCell>
                {showTimestamp && (
                  <TableCell sx={{ width: '120px', whiteSpace: 'nowrap' }}>{entry.timestamp}</TableCell>
                )}
                <TableCell sx={{ wordBreak: 'break-word' }}>{entry.transcription}</TableCell>
                {enableTranslation && (
                  <TableCell sx={{ wordBreak: 'break-word' }}>{entry.translation}</TableCell>
                )}
                <TableCell align="right" sx={{ width: '80px' }}>
                  <IconButton onClick={() => onCopy(entry)} size="small" aria-label="copy">
                    <IconCopy size={18} />
                  </IconButton>
                  <IconButton onClick={() => onDelete(entry.id)} size="small" color="error" aria-label="delete">
                    <IconTrash size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TranscriptionTable;
