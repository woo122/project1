// 일본 여행지 데이터
const japanDestinations = [
  {
    id: 1,
    name: '도쿄',
    region: '관동',
    description: '일본의 수도이자 세계에서 가장 큰 도시 중 하나로, 현대적인 기술과 전통이 공존하는 곳입니다.',
    image: 'https://source.unsplash.com/random/800x600/?tokyo',
    attractions: [
      { name: '도쿄 타워', duration: 2, type: 'landmark', location: { lat: 35.6586, lng: 139.7454 } },
      { name: '시부야 스크램블 교차로', duration: 1, type: 'landmark', location: { lat: 35.6594, lng: 139.7005 } },
      { name: '메이지 신궁', duration: 2, type: 'cultural', location: { lat: 35.6764, lng: 139.6993 } },
      { name: '도쿄 스카이트리', duration: 3, type: 'landmark', location: { lat: 35.7101, lng: 139.8107 } },
      { name: '아사쿠사 센소지 사원', duration: 2, type: 'cultural', location: { lat: 35.7147, lng: 139.7966 } },
      { name: '하라주쿠', duration: 3, type: 'shopping', location: { lat: 35.6716, lng: 139.7031 } },
      { name: '우에노 공원', duration: 3, type: 'nature', location: { lat: 35.7156, lng: 139.7713 } },
      { name: '도쿄 디즈니랜드', duration: 8, type: 'entertainment', location: { lat: 35.6329, lng: 139.8804 } },
      { name: '신주쿠 교엔', duration: 2, type: 'nature', location: { lat: 35.6851, lng: 139.7094 } },
      { name: '아키하바라', duration: 4, type: 'shopping', location: { lat: 35.6983, lng: 139.7732 } }
    ],
    bestFor: ['촘촘한 일정', '쇼핑', '현대적인', '음식 탐방'],
    recommendedDays: 4,
    weather: { spring: '온화함', summer: '덥고 습함', autumn: '온화함', winter: '추움' }
  },
  {
    id: 2,
    name: '교토',
    region: '간사이',
    description: '일본의 옛 수도로, 전통적인 일본 문화와 역사를 체험할 수 있는 곳입니다.',
    image: 'https://source.unsplash.com/random/800x600/?kyoto',
    attractions: [
      { name: '기요미즈데라', duration: 3, type: 'cultural', location: { lat: 34.9949, lng: 135.7851 } },
      { name: '후시미 이나리 신사', duration: 3, type: 'cultural', location: { lat: 34.9671, lng: 135.7727 } },
      { name: '아라시야마 대나무 숲', duration: 2, type: 'nature', location: { lat: 35.0169, lng: 135.6745 } },
      { name: '킨카쿠지(금각사)', duration: 2, type: 'cultural', location: { lat: 35.0394, lng: 135.7292 } },
      { name: '기온 거리', duration: 3, type: 'cultural', location: { lat: 35.0036, lng: 135.7756 } },
      { name: '니조성', duration: 2, type: 'cultural', location: { lat: 35.0144, lng: 135.7483 } },
      { name: '교토 고궁', duration: 2, type: 'cultural', location: { lat: 35.0254, lng: 135.7624 } }
    ],
    bestFor: ['널널한 일정', '문화 체험', '전통적인', '역사 탐방'],
    recommendedDays: 3,
    weather: { spring: '온화함', summer: '덥고 습함', autumn: '온화함', winter: '추움' }
  },
  {
    id: 3,
    name: '오사카',
    region: '간사이',
    description: '일본의 주요 상업 도시로, 맛있는 음식과 쇼핑, 엔터테인먼트로 유명합니다.',
    image: 'https://source.unsplash.com/random/800x600/?osaka',
    attractions: [
      { name: '오사카성', duration: 3, type: 'cultural', location: { lat: 34.6873, lng: 135.5262 } },
      { name: '도톤보리', duration: 4, type: 'entertainment', location: { lat: 34.6687, lng: 135.5037 } },
      { name: '유니버셜 스튜디오 재팬', duration: 8, type: 'entertainment', location: { lat: 34.6654, lng: 135.4323 } },
      { name: '시텐노지', duration: 2, type: 'cultural', location: { lat: 34.6539, lng: 135.5122 } },
      { name: '우메다 스카이 빌딩', duration: 2, type: 'landmark', location: { lat: 34.7052, lng: 135.4957 } },
      { name: '신사이바시', duration: 3, type: 'shopping', location: { lat: 34.6721, lng: 135.4996 } }
    ],
    bestFor: ['촘촘한 일정', '음식 탐방', '쇼핑', '엔터테인먼트'],
    recommendedDays: 2,
    weather: { spring: '온화함', summer: '덥고 습함', autumn: '온화함', winter: '추움' }
  },
  {
    id: 4,
    name: '홋카이도',
    region: '홋카이도',
    description: '일본 최북단의 섬으로, 아름다운 자연 경관과 겨울 스포츠로 유명합니다.',
    image: 'https://source.unsplash.com/random/800x600/?hokkaido',
    attractions: [
      { name: '삿포로 시계탑', duration: 1, type: 'landmark', location: { lat: 43.0626, lng: 141.3544 } },
      { name: '오타루 운하', duration: 3, type: 'landmark', location: { lat: 43.1979, lng: 141.0041 } },
      { name: '후라노 라벤더 밭', duration: 3, type: 'nature', location: { lat: 43.3197, lng: 142.3975 } },
      { name: '비에이 언덕', duration: 4, type: 'nature', location: { lat: 43.5858, lng: 142.4655 } },
      { name: '노보리베츠 지옥곡', duration: 3, type: 'nature', location: { lat: 42.4922, lng: 141.1431 } },
      { name: '삿포로 맥주 박물관', duration: 2, type: 'cultural', location: { lat: 43.0690, lng: 141.3731 } }
    ],
    bestFor: ['널널한 일정', '자연 경관', '겨울 스포츠', '온천'],
    recommendedDays: 4,
    weather: { spring: '시원함', summer: '온화함', autumn: '시원함', winter: '매우 추움' }
  },
  {
    id: 5,
    name: '오키나와',
    region: '오키나와',
    description: '일본 최남단의 열대 섬으로, 아름다운 해변과 독특한 문화로 유명합니다.',
    image: 'https://source.unsplash.com/random/800x600/?okinawa',
    attractions: [
      { name: '슈리성', duration: 3, type: 'cultural', location: { lat: 26.2172, lng: 127.7195 } },
      { name: '추라우미 수족관', duration: 4, type: 'entertainment', location: { lat: 26.6939, lng: 127.8780 } },
      { name: '코우리 섬', duration: 5, type: 'nature', location: { lat: 26.7276, lng: 128.0288 } },
      { name: '아메리칸 빌리지', duration: 3, type: 'shopping', location: { lat: 26.3158, lng: 127.7599 } },
      { name: '만자모', duration: 2, type: 'nature', location: { lat: 26.1792, lng: 127.7432 } },
      { name: '나하 국제거리', duration: 3, type: 'shopping', location: { lat: 26.2124, lng: 127.6792 } }
    ],
    bestFor: ['널널한 일정', '해변', '휴양', '수상 스포츠'],
    recommendedDays: 4,
    weather: { spring: '따뜻함', summer: '덥고 습함', autumn: '따뜻함', winter: '온화함' }
  },
  {
    id: 6,
    name: '나라',
    region: '간사이',
    description: '일본의 첫 번째 수도로, 고대 사원과 사슴 공원으로 유명합니다.',
    image: 'https://source.unsplash.com/random/800x600/?nara',
    attractions: [
      { name: '동대사', duration: 3, type: 'cultural', location: { lat: 34.6890, lng: 135.8398 } },
      { name: '나라 공원', duration: 3, type: 'nature', location: { lat: 34.6851, lng: 135.8398 } },
      { name: '가스가 타이샤', duration: 2, type: 'cultural', location: { lat: 34.6810, lng: 135.8497 } },
      { name: '이스이엔', duration: 2, type: 'nature', location: { lat: 34.6841, lng: 135.8328 } },
      { name: '나라 국립박물관', duration: 3, type: 'cultural', location: { lat: 34.6868, lng: 135.8397 } }
    ],
    bestFor: ['널널한 일정', '역사 탐방', '문화 체험', '자연 경관'],
    recommendedDays: 1,
    weather: { spring: '온화함', summer: '덥고 습함', autumn: '온화함', winter: '추움' }
  },
  {
    id: 7,
    name: '히로시마',
    region: '주고쿠',
    description: '평화 기념관과 아름다운 미야지마 섬으로 유명한 도시입니다.',
    image: 'https://source.unsplash.com/random/800x600/?hiroshima',
    attractions: [
      { name: '평화기념공원', duration: 3, type: 'cultural', location: { lat: 34.3955, lng: 132.4536 } },
      { name: '원폭돔', duration: 1, type: 'cultural', location: { lat: 34.3953, lng: 132.4536 } },
      { name: '미야지마', duration: 5, type: 'cultural', location: { lat: 34.2971, lng: 132.3197 } },
      { name: '이츠쿠시마 신사', duration: 2, type: 'cultural', location: { lat: 34.2952, lng: 132.3194 } },
      { name: '히로시마성', duration: 2, type: 'cultural', location: { lat: 34.4026, lng: 132.4590 } }
    ],
    bestFor: ['널널한 일정', '역사 탐방', '문화 체험'],
    recommendedDays: 2,
    weather: { spring: '온화함', summer: '덥고 습함', autumn: '온화함', winter: '추움' }
  },
  {
    id: 8,
    name: '하코네',
    region: '관동',
    description: '도쿄 근교의 온천 마을로, 아름다운 자연 경관과 후지산 전망으로 유명합니다.',
    image: 'https://source.unsplash.com/random/800x600/?hakone',
    attractions: [
      { name: '오와쿠다니', duration: 3, type: 'nature', location: { lat: 35.2343, lng: 139.0210 } },
      { name: '아시노코 호수', duration: 3, type: 'nature', location: { lat: 35.2173, lng: 139.0076 } },
      { name: '하코네 신사', duration: 2, type: 'cultural', location: { lat: 35.2047, lng: 139.0249 } },
      { name: '하코네 로프웨이', duration: 2, type: 'nature', location: { lat: 35.2359, lng: 139.0261 } },
      { name: '하코네 야외조각박물관', duration: 3, type: 'cultural', location: { lat: 35.2456, lng: 139.0517 } }
    ],
    bestFor: ['널널한 일정', '온천', '자연 경관', '휴양'],
    recommendedDays: 2,
    weather: { spring: '온화함', summer: '온화함', autumn: '온화함', winter: '추움' }
  }
];

// 도쿄 자치구별 대표 POI (샘플). 데이터가 없으면 도쿄 공통 POI로 폴백합니다.
const tokyoWardAttractions = {
  shinjuku: [
    { name: '신주쿠 교엔', duration: 2, type: 'nature', location: { lat: 35.6851, lng: 139.7094 } },
    { name: '가부키초 거리', duration: 2, type: 'entertainment', location: { lat: 35.6951, lng: 139.7020 } }
  ],
  shibuya: [
    { name: '시부야 스크램블 교차로', duration: 1, type: 'landmark', location: { lat: 35.6594, lng: 139.7005 } },
    { name: '하라주쿠', duration: 2, type: 'shopping', location: { lat: 35.6716, lng: 139.7031 } },
    { name: '메이지 신궁', duration: 2, type: 'cultural', location: { lat: 35.6764, lng: 139.6993 } }
  ],
  sumida: [
    { name: '도쿄 스카이트리', duration: 3, type: 'landmark', location: { lat: 35.7101, lng: 139.8107 } }
  ],
  taito: [
    { name: '아사쿠사 센소지 사원', duration: 2, type: 'cultural', location: { lat: 35.7147, lng: 139.7966 } },
    { name: '우에노 공원', duration: 3, type: 'nature', location: { lat: 35.7156, lng: 139.7713 } }
  ]
};

// 여행 스타일 데이터
const travelStyles = [
  { id: 'sightseeing', name: '관광 중심형', description: '대표 명소, 유적지, 랜드마크 등 볼거리 중심' },
  { id: 'food', name: '맛집 탐방형', description: '지역 음식, 전통 요리, 디저트 카페 등 먹거리 중심' },
  { id: 'shopping', name: '쇼핑형', description: '쇼핑몰, 브랜드 거리, 전통시장 등 구매 중심' },
  { id: 'relaxation', name: '휴양형', description: '자연, 온천, 리조트 중심으로 휴식과 경치 감상 위주' },
  { id: 'activity', name: '액티비티형', description: '테마파크, 체험, 스포츠 등 활동 중심' }
];

// 여행지 목록
const japanCities = [
  { id: 'tokyo', name: '도쿄' },
  { id: 'osaka', name: '오사카' },
  { id: 'kyoto', name: '교토' },
  { id: 'fukuoka', name: '후쿠오카' },
  { id: 'sapporo', name: '삿포로' },
  { id: 'nara', name: '나라' },
  { id: 'hiroshima', name: '히로시마' },
  { id: 'nagoya', name: '나고야' }
];

// 도쿄 23개 자치구
const tokyoWards = [
  { id: 'chiyoda', name: '치요다구' },
  { id: 'chuo', name: '주오구' },
  { id: 'minato', name: '미나토구' },
  { id: 'shinjuku', name: '신주쿠구' },
  { id: 'bunkyo', name: '분쿄구' },
  { id: 'taito', name: '다이토구' },
  { id: 'sumida', name: '스미다구' },
  { id: 'koto', name: '고토구' },
  { id: 'shinagawa', name: '시나가와구' },
  { id: 'meguro', name: '메구로구' },
  { id: 'ota', name: '오타구' },
  { id: 'setagaya', name: '세타가야구' },
  { id: 'shibuya', name: '시부야구' },
  { id: 'nakano', name: '나카노구' },
  { id: 'suginami', name: '스기나미구' },
  { id: 'toshima', name: '토시마구' },
  { id: 'kita', name: '키타구' },
  { id: 'arakawa', name: '아라카와구' },
  { id: 'itabashi', name: '이타바시구' },
  { id: 'nerima', name: '네리마구' },
  { id: 'adachi', name: '아다치구' },
  { id: 'katsushika', name: '카츠시카구' },
  { id: 'edogawa', name: '에도가와구' }
];

// 도쿄 공항 정보
export const tokyoAirports = [
  {
    id: 'narita',
    name: '나리타 국제공항',
    code: 'NRT',
    location: { lat: 35.7647, lng: 140.3864 },
    tokyoDistance: '약 60km',
    accessTime: '60-90분',
    description: '도쿄의 주요 국제공항, 도심에서 약 1시간 거리'
  },
  {
    id: 'haneda',
    name: '하네다 공항',
    code: 'HND', 
    location: { lat: 35.5494, lng: 139.7798 },
    tokyoDistance: '약 20km',
    accessTime: '30-45분',
    description: '도쿄 도심과 가까운 공항, 접근성이 좋음'
  }
];

// 여행자 구성 유형
const travelerTypes = [
  { id: 'family_large', name: '가족(대가족)', description: '조부모, 부모, 자녀 등 3대 이상 가족' },
  { id: 'family_parents', name: '가족(부모님)', description: '부모님과 함께하는 여행' },
  { id: 'family_siblings', name: '가족(형제/자매)', description: '형제자매와 함께하는 여행' },
  { id: 'family_children', name: '가족(아이랑)', description: '어린 자녀와 함께하는 여행' },
  { id: 'friends_small', name: '친구(소규모)', description: '2-3명의 친구와 함께하는 여행' },
  { id: 'friends_medium', name: '친구(중규모)', description: '4-6명의 친구와 함께하는 여행' },
  { id: 'friends_large', name: '친구(대규모)', description: '7명 이상의 친구와 함께하는 여행' },
  { id: 'couple_male', name: '연인(남자)', description: '남자친구와 함께하는 여행' },
  { id: 'couple_female', name: '연인(여자)', description: '여자친구와 함께하는 여행' },
  { id: 'solo', name: '혼자', description: '혼자 떠나는 여행' }
];

// 계절별 추천 여행지
const seasonalRecommendations = {
  spring: [1, 2, 6, 7], // 도쿄, 교토, 나라, 히로시마
  summer: [4, 5],       // 홋카이도, 오키나와
  autumn: [2, 3, 7, 8], // 교토, 오사카, 히로시마, 하코네
  winter: [1, 3, 4]     // 도쿄, 오사카, 홋카이도
};

// 여행 일수별 추천 여행지 조합
const durationBasedTrips = {
  short: [ // 3-5일
    [1],      // 도쿄만
    [2, 6],   // 교토 + 나라
    [3, 6],   // 오사카 + 나라
    [8, 1]    // 하코네 + 도쿄
  ],
  medium: [ // 6-9일
    [1, 2, 3],    // 도쿄 + 교토 + 오사카
    [1, 8, 2],    // 도쿄 + 하코네 + 교토
    [3, 2, 6, 7], // 오사카 + 교토 + 나라 + 히로시마
    [4]           // 홋카이도
  ],
  long: [ // 10일 이상
    [1, 8, 2, 3, 6],       // 도쿄 + 하코네 + 교토 + 오사카 + 나라
    [1, 2, 3, 7],          // 도쿄 + 교토 + 오사카 + 히로시마
    [5],                   // 오키나와
    [1, 4]                 // 도쿄 + 홋카이도
  ]
};

export { 
  japanDestinations, 
  travelStyles, 
  seasonalRecommendations, 
  durationBasedTrips,
  japanCities,
  travelerTypes,
  tokyoWards,
  tokyoWardAttractions
};