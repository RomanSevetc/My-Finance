import './App.css';
import {Routes, Route} from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import Profile from './components/Users/Profile';
import AuthPage from './pages/AuthPage';
import {Box, Typography} from '@mui/material';
import {Navigate} from 'react-router-dom';
import type {JSX} from "react";


const ProtectedRoute = ({children}: { children: JSX.Element }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/auth"/>;
};

function App() {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
            }}
        >
            <Header/>
            <Box component="main" sx={{flexGrow: 1}}>
                <Routes>
                    <Route path="/" element={
                        <div style={{padding: '20px', marginTop: '80px'}}>
                            <h1>Welcome to my app</h1>
                        </div>
                    }/>
                    <Route path="/profile" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                    <Route path="/auth" element={<AuthPage/>}/>
                    <Route path="*" element={<Typography>Страница не найдена</Typography>}/>
                </Routes>
            </Box>
            <Footer/>
        </Box>
    );
}

export default App;