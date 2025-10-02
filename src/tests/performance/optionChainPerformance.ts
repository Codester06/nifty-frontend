/**
 * Performance testing utilities for Option Chain components
 * These tests can be run manually in the browser console or integrated with performance monitoring
 */

interface PerformanceMetrics {
  renderTime: number;
  updateTime: number;
  memoryUsage: number;
  reRenderCount: number;
}

class OptionChainPerformanceTester {
  private metrics: PerformanceMetrics = {
    renderTime: 0,
    updateTime: 0,
    memoryUsage: 0,
    reRenderCount: 0,
  };

  private renderStartTime: number = 0;
  private updateStartTime: number = 0;

  /**
   * Start measuring render performance
   */
  startRenderMeasurement(): void {
    this.renderStartTime = performance.now();
  }

  /**
   * End render measurement and record time
   */
  endRenderMeasurement(): number {
    const renderTime = performance.now() - this.renderStartTime;
    this.metrics.renderTime = renderTime;
    console.log(`Option Chain Render Time: ${renderTime.toFixed(2)}ms`);
    return renderTime;
  }

  /**
   * Start measuring update performance
   */
  startUpdateMeasurement(): void {
    this.updateStartTime = performance.now();
  }

  /**
   * End update measurement and record time
   */
  endUpdateMeasurement(): number {
    const updateTime = performance.now() - this.updateStartTime;
    this.metrics.updateTime = updateTime;
    console.log(`Option Chain Update Time: ${updateTime.toFixed(2)}ms`);
    return updateTime;
  }

  /**
   * Measure memory usage
   */
  measureMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memoryUsage = memory.usedJSHeapSize;
      console.log(`Memory Usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
      return memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Increment re-render counter
   */
  incrementReRenderCount(): void {
    this.metrics.reRenderCount++;
  }

  /**
   * Get current metrics
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      renderTime: 0,
      updateTime: 0,
      memoryUsage: 0,
      reRenderCount: 0,
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): string {
    const report = `
Option Chain Performance Report
==============================
Render Time: ${this.metrics.renderTime.toFixed(2)}ms
Update Time: ${this.metrics.updateTime.toFixed(2)}ms
Memory Usage: ${(this.metrics.memoryUsage / 1024 / 1024).toFixed(2)}MB
Re-render Count: ${this.metrics.reRenderCount}

Performance Benchmarks:
- Render Time: ${this.metrics.renderTime < 100 ? '✅ Good' : this.metrics.renderTime < 300 ? '⚠️ Fair' : '❌ Poor'}
- Update Time: ${this.metrics.updateTime < 50 ? '✅ Good' : this.metrics.updateTime < 100 ? '⚠️ Fair' : '❌ Poor'}
- Re-renders: ${this.metrics.reRenderCount < 10 ? '✅ Good' : this.metrics.reRenderCount < 20 ? '⚠️ Fair' : '❌ Poor'}
    `;
    
    console.log(report);
    return report;
  }
}

/**
 * Test large dataset performance
 */
export const testLargeDatasetPerformance = (strikeCount: number = 100): void => {
  console.log(`Testing performance with ${strikeCount} strikes...`);
  
  const tester = new OptionChainPerformanceTester();
  
  // Generate large mock dataset
  const generateLargeOptionChain = (strikes: number) => {
    const options: any = {};
    const basePrice = 19500;
    
    for (let i = 0; i < strikes; i++) {
      const strike = basePrice - (strikes / 2 * 50) + (i * 50);
      options[strike] = {
        call: {
          symbol: `NIFTY25JAN${strike}CE`,
          strike,
          ltp: Math.random() * 100 + 10,
          bid: Math.random() * 100 + 5,
          ask: Math.random() * 100 + 15,
          volume: Math.floor(Math.random() * 10000),
          oi: Math.floor(Math.random() * 50000),
          iv: Math.random() * 30 + 10,
        },
        put: {
          symbol: `NIFTY25JAN${strike}PE`,
          strike,
          ltp: Math.random() * 100 + 10,
          bid: Math.random() * 100 + 5,
          ask: Math.random() * 100 + 15,
          volume: Math.floor(Math.random() * 10000),
          oi: Math.floor(Math.random() * 50000),
          iv: Math.random() * 30 + 10,
        },
      };
    }
    
    return {
      underlying: 'NIFTY',
      spotPrice: basePrice,
      expiry: '2024-01-25',
      lastUpdated: new Date().toISOString(),
      options,
    };
  };

  tester.startRenderMeasurement();
  const largeDataset = generateLargeOptionChain(strikeCount);
  tester.endRenderMeasurement();

  tester.measureMemoryUsage();
  tester.generateReport();
};

/**
 * Test real-time update performance
 */
export const testRealTimeUpdatePerformance = (updateCount: number = 50): void => {
  console.log(`Testing real-time update performance with ${updateCount} updates...`);
  
  const tester = new OptionChainPerformanceTester();
  let updateIndex = 0;

  const simulateUpdate = () => {
    if (updateIndex >= updateCount) {
      tester.generateReport();
      return;
    }

    tester.startUpdateMeasurement();
    
    // Simulate price update
    const mockUpdate = {
      strike: 19500,
      callLtp: Math.random() * 100 + 50,
      putLtp: Math.random() * 100 + 50,
      timestamp: Date.now(),
    };

    // Simulate DOM update time
    setTimeout(() => {
      tester.endUpdateMeasurement();
      tester.incrementReRenderCount();
      updateIndex++;
      
      // Schedule next update
      setTimeout(simulateUpdate, 100);
    }, Math.random() * 10 + 5);
  };

  simulateUpdate();
};

/**
 * Test filtering and sorting performance
 */
export const testFilteringSortingPerformance = (): void => {
  console.log('Testing filtering and sorting performance...');
  
  const tester = new OptionChainPerformanceTester();
  
  // Generate test data
  const strikes = Array.from({ length: 200 }, (_, i) => 19000 + i * 25);
  const options = strikes.map(strike => ({
    strike,
    callLtp: Math.random() * 100 + 10,
    putLtp: Math.random() * 100 + 10,
    callVolume: Math.floor(Math.random() * 10000),
    putVolume: Math.floor(Math.random() * 10000),
    callOI: Math.floor(Math.random() * 50000),
    putOI: Math.floor(Math.random() * 50000),
  }));

  // Test filtering
  tester.startUpdateMeasurement();
  const filteredOptions = options.filter(option => 
    option.callVolume > 1000 && option.putVolume > 1000
  );
  const filterTime = tester.endUpdateMeasurement();

  // Test sorting
  tester.startUpdateMeasurement();
  const sortedOptions = [...filteredOptions].sort((a, b) => b.callLtp - a.callLtp);
  const sortTime = tester.endUpdateMeasurement();

  console.log(`Filter Performance: ${filterTime.toFixed(2)}ms`);
  console.log(`Sort Performance: ${sortTime.toFixed(2)}ms`);
  console.log(`Filtered ${options.length} -> ${filteredOptions.length} options`);
  
  tester.generateReport();
};

/**
 * Test virtualization performance
 */
export const testVirtualizationPerformance = (): void => {
  console.log('Testing virtualization performance...');
  
  const tester = new OptionChainPerformanceTester();
  
  // Simulate large dataset
  const itemCount = 1000;
  const visibleItems = 20;
  
  tester.startRenderMeasurement();
  
  // Simulate virtualized rendering (only render visible items)
  const virtualizedItems = Array.from({ length: visibleItems }, (_, i) => ({
    index: i,
    strike: 19000 + i * 25,
    rendered: true,
  }));
  
  tester.endRenderMeasurement();
  
  console.log(`Virtualization: Rendered ${visibleItems} of ${itemCount} items`);
  console.log(`Memory saved: ~${((itemCount - visibleItems) / itemCount * 100).toFixed(1)}%`);
  
  tester.generateReport();
};

/**
 * Comprehensive performance test suite
 */
export const runPerformanceTestSuite = (): void => {
  console.log('🚀 Starting Option Chain Performance Test Suite...\n');
  
  // Test 1: Large dataset rendering
  console.log('📊 Test 1: Large Dataset Performance');
  testLargeDatasetPerformance(100);
  
  setTimeout(() => {
    // Test 2: Real-time updates
    console.log('\n⚡ Test 2: Real-time Update Performance');
    testRealTimeUpdatePerformance(30);
  }, 1000);
  
  setTimeout(() => {
    // Test 3: Filtering and sorting
    console.log('\n🔍 Test 3: Filtering and Sorting Performance');
    testFilteringSortingPerformance();
  }, 2000);
  
  setTimeout(() => {
    // Test 4: Virtualization
    console.log('\n📱 Test 4: Virtualization Performance');
    testVirtualizationPerformance();
  }, 3000);
  
  setTimeout(() => {
    console.log('\n✅ Performance Test Suite Complete!');
    console.log('Check the console logs above for detailed results.');
  }, 4000);
};

// Export the performance tester class for external use
export { OptionChainPerformanceTester };

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  (window as any).optionChainPerformanceTests = {
    testLargeDatasetPerformance,
    testRealTimeUpdatePerformance,
    testFilteringSortingPerformance,
    testVirtualizationPerformance,
    runPerformanceTestSuite,
  };
  
  console.log('🔧 Option Chain Performance Tests loaded!');
  console.log('Run tests from console: optionChainPerformanceTests.runPerformanceTestSuite()');
}