import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    // 회원가입 성공 후 로그인 페이지로 이동
    setIsLogin(true);
  };

  return (
    <>
      {isLogin ? (
        <LoginForm 
          onSwitchToRegister={() => setIsLogin(false)}
        />
      ) : (
        <RegisterForm 
          onSwitchToLogin={() => setIsLogin(true)}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
};

export default AuthPage;
