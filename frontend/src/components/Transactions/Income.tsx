import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import type { Transaction } from '../../../types/transaction.types.ts';

const Income = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    customCategory: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const fetchCategories = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/transactions/categories', {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) throw new Error('Ошибка при загрузке категорий');
        const data = await response.json();
        setCategories(data.categories);
      } catch (err) {
        setError('Не удалось загрузить категории');
      }
    };

    const fetchTransactions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/transactions?transaction_type=income', {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) throw new Error('Ошибка при загрузке транзакций');
        const data = await response.json();
        setTransactions(data.transactions);
      } catch (err) {
        setError('Не удалось загрузить транзакции');
      }
    };

    fetchCategories();
    fetchTransactions();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    const categoryToSubmit = isCustomCategory ? formData.customCategory.trim() : formData.category;
    if (isCustomCategory && !categoryToSubmit) {
      setError('Своя категория не может быть пустой');
      return;
    }

    try {
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        setError('Сумма должна быть положительным числом');
        return;
      }

      const payload = {
        amount: amount.toFixed(2),
        category: categoryToSubmit,
        transaction_type: 'income',
        description: formData.description,
        date: formData.date,
      };
      console.log('Submitting payload:', payload);

      const response = await fetch('http://localhost:8000/api/transactions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при создании транзакции');
      }

      const data = await response.json();
      setTransactions([...transactions, data]);
      setFormData({ amount: '', category: '', customCategory: '', description: '', date: new Date().toISOString().split('T')[0] });
      setIsCustomCategory(false);
      alert('Доход успешно добавлен');
    } catch (err: any) {
      setError(err.message || 'Не удалось создать транзакцию');
      console.error('Error:', err);
    }
  };

  const handleDelete = async (transactionId: number) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/auth');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/transactions/${transactionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Token ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при удалении транзакции');
      }

      // Удаляем транзакцию из состояния
      setTransactions(transactions.filter((t) => t.id !== transactionId));
      alert('Доход успешно удален');
    } catch (err: any) {
      setError(err.message || 'Не удалось удалить транзакцию');
      console.error('Error:', err);
    }
  };

  return (
    <Box sx={{ p: 3, mt: 10 }}>
      <Typography variant="h4">Доходы</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Сумма"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          required
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Категория</InputLabel>
          {isCustomCategory ? (
            <TextField
              label="Своя категория"
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              required
            />
          ) : (
            <Select
              value={formData.category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'custom') {
                  setIsCustomCategory(true);
                  setFormData({ ...formData, category: '' });
                } else {
                  setIsCustomCategory(false);
                  setFormData({ ...formData, category: value, customCategory: '' });
                }
              }}
              required
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
              <MenuItem value="custom">Своя категория</MenuItem>
            </Select>
          )}
        </FormControl>
        <TextField
          label="Описание"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
        <TextField
          label="Дата"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
        <Button type="submit" variant="contained">Добавить доход</Button>
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5">Список доходов</Typography>
        {transactions.map((t) => (
          <Box key={t.id} sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>
              {t.date} | {t.category} | {t.amount} руб. | {t.description}
            </Typography>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={() => handleDelete(t.id)}
            >
              Удалить
            </Button>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Income;