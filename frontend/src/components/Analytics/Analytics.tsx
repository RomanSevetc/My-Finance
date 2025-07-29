import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import type { Summary } from '../../../types/analytics.types.ts';

const Analytics = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchSummary = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/transactions/summary', {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) throw new Error('Ошибка при загрузке аналитики');
        const data = await response.json();
        setSummary(data);
      } catch (err) {
        setError('Не удалось загрузить аналитику');
      }
    };

    fetchSummary();
  }, [navigate]);

  if (error) return <Typography color="error">{error}</Typography>;
  if (!summary) return <Typography>Загрузка...</Typography>;

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h4">Аналитика</Typography>
      <Typography>Период: {summary.period_start} - {summary.period_end}</Typography>
      <Typography>Доходы: {summary.income} руб.</Typography>
      <Typography>Расходы: {summary.expenses} руб.</Typography>
      <Typography>Баланс: {summary.balance} руб.</Typography>
    </Box>
  );
};

export default Analytics;