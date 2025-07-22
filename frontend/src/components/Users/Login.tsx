import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, TextField, Button, Typography} from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Неверные учетные данные');
            }

            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/profile');
        } catch (err) {
            setError('Неверные учетные данные');
            console.error(err);
        }
    };

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 20}}>
            <Typography variant="h4">Вход</Typography>
            <TextField
                label="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{mt: 2}}
            />
            <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{mt: 2}}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button variant="contained" onClick={handleLogin} sx={{mt: 2}}>
                Войти
            </Button>
        </Box>
    );
};

export default Login;