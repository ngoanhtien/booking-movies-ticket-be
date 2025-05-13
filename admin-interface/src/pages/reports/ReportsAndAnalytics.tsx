import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Tab,
  Tabs,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Scatter,
} from 'recharts';
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface SalesReportData {
  movieName: string;
  format: string;
  date: string;
  revenue: number;
  tickets: number;
  cinemaName?: string;
  time?: string;
  month?: string;
  attendance?: number;
}

interface AttendanceReportData {
  movieName: string;
  cinemaName: string;
  date: string;
  attendance: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`report-tabpanel-${index}`}
      aria-labelledby={`report-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsAndAnalytics: React.FC = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reportType, setReportType] = useState('daily');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: salesData, isLoading: salesLoading, error: salesError } = useQuery<SalesReportData[]>({
    queryKey: ['salesReport', startDate?.toISOString(), endDate?.toISOString(), reportType],
    queryFn: async () => {
      const response = await axios.get('/api/reports/sales', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          type: reportType,
        },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  const { data: attendanceData, isLoading: attendanceLoading, error: attendanceError } = useQuery<AttendanceReportData[]>({
    queryKey: ['attendanceReport', startDate?.toISOString(), endDate?.toISOString(), reportType],
    queryFn: async () => {
      const response = await axios.get('/api/reports/attendance', {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          type: reportType,
        },
      });
      return response.data;
    },
    enabled: !!startDate && !!endDate,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep data in cache for 30 minutes
  });

  const handleExport = async (type: 'sales' | 'attendance') => {
    try {
      const response = await axios.get(`/api/reports/${type}/export`, {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
          type: reportType,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `${type}-report-${new Date().toISOString().split('T')[0]}.xlsx`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      setSnackbar({
        open: true,
        message: t('reports.exportSuccess'),
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: t('reports.exportError'),
        severity: 'error',
      });
      console.error('Error exporting report:', err);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const isLoading = salesLoading || attendanceLoading;
  const error = salesError || attendanceError;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        {t('reports.title')}
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label={t('reports.startDate')}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <DatePicker
                label={t('reports.endDate')}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                format="dd/MM/yyyy"
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>{t('reports.reportType')}</InputLabel>
              <Select
                value={reportType}
                label={t('reports.reportType')}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="daily">{t('reports.daily')}</MenuItem>
                <MenuItem value="weekly">{t('reports.weekly')}</MenuItem>
                <MenuItem value="monthly">{t('reports.monthly')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {t('reports.fetchError')}
        </Alert>
      )}

      <Paper>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="report tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={t('reports.sales')} />
          <Tab label={t('reports.attendance')} />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('sales')}
            >
              {t('reports.export')}
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.salesByMovie')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="movieName" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name={t('reports.revenue')} fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="tickets" name={t('reports.tickets')} stroke="#82ca9d" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.salesByFormat')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={salesData || []}
                        dataKey="revenue"
                        nameKey="format"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(salesData || []).map((entry: SalesReportData, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.salesByCinema')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={salesData || []}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="cinemaName" />
                      <PolarRadiusAxis />
                      <Radar
                        name={t('reports.revenue')}
                        dataKey="revenue"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.salesByTime')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name={t('reports.revenue')}
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.salesTrend')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        name={t('reports.revenue')}
                        stroke="#8884d8"
                      />
                      <Line
                        type="monotone"
                        dataKey="tickets"
                        name={t('reports.tickets')}
                        stroke="#82ca9d"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.monthlyComparison')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <ComposedChart data={salesData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name={t('reports.revenue')} fill="#8884d8" />
                      <Line yAxisId="right" type="monotone" dataKey="tickets" name={t('reports.tickets')} stroke="#82ca9d" />
                      <Scatter yAxisId="right" dataKey="attendance" name={t('reports.attendance')} fill="#ff7300" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExport('attendance')}
            >
              {t('reports.export')}
            </Button>
          </Box>

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.attendanceByMovie')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={attendanceData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="movieName" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="attendance"
                        name={t('reports.attendance')}
                        fill="#8884d8"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.attendanceByCinema')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={attendanceData || []}
                        dataKey="attendance"
                        nameKey="cinemaName"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {(attendanceData || []).map((entry: AttendanceReportData, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {t('reports.attendanceTrend')}
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="attendance"
                        name={t('reports.attendance')}
                        stroke="#8884d8"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          )}
        </TabPanel>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportsAndAnalytics; 