import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
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
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox
                indeterminate={selectedEntries.length > 0 && selectedEntries.length < entries.length}
                checked={entries.length > 0 && selectedEntries.length === entries.length}
                onChange={() => {
                  if (selectedEntries.length === entries.length) {
                    selectedEntries.forEach(id => onSelectEntry(id));
                  } else {
                    entries.forEach(entry => {
                      if (!selectedEntries.includes(entry.id)) {
                        onSelectEntry(entry.id);
                      }
                    });
                  }
                }}
              />
            </TableCell>
            {showTimestamp && <TableCell>Timestamp</TableCell>}
            <TableCell>Transcription</TableCell>
            {enableTranslation && <TableCell>Translation</TableCell>}
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
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
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedEntries.includes(entry.id)}
                    onChange={() => onSelectEntry(entry.id)}
                  />
                </TableCell>
                {showTimestamp && <TableCell>{entry.timestamp}</TableCell>}
                <TableCell>{entry.transcription}</TableCell>
                {enableTranslation && <TableCell>{entry.translation}</TableCell>}
                <TableCell align="right">
                  <IconButton onClick={() => onCopy(entry)} size="small">
                    <IconCopy size={18} />
                  </IconButton>
                  <IconButton onClick={() => onDelete(entry.id)} size="small" color="error">
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
