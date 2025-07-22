import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, TextField, Button, Typography, Tabs, Tab, MenuItem} from '@mui/material';

const AuthPage = () => {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'login' | 'register'>('login');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    typeof errorData.error === 'string'
                        ? errorData.error
                        : 'Неверные учетные данные'
                );
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/profile');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Неверные учетные данные'
            );
            console.error(err);
        }
    };

    const handleRegister = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    first_name: firstName,
                    last_name: lastName,
                    birth_date: birthDate || null,
                    gender: gender || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(
                    typeof errorData.error === 'string'
                        ? errorData.error
                        : 'Ошибка при регистрации'
                );
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/profile');
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : 'Ошибка при регистрации'
            );
            console.error(err);
        }
    };

    const handleSubmit = () => {
        setError(null);
        if (tab === 'login') {
            handleLogin();
        } else {
            handleRegister();
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 3,
            }}
        >
            <Typography variant="h4" sx={{mb: 2}}>
                {tab === 'login' ? 'Вход' : 'Регистрация'}
            </Typography>
            <Tabs
                value={tab}
                onChange={(_, newValue) => setTab(newValue)}
                sx={{mb: 3}}
            >
                <Tab label="Вход" value="login"/>
                <Tab label="Регистрация" value="register"/>
            </Tabs>
            <Box sx={{width: '300px'}}>
                <TextField
                    label="Имя пользователя"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    fullWidth
                    sx={{mb: 2}}
                />
                {tab === 'register' && (
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        fullWidth
                        sx={{mb: 2}}
                    />
                )}
                <TextField
                    label="Пароль"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    fullWidth
                    sx={{mb: 2}}
                />
                {tab === 'register' && (
                    <>
                        <TextField
                            label="Имя"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            fullWidth
                            sx={{mb: 2}}
                        />
                        <TextField
                            label="Фамилия"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            fullWidth
                            sx={{mb: 2}}
                        />
                        <TextField
                            label="Дата рождения"
                            type="date"
                            value={birthDate}
                            onChange={(event) => setBirthDate(event.target.value)}
                            fullWidth
                            sx={{mb: 2}}
                            InputLabelProps={{shrink: true}}
                        />
                        <TextField
                            select
                            label="Пол"
                            value={gender}
                            onChange={(event) => setGender(event.target.value)}
                            fullWidth
                            sx={{mb: 2}}
                        >
                            <MenuItem value="M">Мужской</MenuItem>
                            <MenuItem value="F">Женский</MenuItem>
                            <MenuItem value="O">Другое</MenuItem>
                        </TextField>
                    </>
                )}
                {error && (
                    <Typography color="error" sx={{mb: 2}}>
                        {error}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    fullWidth
                    sx={{mb: 1}}
                >
                    {tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
                </Button>
                <Button
                    variant="text"
                    onClick={() => navigate('/')}
                    fullWidth
                >
                    На главную
                </Button>
            </Box>
        </Box>
    );
};

export default AuthPage;