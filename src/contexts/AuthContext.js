import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 정보 로드
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const register = (email, password, name) => {
    // 기존 사용자 목록 가져오기
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // 이메일 중복 확인
    if (users.find(user => user.email === email)) {
      throw new Error('이미 등록된 이메일입니다.');
    }

    // 새 사용자 생성
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // 실제 프로덕션에서는 반드시 암호화해야 함
      name,
      createdAt: new Date().toISOString()
    };

    // 사용자 목록에 추가
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // 현재 사용자로 설정
    setCurrentUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));

    return newUser;
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    currentUser,
    isLoading,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
