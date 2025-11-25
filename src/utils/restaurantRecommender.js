// 관광지 이름으로 위치 찾기 (Google Places API)
export const findPlaceLocation = async (placeName, cityName) => {
  if (!window.google) {
    return null;
  }

  return new Promise((resolve) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      query: `${placeName} ${cityName}`,
      fields: ['name', 'geometry']
    };

    service.findPlaceFromQuery(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng()
        });
      } else {
        resolve(null);
      }
    });
  });
};

// Google Places API를 사용하여 근처 음식점 추천
export const findNearbyRestaurants = async (location, mealType) => {
  if (!window.google || !location) {
    return null;
  }

  return new Promise((resolve) => {
    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    // 식사 타입에 따른 키워드
    const keywords = {
      breakfast: ['breakfast', 'cafe', 'bakery', 'morning'],
      lunch: ['restaurant', 'lunch', 'ramen', 'sushi', 'japanese restaurant'],
      dinner: ['restaurant', 'dinner', 'izakaya', 'japanese restaurant']
    };

    const keyword = keywords[mealType] ? keywords[mealType][Math.floor(Math.random() * keywords[mealType].length)] : 'restaurant';

    const request = {
      location: new window.google.maps.LatLng(location.lat, location.lng),
      radius: 500, // 500m 반경
      keyword: keyword
      // type 제거: Google Places API에서 establishment와 충돌 방지
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
        // 평점 높은 순으로 정렬 후 상위 5개 중 랜덤 선택
        const topRated = results
          .filter(place => place.rating && place.rating >= 3.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 5);

        if (topRated.length > 0) {
          const randomRestaurant = topRated[Math.floor(Math.random() * topRated.length)];
          
          // 상세 정보 가져오기
          service.getDetails(
            {
              placeId: randomRestaurant.place_id,
              language: 'ko', // 한국어 결과
              fields: ['name', 'rating', 'vicinity', 'geometry', 'photos']
            },
            (details, detailStatus) => {
              if (detailStatus === window.google.maps.places.PlacesServiceStatus.OK) {
                // 사진 URL 생성
                let photoUrl = null;
                if (details.photos && details.photos.length > 0) {
                  photoUrl = details.photos[0].getUrl({ maxWidth: 250, maxHeight: 120 });
                }
                
                resolve({
                  id: randomRestaurant.place_id,
                  name: details.name,
                  rating: details.rating,
                  vicinity: details.vicinity,
                  location: {
                    lat: details.geometry.location.lat(),
                    lng: details.geometry.location.lng()
                  },
                  photo: photoUrl
                });
              } else {
                resolve(null);
              }
            }
          );
        } else {
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  });
};

// 일정의 모든 식사에 근처 음식점 추가
export const enrichItineraryWithRestaurants = async (itinerary) => {
  if (!itinerary || !itinerary.dailySchedule) {
    console.log('❌ 일정 데이터가 없습니다');
    return itinerary;
  }

  console.log('🍽️ 음식점 추천 시작...');
  console.log('📋 일정 데이터:', itinerary.dailySchedule);
  const enrichedSchedule = [];

  for (const day of itinerary.dailySchedule) {
    console.log(`\n📅 ${day.date} (${day.location})`);
    console.log('활동 목록:', day.activities.map(a => `${a.time} ${a.name} (${a.type}) ${a.location ? '✅위치있음' : '❌위치없음'}`));
    
    const enrichedActivities = [];
    
    // 먼저 모든 관광지의 위치를 찾아서 추가
    for (let i = 0; i < day.activities.length; i++) {
      const activity = day.activities[i];
      
      if (activity.type === 'attraction' && !activity.location) {
        console.log(`  🔍 "${activity.name}" 위치 검색 중...`);
        try {
          const location = await findPlaceLocation(activity.name, day.location);
          if (location) {
            console.log(`  ✅ 위치 찾음: ${location.lat}, ${location.lng}`);
            day.activities[i] = { ...activity, location };
          } else {
            console.log(`  ⚠️ 위치를 찾지 못함`);
          }
        } catch (error) {
          console.warn(`  ❌ 위치 검색 실패:`, error);
        }
      }
    }
    
    // 이제 음식점 추천 진행
    for (let i = 0; i < day.activities.length; i++) {
      const activity = day.activities[i];
      
      // 식사 활동인 경우 근처 음식점 추천
      if (activity.type === 'meal') {
        console.log(`\n🍴 ${activity.time} 식사 음식점 검색 중...`);
        let nearbyLocation = null;
        let nearbyName = '';
        
        // 이전 관광지 위치 확인
        for (let j = i - 1; j >= 0; j--) {
          if (day.activities[j].type === 'attraction' && day.activities[j].location) {
            nearbyLocation = day.activities[j].location;
            nearbyName = day.activities[j].name;
            console.log(`  📍 이전 관광지: ${nearbyName}`);
            break;
          }
        }
        
        // 이전 관광지가 없으면 다음 관광지 위치 확인
        if (!nearbyLocation) {
          for (let j = i + 1; j < day.activities.length; j++) {
            if (day.activities[j].type === 'attraction' && day.activities[j].location) {
              nearbyLocation = day.activities[j].location;
              nearbyName = day.activities[j].name;
              console.log(`  📍 다음 관광지: ${nearbyName}`);
              break;
            }
          }
        }

        // 근처 음식점 검색
        if (nearbyLocation) {
          let mealType = 'lunch';
          if (activity.time.startsWith('08')) mealType = 'breakfast';
          else if (activity.time.startsWith('18') || activity.time.startsWith('19') || activity.time.startsWith('20')) mealType = 'dinner';

          console.log(`  🔍 ${nearbyName} 근처에서 ${mealType} 검색...`);

          try {
            const restaurant = await findNearbyRestaurants(nearbyLocation, mealType);
            
            if (restaurant) {
              console.log(`  ✅ 추천: ${restaurant.name} (⭐ ${restaurant.rating})`);
              // 식사 활동 정보 업데이트
              const updatedActivity = {
                ...activity,
                name: restaurant.name,
                description: `${restaurant.vicinity} · ⭐ ${restaurant.rating}`,
                location: restaurant.location,
                restaurantId: restaurant.id,
                rating: restaurant.rating,
                photo: restaurant.photo
              };
              enrichedActivities.push(updatedActivity);
            } else {
              console.log(`  ⚠️ 음식점을 찾지 못함`);
              enrichedActivities.push(activity);
            }
          } catch (error) {
            console.warn('  ❌ 음식점 검색 실패:', error);
            enrichedActivities.push(activity);
          }
        } else {
          console.log(`  ⚠️ 근처 관광지 위치를 찾을 수 없음`);
          enrichedActivities.push(activity);
        }
      } else {
        enrichedActivities.push(activity);
      }
    }

    enrichedSchedule.push({
      ...day,
      activities: enrichedActivities
    });
  }

  console.log('✅ 음식점 추천 완료!');
  return {
    ...itinerary,
    dailySchedule: enrichedSchedule
  };
};
