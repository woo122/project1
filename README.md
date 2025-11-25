# 🇯🇵 일본 여행 플래너

일본 여행 일정을 자동으로 생성해주는 React 웹 애플리케이션입니다.
(https://travel-planner-893.pages.dev/)

## ✨ 주요 기능

- 📅 여행 날짜, 인원, 예산 설정
- 🎨 여행 스타일 선택 (관광, 맛집, 쇼핑, 휴양, 액티비티)
- 🗺️ 도쿄 23구 지역별 일정 생성
- 🚇 Google Maps API 기반 실시간 이동 시간 계산
- 🍽️ 맛집 자동 추천
- 🏨 숙소 위치 기반 일정 최적화

## 🚀 설치 및 실행 방법

### 1. 의존성 설치
```bash
npm install
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사해서 `.env` 파일을 만들고 API 키를 입력하세요:

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

`.env` 파일을 열어서 다음 값을 입력:
```
REACT_APP_GOOGLE_MAPS_API_KEY=여기에_구글_맵스_API_키
REACT_APP_OPENROUTER_API_KEY=여기에_OpenRouter_API_키
```

#### API 키 발급 방법:
- **Google Maps API**: [Google Cloud Console](https://console.cloud.google.com/)
  - Maps JavaScript API, Places API, Distance Matrix API 활성화 필요
- **OpenRouter API**: [OpenRouter](https://openrouter.ai/)

### 3. 개발 서버 실행 (Cloudflare Pages + D1 포함)

먼저 wrangler를 전역 설치합니다:

```bash
npm install -g wrangler
```

그 다음 프로젝트 루트에서:

```bash
wrangler pages dev build
```

콘솔에 `Ready on http://127.0.0.1:8788` 가 보이면 브라우저에서 [http://127.0.0.1:8788](http://127.0.0.1:8788)에 접속하세요.

### 4. (선택) CRA 개발 서버만 실행하고 싶을 때

백엔드 없이 React 프론트엔드만 확인하려면:

```bash
npm start
```

브라우저에서 [http://localhost:3000](http://localhost:3000)이 열립니다.

## 📦 프로덕션 빌드

```bash
npm run build
```

`build` 폴더에 최적화된 프로덕션 빌드가 생성됩니다.


### 주의사항
- API 키가 클라이언트에 노출되므로 반드시 키 제한 설정 필요
- Google Cloud Console에서 HTTP 리퍼러 제한 추가
- 사용량 한도 설정 권장

## 🛠️ 기술 스택

- **Frontend**: React 19, Material-UI v7
- **Maps**: Google Maps JavaScript API, React Google Maps
- **State Management**: React Hooks
- **Build Tool**: Create React App
- **Deployment**: Netlify

## 📁 프로젝트 구조

```
project/
├── src/
│   ├── components/      # React 컴포넌트
│   ├── utils/          # 유틸리티 함수
│   │   ├── attractionRecommender.js   # 관광지 추천
│   │   ├── restaurantRecommender.js   # 음식점 추천
│   │   └── travelTimeCalculator.js    # 이동 시간 계산
│   └── data/           # 일본 여행 데이터
├── public/             # 정적 파일
└── .env               # 환경 변수 (git에 포함 안 됨)
```

## 👥 팀원이 ZIP으로 실행하는 방법

1. Git 저장소에서 **Download ZIP**으로 프로젝트 다운로드 후 압축 해제
2. 프로젝트 폴더에서 의존성 설치:

   ```bash
   npm install
   ```

3. `.env.example`를 복사해서 `.env` 파일 생성:

   ```bash
   # Windows
   copy .env.example .env

   # Mac/Linux
   cp .env.example .env
   ```

4. `.env` 파일을 열어 다음 값 입력:

   ```env
   REACT_APP_GOOGLE_MAPS_API_KEY=구글맵_API_키
   REACT_APP_OPENROUTER_API_KEY=OpenRouter_API_키(옵션)
   ```

5. 개발 서버 실행:

   ```bash
   wrangler pages dev build
   ```

6. 콘솔에 `Ready on http://127.0.0.1:8788` 가 보이면 브라우저에서 `http://127.0.0.1:8788` 접속

## ⚠️ 보안 주의사항

**절대로 `.env` 파일을 공개 저장소에 커밋하지 마세요!**

이 프로젝트는 `.gitignore`에 `.env`가 포함되어 있습니다.

## 📝 라이선스

이 프로젝트는 개인 사용 목적으로 제작되었습니다.
