// itineraryGenerator.js 테스트 파일
const { generateItinerary } = require('./src/utils/itineraryGenerator.js');

// 테스트 데이터
const testTravelInfo = {
  startDate: '2025-11-12',
  endDate: '2025-11-14', 
  tripDuration: 3,
  people: 2,
  travelStyles: ['sightseeing', 'food'],
  destinations: ['tokyo'],
  scheduleDensity: 'normal'
};

try {
  console.log('🧪 일정 생성기 테스트 시작...');
  
  const itinerary = generateItinerary(testTravelInfo);
  
  console.log('✅ 일정 생성 성공!');
  console.log('📅 여행 기간:', itinerary.startDate, '~', itinerary.endDate);
  console.log('👥 인원:', itinerary.people, '명');
  console.log('🎯 여행 스타일:', itinerary.travelStyles);
  console.log('📍 목적지:', itinerary.destinations.map(d => d.name));
  
  console.log('\n📋 일별 일정:');
  itinerary.dailySchedule.forEach((day, index) => {
    console.log(`\n${index + 1}일차 (${day.date}) - ${day.location}`);
    day.activities.forEach(activity => {
      console.log(`  ${activity.time} - ${activity.name} (${activity.duration}시간)`);
      console.log(`    ${activity.description}`);
    });
  });
  
} catch (error) {
  console.error('❌ 테스트 실패:', error.message);
  console.error('상세 오류:', error);
}
