(() => {
  "use strict";

  const FALLBACK = {
    generatedOn: "2026-08-15",
    ipos: [
      { id: "bajaj-housing-finance", name: "Bajaj Housing Finance", sector: "Housing Finance", exchange: "NSE | BSE", status: "listed", priceBand: "₹66 – ₹70", lotSize: 213, minInvestment: "₹14,910", issueSize: "₹6,560 Cr", dates: { open: "2024-09-09", close: "2024-09-11", listing: "2024-09-20" }, qib: { subscription: "209.04x" }, retail: { subscription: "11.14x" }, gmp: "₹95", listingGain: "+114%", rating: 4.5, verdict: "Strong", tags: ["Affordable lot", "Housing", "High GMP"], highlights: [], risks: [], whyAffordable: "", report: "reports/bajaj-housing-rhp-qib.html" },
      { id: "hyundai-motor-india", name: "Hyundai Motor India", sector: "Automobiles", exchange: "NSE | BSE", status: "listed", priceBand: "₹1,865 – ₹1,960", lotSize: 7, minInvestment: "₹13,720", issueSize: "₹27,870 Cr", dates: { open: "2024-10-15", close: "2024-10-17", listing: "2024-10-22" }, qib: { subscription: "0.73x" }, retail: { subscription: "0.52x" }, gmp: "₹30", listingGain: "-1%", rating: 3.0, verdict: "Neutral", tags: ["Large-cap"], highlights: [], risks: [], whyAffordable: "", report: "reports/hyundai-motor-rhp-qib.html" },
      { id: "swiggy", name: "Swiggy", sector: "Internet / Q-Commerce", exchange: "NSE | BSE", status: "listed", priceBand: "₹371 – ₹390", lotSize: 38, minInvestment: "₹14,820", issueSize: "₹11,327 Cr", dates: { open: "2024-11-06", close: "2024-11-08", listing: "2024-11-13" }, qib: { subscription: "4.19x" }, retail: { subscription: "1.48x" }, gmp: "₹18", listingGain: "+5%", rating: 3.5, verdict: "Moderate", tags: ["Consumer tech"], highlights: [], risks: [], whyAffordable: "", report: "reports/swiggy-rhp-qib.html" },
      { id: "ntpc-green-energy", name: "NTPC Green Energy", sector: "Renewable Energy", exchange: "NSE | BSE", status: "listed", priceBand: "₹102 – ₹108", lotSize: 138, minInvestment: "₹14,904", issueSize: "₹10,000 Cr", dates: { open: "2024-11-19", close: "2024-11-21", listing: "2024-11-27" }, qib: { subscription: "1.27x" }, retail: { subscription: "4.13x" }, gmp: "₹7", listingGain: "+3%", rating: 3.5, verdict: "Moderate", tags: ["Green energy"], highlights: [], risks: [], whyAffordable: "", report: "reports/ntpc-green-rhp-qib.html" },
      { id: "mobikwik", name: "MobiKwik", sector: "Fintech", exchange: "NSE | BSE", status: "listed", priceBand: "₹265 – ₹279", lotSize: 53, minInvestment: "₹14,787", issueSize: "₹572 Cr", dates: { open: "2024-12-11", close: "2024-12-13", listing: "2024-12-18" }, qib: { subscription: "82.92x" }, retail: { subscription: "104.43x" }, gmp: "₹80", listingGain: "+87%", rating: 3.5, verdict: "Speculative", tags: ["Fintech"], highlights: [], risks: [], whyAffordable: "", report: null },
      { id: "avanse-financial", name: "Avanse Financial Services", sector: "Education Finance", exchange: "NSE | BSE", status: "upcoming", priceBand: "Expected ₹515 – ₹540", lotSize: 27, minInvestment: "Approx ₹14,580", issueSize: "Approx ₹3,500 Cr", dates: { open: "TBA", close: "TBA", listing: "TBA" }, qib: { subscription: "TBA" }, retail: { subscription: "TBA" }, gmp: "TBA", listingGain: "TBA", rating: 3.5, verdict: "Watch", tags: ["Education loans", "Illustrative"], highlights: [], risks: [], whyAffordable: "", report: null }
    ]
  };

  let data = [];
  let statusFilter = "all";
  let affordableOnly = true;

  const $ = (sel) => document.querySelector(sel);

  const statusMeta = {
    listed: { cls: "status-listed", label: "Listed" },
    open: { cls: "status-open", label: "Open" },
    upcoming: { cls: "status-upcoming", label: "Upcoming" }
  };

  function logoColor(name) {
    const hash = Array.from(name).reduce((a, c) => a + c.charCodeAt(0), 0);
    const hue = hash % 360;
    return `linear-gradient(135deg, hsl(${hue},60%,45%), hsl(${(hue + 40) % 360},60%,35%))`;
  }

  function stars(rating) {
    const full = Math.round(rating);
    return "★".repeat(full) + "☆".repeat(5 - full);
  }

  function fmtInr(n) {
    return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }

  function liveBlock(ipo) {
    if (ipo.livePrice == null) return "";
    return `
      <div><span class="k">Live price</span><span class="v">${fmtInr(ipo.livePrice)}</span></div>
      <div><span class="k">52w high</span><span class="v">${fmtInr(ipo.high52)}</span></div>
      <div><span class="k">vs high</span><span class="v">${ipo.distancePct}% below</span></div>`;
  }

  function cardHtml(ipo) {
    const st = statusMeta[ipo.status] || statusMeta.listed;
    const gain = ipo.listingGain && ipo.listingGain !== "TBA" ? `<div class="v"><span>Listing</span> ${ipo.listingGain}</div>` : "";
    return `
      <article class="ipo-card" data-id="${ipo.id}" role="button" tabindex="0">
        <div class="card-top">
          <div class="card-logo" style="background:${logoColor(ipo.name)}">${ipo.name.charAt(0)}</div>
          <div class="card-title">
            <h3>${ipo.name}</h3>
            <div class="sector">${ipo.sector} · ${ipo.exchange}</div>
          </div>
          <span class="status-pill ${st.cls}">${st.label}</span>
        </div>
        <div class="rating" title="Rating ${ipo.rating}/5">${stars(ipo.rating)}</div>
        <div class="kv">
          <div><span class="k">Price band</span><span class="v">${ipo.priceBand}</span></div>
          <div><span class="k">Lot size</span><span class="v">${ipo.lotSize} sh</span></div>
          <div><span class="k">Min. invest</span><span class="v">${ipo.minInvestment}</span></div>
          <div><span class="k">QIB</span><span class="v">${ipo.qib.subscription}</span></div>
          <div><span class="k">Retail</span><span class="v">${ipo.retail.subscription}</span></div>
          <div><span class="k">GMP</span><span class="v">${ipo.gmp}</span></div>
          ${liveBlock(ipo)}
          ${gain}
        </div>
        <div class="tags">
          ${ipo.tags.map((t) => `<span class="tag">${t}</span>`).join("")}
          ${ipo.nearPeak ? `<span class="tag tag-peak">NEAR PEAK</span>` : ""}
        </div>
        <div class="card-actions">
          <button class="btn btn-primary" data-action="details">Details</button>
          ${ipo.report ? `<a class="btn" href="${ipo.report}" target="_blank" rel="noopener">QIB + RHP</a>` : ""}
        </div>
      </article>`;
  }

  function renderGrid() {
    const q = ($("#searchInput").value || "").trim().toLowerCase();
    let items = data.filter((ipo) => {
      if (statusFilter !== "all" && ipo.status !== statusFilter) return false;
      if (affordableOnly && !isAffordable(ipo)) return false;
      if (q) {
        const hay = `${ipo.name} ${ipo.sector} ${ipo.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    $("#ipoGrid").innerHTML = items.map(cardHtml).join("");
    $("#emptyState").hidden = items.length > 0;
  }

  function isAffordable(ipo) {
    const m = String(ipo.minInvestment).replace(/[^\d.]/g, "");
    if (!m) return true;
    return parseFloat(m) <= 15000;
  }

  function renderStats() {
    const open = data.filter((i) => i.status === "open" || i.status === "upcoming").length;
    const mins = data.map((i) => parseFloat(String(i.minInvestment).replace(/[^\d.]/g, ""))).filter((n) => !isNaN(n));
    const min = mins.length ? Math.min(...mins) : 0;
    const gmpVals = data
      .map((i) => (i.status === "listed" ? parseFloat(String(i.gmp).replace(/[^\d.]/g, "")) : null))
      .filter((n) => n !== null && !isNaN(n));
    $("#statTotal").textContent = data.length;
    $("#statOpen").textContent = open;
    $("#statMin").textContent = "₹" + min.toLocaleString("en-IN");
    $("#statGmp").textContent = gmpVals.length ? "₹" + Math.max(...gmpVals).toLocaleString("en-IN") : "–";
    const pricesNote = data.pricesUpdatedOn ? ` · Live prices ${data.pricesUpdatedOn}` : "";
    $("#dataNote").textContent = `Data as of ${data.generatedOn || "today"}${pricesNote} · Illustrative — verify on BSE/NSE`;
  }

  function scoreIpo(ipo) {
    const verdictScore = { Strong: 40, Moderate: 30, Speculative: 30, Watch: 25, Neutral: 20 }[ipo.verdict] || 20;
    const ratingScore = (ipo.rating || 0) * 6;
    const gmp = parseFloat(String(ipo.gmp || "").replace(/[^\d.]/g, "")) || 0;
    const gmpScore = Math.min(15, gmp / 10);
    const retail = parseFloat(String(ipo.retail.subscription || "0").replace("x", "")) || 0;
    const retailScore = Math.min(18, retail / 4);
    return verdictScore + ratingScore + gmpScore + retailScore;
  }

  function renderPicks() {
    const picks = data
      .slice()
      .sort((a, b) => scoreIpo(b) - scoreIpo(a))
      .slice(0, 4);
    $("#picksNote").textContent = `Ranked as of ${data.generatedOn || "today"}`;
    $("#picksGrid").innerHTML = picks
      .map(
        (ipo, idx) => `
        <article class="pick-card" data-id="${ipo.id}">
          <div class="pick-rank">#${idx + 1}</div>
          <div class="pick-logo" style="background:${logoColor(ipo.name)}">${ipo.name.charAt(0)}</div>
          <div class="pick-body">
            <h3>${ipo.name}</h3>
            <div class="sector">${ipo.sector}</div>
            <div class="pick-meta">
              <span><b>Min:</b> ${ipo.minInvestment}</span>
              <span><b>Verdict:</b> ${ipo.verdict}</span>
              <span><b>GMP:</b> ${ipo.gmp}</span>
              <span><b>Retail:</b> ${ipo.retail.subscription}</span>
              ${ipo.livePrice != null ? `<span><b>Live:</b> ${fmtInr(ipo.livePrice)}</span>` : ""}
              ${ipo.nearPeak ? `<span class="tag tag-peak">NEAR PEAK</span>` : ""}
            </div>
            <p class="pick-why">${ipo.whyAffordable || ""}</p>
            <button class="btn btn-primary" data-action="details">Details</button>
          </div>
        </article>`
      )
      .join("");
  }

  function buildReportText() {
    const today = new Date().toISOString().slice(0, 10);
    const open = data.filter((i) => i.status === "open");
    const upcoming = data.filter((i) => i.status === "upcoming");
    const listed = data.filter((i) => i.status === "listed");
    const lines = [];
    lines.push("SAMAR'S IPO MARKET - DAILY REPORT");
    lines.push("Generated on: " + today);
    lines.push("=".repeat(46));
    lines.push("");
    lines.push("-- OPEN NOW --");
    if (open.length) {
      open.forEach((i) => {
        lines.push("* " + i.name);
        lines.push("  Band: " + i.priceBand + " | Lot " + i.lotSize + " (" + i.minInvestment + ")");
        lines.push("  QIB: " + i.qib.subscription + " | Retail: " + i.retail.subscription + " | Close: " + i.dates.close);
        lines.push("  Verdict: " + i.verdict);
      });
    } else {
      lines.push("* No mainboard IPO is currently open for retail bidding.");
    }
    lines.push("");
    lines.push("-- UPCOMING --");
    if (upcoming.length) {
      upcoming.forEach((i) => {
        lines.push("* " + i.name + " | " + i.priceBand + " | Min " + i.minInvestment);
      });
    } else {
      lines.push("* None.");
    }
    lines.push("");
    lines.push("-- PEAK STATUS (live prices) --");
    const liveListed = listed.filter((i) => i.livePrice != null);
    if (liveListed.length) {
      liveListed.forEach((i) => {
        const mark = i.nearPeak ? "NEAR PEAK - consider profit booking" : "off-high";
        lines.push("* " + i.name + ": live " + fmtInr(i.livePrice) + " | 52w high " + fmtInr(i.high52) + " | " + i.distancePct + "% below | " + mark);
      });
    } else {
      lines.push("* No live prices available. Run daily_report.py --update-data to refresh.");
    }
    lines.push("");
    lines.push("-- SAFETY REMINDER --");
    lines.push("* Apply only via ASBA/UPI through your bank or broker.");
    lines.push("* Money stays blocked in YOUR account, never transfer to a website.");
    lines.push("* GMP is unregulated speculation - not a guarantee.");
    lines.push("* This is education, not investment advice.");
    lines.push("");
    lines.push("=".repeat(46));
    lines.push("Disclaimer: data is illustrative. Verify on BSE/NSE before acting.");
    return lines.join("\n");
  }

  function initShareBox() {
    const textarea = $("#shareText");
    if (!textarea) return;
    textarea.value = buildReportText();
    const status = $("#shareStatus");

    $("#sendWhatsApp").addEventListener("click", () => {
      const text = textarea.value.trim();
      if (!text) return;
      window.open("https://wa.me/917397939279?text=" + encodeURIComponent(text), "_blank", "noopener");
      status.textContent = "WhatsApp opened with the report ready - just press send.";
    });

    $("#draftEmail").addEventListener("click", () => {
      const text = textarea.value.trim();
      const subject = encodeURIComponent("Samar's IPO Market report");
      const body = encodeURIComponent(text);
      window.open("mailto:manishgamare@gmail.com?subject=" + subject + "&body=" + body, "_blank");
      status.textContent = "Email draft opened in your mail app.";
    });

    $("#copyReport").addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        status.textContent = "Report copied to clipboard.";
      } catch (err) {
        status.textContent = "Copy failed - select the text manually.";
      }
    });
  }

  function renderReports() {
    const withReports = data.filter((i) => i.report);
    $("#reportList").innerHTML = withReports
      .map(
        (i) => `
        <div class="report-item">
          <h3>${i.name}</h3>
          <span class="doc">RHP summary + QIB subscription analysis · ${i.issueSize} issue</span>
          <a href="${i.report}" target="_blank" rel="noopener">Open report →</a>
        </div>`
      )
      .join("");
  }

  function modalHtml(ipo) {
    const st = statusMeta[ipo.status] || statusMeta.listed;
    const verdictClass =
      { Strong: "v-strong", Moderate: "v-moderate", Watch: "v-watch", Neutral: "v-neutral", Speculative: "v-speculative" }[
        ipo.verdict
      ] || "v-watch";
    const bars = [
      { label: "QIB subscription", value: ipo.qib.subscription },
      { label: "Retail subscription", value: ipo.retail.subscription }
    ];
    const pct = (v) => {
      const n = parseFloat(String(v).replace("x", ""));
      if (isNaN(n)) return 5;
      return Math.min(100, Math.max(4, n * 2.5));
    };
    return `
      <span class="status-pill ${st.cls}">${st.label}</span>
      <h2>${ipo.name}</h2>
      <div class="sub">${ipo.sector} · ${ipo.exchange}</div>
      <div class="rating" title="Rating ${ipo.rating}/5">${stars(ipo.rating)} <span class="verdict-tag ${verdictClass}">${ipo.verdict}</span></div>

      <section class="metric-line">
        <div class="metric-box"><div class="k">Price band</div><div class="v">${ipo.priceBand}</div></div>
        <div class="metric-box"><div class="k">Lot / Min invest</div><div class="v">${ipo.lotSize} sh · ${ipo.minInvestment}</div></div>
        <div class="metric-box"><div class="k">Issue size</div><div class="v">${ipo.issueSize}</div></div>
        <div class="metric-box"><div class="k">GMP</div><div class="v">${ipo.gmp}</div></div>
        <div class="metric-box"><div class="k">Open → Close</div><div class="v">${ipo.dates.open} → ${ipo.dates.close}</div></div>
        <div class="metric-box"><div class="k">Listing</div><div class="v">${ipo.dates.listing} · ${ipo.listingGain}</div></div>
        ${ipo.livePrice != null
          ? `<div class="metric-box"><div class="k">Live price</div><div class="v">${fmtInr(ipo.livePrice)}</div></div>
             <div class="metric-box"><div class="k">52-week high</div><div class="v">${fmtInr(ipo.high52)}</div></div>`
          : ""}
      </section>

      <section>
        <h4>Subscription (${ipo.qib.bookedAsOn || "final"})</h4>
        <div class="sub-bars">
          ${bars
            .map(
              (b) => `
              <div class="sub-bar">
                <div class="bar-label"><span>${b.label}</span><span class="v">${b.value}</span></div>
                <div class="track"><div class="fill" style="width:${pct(b.value)}%"></div></div>
              </div>`
            )
            .join("")}
        </div>
      </section>

      <section>
        <h4>Why this qualifies as affordable for the common investor</h4>
        <p class="muted">${ipo.whyAffordable || "Retail lot keeps the minimum outlay near or under ₹15,000."}</p>
      </section>

      <section>
        <h4>Key highlights</h4>
        <ul>${ipo.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
      </section>

      <section>
        <h4>Risk factors (from the RHP)</h4>
        <ul>${ipo.risks.map((r) => `<li>${r}</li>`).join("")}</ul>
      </section>

      <section>
        <h4>Precautionary checklist</h4>
        <ul>
          <li>Read the full RHP on BSE/NSE before applying.</li>
          <li>Apply via ASBA/UPI through your own bank or broker — never through any website.</li>
          <li>Money stays blocked in your account until allotment; it is never transferred to a third party.</li>
          <li>GMP is unregulated speculation, not a guaranteed listing gain.</li>
          <li>This is education, not investment advice.</li>
        </ul>
      </section>

      ${ipo.report ? `<p><a class="btn btn-primary" href="${ipo.report}" target="_blank" rel="noopener">View QIB + RHP report →</a></p>` : ""}
    `;
  }

  function openModal(id) {
    const ipo = data.find((i) => i.id === id);
    if (!ipo) return;
    $("#modalBody").innerHTML = modalHtml(ipo);
    $("#modalBackdrop").style.display = "grid";
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    $("#modalBackdrop").style.display = "none";
    document.body.style.overflow = "";
  }

  function setupEvents() {
    $("#filters").addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");
      statusFilter = chip.dataset.status;
      renderGrid();
    });

    $("#affordableOnly").addEventListener("change", (e) => {
      affordableOnly = e.target.checked;
      renderGrid();
    });

    $("#searchForm").addEventListener("submit", (e) => {
      e.preventDefault();
      renderGrid();
    });
    $("#searchInput").addEventListener("input", renderGrid);

    $("#ipoGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='details']");
      const card = e.target.closest(".ipo-card");
      if (btn && card) {
        e.stopPropagation();
        openModal(card.dataset.id);
      } else if (card && !e.target.closest("a")) {
        openModal(card.dataset.id);
      }
    });
    $("#ipoGrid").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.classList.contains("ipo-card")) openModal(e.target.dataset.id);
    });

    $("#picksGrid").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action='details']");
      const card = e.target.closest(".pick-card");
      if (btn && card) {
        e.stopPropagation();
        openModal(card.dataset.id);
      }
    });
    $("#picksGrid").addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.classList.contains("pick-card")) openModal(e.target.dataset.id);
    });

    $("#modalClose").addEventListener("click", closeModal);
    $("#modalBackdrop").addEventListener("click", (e) => {
      if (e.target === $("#modalBackdrop")) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal();
    });

    $("#navToggle").addEventListener("click", () => $("#nav").classList.toggle("open"));
  }

  async function init() {
    setupEvents();
    try {
      const res = await fetch("data/ipos.json", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      data = await res.json();
    } catch (err) {
      data = FALLBACK;
    }
    data.generatedOn = data.generatedOn || FALLBACK.generatedOn;
    renderStats();
    renderPicks();
    renderGrid();
    renderReports();
    initShareBox();
  }

  init();
})();
