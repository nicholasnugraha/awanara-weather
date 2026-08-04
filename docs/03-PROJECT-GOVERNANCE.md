# Project Governance

## Repository

- Baru, public, akun GitHub pribadi.
- Nama yang disarankan: `awanara-weather`.
- `dev`: integration/staging.
- `main`: stable/production.
- Feature branch: `feat/<issue>-<slug>`, `fix/<issue>-<slug>`, `chore/<issue>-<slug>`.

## Branch protection

Untuk `dev` dan `main`:

- require PR;
- require owner approval;
- dismiss stale approval setelah commit baru;
- require conversation resolution;
- require branch up to date;
- require typecheck, lint, unit, build, accessibility smoke, dan E2E smoke;
- block direct/force push dan branch deletion;
- AI/bot tidak boleh bypass;
- prefer squash merge.

`main` hanya menerima release PR dari `dev` setelah staging validation.

## GitHub Project

Views:

- Roadmap per phase;
- Kanban: Backlog → Ready → In Progress → In Review → Owner Approval → Done;
- Bugs;
- Release.

Fields:

- phase;
- priority P0–P3;
- effort XS–XL;
- risk;
- target branch;
- acceptance criteria;
- dependencies;
- owner decision required.

Labels:

`feature`, `bug`, `security`, `accessibility`, `performance`, `api`, `radar`, `design`, `testing`, `documentation`, `blocked`, `needs-owner-decision`.

## Release flow

1. Issue.
2. Feature branch.
3. PR ke `dev`.
4. CI + preview.
5. Agent memberikan review package.
6. Owner review dan approval.
7. Squash merge ke `dev`.
8. Staging smoke/exploratory test.
9. Release PR `dev → main`.
10. Owner review dan approval lagi.
11. Merge ke `main`, production deployment.
12. Verify production, tag, GitHub Release.

Tidak ada automatic merge. Production deployment boleh otomatis hanya setelah approved merge ke `main`.

## Review package wajib

Setiap PR harus memuat:

1. Apa yang berubah.
2. Mengapa perubahan diperlukan.
3. Checklist manual untuk owner.
4. Screenshot/video untuk UI.
5. Test evidence aktual.
6. Preview URL.
7. Dampak quota API/cache.
8. Dampak security/privacy.
9. Known limitations/follow-up.
10. Cara rollback.
