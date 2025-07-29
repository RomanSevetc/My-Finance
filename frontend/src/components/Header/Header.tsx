import {useNavigate, useLocation} from 'react-router-dom';
import {AppBar, Toolbar, Box, Button, Typography} from '@mui/material';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import PieChartIcon from '@mui/icons-material/PieChart';
import {Link} from 'react-router-dom';


const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const navItems = [
        {path: '/expenses', label: 'Расходы', icon: <MoneyOffIcon sx={{mr: 0.5}}/>},
        {path: '/income', label: 'Доходы', icon: <AttachMoneyIcon sx={{mr: 0.5}}/>},
        {path: '/analytics', label: 'Аналитика', icon: <PieChartIcon sx={{mr: 0.5}}/>},
        {path: '/profile', label: 'Профиль', icon: <PersonIcon sx={{mr: 0.5}}/>},
    ];

    return (
        <AppBar
            sx={{
                bgcolor: 'background.paper',
                color: 'text.primary',
                boxShadow: 1,
                py: 1,
            }}
        >
            <Toolbar disableGutters>
                <Typography
                    variant="h5"
                    component={Link}
                    to="/"
                    sx={{
                        fontWeight: 'bold',
                        color: 'primary.main',
                        ml: 5,
                        textDecoration: 'none',
                    }}
                >
                    My Finance
                </Typography>
                <Box sx={{flexGrow: 1, display: 'flex', gap: 1, justifyContent: 'flex-end', mr: 5}}>
                    {navItems.map((item) => (
                        <Button
                            key={item.path}
                            variant={location.pathname === item.path ? 'contained' : 'text'}
                            onClick={() => navigate(item.path)}
                            startIcon={item.icon}
                            sx={{
                                px: 2,
                                borderRadius: 1,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                '&:hover': {
                                    boxShadow: 1,
                                },
                            }}
                        >
                            {item.label}
                        </Button>
                    ))}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;