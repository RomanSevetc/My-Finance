import {useState, useEffect, useMemo, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Collapse,
    IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type {Transaction} from '../../../types/transaction.types.ts';

const predefinedCategories = [
    'Зарплата',
    'Фриланс',
    'Инвестиции',
    'Подарки',
    'Возврат долга',
    'Прочие доходы',
    'Еда',
    'Спорт',
    'Авто'
];

const Income = () => {
    const navigate = useNavigate();
    const [dbCategories, setDbCategories] = useState<string[]>([]);
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
    const [showForm, setShowForm] = useState(false);
    const [dateRange, setDateRange] = useState({startDate: '', endDate: ''});
    const [showDateFilter, setShowDateFilter] = useState(false);
    const tableRef = useRef<HTMLTableElement>(null);
    const customCategoryInputRef = useRef<HTMLInputElement>(null);

    const allCategories = useMemo(() => {
        return [...new Set([...predefinedCategories, ...dbCategories])];
    }, [dbCategories]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        //Загрузка income-транзакций
        const fetchIncomeTransactions = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/transactions?transaction_type=income', {
                    headers: {Authorization: `Token ${token}`},
                });
                if (!response.ok) throw new Error('Ошибка при загрузке транзакций');
                const data = await response.json();
                setTransactions(data.transactions);
            } catch (err) {
                setError('Не удалось загрузить транзакции доходов');
            }
        };

        //Загрузка всех категорий
        const fetchAllCategories = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/transactions', {
                    headers: {Authorization: `Token ${token}`},
                });
                if (!response.ok) throw new Error('Ошибка при загрузке категорий');

                const data = await response.json();
                const uniqueDbCategories = Array.from(
                    new Set<string>(
                        data.transactions
                            .map((t: Transaction) => t.category)
                            .filter((cat: string) => !predefinedCategories.includes(cat))
                    ));

                setDbCategories(uniqueDbCategories);
            } catch (err) {
                setError('Не удалось загрузить категории');
            }
        };

        fetchIncomeTransactions();
        fetchAllCategories();
    }, [navigate]);

    //Закрытие формы
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (tableRef.current && !tableRef.current.contains(event.target as Node)) {
                setShowDateFilter(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isCustomCategory && customCategoryInputRef.current) {
            customCategoryInputRef.current.focus();
        }
    }, [isCustomCategory]);

    //Создание дохода
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

            if (isCustomCategory && !allCategories.includes(categoryToSubmit)) {
                setDbCategories(prev => [...prev, categoryToSubmit]);
            }

            setFormData({
                amount: '',
                category: '',
                customCategory: '',
                description: '',
                date: new Date().toISOString().split('T')[0],
            });
            setIsCustomCategory(false);
            setShowForm(false);
            setError(null);
            alert('Доход успешно добавлен');
        } catch (err: any) {
            setError(err.message || 'Не удалось создать транзакцию');
            console.error('Error:', err);
        }
    };

    //Удаление дохода
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
                    Authorization: `Token ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка при удалении транзакции');
            }

            setTransactions(transactions.filter((t) => t.id !== transactionId));
            alert('Доход успешно удален');
        } catch (err: any) {
            setError(err.message || 'Не удалось удалить транзакцию');
            console.error('Error:', err);
        }
    };

    //Выбор даты отображение доходов
    const filteredAndSortedTransactions = useMemo(() => {
        let result = [...transactions];

        if (dateRange.startDate && dateRange.endDate) {
            result = result.filter((t) => {
                const transactionDate = new Date(t.date);
                const startDate = new Date(dateRange.startDate);
                const endDate = new Date(dateRange.endDate);
                return transactionDate >= startDate && transactionDate <= endDate;
            });
        }

        return result;
    }, [transactions, dateRange]);

    return (
        <Box sx={{p: 3, mt: 10, maxWidth: 1200, mx: 'auto'}}>
            <Typography variant="h4" gutterBottom>
                Доходы
            </Typography>
            {error && (
                <Typography color="error" sx={{mb: 2}}>
                    {error}
                </Typography>
            )}

            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3}}>
                <Typography variant="h5">Список доходов</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Скрыть форму' : 'Добавить доход'}
                </Button>
            </Box>

            <Collapse in={showForm}>
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    sx={{
                        mb: 4,
                        p: 3,
                        bgcolor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 2,
                    }}
                >
                    <TextField
                        label="Сумма"
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        required
                        sx={{flex: '1 1 200px'}}
                    />

                    <FormControl sx={{flex: '1 1 200px'}}>
                        {isCustomCategory ? (
                            <TextField
                                label="Своя категория"
                                value={formData.customCategory}
                                onChange={(e) => setFormData({...formData, customCategory: e.target.value})}
                                required
                                inputRef={customCategoryInputRef}
                            />
                        ) : (
                            <>
                                <InputLabel id="category-label" shrink>
                                    Категория
                                </InputLabel>
                                <Select
                                    labelId="category-label"
                                    value={formData.category}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === 'custom') {
                                            setIsCustomCategory(true);
                                            setFormData({...formData, category: ''});
                                        } else {
                                            setFormData({...formData, category: value});
                                        }
                                    }}
                                    label="Категория"
                                    required
                                >
                                    {allCategories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                    ))}
                                    <MenuItem value="custom">+ Добавить свою категорию</MenuItem>
                                </Select>
                            </>
                        )}
                    </FormControl>

                    <TextField
                        label="Описание"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        sx={{flex: '1 1 200px'}}
                    />

                    <TextField
                        label="Дата"
                        type="date"
                        value={formData.date}
                        InputLabelProps={{shrink: true}}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        required
                        sx={{flex: '1 1 70px'}}
                    />

                    <Button type="submit" variant="contained" sx={{alignSelf: 'flex-start'}}>
                        Добавить
                    </Button>
                </Box>
            </Collapse>

            <TableContainer component={Paper} sx={{borderRadius: 2, boxShadow: 1}}>
                <Table ref={tableRef}>
                    <TableHead>
                        <TableRow sx={{bgcolor: 'primary.light'}}>
                            <TableCell
                                sx={{fontWeight: 'bold', cursor: 'pointer'}}
                                onClick={() => setShowDateFilter(true)}
                            >
                                Дата
                                <Collapse in={showDateFilter}>
                                    <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
                                        <TextField
                                            label="Дата с"
                                            type="date"
                                            value={dateRange.startDate}
                                            onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                                            InputLabelProps={{shrink: true}}
                                            size="small"
                                            sx={{width: 140}}
                                        />
                                        <TextField
                                            label="Дата по"
                                            type="date"
                                            value={dateRange.endDate}
                                            onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                                            InputLabelProps={{shrink: true}}
                                            size="small"
                                            sx={{width: 140}}
                                        />
                                    </Box>
                                </Collapse>
                            </TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Категория</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Сумма</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Описание</TableCell>
                            <TableCell sx={{fontWeight: 'bold'}}>Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedTransactions.length > 0 ? (
                            filteredAndSortedTransactions.map((t) => (
                                <TableRow
                                    key={t.id}
                                    sx={{
                                        '&:hover': {bgcolor: 'action.hover'},
                                        transition: 'background-color 0.2s',
                                    }}
                                >
                                    <TableCell>{t.date}</TableCell>
                                    <TableCell>{t.category}</TableCell>
                                    <TableCell>{t.amount} руб.</TableCell>
                                    <TableCell>{t.description || '-'}</TableCell>
                                    <TableCell>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDelete(t.id)}
                                            size="small"
                                        >
                                            <DeleteIcon/>
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <Typography>Нет доходов</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default Income;