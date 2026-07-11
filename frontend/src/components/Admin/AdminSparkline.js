import React from 'react';
import { Box } from '@mui/material';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

/**
 * Compact trend line for KPI cards.
 * @param {Array<{value: number}>} data
 */
export default function AdminSparkline({ data = [], color = '#4F46E5', height = 36 }) {
  if (!data.length) return null;

  return (
    <Box sx={{ mt: 1, height, width: '100%', opacity: 0.9 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
