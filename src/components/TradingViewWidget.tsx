import React, { useEffect, useRef, memo } from 'react';
import { useTheme } from '../hooks/useTheme';

function TradingViewWidget() {
  const container = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (container.current) {
      // Clear previous widget
      container.current.innerHTML = '';

      // Determine height based on screen size
      const isMobile = window.innerWidth < 640;
      const height = isMobile ? 400 : 550;

      const script = document.createElement("script");
      script.src = "https://s3.tradingview.com/external-embedding/embed-widget-timeline.js";
      script.type = "text/javascript";
      script.async = true;
      script.innerHTML = `
        {
          "displayMode": "regular",
          "feedMode": "all_symbols",
          "colorTheme": "${theme}",
          "isTransparent": true,
          "locale": "en",
          "width": "100%",
          "height": ${height}
        }`;
      container.current.appendChild(script);
    }
  }, [theme]);

  return (
    <div className="tradingview-widget-container" ref={container}>
      <div className="tradingview-widget-container__widget"></div>
      <div className="tradingview-widget-copyright">
        <a 
          href="https://www.tradingview.com/news-flow/?priority=top_stories" 
          rel="noopener nofollow" 
          target="_blank"
          className="text-blue-600 hover:text-blue-700 text-sm"
        >
          Top stories by TradingView
        </a>
      </div>
    </div>
  );
}

export default memo(TradingViewWidget);
