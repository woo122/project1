import React, { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Paper, 
  Alert,
  Link
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      // 로그인 성공 시 첫 화면으로 이동
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(to bottom, rgba(0, 183, 208, 0.5) 0%, #ffffff 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontFamily: 'Pretendard, sans-serif',
      p: 2
    }}>
      <Paper sx={{
        width: { xs: '90vw', sm: '400px' },
        p: 4,
        borderRadius: '16px',
        boxShadow: '-9px 12px 76px rgba(0, 0, 0, 0.2)'
      }}>
        <Typography variant="h4" sx={{ 
          mb: 3, 
          textAlign: 'center', 
          fontWeight: 700,
          color: '#00a4bb'
        }}>
          로그인
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />
          
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
            required
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px'
              }
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isLoading}
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              backgroundColor: '#00a4bb',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '16px',
              '&:hover': {
                backgroundColor: '#008a9e'
              }
            }}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            계정이 없으신가요?{' '}
            <Link 
              component="button" 
              variant="body2" 
              onClick={onSwitchToRegister}
              sx={{ 
                color: '#00a4bb',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              회원가입
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default LoginForm;
