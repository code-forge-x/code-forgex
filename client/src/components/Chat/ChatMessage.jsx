// client/src/components/chat/ChatMessage.jsx

import React, { useState } from 'react';
import { Box, Paper, Typography, Chip, IconButton, Tooltip, Collapse } from '@mui/material';
import { ContentCopy, CheckCircle, Code, Info, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatMessage = ({ message, theme = 'dark' }) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Handle code copying
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Toggle expanded code view
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Detect financial code languages
  const detectFinancialLanguage = (language) => {
    // Map language identifiers to proper name
    const languageMap = {
      'mql4': 'MQL4',
      'mql5': 'MQL5',
      'mql': 'MQL5',
      'pine': 'Pine Script',
      'pinescript': 'Pine Script',
      'python': 'Python',
      'py': 'Python',
      'cs': 'C#',
      'csharp': 'C#',
      'c#': 'C#',
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'cpp': 'C++',
      'c++': 'C++',
      'fix': 'FIX Protocol',
      'fix-protocol': 'FIX Protocol',
      'fixprotocol': 'FIX Protocol',
      'json': 'JSON',
      'xml': 'XML',
      'sql': 'SQL'
    };
    
    return languageMap[language.toLowerCase()] || language;
  };
  
  // Add metadata badges for financial code
  const getFinancialCodeBadges = (code, language) => {
    const badges = [];
    
    // Detect FIX protocol
    if (code.includes('FIX.') || code.includes('BeginString') || code.includes('8=FIX')) {
      badges.push({ label: 'FIX Protocol', color: 'primary' });
    }
    
    // Detect risk management code
    if (code.includes('RiskManagement') || code.includes('StopLoss') || 
        code.includes('risk') || code.includes('AccountBalance')) {
      badges.push({ label: 'Risk Management', color: 'error' });
    }
    
    // Detect trading signals
    if (code.includes('Signal') || code.includes('Entry') || code.includes('Exit') ||
        code.includes('Buy') || code.includes('Sell')) {
      badges.push({ label: 'Trading Signal', color: 'success' });
    }
    
    // Detect indicators
    if (code.includes('Indicator') || code.includes('iMA') || code.includes('iRSI') ||
        code.includes('Moving Average') || code.includes('RSI') || code.includes('MACD')) {
      badges.push({ label: 'Technical Indicator', color: 'info' });
    }
    
    // Detect REST API
    if (code.includes('fetch(') || code.includes('axios.') || 
        code.includes('http.') || code.includes('api/')) {
      badges.push({ label: 'API', color: 'secondary' });
    }
    
    // Language-specific detection
    if (language) {
      const lowerLang = language.toLowerCase();
      
      if (lowerLang === 'mql4' || lowerLang === 'mql5' || lowerLang === 'mql') {
        if (code.includes('Expert Advisor') || code.includes('#property strict')) {
          badges.push({ label: 'Expert Advisor', color: 'warning' });
        }
      }
      
      if (lowerLang === 'python') {
        if (code.includes('import pandas') || code.includes('import numpy')) {
          badges.push({ label: 'Data Analysis', color: 'warning' });
        }
        if (code.includes('import matplotlib') || code.includes('import plotly')) {
          badges.push({ label: 'Visualization', color: 'success' });
        }
      }
    }
    
    return badges;
  };

  // Render content with enhanced code block handling
  const renderContent = () => {
    if (message.isFile) {
      return (
        <Typography>
          Uploaded file: <strong>{message.fileName}</strong>
        </Typography>
      );
    }

    // Handle code blocks in content
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let content = message.content || '';

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(
          <ReactMarkdown 
            key={`text-${lastIndex}`}
            remarkPlugins={[remarkGfm]}
          >
            {content.substring(lastIndex, match.index)}
          </ReactMarkdown>
        );
      }

      // Add code block
      const language = match[1] || 'javascript';
      const code = match[2];
      const formattedLanguage = detectFinancialLanguage(language);
      const badges = getFinancialCodeBadges(code, language);
      
      parts.push(
        <Paper key={`code-${match.index}`} sx={{ position: 'relative', my: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            p: 1, 
            bgcolor: theme === 'dark' ? 'grey.900' : 'grey.100'
          }}>
            <Box display="flex" alignItems="center">
              <Typography variant="caption" fontWeight="bold" sx={{ mr: 1 }}>
                {formattedLanguage}
              </Typography>
              {badges.map((badge, index) => (
                <Chip 
                  key={index}
                  label={badge.label}
                  color={badge.color}
                  size="small"
                  sx={{ mr: 0.5, fontSize: '0.65rem' }}
                />
              ))}
            </Box>
            <Box>
              <Tooltip title={expanded ? "Collapse" : "Expand"}>
                <IconButton size="small" onClick={toggleExpanded}>
                  {expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                </IconButton>
              </Tooltip>
              <Tooltip title={copied ? "Copied!" : "Copy code"}>
                <IconButton size="small" onClick={() => handleCopy(code)}>
                  {copied ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          <Collapse in={expanded} collapsedSize={300}>
            <SyntaxHighlighter 
              language={language} 
              style={theme === 'dark' ? oneDark : oneLight}
              showLineNumbers
              wrapLongLines
            >
              {code}
            </SyntaxHighlighter>
          </Collapse>
        </Paper>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(
        <ReactMarkdown 
          key={`text-${lastIndex}`}
          remarkPlugins={[remarkGfm]}
        >
          {content.substring(lastIndex)}
        </ReactMarkdown>
      );
    }

    return parts.length > 0 ? parts : (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    );
  };

  // Render message with metadata
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
        mb: 2
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          maxWidth: '80%',
          bgcolor: message.role === 'user' 
            ? 'primary.main' 
            : theme === 'dark' ? 'grey.800' : 'background.paper',
          color: message.role === 'user' 
            ? 'primary.contrastText' 
            : theme === 'dark' ? 'common.white' : 'text.primary'
        }}
      >
        {message.metadata?.type && (
          <Chip 
            label={message.metadata.type.replace(/_/g, ' ')}
            size="small" 
            color={message.metadata.type.includes('error') ? 'error' : 'info'}
            sx={{ mb: 1 }}
          />
        )}
        
        {renderContent()}
        
        <Typography 
          variant="caption" 
          sx={{ 
            display: 'block', 
            mt: 1, 
            opacity: 0.7,
            textAlign: 'right'
          }}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </Typography>
      </Paper>
    </Box>
  );
};

export default ChatMessage;