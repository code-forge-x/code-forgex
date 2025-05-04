import React from 'react';
import { List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Typography, Divider, Box } from '@mui/material';
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { format } from 'date-fns';

const VersionHistory = ({ versions, selectedVersion, onSelectVersion }) => {
  const sortedVersions = [...versions].sort((a, b) => b.version - a.version);

  return (
    <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
      <Timeline>
        {sortedVersions.map((version, index) => (
          <TimelineItem key={version.version}>
            <TimelineSeparator>
              <TimelineDot
                color={version.version === selectedVersion ? 'primary' : 'grey'}
                onClick={() => onSelectVersion(version.version)}
                sx={{ cursor: 'pointer' }}
              />
              {index < sortedVersions.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: version.version === selectedVersion ? 'primary.light' : 'background.paper',
                  cursor: 'pointer'
                }}
                onClick={() => onSelectVersion(version.version)}
              >
                <Typography variant="subtitle2">
                  Version {version.version}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(version.metadata.created_at), 'PPpp')}
                </Typography>
                {version.similarity !== null && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Similarity: {(version.similarity * 100).toFixed(1)}%
                  </Typography>
                )}
              </Box>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
};

export default VersionHistory;
