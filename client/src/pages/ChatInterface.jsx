useEffect(() => {
  scrollToBottom();
}, [messages]);import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
Container, 
Grid, 
Paper, 
Typography, 
TextField, 
Button, 
Box, 
Avatar, 
CircularProgress,
Divider,
IconButton,
Chip,
Menu,
MenuItem,
ListItemIcon,
ListItemText,
Card,
CardContent,
Tab,
Tabs
} from '@mui/material';
import { 
Send, 
AttachFile, 
Code, 
MoreVert, 
ContentCopy, 
Download,
Clear,
Architecture,
Terminal
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import logger from '../utils/logger';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const ChatInterface = () => {
const { projectId } = useParams();
const navigate = useNavigate();
const location = useLocation();
const queryParams = new URLSearchParams(location.search);
const componentId = queryParams.get('component');

const [project, setProject] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);
const [messages, setMessages] = useState([]);
const [newMessage, setNewMessage] = useState('');
const [sending, setSending] = useState(false);
const [codeDisplay, setCodeDisplay] = useState(null);
const [rightPanelContent, setRightPanelContent] = useState('code'); // 'code', 'blueprint', 'components'
const [menuAnchorEl, setMenuAnchorEl] = useState(null);
const [blueprint, setBlueprint] = useState(null);
const [components, setComponents] = useState([]);
const [selectedComponent, setSelectedComponent] = useState(null);
const messagesEndRef = useRef(null);
const fileInputRef = useRef(null);
const { currentUser } = useAuth();

// Load initial data
useEffect(() => {
  fetchProject();
  fetchChatHistory();
  fetchBlueprint();
  fetchComponents();
}, [projectId]);

// Handle component query param
useEffect(() => {
  if (componentId && components && components.length > 0) {
    const component = components.find(c => c.id === componentId);
    if (component) {
      setSelectedComponent(component);
      setCodeDisplay({
        code: component.code,
        language: getLanguageFromComponent(component),
        title: component.name
      });
      setRightPanelContent('code');
    }
  }
}, [componentId, components]);

// Keep a ref to the latest messages to avoid closure issues in async functions
const messagesRef = useRef(messages);
useEffect(() => {
  messagesRef.current = messages;
}, [messages]);

const fetchProject = async () => {
  try {
    const response = await api.get(`/api/projects/${projectId}`);
    setProject(response.data);
  } catch (error) {
    logger.error('Failed to fetch project', error);
    setError('Failed to load project information');
  } finally {
    setLoading(false);
  }
};

const fetchChatHistory = async () => {
  try {
    const response = await api.get(`/api/chat/${projectId}/history`);
    if (response.data && response.data.length > 0) {
      setMessages(response.data);
    } else {
      // Add a welcome message if no history
      setMessages([
        {
          role: 'assistant',
          content: `Welcome to the AI coding assistant for your project "${project?.name || 'loading...'}". How can I help you today?`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  } catch (error) {
    logger.error('Failed to fetch chat history', error);
  }
};

const fetchBlueprint = async () => {
  try {
    const response = await api.get(`/api/blueprint/${projectId}`);
    setBlueprint(response.data);
  } catch (error) {
    // Blueprint might not exist yet, that's fine
    logger.debug('No blueprint available yet');
  }
};

const fetchComponents = async () => {
  try {
    const response = await api.get(`/api/components/${projectId}`);
    setComponents(response.data);
  } catch (error) {
    // Components might not exist yet, that's fine
    logger.debug('No components available yet');
  }
};

const scrollToBottom = () => {
  messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
};

const handleRightPanelChange = (event, newValue) => {
  setRightPanelContent(newValue);
};

// Add useCallback for performance optimization
const handleSendMessage = React.useCallback(async () => {
  if (!newMessage.trim()) return;

  const userMessage = {
    role: 'user',
    content: newMessage,
    timestamp: new Date().toISOString()
  };

  // Optimistically update UI
  setMessages(prev => [...prev, userMessage]);
  setNewMessage('');
  setSending(true);

  try {
    // Send message to API
    const response = await api.post(`/api/chat/${projectId}/message`, {
      message: userMessage.content
    });

    // Add AI response - with safer access to response data
    if (response?.data) {
      const aiMessage = {
        role: 'assistant',
        content: response.data.message || 'I received your message but encountered an issue processing it.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if there's code in the response
      if (response.data.message) {
        const codeBlocks = extractCodeBlocks(response.data.message);
        if (codeBlocks.length > 0) {
          setCodeDisplay({
            code: codeBlocks[0].code,
            language: codeBlocks[0].language || 'javascript',
            title: 'Generated Code'
          });
          setRightPanelContent('code');
        }
      }

      // Check if components were updated
      if (response.data.updatedComponents) {
        fetchComponents();
      }

      // Check if blueprint was updated
      if (response.data.updatedBlueprint) {
        fetchBlueprint();
      }
    } else {
      // Handle missing response data
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Received an empty response from the server. Please try again.',
        timestamp: new Date().toISOString(),
        isError: true
      }]);
    }
  } catch (error) {
    logger.error('Failed to send message', error);
    // Show error message
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, there was an error processing your request. Please try again.',
      timestamp: new Date().toISOString(),
      isError: true
    }]);
  } finally {
    setSending(false);
  }
}, [newMessage, projectId]);

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSendMessage();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    await api.post(`/api/files/${projectId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    // Add message about file upload
    setMessages(prev => [...prev, {
      role: 'user',
      content: `[Uploaded file: ${file.name}]`,
      timestamp: new Date().toISOString(),
      isFile: true,
      fileName: file.name
    }]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  } catch (error) {
    logger.error('Failed to upload file', error);
    alert('Failed to upload file. Please try again.');
  }
};

const handleOpenCodeOptions = (event) => {
  setMenuAnchorEl(event.currentTarget);
};

const handleCloseCodeOptions = () => {
  setMenuAnchorEl(null);
};

const handleCopyCode = () => {
  if (codeDisplay?.code) {
    navigator.clipboard.writeText(codeDisplay.code);
    handleCloseCodeOptions();
  }
};

const handleDownloadCode = () => {
  if (codeDisplay?.code) {
    const element = document.createElement('a');
    const file = new Blob([codeDisplay.code], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${codeDisplay.title || 'code'}.${getFileExtension(codeDisplay.language)}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    handleCloseCodeOptions();
  }
};

const handleClearChat = () => {
  if (window.confirm('Are you sure you want to clear the chat history?')) {
    api.delete(`/api/chat/${projectId}/history`)
      .then(() => {
        setMessages([
          {
            role: 'assistant',
            content: `I've cleared our conversation. How can I help you with your project "${project?.name}" now?`,
            timestamp: new Date().toISOString()
          }
        ]);
      })
      .catch(error => {
        logger.error('Failed to clear chat history', error);
        alert('Failed to clear chat history. Please try again.');
      });
  }
};

const handleComponentClick = (component) => {
  setSelectedComponent(component);
  setCodeDisplay({
    code: component.code,
    language: getLanguageFromComponent(component),
    title: component.name
  });
  setRightPanelContent('code');
};

// Helper functions
const extractCodeBlocks = (text) => {
  if (!text) return [];
  
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;

  try {
    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || 'javascript',
        code: match[2]
      });
    }
  } catch (error) {
    logger.error('Error extracting code blocks', error);
  }

  return codeBlocks;
};

const getLanguageFromComponent = (component) => {
  if (!component || !component.type) return 'javascript';
  
  const typeToLanguage = {
    'frontend': 'jsx',
    'react': 'jsx',
    'javascript': 'javascript',
    'backend': 'javascript',
    'node': 'javascript',
    'css': 'css',
    'html': 'html',
    'api': 'javascript',
    'database': 'sql',
    'python': 'python'
  };
  
  return typeToLanguage[component.type.toLowerCase()] || 'javascript';
};

const getFileExtension = (language) => {
  const languageToExt = {
    'jsx': 'jsx',
    'javascript': 'js',
    'typescript': 'ts',
    'python': 'py',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'csharp': 'cs',
    'php': 'php',
    'ruby': 'rb',
    'go': 'go',
    'rust': 'rs',
    'swift': 'swift',
    'kotlin': 'kt',
    'html': 'html',
    'css': 'css',
    'sql': 'sql',
    'bash': 'sh',
    'json': 'json',
    'markdown': 'md',
    'yaml': 'yml'
  };

  return languageToExt[language] || 'txt';
};

const formatCodeInMessage = (message) => {
  if (!message) return '';

  try {
    // Replace code blocks with syntax highlighted code
    const parts = [];
    let lastIndex = 0;
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let match;

    while ((match = codeBlockRegex.exec(message)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {message.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add code block
      const language = match[1] || 'javascript';
      const code = match[2] || '';
      
      try {
        parts.push(
          <Box key={`code-${match.index}`} sx={{ my: 2 }}>
            <Paper sx={{ overflow: 'hidden', bgcolor: 'grey.100' }}>
              <Box sx={{ 
                p: 1, 
                bgcolor: 'grey.200', 
                display: 'flex', 
                justifyContent: 'space-between'
              }}>
                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                  {language}
                </Typography>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                  }}
                >
                  <ContentCopy fontSize="small" />
                </IconButton>
              </Box>
              <SyntaxHighlighter 
                language={language} 
                style={materialLight}
                customStyle={{ margin: 0, maxHeight: '300px', fontSize: '0.85rem' }}
              >
                {code}
              </SyntaxHighlighter>
            </Paper>
          </Box>
        );
      } catch (error) {
        // Fallback if SyntaxHighlighter fails
        logger.error('Error rendering code block', error);
        parts.push(
          <Box key={`code-fallback-${match.index}`} sx={{ my: 2 }}>
            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', display: 'block', mb: 1 }}>
                {language}
              </Typography>
              <pre style={{ margin: 0, overflow: 'auto' }}>
                {code}
              </pre>
            </Paper>
          </Box>
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < message.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {message.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : message;
  } catch (error) {
    logger.error('Error formatting code in message', error);
    return message; // Return original message if formatting fails
  }
};

if (loading) {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}
    >
      <CircularProgress />
    </Box>
  );
}

if (error) {
  return (
    <Container>
      <Typography color="error">{error}</Typography>
      <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
    </Container>
  );
}

return (
  <Container maxWidth="xl" sx={{ mt: 2 }}>
    <Grid container spacing={2}>
      {/* Chat Area - Left Side */}
      <Grid item xs={12} md={7}>
        <Paper 
          sx={{ 
            height: 'calc(100vh - 80px)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Box>
              <Typography variant="h6">
                {project?.name || 'Chat Interface'}
              </Typography>
              <Typography variant="caption">
                AI Assistant
              </Typography>
            </Box>
            <Box>
              <IconButton 
                size="small" 
                color="inherit"
                onClick={handleClearChat}
                title="Clear chat history"
              >
                <Clear />
              </IconButton>
            </Box>
          </Box>
          
          {/* Messages Area */}
          <Box 
            sx={{ 
              p: 2, 
              flexGrow: 1, 
              overflow: 'auto',
              bgcolor: 'grey.50'
            }}
          >
            {messages.map((msg, index) => (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex', 
                  flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                  mb: 2
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'secondary.main',
                    mr: msg.role === 'user' ? 0 : 1,
                    ml: msg.role === 'user' ? 1 : 0
                  }}
                >
                  {msg.role === 'user' ? 
                    currentUser?.name?.charAt(0) || 'U' : 
                    'AI'}
                </Avatar>
                <Box 
                  sx={{ 
                    maxWidth: '70%',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: msg.role === 'user' ? 'primary.light' : 'white',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    boxShadow: 1
                  }}
                >
                  {msg.isFile ? (
                    <Box>
                      <Typography variant="body2">
                        Uploaded file: <strong>{msg.fileName || 'File'}</strong>
                      </Typography>
                    </Box>
                  ) : (
                    <Typography 
                      variant="body1" 
                      component="div"
                      sx={{
                        wordBreak: 'break-word',
                        '& code': {
                          bgcolor: 'grey.100',
                          p: 0.5,
                          borderRadius: 0.5,
                          fontFamily: 'monospace',
                          fontSize: '0.85rem'
                        }
                      }}
                    >
                      {formatCodeInMessage(msg.content || '')}
                    </Typography>
                  )}
                  <Typography 
                    variant="caption" 
                    color={msg.role === 'user' ? 'primary.contrastText' : 'text.secondary'}
                    sx={{ opacity: 0.7, display: 'block', mt: 1 }}
                  >
                    {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                  </Typography>
                </Box>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>
          
          {/* Input Area */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
            <Grid container spacing={1}>
              <Grid item xs>
                <TextField
                  fullWidth
                  placeholder="Type your message..."
                  variant="outlined"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  maxRows={4}
                  disabled={sending}
                  InputProps={{
                    sx: { borderRadius: 2 }
                  }}
                />
              </Grid>
              <Grid item>
                <Box sx={{ display: 'flex', height: '100%', alignItems: 'flex-start' }}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  <IconButton 
                    color="primary" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <AttachFile />
                  </IconButton>
                  <Button
                    variant="contained"
                    endIcon={<Send />}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    sx={{ borderRadius: 2 }}
                  >
                    {sending ? <CircularProgress size={24} /> : 'Send'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
      
      {/* Code/Info Display - Right Side */}
      <Grid item xs={12} md={5}>
        <Paper 
          sx={{ 
            height: 'calc(100vh - 80px)', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {/* Tabs */}
          <Tabs
            value={rightPanelContent}
            onChange={handleRightPanelChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab value="code" icon={<Code />} label="Code" />
            <Tab value="blueprint" icon={<Architecture />} label="Blueprint" />
            <Tab value="components" icon={<Terminal />} label="Components" />
          </Tabs>
          
          {/* Code Display */}
          {rightPanelContent === 'code' && (
            <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box 
                sx={{ 
                  p: 1.5, 
                  borderBottom: '1px solid', 
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography variant="subtitle1">
                  {codeDisplay?.title || 'Code Output'}
                </Typography>
                {codeDisplay && (
                  <>
                    <IconButton 
                      size="small" 
                      onClick={handleOpenCodeOptions}
                    >
                      <MoreVert />
                    </IconButton>
                    <Menu
                      anchorEl={menuAnchorEl}
                      open={Boolean(menuAnchorEl)}
                      onClose={handleCloseCodeOptions}
                    >
                      <MenuItem onClick={handleCopyCode}>
                        <ListItemIcon>
                          <ContentCopy fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Copy Code</ListItemText>
                      </MenuItem>
                      <MenuItem onClick={handleDownloadCode}>
                        <ListItemIcon>
                          <Download fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Download</ListItemText>
                      </MenuItem>
                    </Menu>
                  </>
                )}
              </Box>
              <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'grey.100' }}>
                {codeDisplay ? (
                  <SyntaxHighlighter 
                    language={codeDisplay.language || 'javascript'} 
                    style={materialLight}
                    customStyle={{ margin: 0, minHeight: '100%' }}
                  >
                    {codeDisplay.code || ''}
                  </SyntaxHighlighter>
                ) : (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      justifyContent: 'center', 
                      alignItems: 'center',
                      height: '100%',
                      p: 4,
                      textAlign: 'center'
                    }}
                  >
                    <Code sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No Code Selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ask the AI to generate code or click on a component from the Components tab.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          )}
          
          {/* Blueprint Display */}
          {rightPanelContent === 'blueprint' && (
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {blueprint ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Project Blueprint
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {blueprint.description || 'System architecture blueprint'}
                  </Typography>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Typography variant="subtitle1" gutterBottom>
                    Components:
                  </Typography>
                  
                  {blueprint.components && blueprint.components.map((component) => (
                    <Card 
                      key={component.id || index} 
                      sx={{ 
                        mb: 2,
                        transition: 'transform 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: 2
                        }
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" gutterBottom>
                          {component.name || 'Unnamed Component'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {component.description || 'No description provided'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                          {component.type && (
                            <Chip 
                              label={component.type} 
                              size="small" 
                              color="primary" 
                              variant="outlined" 
                            />
                          )}
                          {component.dependencies && component.dependencies.map((dep, index) => (
                            <Chip 
                              key={index} 
                              label={dep} 
                              size="small" 
                              variant="outlined" 
                            />
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '80%',
                    textAlign: 'center'
                  }}
                >
                  <Architecture sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No Blueprint Available
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ask the AI to generate a blueprint for your project first.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          
          {/* Components Display */}
          {rightPanelContent === 'components' && (
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {components && components.length > 0 ? (
                <List>
                  {components.map((component) => (
                    <React.Fragment key={component.id || index}>
                      <ListItem 
                        button 
                        onClick={() => handleComponentClick(component)}
                        selected={selectedComponent?.id === component.id}
                      >
                        <ListItemIcon>
                          <Code />
                        </ListItemIcon>
                        <ListItemText 
                          primary={component.name || 'Unnamed Component'} 
                          secondary={`${component.type || 'Component'} - Last updated: ${component.lastUpdated ? new Date(component.lastUpdated).toLocaleDateString() : 'Unknown'}`} 
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    justifyContent: 'center', 
                    alignItems: 'center',
                    height: '100%',
                    p: 4,
                    textAlign: 'center'
                  }}
                >
                  <Terminal sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No Components Generated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ask the AI to generate components for your project.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  </Container>
);
};

export default ChatInterface;
