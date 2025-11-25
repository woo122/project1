// Google Maps Distance Matrix API를 사용하여 이동 시간 계산

// 두 장소 간 이동 시간 계산 (대중교통 vs 도보 비교)
export const calculateTravelTime = async (origin, destination) => {
  if (!window.google || !origin || !destination) {
    console.warn('⚠️ Google Maps 또는 위치 정보 없음');
    return null;
  }

  const service = new window.google.maps.DistanceMatrixService();
  const MAX_WALKING_DISTANCE = 1500; // 1.5km
  
  // 먼저 도보 거리 확인
  const walkingResult = await new Promise((resolve) => {
    service.getDistanceMatrix(
      {
        origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
        destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
        travelMode: window.google.maps.TravelMode.WALKING,
        unitSystem: window.google.maps.UnitSystem.METRIC
      },
      (response, status) => {
        if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
          const element = response.rows[0].elements[0];
          resolve({
            duration: element.duration.value,
            durationText: element.duration.text,
            distance: element.distance.value,
            distanceText: element.distance.text,
            mode: '🚶 도보'
          });
        } else {
          resolve(null);
        }
      }
    );
  });
  
  // 1.5km 이상이면 대중교통만 사용
  if (walkingResult && walkingResult.distance > MAX_WALKING_DISTANCE) {
    console.log(`  📏 거리: ${walkingResult.distanceText} → 대중교통 사용`);
    
    // 평일 오전 10시로 출발 시간 설정 (대중교통이 활발한 시간)
    const now = new Date();
    const departureTime = new Date(now);
    departureTime.setHours(10, 0, 0, 0);
    // 과거 시간이면 내일로 설정
    if (departureTime < now) {
      departureTime.setDate(departureTime.getDate() + 1);
    }
    
    const transitResult = await new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: window.google.maps.TravelMode.TRANSIT,
          transitOptions: {
            departureTime: departureTime,
            modes: [window.google.maps.TransitMode.SUBWAY, window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.TRAIN],
            routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
          },
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            resolve({
              duration: element.duration.value,
              durationText: element.duration.text,
              distance: element.distance.value,
              distanceText: element.distance.text,
              mode: '🚇 대중교통'
            });
          } else {
            console.log(`  ⚠️ 대중교통 경로 없음 (상태: ${status})`);
            resolve(null);
          }
        }
      );
    });
    
    if (transitResult) {
      console.log(`✅ 대중교통: ${transitResult.durationText} (${transitResult.distanceText})`);
      return transitResult;
    } else {
      // 대중교통 실패 시 자동차로 폴백
      console.log(`  ⚠️ 대중교통 실패 → 자동차로 재시도...`);
      
      const drivingResult = await new Promise((resolve) => {
        service.getDistanceMatrix(
          {
            origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
            destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
            travelMode: window.google.maps.TravelMode.DRIVING,
            unitSystem: window.google.maps.UnitSystem.METRIC
          },
          (response, status) => {
            if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
              const element = response.rows[0].elements[0];
              resolve({
                duration: element.duration.value,
                durationText: element.duration.text,
                distance: element.distance.value,
                distanceText: element.distance.text,
                mode: '🚗 차량'
              });
            } else {
              resolve(null);
            }
          }
        );
      });
      
      if (drivingResult) {
        // 차량 시간을 대중교통 예상 시간으로 변환 (약 1.3배)
        const transitEstimatedTime = Math.round(drivingResult.duration * 1.3);
        const transitEstimatedMinutes = Math.round(transitEstimatedTime / 60);
        
        const result = {
          duration: transitEstimatedTime,
          durationText: `${transitEstimatedMinutes}분`,
          distance: drivingResult.distance,
          distanceText: drivingResult.distanceText,
          mode: '🚇 대중교통 (예상)'
        };
        console.log(`✅ 대중교통 (예상): ${result.durationText} (${result.distanceText})`);
        return result;
      } else {
        console.log(`❌ 모든 이동 수단 실패`);
        return null;
      }
    }
  }
  
  // 1.5km 이하면 대중교통과 도보 비교
  if (walkingResult) {
    console.log(`  📏 거리: ${walkingResult.distanceText} → 대중교통 vs 도보 비교`);
    
    // 평일 오전 10시로 출발 시간 설정
    const now = new Date();
    const departureTime = new Date(now);
    departureTime.setHours(10, 0, 0, 0);
    if (departureTime < now) {
      departureTime.setDate(departureTime.getDate() + 1);
    }
    
    const transitResult = await new Promise((resolve) => {
      service.getDistanceMatrix(
        {
          origins: [new window.google.maps.LatLng(origin.lat, origin.lng)],
          destinations: [new window.google.maps.LatLng(destination.lat, destination.lng)],
          travelMode: window.google.maps.TravelMode.TRANSIT,
          transitOptions: {
            departureTime: departureTime,
            modes: [window.google.maps.TransitMode.SUBWAY, window.google.maps.TransitMode.BUS, window.google.maps.TransitMode.TRAIN],
            routingPreference: window.google.maps.TransitRoutePreference.FEWER_TRANSFERS
          },
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            resolve({
              duration: element.duration.value,
              durationText: element.duration.text,
              distance: element.distance.value,
              distanceText: element.distance.text,
              mode: '🚇 대중교통'
            });
          } else {
            resolve(null);
          }
        }
      );
    });
    
    if (transitResult) {
      const faster = transitResult.duration <= walkingResult.duration ? transitResult : walkingResult;
      console.log(`✅ 대중교통 ${transitResult.durationText} vs 도보 ${walkingResult.durationText} → ${faster.mode} 선택`);
      return faster;
    } else {
      // 대중교통 실패 시 도보와 자동차 비교
      console.log(`  ⚠️ 대중교통 실패 → 도보 사용`);
      console.log(`✅ 도보: ${walkingResult.durationText}`);
      return walkingResult;
    }
  }
  
  console.error('❌ 이동 경로를 찾을 수 없음');
  return null;
};

// 일정에 이동 시간 추가
export const enrichItineraryWithTravelTime = async (itinerary) => {
  if (!itinerary || !itinerary.dailySchedule) {
    console.log('❌ 일정 데이터가 없습니다');
    return itinerary;
  }

  console.log('🚇 이동 시간 계산 시작...');
  const enrichedSchedule = [];

  for (const day of itinerary.dailySchedule) {
    const enrichedActivities = [];
    
    console.log(`\n📅 ${day.date} 이동 시간 계산 중...`);
    
    for (let i = 0; i < day.activities.length; i++) {
      const currentActivity = day.activities[i];
      enrichedActivities.push(currentActivity);
      
      // 다음 활동이 있고, 둘 다 위치 정보가 있으면 이동 시간 계산
      if (i < day.activities.length - 1) {
        const nextActivity = day.activities[i + 1];
        
        // 위치 정보 확인
        if (!currentActivity.location) {
          console.log(`  ⚠️ ${currentActivity.name}: 위치 정보 없음`);
        }
        if (!nextActivity.location) {
          console.log(`  ⚠️ ${nextActivity.name}: 위치 정보 없음`);
        }
        
        if (currentActivity.location && nextActivity.location) {
          console.log(`  🚶 ${currentActivity.name} → ${nextActivity.name}`);
          console.log(`     출발: (${currentActivity.location.lat}, ${currentActivity.location.lng})`);
          console.log(`     도착: (${nextActivity.location.lat}, ${nextActivity.location.lng})`);
          
          try {
            const travelInfo = await calculateTravelTime(
              currentActivity.location,
              nextActivity.location
            );
            
            if (travelInfo) {
              // 도보 5분 이내면 "도보 5분 이내"로 표시, 그 이상이면 실제 시간 표시
              let displayInfo = {...travelInfo};
              
              if (travelInfo.mode === '🚶 도보' && travelInfo.duration <= 300) {
                displayInfo.durationText = '5분 이내';
                console.log(`    ✅ ${travelInfo.mode} ${travelInfo.durationText} → 5분 이내로 표시`);
              } else {
                console.log(`    ✅ ${travelInfo.mode} ${travelInfo.durationText} (${travelInfo.distanceText}) - 표시함`);
              }
              
              // 이동 활동 추가
              enrichedActivities.push({
                type: 'transit',
                name: '이동',
                description: `${currentActivity.name}에서 ${nextActivity.name}으로 이동`,
                duration: Math.round(travelInfo.duration / 60 / 60 * 10) / 10, // 시간 단위로 변환
                durationText: displayInfo.durationText,
                distanceText: travelInfo.distanceText,
                mode: travelInfo.mode, // 이동 수단 (대중교통/도보)
                time: calculateArrivalTime(currentActivity.time, currentActivity.duration || 0)
              });
            } else {
              console.error(`    ❌ 이동 시간 계산 실패 - API가 null 반환`);
            }
            
            // API 속도 제한 방지를 위한 대기
            await new Promise(resolve => setTimeout(resolve, 200));
          } catch (error) {
            console.error(`  ❌ 이동 시간 계산 오류:`, error);
          }
        }
      }
    }
    
    enrichedSchedule.push({
      ...day,
      activities: enrichedActivities
    });
  }

  console.log('✅ 이동 시간 계산 완료!');
  return {
    ...itinerary,
    dailySchedule: enrichedSchedule
  };
};

// 시간 계산 헬퍼 함수
const calculateArrivalTime = (startTime, duration) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + (duration * 60);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = Math.floor(totalMinutes % 60);
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};
