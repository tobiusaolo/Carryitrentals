import React from 'react';
import { Box, Card, CardContent, Skeleton, Grid } from '@mui/material';

export const StatCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="text" width="40%" height={40} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="80%" height={16} sx={{ mt: 1 }} />
        </Box>
        <Skeleton variant="circular" width={48} height={48} />
      </Box>
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <Box>
    {[...Array(rows)].map((_, index) => (
      <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
        {[...Array(columns)].map((_, colIndex) => (
          <Skeleton key={colIndex} variant="rectangular" height={40} sx={{ flex: 1 }} />
        ))}
      </Box>
    ))}
  </Box>
);

export const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="text" width="40%" height={40} sx={{ mb: 3 }} />
    <Grid container spacing={3}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <StatCardSkeleton />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3} sx={{ mt: 3 }}>
      {[...Array(2)].map((_, index) => (
        <Grid item xs={12} md={6} key={index}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="40%" height={30} sx={{ mb: 2 }} />
              <Skeleton variant="rectangular" height={300} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export const PropertyCardSkeleton = () => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Skeleton variant="text" width="60%" height={30} />
        <Skeleton variant="rectangular" width={80} height={24} />
      </Box>
      <Skeleton variant="text" width="80%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Skeleton variant="rectangular" width={80} height={32} />
        <Skeleton variant="rectangular" width={80} height={32} />
      </Box>
    </CardContent>
  </Card>
);

export const AccordionSkeleton = ({ count = 3 }) => (
  <Box>
    {[...Array(count)].map((_, index) => (
      <Card key={index} sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="text" width="60%" height={20} />
            </Box>
            <Skeleton variant="rectangular" width={100} height={32} />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Box>
);

const LoadingSkeleton = {
  StatCardSkeleton,
  TableSkeleton,
  DashboardSkeleton,
  PropertyCardSkeleton,
  AccordionSkeleton
};

export default LoadingSkeleton;

