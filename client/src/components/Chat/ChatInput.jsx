// client/src/components/chat/ChatInput.jsx

import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  CircularProgress, 
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  Chip,
  Paper,
  Divider
} from '@mui/material';
import { 
  Send, 
  AttachFile, 
  Code, 
  ShowChart, 
  AccountBalance, 
  Add, 
  Settings, 
  MoreVert,
  DataObject
} from '@mui/icons-material';

// Financial code templates
const codeTemplates = [
  {
    name: 'MQL5 Expert Advisor',
    icon: <Code />,
    template: `//+------------------------------------------------------------------+
//|                                                    MyExpertAdvisor.mq5 |
//|                        Copyright 2025, Your Name                       |
//|                                              https://www.yoursite.com/ |
//+------------------------------------------------------------------+
#property copyright "Copyright 2025, Your Name"
#property link      "https://www.yoursite.com/"
#property version   "1.00"
#property strict

// Input parameters
input double LotSize = 0.1;      // Position size
input int StopLoss = 100;        // Stop Loss in points
input int TakeProfit = 200;      // Take Profit in points

// Global variables
int MA_Handle;
bool isTradeAllowed = false;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // Initialize indicators
   MA_Handle = iMA(_Symbol, PERIOD_CURRENT, 20, 0, MODE_SMA, PRICE_CLOSE);
   if(MA_Handle == INVALID_HANDLE)
   {
      Print("Error creating MA indicator");
      return INIT_FAILED;
   }
   
   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   // Release indicator handles
   IndicatorRelease(MA_Handle);
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // TODO: Add your trading logic here
   
}
`
  },
  {
    name: 'Python Trading Strategy',
    icon: <ShowChart />,
    template: `# Simple Moving Average Crossover Strategy
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# Strategy parameters
fast_period = 20
slow_period = 50
initial_capital = 10000.0

def calculate_signals(data):
    """Calculate trading signals based on moving average crossover"""
    # Calculate moving averages
    data['fast_ma'] = data['close'].rolling(window=fast_period).mean()
    data['slow_ma'] = data['close'].rolling(window=slow_period).mean()
    
    # Generate signals
    data['signal'] = 0
    data.loc[data['fast_ma'] > data['slow_ma'], 'signal'] = 1  # Buy signal
    data.loc[data['fast_ma'] < data['slow_ma'], 'signal'] = -1 # Sell signal
    
    # Generate trading orders
    data['position'] = data['signal'].diff()
    
    return data

def backtest_strategy(data):
    """Run backtest on the strategy"""
    # Calculate signals
    data = calculate_signals(data)
    
    # Initialize portfolio metrics
    data['returns'] = data['close'].pct_change()
    data['strategy_returns'] = data['returns'] * data['signal'].shift(1)
    data['equity_curve'] = (1 + data['strategy_returns']).cumprod() * initial_capital
    
    # Calculate performance metrics
    total_return = (data['equity_curve'].iloc[-1] / initial_capital) - 1
    annual_return = total_return / (len(data) / 252)
    sharpe_ratio = data['strategy_returns'].mean() / data['strategy_returns'].std() * np.sqrt(252)
    
    print(f"Total Return: {total_return:.2%}")
    print(f"Annual Return: {annual_return:.2%}")
    print(f"Sharpe Ratio: {sharpe_ratio:.2f}")
    
    return data

# Example usage:
# data = pd.read_csv('EURUSD.csv', parse_dates=['date'])
# result = backtest_strategy(data)
# plot_results(result)
`
  },
  {
    name: 'FIX Protocol Message',
    icon: <DataObject />,
    template: `// Example of sending a FIX order message with QuickFIX/J
import quickfix.*;
import quickfix.field.*;

public class OrderSender {
    private final Session session;
    
    public OrderSender(Session session) {
        this.session = session;
    }
    
    public void sendMarketOrder(String symbol, char side, double quantity) throws SessionNotFound {
        // Create FIX message
        quickfix.fix44.NewOrderSingle order = new quickfix.fix44.NewOrderSingle(
            new ClOrdID(generateOrderId()),
            new Side(side),
            new TransactTime(new Date()),
            new OrdType(OrdType.MARKET)
        );
        
        // Set required fields
        order.set(new Symbol(symbol));
        order.set(new OrderQty(quantity));
        order.set(new TimeInForce(TimeInForce.DAY));
        order.set(new HandlInst('1')); // Automated execution
        
        // Send the message
        Session.sendToTarget(order, session.getSessionID());
        System.out.println("Sent market order: " + symbol + ", " + 
                           (side == Side.BUY ? "BUY" : "SELL") + ", " + 
                           quantity + " units");
    }
    
    private String generateOrderId() {
        return "ORD" + System.currentTimeMillis();
    }
}
`
  },
  {
    name: 'Risk Management',
    icon: <AccountBalance />,
    template: `// Position sizing and risk management module
public class RiskManager {
    private const double MAX_RISK_PERCENT = 2.0; // Maximum risk per trade (2%)
    private const double MAX_ACCOUNT_RISK = 10.0; // Maximum total risk (10%)
    
    public double CalculatePositionSize(double accountEquity, double riskAmount, 
                                      double entryPrice, double stopLossPrice) {
        // Calculate risk amount based on percentage
        double riskAmountValue = accountEquity * (riskAmount / 100.0);
        
        // Calculate risk per unit
        double riskPerUnit = Math.Abs(entryPrice - stopLossPrice);
        if (riskPerUnit == 0) {
            throw new ArgumentException("Entry and stop loss prices cannot be the same");
        }
        
        // Calculate position size
        double positionSize = riskAmountValue / riskPerUnit;
        
        // Apply risk limits
        positionSize = ApplyRiskLimits(positionSize, accountEquity, entryPrice);
        
        return positionSize;
    }
    
    public double ApplyRiskLimits(double positionSize, double accountEquity, double price) {
        // Check if position exceeds max risk percent
        double positionValue = positionSize * price;
        double riskPercent = positionValue / accountEquity * 100.0;
        
        if (riskPercent > MAX_RISK_PERCENT) {
            positionSize = (accountEquity * MAX_RISK_PERCENT / 100.0) / price;
        }
        
        // Check total account risk (assuming other positions)
        // This would require tracking all open positions
        
        return positionSize;
    }
}
`
  }
];

const ChatInput = ({ onSendMessage, isProcessing, placeholder, onFileUpload }) => {
  const [message, setMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [templateAnchorEl, setTemplateAnchorEl] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const fileInputRef = useRef(null);
  const textFieldRef = useRef(null);
  
  // Detected financial terms for suggestions
  const [detectedTerms, setDetectedTerms] = useState([]);
  
  // Financial terms dictionary for auto-detection
  const financialTerms = {
    'stop loss': { name: 'Stop Loss', type: 'risk' },
    'take profit': { name: 'Take Profit', type: 'risk' },
    'leverage': { name: 'Leverage', type: 'risk' },
    'lot size': { name: 'Lot Size', type: 'trading' },
    'margin': { name: 'Margin', type: 'risk' },
    'moving average': { name: 'Moving Average', type: 'indicator' },
    'macd': { name: 'MACD', type: 'indicator' },
    'rsi': { name: 'RSI', type: 'indicator' },
    'bollinger': { name: 'Bollinger Bands', type: 'indicator' },
    'backtesting': { name: 'Backtesting', type: 'analysis' },
    'api': { name: 'API', type: 'connectivity' },
    'fix protocol': { name: 'FIX Protocol', type: 'connectivity' },
    'expert advisor': { name: 'Expert Advisor', type: 'trading' },
    'trailing stop': { name: 'Trailing Stop', type: 'risk' },
    'buy signal': { name: 'Buy Signal', type: 'trading' },
    'sell signal': { name: 'Sell Signal', type: 'trading' },
    'scalping': { name: 'Scalping', type: 'strategy' },
    'swing trading': { name: 'Swing Trading', type: 'strategy' },
    'day trading': { name: 'Day Trading', type: 'strategy' },
    'position sizing': { name: 'Position Sizing', type: 'risk' },
    'mean reversion': { name: 'Mean Reversion', type: 'strategy' },
    'trend following': { name: 'Trend Following', type: 'strategy' },
    'order book': { name: 'Order Book', type: 'market data' },
    'liquidity': { name: 'Liquidity', type: 'market' },
    'volatility': { name: 'Volatility', type: 'market' },
  };
  
  // Detect financial terms in message
  useEffect(() => {
    if (!message) {
      setDetectedTerms([]);
      return;
    }
    
    const lowerMessage = message.toLowerCase();
    const found = [];
    
    Object.entries(financialTerms).forEach(([term, info]) => {
      if (lowerMessage.includes(term)) {
        found.push({
          term: term,
          name: info.name,
          type: info.type
        });
      }
    });
    
    // Remove duplicates and limit to 5 items
    const uniqueTerms = found.filter((term, index, self) => 
      index === self.findIndex(t => t.name === term.name)
    ).slice(0, 5);
    
    setDetectedTerms(uniqueTerms);
  }, [message]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !isProcessing) {
      onSendMessage(message);
      setMessage('');
      setDetectedTerms([]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleTemplateMenuOpen = (event) => {
    setTemplateAnchorEl(event.currentTarget);
  };
  
  const handleTemplateMenuClose = () => {
    setTemplateAnchorEl(null);
  };
  
  const handleFileUpload = () => {
    fileInputRef.current.click();
  };
  
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      if (onFileUpload) {
        onFileUpload(file);
      }
      // Reset input
      e.target.value = null;
    }
  };
  
  const handleTemplateSelect = (template) => {
    setMessage(prevMessage => prevMessage + (prevMessage ? '\n\n' : '') + template.template);
    setSelectedTemplate(template);
    handleTemplateMenuClose();
    
    // Focus textarea and move cursor to the right position
    if (textFieldRef.current) {
      setTimeout(() => {
        const input = textFieldRef.current.querySelector('textarea');
        if (input) {
          input.focus();
          
          // Find TODO or placeholder position to position cursor
          const text = input.value;
          const todoPos = text.indexOf('TODO');
          if (todoPos !== -1) {
            input.setSelectionRange(todoPos, todoPos + 4);
          } else {
            input.setSelectionRange(text.length, text.length);
          }
        }
      }, 100);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Financial terms detected */}
      {detectedTerms.length > 0 && (
        <Paper
          variant="outlined"
          sx={{ 
            p: 1, 
            mb: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Financial terms detected:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {detectedTerms.map((term, index) => (
              <Chip
                key={index}
                label={term.name}
                size="small"
                variant="outlined"
                color={
                  term.type === 'risk' ? 'error' :
                  term.type === 'indicator' ? 'info' :
                  term.type === 'trading' ? 'success' :
                  term.type === 'strategy' ? 'warning' : 'default'
                }
              />
            ))}
          </Box>
        </Paper>
      )}
      
      <Box sx={{ display: 'flex' }}>
        {/* Template menu button */}
        <Tooltip title="Code Templates">
          <IconButton 
            color="primary"
            onClick={handleTemplateMenuOpen}
            disabled={isProcessing}
          >
            <Code />
          </IconButton>
        </Tooltip>
        
        {/* More options menu button */}
        <Tooltip title="Options">
          <IconButton 
            onClick={handleMenuOpen}
            disabled={isProcessing}
          >
            <MoreVert />
          </IconButton>
        </Tooltip>
        
        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
        
        {/* Main text input */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder={placeholder || "Type a message..."}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isProcessing}
          multiline
          maxRows={6}
          minRows={1}
          sx={{ mr: 1 }}
          ref={textFieldRef}
        />
        
        {/* Send button */}
        <IconButton 
          type="submit" 
          color="primary" 
          disabled={isProcessing || !message.trim()}
        >
          {isProcessing ? <CircularProgress size={24} /> : <Send />}
        </IconButton>
      </Box>
      
      {/* Templates menu */}
      <Menu
        anchorEl={templateAnchorEl}
        open={Boolean(templateAnchorEl)}
        onClose={handleTemplateMenuClose}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Code Templates
        </Typography>
        <Divider />
        {codeTemplates.map((template, index) => (
          <MenuItem key={index} onClick={() => handleTemplateSelect(template)}>
            <ListItemIcon>
              {template.icon}
            </ListItemIcon>
            <ListItemText primary={template.name} />
          </MenuItem>
        ))}
      </Menu>
      
      {/* Options menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleFileUpload}>
          <ListItemIcon>
            <AttachFile fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Upload File" />
        </MenuItem>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </Menu>
    </Box>
  );
};

export default ChatInput;