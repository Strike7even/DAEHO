# Sales Dashboard 프로젝트 계획서

## 기술 스택
- Next.js 16 (App Router)
- UI: Tailwind CSS v4 (shadcn/ui 미사용)
- 데이터: Google Sheets API v4 (DB 역할)
- 인증: 쿠키 기반 패스워드 (혼자만 사용)
- 차트: recharts
- 배포: Vercel (무료)

## 데이터 구조 (33컬럼, 6그룹)

| 그룹 | 컬럼 | 입력 | 자동계산 |
|------|------|------|---------|
| 기본정보 | 로트번호, 수입일, 인쇄형태 | 3 | 0 |
| 수입원가 | 입고수량, 카드단가, 박스수량/금액, 송금액(원), 통관비 | 6 | 4 |
| 가공/납품 | 납품박스수, 잔량, 가공비 | 3 | 3 |
| 매출/단가 | 공급단가 | 1 | 3 |
| 수익성 | — | 0 | 3 |
| 세무/정산 | 발행비율, 입금액 | 2 | 4 |

- 직접 입력: 15개 컬럼
- 자동계산: 18개 컬럼

## 화면 구성 (3개 페이지)
```
/ (로그인)
├── /dashboard  ← 대시보드 (KPI 카드 + 차트)
└── /transactions
    ├── 목록 (테이블)
    ├── /new  ← 신규 입력
    └── /[id]  ← 수정
```

## 구현 단계

### Phase 1 — 기반 설정 ✅ 완료
- [x] Next.js 프로젝트 생성
- [x] Google Cloud 프로젝트 + Sheets API 활성화
- [x] Service Account 생성 및 구글 시트 연동
- [x] 기존 엑셀 데이터 구글 시트로 이전

### Phase 2 — 데이터 레이어 ✅ 완료
- [x] 구글 시트 읽기/쓰기/수정/삭제 API 라우트 구현
- [x] 18개 자동계산 수식 서버사이드 JavaScript로 구현
- [x] 구글 시트 연동 레이어
- [x] 타입 정의

### Phase 3 — 거래내역 화면 🚧 진행 중
- [ ] 전체 로트 목록 테이블 `/transactions`
  - 컬럼 그룹별 색상 구분
  - 정산잔액 > 0인 행 강조
- [ ] 신규 입력 폼 `/transactions/new`
  - 15개 입력 필드
  - 실시간 자동계산 미리보기
- [ ] 기존 로트 수정 폼 `/transactions/[id]`
- [ ] 삭제 기능

### Phase 4 — 대시보드 `/dashboard`
- [ ] KPI 카드: 총 매출 / 총 원가 / 총 마진 / 평균 마진율 / 평균 불량률
- [ ] 로트별 마진율 차트 (recharts)
- [ ] 정산잔액 0 아닌 건 강조 표시

### Phase 5 — 인증/마무리
- [ ] 단순 패스워드 로그인 화면 `/`
- [ ] 미들웨어로 인증 보호
- [ ] Vercel 배포

## 환경변수 (.env.local)
```
APP_PASSWORD=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...
GOOGLE_SPREADSHEET_ID=...
```

## 파일 구조
```
sales-dashboard/
├── app/
│   ├── api/
│   │   ├── auth/route.ts
│   │   ├── transactions/route.ts
│   │   ├── transactions/[id]/route.ts
│   │   └── settings/route.ts
│   ├── dashboard/        ← Phase 4
│   ├── transactions/     ← Phase 3
│   │   ├── page.tsx      (목록)
│   │   ├── new/page.tsx  (신규)
│   │   └── [id]/page.tsx (수정)
│   ├── layout.tsx
│   └── page.tsx          (로그인, Phase 5)
├── lib/
│   ├── sheets.ts
│   ├── calculations.ts
│   └── auth.ts
└── types/
    └── transaction.ts
```
