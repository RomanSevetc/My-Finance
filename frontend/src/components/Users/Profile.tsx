import {Box, Typography, Avatar, Button} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useEffect, useState, useRef} from 'react';
import type {UserData} from "../../../types/userData.types.ts";
import CallReceivedIcon from '@mui/icons-material/CallReceived';

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Токен отсутствует. Пожалуйста, войдите в систему.');
            navigate('/auth');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await fetch('http://localhost:8000/api/profile/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Token ${token}`,
                    },
                });

                if (!response.ok) {
                    if (response.status === 401 || response.status === 403) {
                        localStorage.removeItem('token');
                        setError('Не авторизован. Пожалуйста, войдите в систему.');
                        navigate('/auth');
                    } else {
                        throw new Error('Не удалось загрузить данные пользователя');
                    }
                    return;
                }

                const data = await response.json();
                setUserData(data);
            } catch (err) {
                console.error('Ошибка:', err);
                setError('Не удалось загрузить данные пользователя');
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            await handleAvatarUpload(file);
        }
    };

    const handleAvatarUpload = async (file: File) => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('http://localhost:8000/api/avatar/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                },
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Ошибка при загрузке аватара');
            }

            const data = await response.json();
            setUserData({...userData!, avatar: `${data.avatar}?t=${new Date().getTime()}`});
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            alert('Аватар успешно загружен');
        } catch (err) {
            console.error('Ошибка при загрузке аватара:', err);
            alert('Не удалось загрузить аватар');
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleLogout = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/auth');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/logout/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Ошибка при выходе');
            }

            localStorage.removeItem('token');
            navigate('/auth');
        } catch (err) {
            console.error('Ошибка при выходе:', err);
            localStorage.removeItem('token');
            navigate('/auth');
        }
    };

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    if (error) {
        return (
            <Box sx={{textAlign: 'center', mt: 4}}>
                <Typography color="error">{error}</Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Вернуться на главную
                </Button>
            </Box>
        );
    }

    if (!userData) {
        return <Typography>Загрузка...</Typography>;
    }

    return (
        <Box
            sx={{

                p: 3,
            }}
        >
            <Typography variant="h4" sx={{mt: 10}}>
                Ваш профиль
            </Typography>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                p: 5
            }}>
                <Avatar
                    sx={{width: 300, height: 300, cursor: 'pointer'}}
                    src={previewUrl || userData.avatar || "/path/to/default-profile-picture.jpg"}
                    onClick={handleAvatarClick}
                />
                <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start'}}>
                    <Typography variant="h4" sx={{mb: 2, mt: 10, display: 'flex', gap: 2}}>
                        Обо мне <CallReceivedIcon sx={{fontSize: 35}}/>
                    </Typography>
                    <Typography variant="h6">{userData.last_name} {userData.first_name}</Typography>
                    <Typography>Имя пользователя: {userData.username}</Typography>
                    <Typography>Email: {userData.email}</Typography>
                    {userData.birth_date && (
                        <Typography>Дата рождения: {userData.birth_date}</Typography>
                    )}
                    {userData.gender && (
                        <Typography>
                            Пол: {userData.gender === 'M' ? 'Мужской' : userData.gender === 'F' ? 'Женский' : 'Другое'}
                        </Typography>
                    )}
                    <Typography>Баланс: {userData.balance} руб.</Typography>
                    <Typography>Дата регистрации: {new Date(userData.date_joined).toLocaleDateString()}</Typography>
                    <Typography>Последний
                        вход: {userData.last_login ? new Date(userData.last_login).toLocaleString() : 'Неизвестно'}</Typography>
                    <input
                        type="file"
                        accept="image/png,image/jpeg"
                        onChange={handleFileChange}
                        style={{display: 'none'}}
                        ref={fileInputRef}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleLogout}
                        sx={{mt: 2}}
                    >
                        Выйти
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Profile;