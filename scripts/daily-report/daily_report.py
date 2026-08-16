#!/usr/bin/env python3
"""
Samar's IPO Market - Daily Report generator and sender.

Reads ../../data/ipos.json, builds a short report, and sends it by email (SMTP).
Intended to be run daily by cron:
    0 8 * * *  cd /path/to/project/scripts/daily-report && python3 daily_report.py
For "peak" alerts, add a second run near market close:
    0 15 * * * cd /path/to/project/scripts/daily-report && python3 daily_report.py --peak --live

Extra modes:
    --update-data   fetch live prices for listed IPOs and write them into
                    ../../data/ipos.json (the website then shows them).

Requirements: pip install -r requirements.txt
Config: copy config.example.env to .env and fill in YOUR OWN credentials.
"""

import json
import os
import sys
import smtplib
from datetime import date
from email.message import EmailMessage
from email.utils import formataddr

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

PROJECT_ROOT = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_FILE = os.path.join(PROJECT_ROOT, "data", "ipos.json")


def load_data():
    with open(DATA_FILE, "r", encoding="utf-8") as fh:
        return json.load(fh)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def format_inr(value):
    return "₹" + str(value)


def update_live_prices(data):
    """Fetch live prices and write them into data/ipos.json for the website."""
    from datetime import datetime

    ipos = data.get("ipos", [])
    live = fetch_live_prices(ipos)
    for ipo in ipos:
        info = live.get(ipo["id"])
        if info:
            ipo["livePrice"] = info["price"]
            ipo["high52"] = info["high52"]
            ipo["distancePct"] = info["distance_pct"]
            ipo["nearPeak"] = info["distance_pct"] <= NEAR_PEAK_PCT
    data["pricesUpdatedOn"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    save_data(data)
    return len(live)


NEAR_PEAK_PCT = 3.0


def fetch_live_prices(ipos):
    """Fetch current price and 52-week high for listed IPOs from Yahoo Finance."""
    import requests

    prices = {}
    for ipo in ipos:
        symbol = ipo.get("symbol")
        if ipo["status"] != "listed" or not symbol:
            continue
        try:
            resp = requests.get(
                "https://query1.finance.yahoo.com/v8/finance/chart/" + symbol,
                params={"range": "1y", "interval": "1d"},
                headers={"User-Agent": "Mozilla/5.0 (SamarsIPOMarket)"},
                timeout=15,
            )
            resp.raise_for_status()
            meta = resp.json()["chart"]["result"][0]["meta"]
            price = meta.get("regularMarketPrice")
            high = meta.get("fiftyTwoWeekHigh")
            if price is None or high is None:
                continue
            prices[ipo["id"]] = {
                "price": float(price),
                "high52": float(high),
                "distance_pct": round((float(high) - float(price)) / float(high) * 100, 1),
            }
        except Exception as exc:
            print("[live] failed for", symbol, ":", exc)
    return prices


def build_report(data, peak_mode=False, live_prices=None):
    today = date.today().isoformat()
    ipos = data.get("ipos", [])
    open_ips = [i for i in ipos if i["status"] == "open"]
    upcoming = [i for i in ipos if i["status"] == "upcoming"]
    listed = [i for i in ipos if i["status"] == "listed"]

    lines = []
    lines.append("SAMAR'S IPO MARKET - DAILY REPORT")
    lines.append("Generated on: " + today)
    lines.append("=" * 46)

    if peak_mode:
        lines.append("\n-- PEAK / EXIT ALERT --")
        near = []
        if live_prices:
            for ipo in listed:
                info = live_prices.get(ipo["id"])
                if not info:
                    continue
                flag = info["distance_pct"] <= NEAR_PEAK_PCT
                mark = "NEAR PEAK" if flag else "off-high"
                lines.append(
                    "* {name}: current {price} | 52w high {high} | {dist}% below high | {mark}"
                    .format(
                        name=ipo["name"],
                        price="INR " + format(info["price"], ",.2f"),
                        high="INR " + format(info["high52"], ",.2f"),
                        dist=info["distance_pct"],
                        mark=mark,
                    )
                )
                if flag:
                    near.append(ipo["name"])
            if not near:
                lines.append("* None of the tracked IPOs are currently near their 52-week high.")
        else:
            for ipo in listed:
                gain = ipo.get("listingGain", "TBA")
                if isinstance(gain, str) and gain.startswith("+"):
                    lines.append(
                        "* {name}: listed {gain}, watch for profit booking near highs."
                        .format(name=ipo["name"], gain=gain)
                    )
        if not listed:
            lines.append("* No listed IPOs to monitor.")
        lines.append("Reminder: sell rules are personal. Never chase peaks.")
    else:
        if open_ips:
            lines.append("\n-- OPEN NOW --")
            for ipo in open_ips:
                lines.append("")
                lines.append("  * " + ipo["name"])
                lines.append("    Band: " + ipo["priceBand"])
                lines.append("    Lot: " + str(ipo["lotSize"]) + " shares | Min: " + ipo["minInvestment"])
                lines.append("    QIB: " + ipo["qib"]["subscription"] + " | Retail: " + ipo["retail"]["subscription"])
                lines.append("    Close: " + ipo["dates"]["close"])
                lines.append("    Verdict: " + ipo["verdict"])
                if ipo.get("report"):
                    lines.append("    Report: " + ipo["report"])
        else:
            lines.append("\n-- OPEN NOW --")
            lines.append("  * No mainboard IPO is currently open for retail bidding.")

        if upcoming:
            lines.append("\n-- UPCOMING --")
            for ipo in upcoming:
                lines.append(
                    "  * {name} | {band} | Min {mininv}"
                    .format(name=ipo["name"], band=ipo["priceBand"], mininv=ipo["minInvestment"])
                )

        lines.append("\n-- SAFETY REMINDER --")
        lines.append("  * Apply only via ASBA/UPI through your bank or broker.")
        lines.append("  * Money stays blocked in YOUR account, never transfer to a website.")
        lines.append("  * GMP is unregulated speculation - not a guarantee.")
        lines.append("  * This is education, not investment advice.")

    lines.append("\n" + "=" * 46)
    lines.append("Disclaimer: data is illustrative. Verify on BSE/NSE before acting.")
    return "\n".join(lines)


def send_email(subject, body):
    host = os.getenv("USER_SMTP_HOST")
    port = int(os.getenv("USER_SMTP_PORT", "587"))
    user = os.getenv("USER_SMTP_USER")
    password = os.getenv("USER_SMTP_PASSWORD")
    to = os.getenv("USER_MAIL_TO")
    if not all([host, user, password, to]):
        print("[email] missing config (USER_SMTP_* / USER_MAIL_TO), skipping.")
        return False
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = formataddr(("Samar's IPO Market", user))
        msg["To"] = to
        msg.set_content(body)
        with smtplib.SMTP(host, port, timeout=30) as server:
            server.ehlo()
            if port == 587:
                server.starttls()
            server.login(user, password)
            server.send_message(msg)
        print("[email] sent to", to)
        return True
    except smtplib.SMTPAuthenticationError:
        print("[email] AUTH FAILED - check USER_SMTP_USER / USER_SMTP_PASSWORD (use a Gmail App Password).")
    except Exception as exc:
        print("[email] SEND FAILED:", exc)
    return False


def send_whatsapp(body):
    print("[whatsapp] automation removed by request - use the site's Send-on-WhatsApp box instead.")
    return False


def main():
    if "--update-data" in sys.argv:
        data = load_data()
        updated = update_live_prices(data)
        print("Updated live prices for", updated, "listed IPOs ->", DATA_FILE)
        return
    peak_mode = "--peak" in sys.argv
    use_live = "--live" in sys.argv
    data = load_data()
    live_prices = None
    if peak_mode and use_live:
        live_prices = fetch_live_prices(data.get("ipos", []))
    report = build_report(data, peak_mode=peak_mode, live_prices=live_prices)
    print(report)
    print()
    subject = "Samar's IPO Market - " + ("Peak Alert " if peak_mode else "") + date.today().isoformat()
    send_email(subject, report)
    send_whatsapp(report)


if __name__ == "__main__":
    main()
