/**
 * Sample Trading Strategy Template
 * This template demonstrates a simple moving average crossover strategy
 */

// Strategy parameters
const parameters = {
  fastPeriod: {
    name: 'fastPeriod',
    type: 'number',
    description: 'Fast moving average period',
    required: true,
    defaultValue: 10,
    validation: (value) => {
      if (value <= 0) return 'Fast period must be greater than 0';
      if (value >= parameters.slowPeriod.defaultValue) {
        return 'Fast period must be less than slow period';
      }
      return null;
    }
  },
  slowPeriod: {
    name: 'slowPeriod',
    type: 'number',
    description: 'Slow moving average period',
    required: true,
    defaultValue: 20,
    validation: (value) => {
      if (value <= 0) return 'Slow period must be greater than 0';
      if (value <= parameters.fastPeriod.defaultValue) {
        return 'Slow period must be greater than fast period';
      }
      return null;
    }
  },
  stopLoss: {
    name: 'stopLoss',
    type: 'number',
    description: 'Stop loss percentage',
    required: true,
    defaultValue: 2,
    validation: (value) => {
      if (value <= 0) return 'Stop loss must be greater than 0';
      if (value >= 100) return 'Stop loss must be less than 100';
      return null;
    }
  },
  takeProfit: {
    name: 'takeProfit',
    type: 'number',
    description: 'Take profit percentage',
    required: true,
    defaultValue: 4,
    validation: (value) => {
      if (value <= 0) return 'Take profit must be greater than 0';
      if (value >= 100) return 'Take profit must be less than 100';
      if (value <= parameters.stopLoss.defaultValue) {
        return 'Take profit must be greater than stop loss';
      }
      return null;
    }
  }
};

// Dependencies
const dependencies = [
  {
    name: 'technicalindicators',
    version: '3.1.0',
    type: 'npm'
  }
];

// Template code
const code = `
const { SMA } = require('technicalindicators');

class MovingAverageCrossover {
  constructor({ fastPeriod, slowPeriod, stopLoss, takeProfit }) {
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
    this.stopLoss = stopLoss;
    this.takeProfit = takeProfit;
    this.fastSMA = new SMA({ period: fastPeriod, values: [] });
    this.slowSMA = new SMA({ period: slowPeriod, values: [] });
    this.position = null;
    this.entryPrice = null;
  }

  calculateIndicators(candles) {
    const closes = candles.map(candle => candle.close);
    const fastMA = this.fastSMA.nextValue(closes);
    const slowMA = this.slowSMA.nextValue(closes);
    return { fastMA, slowMA };
  }

  checkStopLossTakeProfit(currentPrice) {
    if (!this.position || !this.entryPrice) return null;

    const priceChange = ((currentPrice - this.entryPrice) / this.entryPrice) * 100;
    
    if (this.position === 'long') {
      if (priceChange <= -this.stopLoss) return 'sell';
      if (priceChange >= this.takeProfit) return 'sell';
    } else if (this.position === 'short') {
      if (priceChange >= this.stopLoss) return 'buy';
      if (priceChange <= -this.takeProfit) return 'buy';
    }

    return null;
  }

  generateSignal(candles) {
    const currentPrice = candles[candles.length - 1].close;
    const { fastMA, slowMA } = this.calculateIndicators(candles);

    // Check stop loss and take profit first
    const sltpSignal = this.checkStopLossTakeProfit(currentPrice);
    if (sltpSignal) return sltpSignal;

    // Generate new signals
    if (!fastMA || !slowMA) return null;

    if (fastMA > slowMA && this.position !== 'long') {
      this.position = 'long';
      this.entryPrice = currentPrice;
      return 'buy';
    } else if (fastMA < slowMA && this.position !== 'short') {
      this.position = 'short';
      this.entryPrice = currentPrice;
      return 'sell';
    }

    return null;
  }
}

module.exports = MovingAverageCrossover;
`;

// Template metadata
const metadata = {
  name: 'Moving Average Crossover Strategy',
  description: 'A simple moving average crossover strategy with stop loss and take profit',
  version: '1.0.0',
  category: 'strategy',
  tags: ['moving-average', 'crossover', 'trend-following'],
  isPublic: true,
  status: 'published'
};

module.exports = {
  parameters,
  dependencies,
  code,
  metadata
}; 