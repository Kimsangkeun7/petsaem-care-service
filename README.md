# 펫쌤 - 통합 반려동물·식물 케어 서비스

모든 생명과의 따뜻한 동행, 생명케어의 새로운 패러다임을 제공하는 통합 반려동물·식물 케어 서비스입니다.

## 🐾 주요 기능

### 반려동물 케어
- **토끼 케어**: 토끼 전문 수의사의 사육법, 건강 관리, 영양 상담
- **햄스터·기니피그 케어**: 설치류 전문가의 맞춤 케어와 건강 관리
- **파충류 케어**: 이구아나, 거북이, 뱀 등 파충류 전문 상담
- **조류 케어**: 앵무새, 카나리아 등 조류 전문 건강 관리
- **어류 케어**: 관상어, 수족관 관리 전문 상담

### 식물 케어
- **식물 케어**: 실내식물, 다육식물 전문 진단 및 관리

### 커뮤니티
- **전문가 상담**: 현직 수의사의 직접 경험과 상담
- **게시판**: 각 동물별 전문 게시판 운영
- **응급상황 게시판**: 긴급 상담 전용
- **자유 게시판**: 일상 공유, 자유 토론

## 🚀 Netlify 배포 가이드

### 1. 준비사항
- GitHub 계정
- Netlify 계정
- Node.js 18+ 설치

### 2. 배포 단계

#### 2.1 GitHub에 코드 업로드
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin [YOUR_GITHUB_REPO_URL]
git push -u origin main
```

#### 2.2 Netlify 배포
1. [Netlify](https://netlify.com)에 로그인
2. "New site from Git" 클릭
3. GitHub 연결 후 저장소 선택
4. 배포 설정:
   - **Build command**: `npm install`
   - **Publish directory**: `.`
   - **Node version**: `18`

#### 2.3 환경 변수 설정 (선택사항)
Netlify 대시보드 → Site settings → Environment variables에서 필요한 환경 변수 설정

### 3. 배포 후 확인사항
- [ ] 홈페이지 정상 로드
- [ ] 게시판 접속 및 글쓰기 기능
- [ ] 상담 신청 기능
- [ ] 관리자 페이지 접속
- [ ] 연락처 정보 표시 (010-4327-3669, peostar@naver.com)

## 🛠 기술 스택

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Font Awesome (아이콘)
- Google Fonts (Noto Sans KR)

### Backend
- Node.js
- Express.js
- Netlify Functions (서버리스)
- Multer (파일 업로드)
- Helmet (보안)
- CORS (크로스 오리진)

### 배포
- Netlify (정적 호스팅 + 서버리스 함수)

## 📁 프로젝트 구조

```
동영상워터마크지우기/
├── index.html          # 메인 페이지
├── board.html          # 게시판 페이지
├── admin.html          # 관리자 페이지
├── styles.css          # 메인 스타일
├── board.css           # 게시판 스타일
├── admin.css           # 관리자 스타일
├── script.js           # 메인 스크립트
├── board.js            # 게시판 스크립트
├── admin.js            # 관리자 스크립트
├── server.js           # Express 서버 (로컬용)
├── netlify/
│   └── functions/
│       └── api.js      # Netlify Functions API
├── netlify.toml        # Netlify 설정
├── package.json        # 의존성 관리
└── README.md           # 프로젝트 문서
```

## 🔧 로컬 개발

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 서버 실행
```bash
npm start
```

## 📞 연락처

- **전화**: 010-4327-3669
- **이메일**: peostar@naver.com
- **운영시간**: 24시간 운영
- **서비스**: 온라인 서비스

## 📝 라이선스

MIT License

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**펫쌤** - 모든 생명과의 따뜻한 동행 🐾🌱 