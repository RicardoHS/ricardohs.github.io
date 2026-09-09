const DATA_URL = "/content/ai-benchmark-results.json";

const state = { data: null, sort: "speed", showIncomplete: true };

const escapeHtml = value => String(value ?? "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const formatDuration = seconds => {
  if (seconds === null || seconds === undefined) return "n/c";
  const rounded = Math.round(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainder = rounded % 60;
  return `${minutes}:${String(remainder).padStart(2, "0")}`;
};

const formatNumber = (value, digits = 1) => value === null || value === undefined
  ? "n/c"
  : new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(value);

const metricFor = run => {
  if (state.sort === "time") return run.total_seconds ?? run.agent_seconds;
  if (state.sort === "memory") return run.host_used_gib;
  return run.decode_mean;
};

const metricText = run => {
  if (state.sort === "time") return run.total_seconds === null ? `${formatDuration(run.agent_seconds)}*` : formatDuration(run.total_seconds);
  if (state.sort === "memory") return run.host_used_gib === null ? "n/c" : `${formatNumber(run.host_used_gib, 2)} GiB`;
  return run.decode_mean === null ? "n/c" : `${formatNumber(run.decode_mean, 2)} tok/s`;
};

function visibleRuns() {
  const runs = state.data.creative_runs.filter(run => state.showIncomplete || run.verification !== "incomplete");
  return [...runs].sort((a, b) => {
    const av = metricFor(a);
    const bv = metricFor(b);
    if (av === null || av === undefined) return 1;
    if (bv === null || bv === undefined) return -1;
    return state.sort === "time" ? av - bv : bv - av;
  });
}

function renderRuns() {
  const runs = visibleRuns();
  const values = runs.map(metricFor).filter(value => value !== null && value !== undefined);
  const max = Math.max(...values, 1);
  const chart = document.querySelector("#run-chart");
  const table = document.querySelector("#run-table");
  const labels = { speed: "ACTIVE DECODE · TOK/S", time: "END-TO-END · MM:SS", memory: "HOST MEMORY USED · GiB" };
  document.querySelector("#metric-label").textContent = labels[state.sort];

  chart.innerHTML = runs.map(run => {
    const value = metricFor(run);
    const width = value === null || value === undefined ? 0 : Math.max(1, value / max * 100);
    return `<div class="run-row ${run.verification}">
      <div class="run-label"><strong title="${run.model}">${run.model}</strong><span>${run.verification} · ${run.topology}</span></div>
      <div class="bar-track" aria-hidden="true"><div class="bar" style="width:${width}%"></div></div>
      <div class="metric-value">${metricText(run)}</div>
    </div>`;
  }).join("");

  table.innerHTML = runs.map(run => `<tr>
    <td class="model-cell"><strong>${run.model}</strong><span>${run.quantization} · ${run.run_id}</span></td>
    <td>${formatDuration(run.agent_seconds)} / ${formatDuration(run.total_seconds)}${run.timed_out ? " · timeout" : ""}</td>
    <td>${run.decode_mean === null ? "n/c" : `${formatNumber(run.decode_mean, 3)} ± ${formatNumber(run.decode_stddev, 3)} tok/s`}</td>
    <td>${run.host_used_gib === null ? "n/c" : `${formatNumber(run.host_used_gib, 2)} / ${formatNumber(run.host_available_gib, 2)} GiB`}</td>
    <td class="result-cell"><span class="badge ${run.verification}">${run.verification}</span>${run.summary}
      <span class="run-links"><a href="${run.code_url}">Code</a>${run.demo_url ? `<a href="${run.demo_url}">Live demo</a>` : "<span>Demo unavailable</span>"}</span>
    </td>
  </tr>`).join("");
}

function renderSecondary() {
  document.querySelector("#optimization-results").innerHTML = state.data.optimization_smoke.map(item => `<div class="optimization-result">
    <header><span>${item.problem} · ${item.size}</span><span>${formatNumber(item.score_percent, 2)}%</span></header>
    <div class="score-track"><div class="score-fill" style="width:${item.score_percent}%"></div></div>
    <p>${formatNumber(item.wall_seconds, 2)} s · ${item.configuration}</p>
  </div>`).join("");

  document.querySelector("#arc-attempts").innerHTML = state.data.arc_smoke.attempts.map(item => `<div class="arc-attempt">
    <strong>Attempt ${item.attempt} · exact</strong>${formatNumber(item.wall_seconds, 2)} s · ${item.output_tokens} tokens
  </div>`).join("");

  document.querySelector("#completion-grid").innerHTML = state.data.completion.map(item => `<article class="completion-item">
    <header><h3>${item.track}</h3><span class="state">${item.state}</span></header><p>${item.detail}</p>
  </article>`).join("");
}

function renderCampaign() {
  const campaign = state.data.campaign;
  if (!campaign) {
    document.querySelector("#campaign-counts").innerHTML = '<p class="empty-state">No campaign snapshot published yet.</p>';
    document.querySelector("#campaign-table").innerHTML = "";
    return;
  }
  const order = { running: 0, complete: 1, "infrastructure-failed": 2, interrupted: 3, blocked: 4, queued: 5, skipped: 6 };
  const rows = [...campaign.models].sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
  const labels = {
    complete: "Complete", running: "Running", "infrastructure-failed": "Infra failed",
    interrupted: "Interrupted", blocked: "Blocked", queued: "Queued", skipped: "Skipped",
  };
  document.querySelector("#campaign-counts").innerHTML = Object.entries(campaign.counts)
    .map(([status, count]) => `<div class="campaign-count ${escapeHtml(status)}"><strong>${count}</strong><span>${escapeHtml(labels[status] ?? status)}</span></div>`)
    .join("");
  document.querySelector("#campaign-table").innerHTML = rows.map(run => {
    const noData = !run.has_measurements;
    const progress = run.arc_agentic_tasks === null ? "n/c" : `${run.arc_agentic_tasks}/${run.arc_agentic_target_tasks ?? 120} tasks`;
    const arc = noData ? "—" : `<strong>${run.arc_agentic_exact ?? "—"} exact</strong><span>${progress} · ${run.arc_agentic_cell_accuracy === null ? "cell n/c" : `${formatNumber(run.arc_agentic_cell_accuracy * 100, 2)}% cells`}${run.arc_agentic_vision ? " · vision" : ""}</span>`;
    const runtime = noData ? "—" : `<strong>${run.decode_mean === null ? "n/c" : `${formatNumber(run.decode_mean, 2)} ± ${formatNumber(run.decode_stddev, 2)} tok/s`}</strong><span>${run.host_used_gib === null ? "memory n/c" : `${formatNumber(run.host_used_gib, 2)} GiB used`}</span>`;
    const np = noData ? "—" : `<strong>Cut ${formatNumber(run.np_maxcut_points, 1)}</strong><span>${run.np_maxcut_valid ?? "—"}/${run.np_maxcut_instances ?? "—"} valid</span><strong>3SAT ${formatNumber(run.np_max3sat_points, 1)}</strong><span>${run.np_max3sat_valid ?? "—"}/${run.np_max3sat_instances ?? "—"} valid</span>`;
    const refugio = noData ? "—" : `<strong>${run.refugio_hidden_score ?? "n/c"} hidden</strong><span>${run.refugio_development_score ?? "n/c"} development${run.refugio_agent_seconds === null ? "" : ` · ${formatDuration(run.refugio_agent_seconds)}`}</span>`;
    return `<tr class="campaign-row ${escapeHtml(run.status)}">
      <td class="model-cell"><strong>${escapeHtml(run.model)}</strong><span>${escapeHtml(run.quantization ?? "native")} · ${escapeHtml(run.topology)}</span><span class="badge ${escapeHtml(run.status)}">${escapeHtml(labels[run.status] ?? run.status)}${run.provisional ? " · provisional" : ""}</span></td>
      <td class="stacked-metric">${arc}</td>
      <td class="stacked-metric">${runtime}</td>
      <td class="stacked-metric">${np}</td>
      <td class="stacked-metric">${refugio}</td>
      <td><div class="capability-list">${run.capabilities.map(item => `<span>${escapeHtml(item)}</span>`).join("") || "—"}</div></td>
    </tr>`;
  }).join("");
  document.querySelector("#campaign-note").textContent = campaign.notes.join(" ");
}

function bindControls() {
  document.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
    state.sort = button.dataset.sort;
    document.querySelectorAll("[data-sort]").forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
    renderRuns();
  }));
  document.querySelector("#show-incomplete").addEventListener("change", event => {
    state.showIncomplete = event.currentTarget.checked;
    renderRuns();
  });
}

async function initialize() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Dataset returned HTTP ${response.status}`);
    state.data = await response.json();
    document.querySelector("#run-count").textContent = state.data.campaign?.models.length ?? state.data.creative_runs.length;
    document.querySelector("#pass-count").textContent = state.data.campaign?.counts.complete ?? state.data.creative_runs.filter(run => run.verification === "passed").length;
    document.querySelector("#last-updated").textContent = `Dataset ${state.data.status} · updated ${state.data.updated_at.slice(0, 10)}`;
    renderRuns();
    renderSecondary();
    renderCampaign();
    bindControls();
  } catch (error) {
    document.querySelector("#run-chart").innerHTML = `<p role="alert">The public dataset could not be loaded: ${error.message}</p>`;
    document.querySelector("#last-updated").textContent = "Dataset unavailable";
  }
}

initialize();
