// 사용자 일정 저장 및 불러오기 유틸리티

export const saveUserSchedule = (userId, scheduleData) => {
  try {
    // 기존 사용자 일정 목록 가져오기
    const userSchedules = JSON.parse(localStorage.getItem(`schedules_${userId}`) || '[]');
    
    // 새 일정 데이터에 ID와 생성일자 추가
    const newSchedule = {
      id: Date.now().toString(),
      userId,
      ...scheduleData,
      createdAt: new Date().toISOString()
    };
    
    // 일정 목록에 추가
    userSchedules.push(newSchedule);
    localStorage.setItem(`schedules_${userId}`, JSON.stringify(userSchedules));
    
    return newSchedule;
  } catch (error) {
    console.error('일정 저장 중 오류 발생:', error);
    throw new Error('일정을 저장하는 데 실패했습니다.');
  }
};

export const getUserSchedules = (userId) => {
  try {
    const schedules = JSON.parse(localStorage.getItem(`schedules_${userId}`) || '[]');
    return schedules;
  } catch (error) {
    console.error('일정 불러오기 중 오류 발생:', error);
    return [];
  }
};

export const deleteSchedule = (userId, scheduleId) => {
  try {
    const schedules = getUserSchedules(userId);
    const updatedSchedules = schedules.filter(schedule => schedule.id !== scheduleId);
    localStorage.setItem(`schedules_${userId}`, JSON.stringify(updatedSchedules));
    return true;
  } catch (error) {
    console.error('일정 삭제 중 오류 발생:', error);
    return false;
  }
};

export const updateSchedule = (userId, scheduleId, updatedData) => {
  try {
    const schedules = getUserSchedules(userId);
    const scheduleIndex = schedules.findIndex(schedule => schedule.id === scheduleId);
    
    if (scheduleIndex === -1) {
      throw new Error('일정을 찾을 수 없습니다.');
    }
    
    schedules[scheduleIndex] = {
      ...schedules[scheduleIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`schedules_${userId}`, JSON.stringify(schedules));
    return schedules[scheduleIndex];
  } catch (error) {
    console.error('일정 업데이트 중 오류 발생:', error);
    throw new Error('일정을 업데이트하는 데 실패했습니다.');
  }
};
