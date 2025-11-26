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
    
    const activities = day.activities || [];
    
    for (let i = 0; i < activities.length; i++) {
      const currentActivity = activities[i];
      enrichedActivities.push(currentActivity);

      // 마지막 인덱스면 다음 이동 없음
      if (i >= activities.length - 1) {
        continue;
      }

      // 현재 활동에 위치가 없으면 이동 계산 불가 → 다음으로 진행
      if (!currentActivity.location) {
        console.log(`  ⚠️ ${currentActivity.name}: 위치 정보 없음`);
        continue;
      }

      // 이후 활동 중 위치가 있는 첫 번째 활동을 찾는다 (중간에 위치 없는 식사/텍스트 활동 건너뜀)
      let nextIndexWithLocation = -1;
      for (let j = i + 1; j < activities.length; j++) {
        if (activities[j].location) {
          nextIndexWithLocation = j;
          break;
        } else {
          console.log(`  ⚠️ ${activities[j].name}: 위치 정보 없음 (건너뜀)`);
        }
      }

      if (nextIndexWithLocation === -1) {
        // 이후에 위치 있는 활동이 없으면 이동 계산 스킵
        continue;
      }

      const nextActivity = activities[nextIndexWithLocation];

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
          let displayInfo = { ...travelInfo };
          
          if (travelInfo.mode === '🚶 도보' && travelInfo.duration <= 300) {
            displayInfo.durationText = '5분 이내';
            console.log(`    ✅ ${travelInfo.mode} ${displayInfo.durationText} → 5분 이내로 표시`);
          } else {
            console.log(`    ✅ ${travelInfo.mode} ${displayInfo.durationText} (${travelInfo.distanceText}) - 표시함`);
          }

          const durationHours = Math.round(travelInfo.duration / 60 / 60 * 10) / 10;
          
          // 이동 활동 추가
          enrichedActivities.push({
            type: 'transit',
            name: '이동',
            description: `${currentActivity.name}에서 ${nextActivity.name}으로 이동`,
            duration: durationHours, // 시간 단위로 변환
            durationText: displayInfo.durationText,
            distanceText: travelInfo.distanceText,
            mode: travelInfo.mode, // 이동 수단 (대중교통/도보)
            time: calculateArrivalTime(currentActivity.time, currentActivity.duration || 0)
          });
        } else {
          // API에서 경로를 찾지 못한 경우에도 기본 이동 배너는 표시
          console.warn(`    ⚠️ 이동 시간 계산 실패 - API가 null 반환, 기본값으로 대체`);
          const fallbackMinutes = 30; // 기본 30분으로 가정
          const fallbackDurationHours = fallbackMinutes / 60;
          enrichedActivities.push({
            type: 'transit',
            name: '이동',
            description: `${currentActivity.name}에서 ${nextActivity.name}으로 이동 (예상)`,
            duration: fallbackDurationHours,
            durationText: `약 ${fallbackMinutes}분`,
            distanceText: '거리 정보 없음',
            mode: '🚇 대중교통 (예상)',
            time: calculateArrivalTime(currentActivity.time, currentActivity.duration || 0)
          });
        }
        
        // API 속도 제한 방지를 위한 대기
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`  ❌ 이동 시간 계산 오류:`, error);
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

// 기존 이동(transit) 활동들을 제거한 뒤, 다시 이동 시간을 계산하여 일정에 반영
export const recalculateItineraryTravelTime = async (itinerary) => {
  if (!itinerary || !itinerary.dailySchedule) {
    console.log('❌ 일정 데이터가 없습니다 (recalculate)');
    return itinerary;
  }

  const baseItinerary = {
    ...itinerary,
    dailySchedule: itinerary.dailySchedule.map((day) => ({
      ...day,
      activities: Array.isArray(day.activities)
        ? day.activities.filter((act) => act.type !== 'transit')
        : [],
    })),
  };

  const enriched = await enrichItineraryWithTravelTime(baseItinerary);
  return normalizeItineraryTimes(enriched);
};

// 시간 계산 헬퍼 함수
const calculateArrivalTime = (startTime, duration) => {
  if (!startTime) return '';
  const str = String(startTime).trim();
  if (!str) return '';

  const parts = str.split(':');
  const hoursPart = parts[0];
  const minutesPart = parts[1] != null && parts[1] !== '' ? parts[1] : '00';

  const hours = Number(hoursPart);
  const minutes = Number(minutesPart);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return str;
  }

  const totalMinutes = hours * 60 + minutes + (duration * 60);
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMinutes = Math.floor(totalMinutes % 60);
  return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

// 일정의 각 날짜별 활동 시작 시간을 duration 기준으로 다시 계산하여 연속적으로 배치
const normalizeItineraryTimes = (itinerary) => {
  if (!itinerary || !Array.isArray(itinerary.dailySchedule)) return itinerary;

  const parseTimeToMinutes = (time) => {
    if (!time) return 8 * 60; // 기본 08:00
    const str = String(time).trim();
    if (!str) return 8 * 60;
    const parts = str.split(':');
    const hoursPart = parts[0];
    const minutesPart = parts[1] != null && parts[1] !== '' ? parts[1] : '00';
    const h = Number(hoursPart);
    const m = Number(minutesPart);
    if (Number.isNaN(h) || Number.isNaN(m)) return 8 * 60;
    return h * 60 + m;
  };

  const formatMinutesToTime = (minutesTotal) => {
    const minutes = ((minutesTotal % (24 * 60)) + (24 * 60)) % (24 * 60);
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const getDefaultDuration = (activity) => {
    if (typeof activity.duration === 'number' && activity.duration > 0) {
      return activity.duration;
    }
    switch (activity.type) {
      case 'meal':
        return 1; // 1시간
      case 'attraction':
        return 2; // 2시간
      case 'airport':
        return 1; // 1시간
      case 'accommodation':
        return 0.5; // 30분
      case 'custom':
        return 1; // 1시간
      case 'transit':
        return activity.duration || 0; // 이미 계산된 이동 시간 사용
      default:
        return activity.duration || 1;
    }
  };

  const normalizedSchedule = itinerary.dailySchedule.map((day) => {
    const activities = Array.isArray(day.activities) ? [...day.activities] : [];
    if (activities.length === 0) return day;

    // 첫 활동의 시간을 기준으로 나머지를 재배치
    const firstTimeMinutes = parseTimeToMinutes(activities[0].time || '08:00');
    let currentMinutes = firstTimeMinutes;

    const timedActivities = activities.map((activity) => {
      const updated = { ...activity };

      // 각 활동 시작 시간을 현재 시각으로 설정 (숙소 포함, 고정 시간 해제)
      updated.time = formatMinutesToTime(currentMinutes);

      const durationHours = getDefaultDuration(updated);
      currentMinutes += Math.round(durationHours * 60);

      return updated;
    });

    // 연속된 숙소(accommodation)는 하나로 압축 (예: 숙소 → 숙소 인 경우 하나만 남김)
    const collapsedActivities = [];
    for (let i = 0; i < timedActivities.length; i += 1) {
      const current = timedActivities[i];
      const prev = collapsedActivities[collapsedActivities.length - 1];

      if (
        prev &&
        prev.type === 'accommodation' &&
        current.type === 'accommodation'
      ) {
        // 이전이 숙소이고 현재도 숙소면, 이전 숙소만 유지하고 현재 것은 건너뜀
        continue;
      }

      collapsedActivities.push(current);
    }

    return {
      ...day,
      activities: collapsedActivities,
    };
  });

  return {
    ...itinerary,
    dailySchedule: normalizedSchedule,
  };
};
