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
  let activeSegment = "mainline";

  const $ = (sel) => document.querySelector(sel);

  const statusMeta = {
    listed: { cls: "status-listed", label: "Listed" },
    open: { cls: "status-open", label: "Open" },
    upcoming: { cls: "status-upcoming", label: "Upcoming" },
    closed: { cls: "status-closed", label: "Closed" }
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
          ${ipo.sample ? `<span class="tag tag-sample">SAMPLE</span>` : ""}
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
      if (ipo.segment !== activeSegment) return false;
      if (statusFilter !== "all" && ipo.status !== statusFilter) return false;
      if (affordableOnly && !isAffordable(ipo)) return false;
      if (q) {
        const hay = `${ipo.name} ${ipo.sector} ${ipo.tags.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      } else if (statusFilter !== "listed" && statusFilter !== "closed" && isArchived(ipo)) {
        return false;
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

  function isArchived(ipo) {
    return ipo.status === "listed" || ipo.status === "closed";
  }

  function visibleIpos() {
    return data.filter((i) => i.segment === activeSegment && !isArchived(i));
  }

  function visibleFor(segment) {
    return data.filter((i) => i.segment === segment && !isArchived(i));
  }

  function totalSubscription(sub, overrides) {
    if (!sub || !sub.qib || !sub.nii || !sub.rii) return null;
    const w = sub.w || [0.5, 0.15, 0.35];
    const v = (key) => {
      const src = (overrides && overrides[key]) || sub[key];
      return parseFloat(String(src).replace("x", "")) || 0;
    };
    return Math.round((v("qib") * w[0] + v("nii") * w[1] + v("rii") * w[2]) * 100) / 100;
  }

  function expectedListingPrice(gmp, upperBand) {
    return (Number(gmp) || 0) + (Number(upperBand) || 0);
  }

  function gainPct(expected, cutoff) {
    const c = Number(cutoff);
    if (!c) return 0;
    return Math.round(((expected - c) / c) * 10000) / 100;
  }

  function allotmentResult(retailMult, random) {
    const r = parseFloat(String(retailMult).replace("x", "")) || 0;
    const mult = Math.max(1, r);
    const prob = 1 / mult;
    const roll = typeof random === "number" ? random : Math.random();
    return { prob, allotted: roll < prob };
  }

  function sentimentFor(pe, peerPe) {
    if (pe == null || peerPe == null || isNaN(pe) || isNaN(peerPe)) {
      return { label: "Not enough data", cls: "s-muted" };
    }
    if (pe < peerPe * 0.9) return { label: "Cheap", cls: "s-cheap" };
    if (pe > peerPe * 1.1) return { label: "Overvalued", cls: "s-over" };
    return { label: "Fair", cls: "s-fair" };
  }

  function renderStats() {
    const vis = visibleIpos();
    const open = vis.filter((i) => i.status === "open" || i.status === "upcoming").length;
    const mins = vis.map((i) => parseFloat(String(i.minInvestment).replace(/[^\d.]/g, ""))).filter((n) => !isNaN(n));
    const min = mins.length ? Math.min(...mins) : 0;
    const retailVals = vis
      .map((i) => parseFloat(String(i.retail.subscription || "").replace(/[^\d.]/g, "")))
      .filter((n) => !isNaN(n));
    $("#statTotal").textContent = vis.length;
    $("#statOpen").textContent = open;
    $("#statMin").textContent = "₹" + min.toLocaleString("en-IN");
    $("#statRetail").textContent = retailVals.length ? Math.max(...retailVals).toFixed(1) + "x" : "–";
    $("#dataNote").textContent = `Data as of ${data.generatedOn || "today"} · Illustrative — verify on BSE/NSE`;
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
    const picks = visibleIpos()
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
              ${ipo.sample ? `<span class="tag tag-sample">SAMPLE</span>` : ""}
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
    const liveListed = visibleIpos().filter((i) => i.status === "listed" && i.livePrice != null);
    if (liveListed.length) {
      liveListed.forEach((i) => {
        const mark = i.nearPeak ? "NEAR PEAK - consider profit booking" : "off-high";
        lines.push("* " + i.name + ": live " + fmtInr(i.livePrice) + " | 52w high " + fmtInr(i.high52) + " | " + i.distancePct + "% below | " + mark);
      });
    } else {
      lines.push("* Listed IPOs are archived and not shown in this report — use the site search to find one.");
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

  function renderListing() {
    const groups = [
      { key: "open", title: "OPEN NOW" },
      { key: "upcoming", title: "UPCOMING" },
      { key: "listed", title: "LISTED" }
    ];
    const html = groups
      .map((g) => {
        const items = g.key === "listed"
          ? data.filter((i) => i.segment === activeSegment && i.status === "listed" && !isArchived(i))
          : data.filter((i) => i.segment === activeSegment && i.status === g.key);
        const emptyMsg = g.key === "listed"
          ? "Listed IPOs are archived — use Search or the Listed filter to view them."
          : `No ${g.title} ${activeSegment === "sme" ? "SME " : ""}IPOs tracked.`;
        const rows = items.length
          ? items.map(ipoListingRow).join("")
          : `<div class="listing-row listing-empty">${emptyMsg}</div>`;
        return `
          <div class="listing-group">
            <h3>${g.title}</h3>
            <div class="listing-header">
              <span>IPO</span><span>Band</span><span>Lot</span><span>Min.</span><span>QIB</span><span>Retail</span><span>Close</span><span>Verdict</span>
            </div>
            ${rows}
          </div>`;
      })
      .join("");
    $("#ipoListing").innerHTML = html;
    $("#listingNote").textContent = data.generatedOn
      ? `Data as of ${data.generatedOn} · Illustrative — verify on BSE/NSE`
      : "";
  }

  function ipoListingRow(i) {
    const st = statusMeta[i.status] || statusMeta.listed;
    const gain = i.status === "listed" && i.listingGain && i.listingGain !== "TBA"
      ? ` ${i.listingGain}` : "";
    return `
      <div class="listing-row">
        <span class="listing-name">
          ${i.name}${i.sample ? `<span class="tag tag-sample">SAMPLE</span>` : ""}<span class="status-pill ${st.cls}">${st.label}</span>
        </span>
        <span>${i.priceBand}</span>
        <span>${i.lotSize} sh</span>
        <span>${i.minInvestment}</span>
        <span>${i.qib.subscription}</span>
        <span>${i.retail.subscription}</span>
        <span>${i.dates.close}</span>
        <span class="verdict-tag ${verdictCls(i.verdict)}">${i.verdict}${gain}</span>
      </div>`;
  }

  function verdictCls(v) {
    return { Strong: "v-strong", Moderate: "v-moderate", Speculative: "v-speculative", Watch: "v-watch", Neutral: "v-neutral" }[v] || "v-neutral";
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
    return `
      <span class="status-pill ${st.cls}">${st.label}</span>
      ${ipo.sample ? `<span class="tag tag-sample">SAMPLE</span>` : ""}
      <h2>${ipo.name}</h2>
      <div class="sub">${ipo.sector} · ${ipo.exchange}${ipo.segment === "sme" ? " · SME" : ""}</div>
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

      ${subscriptionPanelHtml(ipo)}

      ${financialHtml(ipo)}

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

  function subMultiple(v) {
    const n = parseFloat(String(v).replace("x", ""));
    return isNaN(n) ? 0 : n;
  }

  function subscriptionPanelHtml(ipo) {
    if (ipo.status === "listed") {
      const bars = [
        { label: "QIB subscription (final)", value: ipo.qib.subscription },
        { label: "Retail subscription (final)", value: ipo.retail.subscription }
      ];
      return `
        <section>
          <h4>Subscription (final)</h4>
          <div class="sub-bars">
            ${bars
              .map(
                (b) => `
                <div class="sub-bar">
                  <div class="bar-label"><span>${b.label}</span><span class="v">${b.value}</span></div>
                  <div class="track"><div class="fill" style="width:${Math.min(100, Math.max(4, subMultiple(b.value) * 2.5))}%"></div></div>
                </div>`
              )
              .join("")}
          </div>
        </section>`;
    }
    if (ipo.status !== "open" || !ipo.sub) {
      const msg = ipo.status === "open"
        ? "Subscription data not available yet."
        : ipo.status === "upcoming"
          ? `Subscription not open yet — bidding begins on ${ipo.dates.open === "TBA" ? "the open date" : ipo.dates.open}.`
          : "Subscription closed — allotment has been finalized.";
      return `<section><h4>Live Subscription</h4><p class="muted">${msg}</p></section>`;
    }
    const w = ipo.sub.w || [0.5, 0.15, 0.35];
    const tiers = ["qib", "nii", "rii"];
    const labels = {
      qib: "QIB (Qualified Institutional Buyers)",
      nii: "NII (Non-Institutional Investors)",
      rii: "RII (Retail Individual Investors)"
    };
    return `
      <section>
        <h4>Live Subscription</h4>
        <p class="formula">Total = QIB×${Math.round(w[0] * 100)}% + NII×${Math.round(w[1] * 100)}% + Retail×${Math.round(w[2] * 100)}%</p>
        <div class="sub-tiers">
          ${tiers
            .map(
              (t) => `
              <div class="sub-tier">
                <div class="bar-label"><span>${labels[t]} <em>(${Math.round(w[["qib", "nii", "rii"].indexOf(t)] * 100)}%)</em></span>
                  <input class="sub-input" data-tier="${t}" type="number" min="0" step="0.01" value="${subMultiple(ipo.sub[t])}" aria-label="${labels[t]} multiple" /></div>
                <div class="track"><div class="fill" data-fill="${t}" style="width:${Math.min(100, subMultiple(ipo.sub[t]) * 4)}%"></div></div>
              </div>`
            )
            .join("")}
        </div>
        <div class="total-sub">Total Subscription Multiple: <strong data-total>${totalSubscription(ipo.sub)}x</strong></div>
      </section>`;
  }

  function financialHtml(ipo) {
    const f = ipo.fin;
    if (!f || !f.years || !f.years.length) {
      return `<section><h4>Financial Health</h4><p class="muted">Not enough data.</p></section>`;
    }
    const rows = [
      { label: "Revenue (₹ Cr)", arr: f.revenue },
      { label: "Profit After Tax (₹ Cr)", arr: f.pat },
      { label: "Total Assets (₹ Cr)", arr: f.assets }
    ]
      .map(
        (r) => `<tr><td>${r.label}</td>${f.years.map((y, idx) => `<td>${Number(r.arr[idx] || 0).toLocaleString("en-IN")}</td>`).join("")}</tr>`
      )
      .join("");
    return `
      <section>
        <h4>Financial Health (last ${f.years.length} fiscal years)</h4>
        <table class="fin-table">
          <thead><tr><th>Metric</th>${f.years.map((y) => `<th>${y}</th>`).join("")}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${sentimentHtml(ipo)}
      </section>`;
  }

  function sentimentHtml(ipo) {
    const s = sentimentFor(ipo.pe, ipo.peerPe);
    const detail = s.label === "Not enough data"
      ? ""
      : `IPO P/E ${ipo.pe}x vs listed market peers ${ipo.peerPe}x.`;
    return `
      <div class="sentiment-box ${s.cls}">
        <strong>Sentiment Summary</strong>
        <span>${s.label === "Not enough data" ? "Not enough data" : s.label + " valuation"}</span>
        <p class="muted">${detail}</p>
      </div>`;
  }

  function renderSegmentTabs() {
    const tabsEl = $("#segmentTabs");
    if (!tabsEl) return;
    tabsEl.innerHTML = `
      <button class="seg-tab ${activeSegment === "mainline" ? "active" : ""}" data-segment="mainline">Mainline</button>
      <button class="seg-tab ${activeSegment === "sme" ? "active" : ""}" data-segment="sme">SME</button>
      <span class="tabs-hint">IPO Xtra · ${activeSegment === "mainline" ? "Mainboard" : "SME"} issues</span>`;
    tabsEl.addEventListener("click", (e) => {
      const t = e.target.closest(".seg-tab");
      if (!t) return;
      document.querySelectorAll(".seg-tab").forEach((x) => x.classList.remove("active"));
      t.classList.add("active");
      activeSegment = t.dataset.segment;
      statusFilter = "all";
      document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      const allChip = document.querySelector(".chip[data-status='all']");
      if (allChip) allChip.classList.add("active");
      renderAll();
    });
  }

  function renderAll() {
    renderStats();
    renderPicks();
    renderGrid();
    renderListing();
  }

  function initTools() {
    const gmpSel = $("#gmpIpoSelect");
    const allotSel = $("#allotIpoSelect");
    if (!gmpSel || !allotSel) return;
    const opts = data
      .map((i) => `<option value="${i.id}">${i.name}${i.segment === "sme" ? " (SME)" : ""}</option>`)
      .join("");
    gmpSel.innerHTML = opts;
    allotSel.innerHTML = opts;

    const gmpSlider = $("#gmpSlider");
    const gmpInput = $("#gmpInput");
    const cutoffInput = $("#gmpCutoff");
    const expectedEl = $("#gmpExpected");
    const gainEl = $("#gmpGain");

    const setGmp = (v) => {
      gmpSlider.value = v;
      gmpInput.value = v;
      updateGmp();
    };
    const updateGmp = () => {
      const gmp = parseFloat(gmpInput.value) || 0;
      const cutoff = parseFloat(cutoffInput.value) || 0;
      const ipo = data.find((i) => i.id === gmpSel.value);
      const upper = cutoff || (ipo && ipo.cutoff) || 0;
      const expected = expectedListingPrice(gmp, upper);
      expectedEl.textContent = "₹" + expected.toLocaleString("en-IN");
      const pct = gainPct(expected, upper || 1);
      gainEl.textContent = (pct >= 0 ? "+" : "") + pct + "%";
      gainEl.classList.toggle("gain-up", pct >= 0);
      gainEl.classList.toggle("gain-down", pct < 0);
    };
    gmpSel.addEventListener("change", () => {
      const ipo = data.find((i) => i.id === gmpSel.value);
      if (!ipo) return;
      cutoffInput.value = ipo.cutoff || "";
      const gmpDefault = Math.max(0, subMultiple(ipo.gmpEst || ipo.gmp || 0));
      setGmp(Math.round(gmpDefault));
    });
    gmpSlider.addEventListener("input", () => {
      gmpInput.value = gmpSlider.value;
      updateGmp();
    });
    gmpInput.addEventListener("input", updateGmp);
    cutoffInput.addEventListener("input", updateGmp);

    const appInput = $("#allotPan");
    const simBtn = $("#allotSimulate");
    const resultEl = $("#allotResult");
    simBtn.addEventListener("click", () => {
      const pan = (appInput.value || "").trim().toUpperCase();
      if (pan.length < 5) {
        resultEl.innerHTML = `<div class="sim-error">Enter a valid PAN / Application number (min 5 characters).</div>`;
        return;
      }
      const ipo = data.find((i) => i.id === allotSel.value);
      const mult = subMultiple(ipo ? (ipo.sub && ipo.sub.rii) || ipo.retail.subscription : 0);
      const res = allotmentResult(mult, undefined);
      resultEl.innerHTML = res.allotted
        ? `<div class="sim-win"><strong>Congratulations!</strong> You have been allotted shares in ${ipo ? ipo.name : "the IPO"} (probability ${Math.round(res.prob * 100)}%).</div>`
        : `<div class="sim-lose"><strong>Not Allotted</strong> — chances were ~${Math.round(res.prob * 100)}%. Better luck with the next one.</div>`;
    });
  }

  function openModal(id) {
    const ipo = data.find((i) => i.id === id);
    if (!ipo) return;
    $("#modalBody").innerHTML = modalHtml(ipo);
    const totalEl = $("#modalBody").querySelector("[data-total]");
    if (totalEl) {
      $("#modalBody").querySelectorAll(".sub-input").forEach((inp) => {
        inp.addEventListener("input", () => {
          const overrides = {};
          document.querySelectorAll(".sub-input").forEach((x) => {
            overrides[x.dataset.tier] = x.value;
          });
          totalEl.textContent = totalSubscription(ipo.sub, overrides) + "x";
          const f = document.querySelector(`.fill[data-fill="${inp.dataset.tier}"]`);
          if (f) f.style.width = Math.min(100, Math.max(0, parseFloat(inp.value) || 0) * 4) + "%";
        });
      });
    }
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
    let json;
    try {
      const res = await fetch("data/ipos.json", { cache: "no-store" });
      if (!res.ok) throw new Error("fetch failed");
      json = await res.json();
    } catch (err) {
      json = FALLBACK;
    }
    data = json.ipos || [];
    data.generatedOn = json.generatedOn || FALLBACK.generatedOn;
    data.pricesUpdatedOn = json.pricesUpdatedOn || "";
    window.IPOSite = {
      get data() { return data; },
      fmtInr,
      statusMeta,
      buildReportText,
      visible: visibleIpos,
      visibleFor,
      isArchived,
      totalSubscription,
      expectedListingPrice,
      gainPct,
      allotmentResult,
      sentimentFor
    };
    renderAll();
    renderSegmentTabs();
    renderReports();
    initShareBox();
    initTools();
  }

  init();
})();
