import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { alpha } from '@mui/material/styles';

// A Shadcn-inspired Bar Chart component using Chart.js
export function BarChart({ data, options = {}, className = '' }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Default options with Shadcn-inspired styling
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: alpha('#000', 0.8),
        titleFont: {
          family: "'Inter', sans-serif",
          size: 13,
          weight: '600'
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 12
        },
        padding: 12,
        cornerRadius: 8,
        boxPadding: 6,
        usePointStyle: true
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#777'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: alpha('#000', 0.04),
          drawBorder: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif",
            size: 11
          },
          color: '#777',
          maxTicksLimit: 6
        }
      }
    },
    elements: {
      bar: {
        borderRadius: 4,
        borderWidth: 0
      }
    }
  };

  // Effect to create or update the chart when data changes
  useEffect(() => {
    if (!chartRef.current || !data) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Merge default options with provided options
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      scales: {
        ...defaultOptions.scales,
        ...(options.scales || {}),
        x: {
          ...defaultOptions.scales.x,
          ...(options.scales?.x || {}),
        },
        y: {
          ...defaultOptions.scales.y,
          ...(options.scales?.y || {}),
        }
      },
      plugins: {
        ...defaultOptions.plugins,
        ...(options.plugins || {}),
      }
    };

    // Create new chart instance
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data,
      options: mergedOptions
    });

    // Clean up chart instance on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [data, options]);

  return (
    <div className={className} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <canvas ref={chartRef} />
    </div>
  );
} 