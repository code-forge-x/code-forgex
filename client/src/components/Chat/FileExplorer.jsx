import React from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Collapse, Box, Typography } from '@mui/material';
import { Folder, FolderOpen, InsertDriveFile, ExpandLess, ExpandMore } from '@mui/icons-material';

const FileExplorer = ({ project, onFileSelect }) => {
  const [open, setOpen] = React.useState({});

  const handleToggle = (path) => {
    setOpen((prev) => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const renderFileTree = (node, path = '') => {
    if (!node) return null;

    if (node.type === 'directory') {
      const currentPath = path ? `${path}/${node.name}` : node.name;
      const isExpanded = open[currentPath] || false;

      return (
        <React.Fragment key={currentPath}>
          <ListItem button onClick={() => handleToggle(currentPath)}>
            <ListItemIcon>
              {isExpanded ? <FolderOpen fontSize="small" /> : <Folder fontSize="small" />}
            </ListItemIcon>
            <ListItemText primary={node.name} />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}>
              {node.children.map((child) => renderFileTree(child, currentPath))}
            </List>
          </Collapse>
        </React.Fragment>
      );
    } else {
      const filePath = path ? `${path}/${node.name}` : node.name;
      return (
        <ListItem 
          button 
          key={filePath}
          onClick={() => onFileSelect(filePath, node)}
        >
          <ListItemIcon>
            <InsertDriveFile fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={node.name} />
        </ListItem>
      );
    }
  };

  if (!project || !project.fileTree) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No files available
        </Typography>
      </Box>
    );
  }

  return (
    <List dense component="nav">
      {renderFileTree(project.fileTree)}
    </List>
  );
};

export default FileExplorer;