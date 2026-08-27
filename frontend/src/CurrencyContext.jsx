import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export function useCurrency() {
  return useContext(CurrencyContext);
}

// Fixed conversion rates (Base is INR)
const RATES = {
  INR: 1,
  USD: 0.012, // 1 INR = ~0.012 USD (1 USD = ~83 INR)
  GBP: 0.0094 // 1 INR = ~0.0094 GBP (1 GBP = ~105 INR)
};

const SYMBOLS = {
  INR: '₹',
  USD: '$',
  GBP: '£'
};

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try {
      const savedCurrency = localStorage.getItem('bt_market_currency');
      if (savedCurrency && RATES[savedCurrency]) {
        return savedCurrency;
      }
    } catch {
      // Ignore localStorage error
    }
    return 'INR';
  });

  const changeCurrency = (newCurrency) => {
    if (RATES[newCurrency]) {
      setCurrency(newCurrency);
      localStorage.setItem('bt_market_currency', newCurrency);
    }
  };

  // Convert raw INR amount to target currency raw amount
  const convertPrice = (inrAmount) => {
    const amount = Number(inrAmount) || 0;
    if (currency === 'INR') return amount;
    return amount * RATES[currency];
  };

  // Convert and format the string (e.g., "$60.24")
  const formatPrice = (inrAmount) => {
    const amount = Number(inrAmount) || 0;
    
    if (currency === 'INR') {
      return `₹${amount.toLocaleString('en-IN')}`;
    }

    const converted = amount * RATES[currency];
    return `${SYMBOLS[currency]}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const value = {
    currency,
    changeCurrency,
    formatPrice,
    convertPrice,
    symbols: SYMBOLS
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
