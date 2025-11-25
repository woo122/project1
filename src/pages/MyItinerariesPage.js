import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItemButton, ListItemText, Button, CircularProgress, Alert } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';

const MyItinerariesPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('tp_user');
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
    } catch (e) {
      console.error('사용자 정보 파싱 실패:', e);
    }
  }, []);

  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/itineraries?userId=${user.id}`);
        const data = await res.json();
        setItineraries(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('일정 목록 불러오기 실패:', e);
        setError('일정 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchItineraries();
    }
  }, [user]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleOpenItinerary = async (id) => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/itineraries?id=${id}&userId=${user.id}`);
      const data = await res.json();
      if (!data || !data.itinerary) {
        setError('일정을 불러오지 못했습니다.');
        setLoading(false);
        return;
      }
      navigate('/itinerary', {
        state: {
          itinerary: data.itinerary,
          itineraryId: data.id
        }
      });
    } catch (e) {
      console.error('일정 불러오기 실패:', e);
      setError('일정을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItinerary = async (id) => {
    if (!user?.id) return;
    const confirmDelete = window.confirm('이 일정을 삭제하시겠습니까?');
    if (!confirmDelete) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/itineraries?id=${id}&userId=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json().catch(() => null);
      if (!data || !data.ok) {
        setError(data?.error || '일정 삭제에 실패했습니다.');
        return;
      }
      setItineraries((prev) => prev.filter((item) => item.id !== id));
    } catch (e) {
      console.error('일정 삭제 실패:', e);
      setError('일정을 삭제하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenameItinerary = async (item) => {
    if (!user?.id) return;

    const newTitle = window.prompt('새 일정 제목을 입력하세요.', item.title || '제목 없는 일정');
    if (!newTitle || newTitle.trim() === '') return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/itineraries', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: item.id,
          userId: user.id,
          title: newTitle.trim()
        })
      });
      const data = await res.json().catch(() => null);
      if (!data || !data.ok) {
        setError(data?.error || '일정 제목 변경에 실패했습니다.');
        return;
      }
      setItineraries((prev) => prev.map((it) => (it.id === item.id ? { ...it, title: newTitle.trim() } : it)));
    } catch (e) {
      console.error('일정 제목 변경 실패:', e);
      setError('일정 제목을 변경하지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Paper sx={{ p: 4, maxWidth: 400, width: '90%', textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            내 일정을 보려면 로그인이 필요합니다.
          </Typography>
          <Button variant="contained" component={Link} to="/login">
            로그인 하러 가기
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <Paper sx={{ p: 4, maxWidth: 600, width: '95%' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            내 일정
          </Typography>
          <Button variant="text" onClick={handleBack}>
            뒤로가기
          </Button>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {itineraries.length === 0 ? (
              <Typography variant="body1">저장된 일정이 없습니다.</Typography>
            ) : (
              <List>
                {itineraries.map((item) => (
                  <ListItemButton key={item.id} onClick={() => handleOpenItinerary(item.id)}>
                    <ListItemText
                      primary={item.title || '제목 없는 일정'}
                      secondary={item.created_at}
                    />
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameItinerary(item);
                        }}
                      >
                        이름 변경
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteItinerary(item.id);
                        }}
                      >
                        삭제
                      </Button>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            )}
            <Box sx={{ mt: 2, textAlign: 'right' }}>
              <Button variant="outlined" component={Link} to="/plan">
                새 일정 만들기
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default MyItinerariesPage;
