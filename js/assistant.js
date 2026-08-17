(function () {
  "use strict";

  const SUGGESTIONS = [
    "Which IPOs are open?",
    "What is the cheapest lot?",
    "Which is the best rated IPO?",
    "What is GMP?",
    "How do I apply safely?",
    "Which IPOs are near their peak?",
    "Send the report to WhatsApp"
  ];

  const TERMS = {
    asba: "ASBA (Application Supported by Blocked Amount) means the IPO money stays blocked in YOUR bank account until allotment. No money leaves your account unless you get shares - apply through your bank's ASBA facility.",
    upi: "UPI is the standard payment method for mainboard IPO applications. Your bank account is debited only if you get allotment; the amount stays blocked till then.",
    rhp: "RHP (Red Herring Prospectus) is the official SEBI-filed document with the company's financials, risks, objects of the issue and the price band. Always read it on BSE/NSE before applying. Our site links curated QIB + RHP summaries.",
    qib: "QIBs are Qualified Institutional Buyers (mutual funds, FIIs, insurance). Their subscription (e.g. 209x) shows institutional demand. High QIB interest usually signals strong fundamentals, but it is not a guarantee of listing gains.",
    gmp: "GMP (Grey Market Premium) is the unofficial price at which IPO shares trade before listing. It is unregulated speculation, not a guarantee. High GMP can also mean high risk of volatility. Never pay anyone to 'reserve' shares via GMP.",
    lot: "A lot is the minimum number of shares you must apply for. The minimum investment = lot size x upper price band. Our site only tracks mainboard IPOs with affordable lots (around Rs 15,000 or less).",
    allotment: "Allotment is decided by lottery when an IPO is oversubscribed. Retail applicants get 1 lot if selected; your money is unblocked after allotment if not selected. Subscription ratios indicate demand, not guaranteed allotment.",
    band: "The price band is the lower-upper range set by the issuer. You can bid at any price within the band. The minimum amount is calculated at the upper band.",
    listing: "Listing is when the stock starts trading on the exchange (BSE/NSE). Gains vs the issue price are realised at listing. 'Listing gain' shown on our site is the first-trade day move."
  };

  const SAFETY_MSG = [
    "Here is how to apply safely:",
    "* Apply only via ASBA/UPI through your bank or broker - never through a website.",
    "* Your money stays blocked in YOUR account; never transfer it to anyone.",
    "* GMP is unregulated speculation - it is not a guarantee.",
    "* Always read the RHP on BSE/NSE before applying.",
    "* No one can guarantee allotment. Ignore 'guaranteed allotment' offers.",
    "* Do not share your UPI PIN, PAN, or banking OTP with anyone.",
    "* This site is education, not investment advice."
  ].join("\n");

  const HELP_MSG = [
    "I can help you with:",
    "* Specific IPOs - try 'Tell me about Bajaj Housing Finance'",
    "* What's open - 'Which IPOs are open?'",
    "* Recommendations - 'best rated', 'cheapest lot', 'under Rs 15000'",
    "* Live prices - 'which IPO is near its 52-week high?'",
    "* Terms - 'What is GMP?', 'What is RHP?', 'What is ASBA?'",
    "* Safety - 'How do I apply safely?'",
    "* Reports - 'Bajaj QIB report'",
    "* Sharing - 'Send the report to WhatsApp' or 'email me the report'"
  ].join("\n");

  const $ = (sel) => document.querySelector(sel);

  function site() {
    return window.IPOSite || {};
  }
  function data() {
    const d = site().data;
    return Array.isArray(d) ? d : ((d && d.ipos) || []);
  }

  function normalize(q) {
    return q.toLowerCase().replace(/[^\w\s₹]/g, " ").replace(/\s+/g, " ").trim();
  }

  function has(tokens, ...words) {
    return words.some((w) => tokens.includes(w));
  }

  function findIpo(tokens) {
    return data().find((ipo) =>
      ipo.name.toLowerCase().split(/\s+/).some((part) =>
        part.length > 3 && tokens.includes(part)
      )
    );
  }

  function ipoSnapshot(ipo) {
    const siteApi = site();
    const st = siteApi.statusMeta[ipo.status] || siteApi.statusMeta.listed;
    const lines = [];
    lines.push("*" + ipo.name + "*  [" + st.label + "]");
    lines.push("Sector: " + ipo.sector + "  |  " + ipo.exchange);
    lines.push("Price band: " + ipo.priceBand);
    lines.push("Lot size: " + ipo.lotSize + " shares  |  Min invest: " + ipo.minInvestment);
    lines.push("Issue size: " + ipo.issueSize);
    lines.push("Open: " + ipo.dates.open + "  |  Close: " + ipo.dates.close + "  |  Listing: " + ipo.dates.listing);
    lines.push("QIB: " + ipo.qib.subscription + "  |  Retail: " + ipo.retail.subscription);
    lines.push("GMP: " + ipo.gmp + "  |  Verdict: " + ipo.verdict + "  |  Rating: " + "★".repeat(Math.round(ipo.rating)) + "☆".repeat(5 - Math.round(ipo.rating)));
    if (ipo.livePrice != null) {
      lines.push("Live price: " + siteApi.fmtInr(ipo.livePrice) + "  |  52w high: " + siteApi.fmtInr(ipo.high52) + "  |  " + ipo.distancePct + "% below high" + (ipo.nearPeak ? "  (NEAR PEAK)" : ""));
    }
    if (ipo.listingGain && ipo.listingGain !== "TBA") {
      lines.push("Listing gain: " + ipo.listingGain);
    }
    if (ipo.report) {
      lines.push("Report: " + window.location.origin + window.location.pathname.replace(/index\.html$/, "") + ipo.report);
    }
    return lines.join("\n");
  }

  function buildActionLinks(text) {
    const subject = encodeURIComponent("Samar's IPO Market report");
    const body = encodeURIComponent(text);
    return [
      "Share via WhatsApp: https://wa.me/917397939279?text=" + encodeURIComponent(text),
      "Draft email: mailto:manishgamare@gmail.com?subject=" + subject + "&body=" + body
    ].join("\n");
  }

  function fmtIpoList(items, prefix) {
    if (!items.length) return "";
    return items
      .map((i) => "* " + i.name + " | " + i.priceBand + " | Min " + i.minInvestment)
      .join("\n");
  }

  function answer(query) {
    const q = normalize(query);
    const tokens = q.split(/\s+/);
    if (!q) return "";

    const ipo = findIpo(tokens);

    if (ipo && has(tokens, "report", "rhp", "qib")) {
      return ipo.report
        ? "Here is the QIB + RHP summary for " + ipo.name + ":\n" + window.location.origin + window.location.pathname.replace(/index\.html$/, "") + ipo.report
        : "There is no curated report page for " + ipo.name + " yet. Verify the RHP directly on BSE/NSE.";
    }

    if (ipo) {
      return ipoSnapshot(ipo);
    }

    if (has(tokens, "whatsapp", "email", "send", "share", "report", "mail")) {
      const reportText = site().buildReportText ? site().buildReportText() : "";
      if (reportText) {
        return "Here is today's report - tap a link to open it in WhatsApp or your email app:\n\n" + buildActionLinks(reportText);
      }
      return "I could not build the report text right now.";
    }

    if (has(tokens, "term", "meaning", "mean", "define", "explain", "what") && tokens.some((t) => TERMS[t])) {
      const term = tokens.find((t) => TERMS[t]);
      return TERMS[term];
    }
    if (tokens.some((t) => TERMS[t])) {
      const term = tokens.find((t) => TERMS[t]);
      return TERMS[term];
    }

    if (has(tokens, "open", "now", "today")) {
      const open = data().filter((i) => i.status === "open");
      if (open.length) {
        return "Currently open for retail bidding:\n" + fmtIpoList(open);
      }
      const upcoming = data().filter((i) => i.status === "upcoming");
      return upcoming.length
        ? "No mainboard IPO is open right now. Upcoming:\n" + fmtIpoList(upcoming)
        : "No mainboard IPO is currently open for retail bidding.";
    }

    if (has(tokens, "upcoming", "next", "coming")) {
      const upcoming = data().filter((i) => i.status === "upcoming");
      return upcoming.length
        ? "Upcoming IPOs:\n" + fmtIpoList(upcoming)
        : "There are no upcoming IPOs in the tracked list right now.";
    }

    if (has(tokens, "listed", "listing")) {
      const listed = data().filter((i) => i.status === "listed");
      return listed.length
        ? "Listed IPOs we track (all with live prices):\n" + fmtIpoList(listed)
        : "No listed IPOs in the tracked list.";
    }

    if (has(tokens, "cheapest", "cheap", "lowest", "affordable", "low") || (tokens.includes("15000") || tokens.includes("15,000"))) {
      const mins = data()
        .map((i) => ({ ipo: i, n: parseFloat(String(i.minInvestment).replace(/[^\d.]/g, "")) }))
        .filter((x) => !isNaN(x.n))
        .sort((a, b) => a.n - b.n);
      if (!mins.length) return "I could not find minimum investment data.";
      const cheapest = mins[0].ipo;
      return "Cheapest affordable lot: " + cheapest.name + " - " + cheapest.minInvestment + " (lot of " + cheapest.lotSize + " shares).\nAll tracked lots are within reach:\n" + fmtIpoList(mins.map((x) => x.ipo).slice(0, 5));
    }

    if (has(tokens, "best", "top", "recommend", "pick", "rated", "strong")) {
      const byRating = data().slice().sort((a, b) => (b.rating || 0) - (a.rating || 0));
      if (!byRating.length) return "I have no IPO data to rank right now.";
      const best = byRating[0];
      return "My top pick by rating: " + best.name + " (" + best.rating + "/5, verdict " + best.verdict + ").\nCheck the 'Best Picks' section on the site for the full ranking.";
    }

    if (has(tokens, "peak", "near", "52", "high", "live", "price")) {
      const listed = data().filter((i) => i.livePrice != null);
      if (!listed.length) return "No live prices available yet. Run daily_report.py --update-data to refresh.";
      const near = listed.filter((i) => i.nearPeak);
      const lines = [];
      if (near.length) {
        lines.push("Near their 52-week high (watch for profit booking):");
        near.forEach((i) => lines.push("* " + i.name + " - live " + site().fmtInr(i.livePrice) + " | 52w high " + site().fmtInr(i.high52) + " | " + i.distancePct + "% below"));
      } else {
        lines.push("None of the tracked IPOs are near their 52-week high right now. Latest live prices:");
        listed.forEach((i) => lines.push("* " + i.name + " - " + site().fmtInr(i.livePrice)));
      }
      return lines.join("\n");
    }

    if (has(tokens, "safety", "scam", "protect", "secure", "safe", "apply", "how")) {
      return SAFETY_MSG;
    }

    if (has(tokens, "total", "count", "how many")) {
      return "I am tracking " + data().length + " mainboard IPOs on this site.";
    }

    return HELP_MSG;
  }

  function renderMessage(text, from) {
    const list = $("#asmMsgList");
    const div = document.createElement("div");
    div.className = "asm-msg " + (from === "user" ? "user" : "bot");
    div.textContent = text;
    if (from === "bot") {
      const urlRe = /(https?:\/\/[^\s]+)/g;
      if (urlRe.test(text)) {
        div.innerHTML = "";
        let last = 0;
        const re = /(https?:\/\/[^\s]+)/g;
        let m;
        while ((m = re.exec(text)) !== null) {
          if (m.index > last) {
            div.appendChild(document.createTextNode(text.slice(last, m.index)));
          }
          const a = document.createElement("a");
          a.href = m[0];
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = m[0];
          div.appendChild(a);
          last = m.index + m[0].length;
        }
        if (last < text.length) {
          div.appendChild(document.createTextNode(text.slice(last)));
        }
      }
    }
    list.appendChild(div);
    list.scrollTop = list.scrollHeight;
  }

  function renderSuggestions() {
    const wrap = $("#asmSuggestions");
    wrap.innerHTML = "";
    SUGGESTIONS.forEach((s) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "asm-chip";
      chip.textContent = s;
      chip.addEventListener("click", () => ask(s));
      wrap.appendChild(chip);
    });
  }

  function ask(text) {
    const input = $("#asmInput");
    input.value = "";
    renderMessage(text, "user");
    const typing = document.createElement("div");
    typing.className = "asm-msg bot typing";
    typing.textContent = "Samar is typing…";
    $("#asmMsgList").appendChild(typing);
    setTimeout(() => {
      typing.remove();
      renderMessage(answer(text), "bot");
      renderSuggestions();
    }, 450 + Math.random() * 400);
  }

  function initWidget() {
    const host = $("#assistantHost");
    if (!host || !window.IPOSite) return;

    host.innerHTML = `
      <button class="asm-toggle" id="asmToggle" type="button" aria-label="Ask Samar">
        <span class="asm-toggle-icon">?</span>
      </button>
      <div class="asm-panel" id="asmPanel" hidden>
        <div class="asm-head">
          <strong>Samar — IPO Assistant</strong>
          <button type="button" id="asmClose" aria-label="Close">×</button>
        </div>
        <div class="asm-msg-list" id="asmMsgList">
          <div class="asm-msg bot">Hi! I am Samar. Ask me about the IPOs on this site - open issues, cheapest lots, GMP, live prices, safety, or send today's report to WhatsApp or email.</div>
        </div>
        <div class="asm-suggestions" id="asmSuggestions"></div>
        <form class="asm-form" id="asmForm">
          <input id="asmInput" type="text" placeholder="Ask about IPOs…" autocomplete="off" aria-label="Ask about IPOs" />
          <button type="submit" aria-label="Send">➤</button>
        </form>
      </div>`;

    const panel = $("#asmPanel");
    const toggle = $("#asmToggle");
    const close = $("#asmClose");
    const form = $("#asmForm");

    toggle.addEventListener("click", () => {
      const opening = panel.hidden;
      panel.hidden = !opening;
      if (opening) {
        renderSuggestions();
        $("#asmInput").focus();
      }
    });
    close.addEventListener("click", () => { panel.hidden = true; });
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const v = $("#asmInput").value.trim();
      if (v) ask(v);
    });
  }

  function boot() {
    const host = $("#assistantHost");
    if (!host) return;
    initWidget();
    if (!window.IPOSite) {
      const interval = setInterval(() => {
        if (window.IPOSite) {
          clearInterval(interval);
          initWidget();
        }
      }, 300);
      setTimeout(() => clearInterval(interval), 8000);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  window.IPOSiteAssistant = { answer: answer, data: data };
})();
