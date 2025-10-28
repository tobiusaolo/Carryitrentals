import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

// Custom Tooltip with better styling
export const CustomTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        sx={{
          p: 2,
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 3,
          borderRadius: 2
        }}
      >
        {label && (
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            {label}
          </Typography>
        )}
        {payload.map((entry, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 12,
                bgcolor: entry.color,
                borderRadius: '50%'
              }}
            />
            <Typography variant="body2" color="text.secondary">
              {entry.name}:
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {formatter ? formatter(entry.value) : entry.value}
            </Typography>
          </Box>
        ))}
      </Paper>
    );
  }
  return null;
};

// Enhanced Bar Chart with better tooltips
export const EnhancedBarChart = ({ data, dataKey, xKey, title, color = '#1976d2', formatter }) => {
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip 
            content={<CustomTooltip formatter={formatter} />}
            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
          />
          <Bar 
            dataKey={dataKey} 
            fill={color}
            radius={[8, 8, 0, 0]}
            animationDuration={500}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Enhanced Pie Chart with better legend
export const EnhancedPieChart = ({ data, title, colors }) => {
  const COLORS = colors || ['#10b981', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.name}: ${entry.value}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            animationDuration={500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry) => (
              <span style={{ color: '#666', fontSize: '14px' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

// Enhanced Line Chart for trends
export const EnhancedLineChart = ({ data, dataKey, xKey, title, color = '#1976d2', formatter }) => {
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom fontWeight="bold">
          {title}
        </Typography>
      )}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey={xKey} 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip 
            content={<CustomTooltip formatter={formatter} />}
            cursor={{ stroke: color, strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={3}
            dot={{ fill: color, r: 5 }}
            activeDot={{ r: 7 }}
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default { CustomTooltip, EnhancedBarChart, EnhancedPieChart, EnhancedLineChart };

