import { japanDestinations } from '../data/japanData';
import { format, addDays } from 'date-fns';

// OpenRouter API를 사용하여 AI 일정 생성
export const generateAIItinerary = async (travelInfo) => {
  const { startDate, endDate, tripDuration, people, travelStyles, destinations, scheduleDensity, selectedWards, airport } = travelInfo;
  
  // 여행 스타일을 한글로 변환
  const styleMapping = {
    'sightseeing': '관광',
    'food': '음식 탐방',
    'shopping': '쇼핑',
    'relaxation': '휴식',
    'activity': '액티비티'
  };
  
  const stylesText = travelStyles.map(style => styleMapping[style] || style).join(', ');
  
  // 선택한 도시 정보
  const selectedDestinations = japanDestinations.filter(dest => 
    destinations.includes(dest.name.toLowerCase())
  );
  
  const destinationsText = selectedDestinations.map(dest => {
    const attractions = dest.attractions.map(a => `${a.name} (${a.duration}시간)`).join(', ');
    return `${dest.name}: ${attractions}`;
  }).join('\n');

  // 선택된 구역 텍스트
  const wardsText = selectedWards && selectedWards.length > 0 
    ? `\n- 선호 구역: ${selectedWards.join(', ')} (이 구역들을 중심으로 일정을 구성해주세요)`
    : '';

  // 공항 정보
  const airportMapping = {
    'haneda': '하네다 공항 (도쿄)',
    'narita': '나리타 공항 (도쿄)'
  };
  const airportName = airportMapping[airport] || '공항';

  // AI 프롬프트 생성
  const prompt = `당신은 일본 여행 전문가입니다. 다음 조건에 맞는 상세한 여행 일정을 JSON 형식으로 생성해주세요.

여행 정보:
- 여행 기간: ${format(new Date(startDate), 'yyyy년 M월 d일')} ~ ${format(new Date(endDate), 'yyyy년 M월 d일')} (총 ${tripDuration}일)
- 인원: ${people}명
- 여행 스타일: ${stylesText}
- 일정 밀도: ${scheduleDensity === 'tight' ? '촉촉한 일정' : scheduleDensity === 'relaxed' ? '여유로운 일정' : '보통'}
- 방문 도시: ${selectedDestinations.map(d => d.name).join(', ')}${wardsText}
- 도착 공항: ${airportName}

사용 가능한 관광지 목록:
${destinationsText}

**중요 요구사항:**
1. **반드시 ${tripDuration}일 전체의 일정을 생성**해주세요. (Day 1부터 Day ${tripDuration}까지)
2. **첫날은 ${airportName}에서 시작하고, 마지막날은 ${airportName}에서 끝나야 합니다.**
3. 각 날짜마다 아침(08:00), 오전 활동(09:30~), 점심(12:30), 오후 활동(14:00~), 저녁(18:30), 숙소 복귀(20:30)를 포함해주세요.
4. 위의 관광지 목록에서 선택하되, 여행 스타일에 맞는 장소를 우선 선택해주세요.
5. 이동 시간을 고려하여 같은 지역의 관광지를 묶어주세요.
6. 각 활동에는 시간, 이름, 설명, 타입(meal/attraction/hotel/transit/airport), 소요시간을 포함해주세요.
7. 일정 밀도에 따라 하루에 방문하는 장소 수를 조절해주세요 (촘촘: 4-5곳, 보통: 3-4곳, 여유: 2-3곳).

JSON 형식 (정확히 이 형식을 따라주세요):
{
  "dailySchedule": [
    {
      "date": "2024-01-01",
      "location": "도쿄",
      "activities": [
        {
          "time": "08:00",
          "name": "아침 식사",
          "description": "호텔 조식",
          "type": "meal",
          "duration": 1
        },
        {
          "time": "09:30",
          "name": "센소지",
          "description": "도쿄에서 가장 오래된 사찰",
          "type": "attraction",
          "duration": 2
        }
      ]
    }
  ]
}

JSON만 출력하고 다른 설명은 하지 마세요.`;

  try {
    const apiKey = process.env.REACT_APP_OPENROUTER_API_KEY;
    
    if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
      throw new Error('OpenRouter API 키가 설정되지 않았습니다. .env 파일에 REACT_APP_OPENROUTER_API_KEY를 설정해주세요.');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Travel Planner'
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API 오류: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('AI 응답이 비어있습니다.');
    }

    // JSON 추출 (```json ... ``` 형식일 수 있음)
    let jsonText = content.trim();
    const jsonMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const aiSchedule = JSON.parse(jsonText);

    // 관광지 위치 정보 추가 (Google Places API 사용)
    const dailyScheduleWithLocations = await Promise.all(
      aiSchedule.dailySchedule.map(async (day) => {
        const activitiesWithLocations = await Promise.all(
          day.activities.map(async (activity) => {
            if (activity.type === 'attraction') {
              // 먼저 데이터베이스에서 위치 정보 찾기
              let location = null;
              for (const dest of selectedDestinations) {
                const attraction = dest.attractions.find(a => 
                  a.name === activity.name || a.name.includes(activity.name) || activity.name.includes(a.name)
                );
                if (attraction && attraction.location) {
                  location = attraction.location;
                  console.log(`✅ Found location in DB for ${activity.name}:`, location);
                  break;
                }
              }

              // 데이터베이스에 없으면 Google Places API로 검색
              if (!location && window.google) {
                try {
                  const service = new window.google.maps.places.PlacesService(
                    document.createElement('div')
                  );

                  location = await new Promise((resolve) => {
                    const request = {
                      query: `${activity.name} 도쿄`,
                      fields: ['geometry']
                    };

                    service.textSearch(request, (results, status) => {
                      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                        const loc = {
                          lat: results[0].geometry.location.lat(),
                          lng: results[0].geometry.location.lng()
                        };
                        console.log(`🗺️ Found location via Google API for ${activity.name}:`, loc);
                        resolve(loc);
                      } else {
                        console.warn(`⚠️ Google API search failed for: ${activity.name}`);
                        resolve(null);
                      }
                    });
                  });
                } catch (error) {
                  console.error(`❌ Error searching for ${activity.name}:`, error);
                }
              }

              if (!location) {
                console.warn(`⚠️ No location found for attraction: ${activity.name}`);
              }

              return { ...activity, location };
            }
            return activity;
          })
        );

        return {
          ...day,
          activities: activitiesWithLocations
        };
      })
    );

    console.log('📍 Daily schedule with locations:', dailyScheduleWithLocations);

    // 공항 위치 정보
    const airportLocations = {
      'haneda': { lat: 35.5494, lng: 139.7798 },
      'narita': { lat: 35.7647, lng: 140.3864 }
    };

    // 첫날 첫 활동에 공항 추가
    if (dailyScheduleWithLocations.length > 0 && airport) {
      const firstDay = dailyScheduleWithLocations[0];
      const airportArrival = {
        time: '07:00',
        name: airportName,
        description: `${airportName}`,
        type: 'airport',
        duration: 1,
        location: airportLocations[airport]
      };
      firstDay.activities.unshift(airportArrival);
    }

    // 마지막날 마지막 활동에 공항 추가
    if (dailyScheduleWithLocations.length > 0 && airport) {
      const lastDay = dailyScheduleWithLocations[dailyScheduleWithLocations.length - 1];
      const airportDeparture = {
        time: '21:00',
        name: airportName,
        description: `${airportName}`,
        type: 'airport',
        duration: 1,
        location: airportLocations[airport]
      };
      lastDay.activities.push(airportDeparture);
    }

    return {
      startDate,
      endDate,
      tripDuration,
      people,
      travelStyles,
      destinations: selectedDestinations,
      dailySchedule: dailyScheduleWithLocations,
      scheduleDensity,
      airport: airportName,
      isAIGenerated: true
    };

  } catch (error) {
    console.error('AI 일정 생성 실패:', error);
    throw error;
  }
};
