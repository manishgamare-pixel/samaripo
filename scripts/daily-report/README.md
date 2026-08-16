# Daily Report Alert System

Sends a daily IPO report to a WhatsApp number and an email address. The script reads
`../../data/ipos.json` (the same dataset the website uses), builds a plain-text report,
and delivers it via **Twilio (WhatsApp Business API)** and **SMTP (email)**.

## Modes

| Command | When | What it sends |
| --- | --- | --- |
| `python3 daily_report.py` | Daily morning | Open IPOs, subscription, safety tips |
| `python3 daily_report.py --peak --live` | Market close | **Live prices** of all listed IPOs with distance from their 52-week high; flags any IPO within 3% of its high as "NEAR PEAK" (profit-booking signal) |

Live prices come from the public Yahoo Finance quote endpoint using each IPO's NSE symbol
(stored in `data/ipos.json`). If the network or a symbol fails, the script degrades gracefully.

## Local setup

```bash
cd scripts/daily-report
pip install -r requirements.txt
cp config.example.env .env
# Edit .env and fill in YOUR OWN credentials:
#   Email: USER_MAIL_TO, USER_SMTP_HOST, USER_SMTP_PORT, USER_SMTP_USER, USER_SMTP_PASSWORD
#   WhatsApp: USER_WHATSAPP_TO, USER_TWILIO_ACCOUNT_SID, USER_TWILIO_AUTH_TOKEN, USER_TWILIO_FROM
```

The `.env` file holds your private keys. It is git-ignored (`**/.env`) and must never be
committed.

```bash
# Test the morning report
python3 daily_report.py

# Test the peak alert
python3 daily_report.py --peak --live
```

## Option A - GitHub Actions (no server needed)

1. Push this repository to GitHub.
2. In repo **Settings → Secrets and variables → Actions**, add each key:
   - `USER_MAIL_TO`, `USER_SMTP_HOST`, `USER_SMTP_PORT`, `USER_SMTP_USER`, `USER_SMTP_PASSWORD`
   - `USER_WHATSAPP_TO`, `USER_TWILIO_ACCOUNT_SID`, `USER_TWILIO_AUTH_TOKEN`, `USER_TWILIO_FROM`
3. The workflow `.github/workflows/daily-report.yml` runs automatically:
   - 08:00 IST - morning report
   - 15:15 IST - peak alert (`--peak --live`)
   - You can also trigger it manually via the Actions tab.

## Option B - VPS / cron

1. Clone the repo on a server and complete the local setup above.
2. Add the cron lines from `crontab.example` (edit the path):

```
# Morning report at 08:00 IST (= 02:30 UTC)
30 2 * * * /path/to/scripts/daily-report/run_daily.sh morning >> /var/log/samar_ipo_report.log 2>&1

# Peak alert near market close at 15:15 IST (= 09:45 UTC)
45 9 * * * /path/to/scripts/daily-report/run_daily.sh peak >> /var/log/samar_ipo_report.log 2>&1
```

The `run_daily.sh` wrapper loads `.env` and runs the correct mode.

## Troubleshooting

- **Error 21654 "ContentSid Required"** — new Twilio accounts must send WhatsApp messages
  through an approved **content template**. In the Twilio Console create a WhatsApp template
  (Messaging → Content Editor → Templates) with body `Samar IPO {{1}}`, wait for approval,
  then set `USER_TWILIO_CONTENT_SID` to its SID (starts with `HX`). The script passes the whole
  report as variable `1`.
- **Trial account limits** — a Trial account can only message numbers you have **verified** in
  the console, and template creation via the API is disabled. Verify the recipient number
  (`+91 7397939279`) under Phone Numbers → Verified Numbers. Upgrading the account removes
  these limits and lets the script create the template automatically.
- **Sandbox opt-in** — if using the Twilio WhatsApp sandbox sender, the recipient WhatsApp
  must first send a message to the sandbox number to opt in.

## Note on data freshness

`data/ipos.json` is a static, illustrative snapshot. Live **prices** are fetched at run time,
but the IPO list, bands and subscription figures come from the file — refresh it from BSE/NSE
(daily, or before a fresh IPO window opens) for accurate morning reports.
