# Personal Scheduling Management

PSM la ung dung Next.js quan ly lich ca nhan, nhac viec va thong bao. Repo nay da duoc bo sung CI/CD voi GitHub Actions va Playwright de chan loi giao dien truoc khi deploy production.

## Yeu cau moi truong

- Node.js 20
- npm 10+
- Playwright Chromium browser cho local E2E

## Cai dat va chay local

```bash
npm ci
copy .env.example .env.local
# hoac tren macOS/Linux:
# cp .env.example .env.local
npx playwright install chromium
npm run dev
```

Mac dinh ung dung dung:

- `NEXT_PUBLIC_PSMS_API_URL=http://localhost:4000/api/v1`
- `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000`
- `PLAYWRIGHT_PORT=3000`

E2E hien tai mock API ngay trong browser, vi vay local va CI khong can dung backend rieng de chay Playwright.

## Scripts chinh

```bash
npm run lint
npm run test
npm run build
npm run test:e2e
npm run test:e2e:ui
```

- `npm run test` chi chay Jest unit/integration va bo qua `tests/e2e`.
- `npm run test:e2e` dung Playwright tren thu muc `tests/e2e`.

## CI/CD da cau hinh

Workflow nam tai `.github/workflows/ci-cd.yml`.

### CI

Khi mo `pull_request` vao `main` hoac `push` len `main`, pipeline se chay:

1. `npm ci`
2. `npm run lint`
3. `npm test`
4. `npm run build`
5. `npm run test:e2e`

Playwright tren CI se:

- build app truoc
- dung `next start` thay vi `next dev`
- retry 2 lan khi fail
- gioi han 1 worker de giam flaky
- upload `playwright-report` va `test-results` lam artifact

### CD

Neu pipeline `push` len `main` thanh cong va da khai bao du 3 secrets Vercel, workflow se deploy production:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Neu chua co secrets, job deploy se tu dong bi skip, CI van chay binh thuong.

## Cach lay thong tin Vercel

1. Dang nhap Vercel CLI: `vercel login`
2. Link project neu chua co: `vercel link`
3. Lay `VERCEL_ORG_ID` va `VERCEL_PROJECT_ID` trong `.vercel/project.json`
4. Tao `VERCEL_TOKEN` tai Vercel dashboard, sau do add vao GitHub repository secrets

## Bien moi truong GitHub Actions

Workflow dang set san bien sau cho luc build/test:

```text
NEXT_PUBLIC_PSMS_API_URL=http://127.0.0.1:4000/api/v1
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000
PLAYWRIGHT_PORT=3000
```

Vi Playwright dang mock request `/api/**`, gia tri API URL trong CI chu yeu de dam bao Next.js build duoc on dinh.

## Mo rong them neu can

- Them preview deployment cho branch khac `main`
- Tach workflow thanh `ci.yml` va `deploy.yml` neu muon quan ly rieng
- Them unit test that su de `npm test` bao phu logic business thay vi chi la sanity check pipeline
