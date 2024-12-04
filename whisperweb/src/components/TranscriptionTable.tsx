// TranscriptionTable.tsx
import React, { useEffect } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Checkbox,
  Typography,
} from '@mui/material';

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
  selectedEntries: string[];
  onSelectEntry: (id: string) => void;
  transcriptionTableRef: React.RefObject<HTMLDivElement>;
  fontSize: number;
}

const TranscriptionTable: React.FC<TranscriptionTableProps> = ({
  entries,
  showTimestamp,
  enableTranslation,
  selectedEntries,
  onSelectEntry,
  transcriptionTableRef,
  fontSize,
}) => {
  useEffect(() => {
    if (transcriptionTableRef.current) {
      transcriptionTableRef.current.scrollTop = transcriptionTableRef.current.scrollHeight;
    }
  }, [entries.length]);

  return (
    <TableContainer
      component={Paper}
      sx={{
        width: '100%',
        height: '100%',
        overflowY: 'auto',
        boxShadow: 'none',
      }}
      ref={transcriptionTableRef}
    >
      <Table stickyHeader sx={{ tableLayout: 'fixed' }}>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell colSpan={enableTranslation ? 4 : 3} align="center">
                <Typography variant="body2" color="textSecondary" sx={{ fontSize: `${fontSize}px` }}>
                  No transcriptions yet. Click the play button to start recording.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            entries.map((entry) => {
              const isSelected = selectedEntries.includes(entry.id);
              return (
                <TableRow
                  key={entry.id}
                  selected={isSelected}
                  onClick={() => onSelectEntry(entry.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox" sx={{ width: '40px' }}>
                    <Checkbox checked={isSelected} />
                  </TableCell>
                  {showTimestamp && (
                    <TableCell sx={{ width: '120px', whiteSpace: 'nowrap', fontSize: `${fontSize}px` }}>
                      {entry.timestamp}
                    </TableCell>
                  )}
                  <TableCell sx={{ wordBreak: 'break-word', fontSize: `${fontSize}px` }}>
                    {entry.transcription}
                  </TableCell>
                  {enableTranslation && (
                    <TableCell sx={{ wordBreak: 'break-word', fontSize: `${fontSize}px` }}>
                      {entry.translation}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TranscriptionTable;
