import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../hooks/useTheme';

function TechnicalAnalysisWidget() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (container.current) {
      // Clear previous widget
      container.current.innerHTML = '';
      
      // Determine dimensions based on screen size
      const isMobile = window.innerWidth < 640;
      const width = isMobile ? 350 : 425;
      const height = isMobile ? 400 : 450;
      
      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "colorTheme": "${theme}",
          "displayMode": "single",
          "isTransparent": true,
          "locale": "en",
          "interval": "1m",
          "disableInterval": false,
          "width": ${width},
          "height": ${height},
          "symbol": "NSE:NIFTY",
          "showIntervalTabs": true
        }`;
      container.current.appendChild(script);
    }
  }, [theme]);

  return (
    <div className="w-full flex justify-center">
      <div className="tradingview-widget-container" ref={container}>
        <div className="tradingview-widget-container__widget"></div>
        <div className="tradingview-widget-copyright text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
          <a 
            href="https://www.tradingview.com/symbols/NSE-NIFTY/technicals/?exchange=NSE" 
            rel="noopener nofollow" 
            target="_blank"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Technical analysis for NIFTY by TradingView
          </a>
        </div>
      </div>
    </div>
  );
}

export default memo(TechnicalAnalysisWidget);
