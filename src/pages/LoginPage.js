import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!data.ok) {
        setError(data.error || '로그인에 실패했습니다.');
        setLoading(false);
        return;
      }

      localStorage.setItem('tp_user', JSON.stringify(data.user));
      navigate('/');
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0, 183, 208, 0.5) 0%, #ffffff 100%)' }}>
      <Paper sx={{ p: 5, maxWidth: 450, width: '90%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: '20px' }}>
          <Box
            component={Link}
            to="/"
            sx={{ display: 'inline-block', cursor: 'pointer' }}
          >
            <Box component="img" src={'/images/logo2.png'} alt="로고" sx={{ width: 150, height: 'auto', display: 'block' }} />
          </Box>
        </Box>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>로그인</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="이메일"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="비밀번호"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Box>
        <Typography variant="body2" sx={{ mt: 2 }}>
          아직 계정이 없으신가요? <Link to="/register">회원가입</Link>
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;
