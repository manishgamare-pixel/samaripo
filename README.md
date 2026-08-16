# Samar's IPO Market

A Groww-style educational screener for **mainboard IPOs** that the common retail investor
can actually afford. No SMEs, no high-capital plays — every pick has a retail lot at or
under ~₹15,000, comes with a QIB report and RHP summary, and includes precautionary
(security) guidance.

## What's inside

| Area | Files |
| --- | --- |
| Website (static, Groww-style) | `index.html`, `css/styles.css`, `js/main.js` |
| IPO dataset (edit this daily) | `data/ipos.json` |
| RHP + QIB reports | `reports/*.html` |
| Daily WhatsApp + email alerts | `scripts/daily-report/` |

## Features

- **Dashboard** — filter by status (All / Open / Upcoming / Listed), search by name/sector,
  toggle "lots <= ₹15,000" only.
- **IPO cards** — price band, lot size, minimum outlay, QIB & retail subscription, GMP,
  listing gain, rating and verdict.
- **Detail modal** — subscription bars, RHP highlights, risk factors from the RHP, and a
  precautionary checklist.
- **Reports section** — curated RHP summaries + QIB subscription analysis for all 8 listed
  IPOs (Bajaj Housing Finance, Hyundai Motor India, Swiggy, NTPC Green Energy, Vishal Mega
  Mart, MobiKwik, Sagility India, Unimech Aerospace).
- **Safety section** — the security checklist: apply only via ASBA/UPI, never pay any website,
  money stays blocked in your own account, verify RHP on BSE/NSE, ignore "guaranteed
  allotment" claims, protect credentials, size positions.
- **Daily alerts** — `scripts/daily-report/daily_report.py` sends a daily report by email
  (SMTP); a `--peak --live` mode fetches real prices from the public Yahoo quote API and flags
  any listed IPO trading within 3% of its 52-week high for profit booking. Runs via GitHub
  Actions (`.github/workflows/daily-report.yml`) or VPS cron. `--update-data` fetches live
  prices and writes them into `data/ipos.json` so the website shows current prices and a
  "NEAR PEAK" badge.

## Important

1. **No payment gateway is included, by design.** IPOs in India are applied for via ASBA
   (through your bank) or a UPI mandate in your broker/bank app. The money stays blocked in
   YOUR account until allotment. A website collecting money to "buy IPOs" is a scam pattern;
   this project does not do that.
2. **Data is illustrative.** `data/ipos.json` is a snapshot for demonstration. Update it
   daily from BSE/NSE before running the alert scripts so reports carry live figures.
3. **Alerts need your own keys.** Copy `scripts/daily-report/config.example.env` to `.env`,
   fill in your SMTP and Twilio credentials, then schedule with GitHub Actions (add the keys as
   repository secrets) or with VPS cron via `scripts/daily-report/crontab.example`.

## Run the daily alert

```bash
cd scripts/daily-report
pip install -r requirements.txt
cp config.example.env .env
# edit .env with your keys
python3 daily_report.py          # morning report
python3 daily_report.py --peak --live   # peak alert near market close
```

Cron schedule: `30 2 * * *` (08:00 IST) for the morning report and `45 9 * * *` (15:15 IST)
for the `--peak --live` alert near market close — see `scripts/daily-report/crontab.example`
or use the GitHub Actions workflow with repository secrets.

## Local preview

Serve the folder over HTTP (e.g. `python3 -m http.server 8080`) and open `index.html`.
