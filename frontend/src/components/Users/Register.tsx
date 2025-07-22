import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Box, TextField, Button, Typography, MenuItem} from '@mui/material';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

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

    return (
        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4}}>
            <Typography variant="h4">Регистрация</Typography>
            <TextField
                label="Имя пользователя"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            />
            <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            />
            <TextField
                label="Пароль"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            />
            <TextField
                label="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            />
            <TextField
                label="Фамилия"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            />
            <TextField
                label="Дата рождения"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                sx={{mt: 2, width: '300px'}}
                InputLabelProps={{shrink: true}}
            />
            <TextField
                select
                label="Пол"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                sx={{mt: 2, width: '300px'}}
            >
                <MenuItem value="M">Мужской</MenuItem>
                <MenuItem value="F">Женский</MenuItem>
                <MenuItem value="O">Другое</MenuItem>
            </TextField>
            {error && <Typography color="error" sx={{mt: 2}}>{error}</Typography>}
            <Button variant="contained" onClick={handleRegister} sx={{mt: 2}}>
                Зарегистрироваться
            </Button>
            <Button
                variant="text"
                onClick={() => navigate('/login')}
                sx={{mt: 1}}
            >
                Уже есть аккаунт? Войти
            </Button>
        </Box>
    );
};

export default Register;