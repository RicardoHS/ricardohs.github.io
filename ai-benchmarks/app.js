const DATA_URL = "/content/ai-benchmark-results.json";

const state = {
  data: null,
  sort: "speed",
  showIncomplete: true,
  campaignSort: { key: "decode_mean", direction: "desc" },
  details: new Map(),
  detailSequence: 0,
};

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

const formatPercent = value => value === null || value === undefined
  ? "n/c"
  : `${formatNumber(value * 100, 1)}%`;

function detailButton(label, value, detail, tone = "neutral") {
  const id = `detail-${state.detailSequence++}`;
  state.details.set(id, detail);
  return `<button class="metric-chip ${escapeHtml(tone)}" type="button" data-detail="${id}">
    <span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>
  </button>`;
}

function showDetail(id) {
  const detail = state.details.get(id);
  if (!detail) return;
  document.querySelector("#result-dialog-kicker").textContent = detail.kicker;
  document.querySelector("#result-dialog-title").textContent = detail.title;
  document.querySelector("#result-dialog-summary").textContent = detail.summary;
  document.querySelector("#result-dialog-values").innerHTML = detail.values.map(item => `
    <div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>
  `).join("");
  const dialog = document.querySelector("#result-dialog");
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function scoreExplanation(score) {
  if (score === null || score === undefined) {
    return "The verifier rejected the submission or no feasible objective was available. It is not a score of zero.";
  }
  if (score < 0) return "The submission was feasible, but its objective was worse than the frozen baseline. Negative scores are valid and unbounded below.";
  if (score === 0) return "The submission matched the frozen baseline objective.";
  return "The submission improved on the frozen baseline. A score of 100 reaches the supplied theoretical lower bound.";
}

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

const campaignStatusOrder = {
  running: 0,
  complete: 1,
  "infrastructure-failed": 2,
  interrupted: 3,
  blocked: 4,
  queued: 5,
  skipped: 6,
};

const campaignSortLabels = {
  model: "model",
  status: "state",
  decode_mean: "decode speed",
  host_used_gib: "host memory",
  optimization_feasible_rate: "one-shot feasibility",
  optimization_normalized_score: "one-shot score",
  optimization_agentic_feasible_rate: "agentic feasibility",
  optimization_agentic_normalized_score: "agentic score",
  optimization_agentic_total_tokens: "agent tokens",
  optimization_agentic_wall_seconds: "agent time",
  np_maxcut_points: "MaxCut",
  np_max3sat_points: "Max3SAT",
  refugio_hidden_score: "Refugio",
  arc_agentic_exact: "ARC exact",
};

const campaignLowerIsBetter = new Set([
  "host_used_gib",
  "optimization_agentic_total_tokens",
  "optimization_agentic_wall_seconds",
]);

function campaignSortValue(run, key) {
  if (key === "model") return run.model;
  if (key === "status") return campaignStatusOrder[run.status] ?? 99;
  return run[key];
}

function sortedCampaignRows(models) {
  const { key, direction } = state.campaignSort;
  const multiplier = direction === "asc" ? 1 : -1;
  return [...models].sort((a, b) => {
    const av = campaignSortValue(a, key);
    const bv = campaignSortValue(b, key);
    const aMissing = av === null || av === undefined || Number.isNaN(av);
    const bMissing = bv === null || bv === undefined || Number.isNaN(bv);
    if (aMissing !== bMissing) return aMissing ? 1 : -1;
    if (aMissing && bMissing) return a.model.localeCompare(b.model, "en", { numeric: true });
    const comparison = typeof av === "string"
      ? av.localeCompare(String(bv), "en", { numeric: true, sensitivity: "base" })
      : Number(av) - Number(bv);
    return comparison === 0
      ? a.model.localeCompare(b.model, "en", { numeric: true })
      : comparison * multiplier;
  });
}

function tableDetailButton(value, detail, tone = "neutral") {
  if (value === null || value === undefined) return '<span class="table-empty">—</span>';
  const id = `detail-${state.detailSequence++}`;
  state.details.set(id, detail);
  return `<button class="table-metric ${escapeHtml(tone)}" type="button" data-detail="${id}">${escapeHtml(value)}</button>`;
}

function challengeValues(results, field = "mean_normalized_score") {
  return (results ?? []).map(item => ({
    label: item.challenge,
    value: item[field] === null || item[field] === undefined
      ? "Invalid / unavailable"
      : formatNumber(item[field], 4),
  }));
}

function updateCampaignSortHeader() {
  const { key, direction } = state.campaignSort;
  document.querySelectorAll("[data-campaign-sort]").forEach(button => {
    const active = button.dataset.campaignSort === key;
    const header = button.closest("th");
    if (header) header.setAttribute("aria-sort", active ? (direction === "asc" ? "ascending" : "descending") : "none");
    const marker = button.querySelector("span");
    if (marker) marker.textContent = active ? (direction === "asc" ? "↑" : "↓") : "↕";
    button.classList.toggle("active", active);
  });
  const summary = document.querySelector("#campaign-sort-summary");
  const orderDescription = key === "model"
    ? (direction === "asc" ? "A–Z" : "Z–A")
    : key === "status"
      ? (direction === "asc" ? "active and complete first" : "queued and failed first")
      : (direction === "asc" ? "lowest first" : "highest first");
  if (summary) summary.textContent = `Sorted by ${campaignSortLabels[key] ?? key}, ${orderDescription}.`;
}

function renderCampaign() {
  const campaign = state.data.campaign;
  if (!campaign) {
    document.querySelector("#campaign-counts").innerHTML = '<p class="empty-state">No campaign snapshot published yet.</p>';
    document.querySelector("#campaign-models").innerHTML = '<tr><td colspan="14" class="empty-state">No campaign snapshot published yet.</td></tr>';
    return;
  }
  const rows = sortedCampaignRows(campaign.models);
  const labels = {
    complete: "Complete", running: "Running", "infrastructure-failed": "Infra failed",
    interrupted: "Interrupted", blocked: "Blocked", queued: "Queued", skipped: "Skipped",
  };
  document.querySelector("#campaign-counts").innerHTML = Object.entries(campaign.counts)
    .map(([status, count]) => `<div class="campaign-count ${escapeHtml(status)}"><strong>${count}</strong><span>${escapeHtml(labels[status] ?? status)}</span></div>`)
    .join("");
  document.querySelector("#campaign-models").innerHTML = rows.map(run => {
    const optimizationDetail = {
      kicker: `${run.model} · one-shot optimization`,
      title: "Five-challenge summary",
      summary: scoreExplanation(run.optimization_normalized_score),
      values: [
        { label: "Feasible", value: `${run.optimization_successful ?? 0}/${run.optimization_cases ?? 0} · ${formatPercent(run.optimization_feasible_rate)}` },
        { label: "Macro normalized score", value: formatNumber(run.optimization_normalized_score, 4) },
        ...challengeValues(run.optimization_results),
      ],
    };
    const agentDetail = {
      kicker: `${run.model} · agentic optimization`,
      title: "Build, verify and iterate",
      summary: "Pi implemented five solvers, iterated against bounded development feedback and was evaluated on disjoint private cases.",
      values: [
        { label: "Private macro feasibility", value: formatPercent(run.optimization_agentic_feasible_rate) },
        { label: "Private macro score", value: formatNumber(run.optimization_agentic_normalized_score, 4) },
        { label: "Model / tool calls", value: `${formatNumber(run.optimization_agentic_model_calls, 0)} / ${formatNumber(run.optimization_agentic_tool_calls, 0)}` },
        { label: "Verifier calls", value: formatNumber(run.optimization_agentic_development_evaluations, 0) },
        { label: "Input / output tokens", value: `${formatNumber(run.optimization_agentic_input_tokens, 0)} / ${formatNumber(run.optimization_agentic_output_tokens, 0)}` },
        { label: "Effective output speed", value: `${formatNumber(run.optimization_agentic_output_tps, 3)} tok/s` },
        { label: "End-to-end time", value: formatDuration(run.optimization_agentic_wall_seconds) },
        ...challengeValues(run.optimization_agentic_results),
      ],
    };
    const runtimeDetail = {
      kicker: `${run.model} · runtime`,
      title: "Runtime and memory",
      summary: "Decode is the mean per-request rate from the two-request smoke, not aggregate multi-user throughput. Memory is the observed post-run host snapshot.",
      values: [
        { label: "Decode mean", value: `${formatNumber(run.decode_mean, 4)} tok/s` },
        { label: "Decode standard deviation", value: `${formatNumber(run.decode_stddev, 4)} tok/s` },
        { label: "Host used", value: `${formatNumber(run.host_used_gib, 2)} GiB` },
        { label: "Host available", value: `${formatNumber(run.host_available_gib, 2)} GiB` },
        { label: "Topology", value: run.topology },
        { label: "Quantization", value: run.quantization ?? "native" },
      ],
    };
    const npDetail = (name, points, valid, instances) => ({
      kicker: `${run.model} · NP Frontier`,
      title: name,
      summary: "One-shot frontier score recalculated by the independent verifier.",
      values: [
        { label: "Frontier points", value: formatNumber(points, 4) },
        { label: "Valid solutions", value: `${valid ?? "n/c"}/${instances ?? "n/c"}` },
      ],
    });

    const oneShotTone = run.optimization_normalized_score < 0 ? "negative" : "positive";
    const agentTone = run.optimization_agentic_normalized_score < 0 ? "negative" : "positive";
    return `<tr class="campaign-row ${escapeHtml(run.status)}">
      <td class="model-cell"><strong>${escapeHtml(run.model)}</strong><span>${escapeHtml(run.quantization ?? "native")} · ${escapeHtml(run.topology)}</span></td>
      <td><span class="badge ${escapeHtml(run.status)}">${escapeHtml(labels[run.status] ?? run.status)}</span>${run.provisional ? '<span class="provisional-mark">provisional</span>' : ""}</td>
      <td>${tableDetailButton(run.decode_mean === null || run.decode_mean === undefined ? null : formatNumber(run.decode_mean, 2), runtimeDetail)}</td>
      <td>${tableDetailButton(run.host_used_gib === null || run.host_used_gib === undefined ? null : formatNumber(run.host_used_gib, 1), runtimeDetail)}</td>
      <td>${tableDetailButton(run.optimization_feasible_rate === null || run.optimization_feasible_rate === undefined ? null : formatPercent(run.optimization_feasible_rate), optimizationDetail)}</td>
      <td>${tableDetailButton(run.optimization_normalized_score === null || run.optimization_normalized_score === undefined ? null : formatNumber(run.optimization_normalized_score, 2), optimizationDetail, oneShotTone)}</td>
      <td>${tableDetailButton(run.optimization_agentic_feasible_rate === null || run.optimization_agentic_feasible_rate === undefined ? null : formatPercent(run.optimization_agentic_feasible_rate), agentDetail)}</td>
      <td>${tableDetailButton(run.optimization_agentic_normalized_score === null || run.optimization_agentic_normalized_score === undefined ? null : formatNumber(run.optimization_agentic_normalized_score, 2), agentDetail, agentTone)}</td>
      <td>${tableDetailButton(run.optimization_agentic_total_tokens === null || run.optimization_agentic_total_tokens === undefined ? null : formatNumber(run.optimization_agentic_total_tokens, 0), agentDetail)}</td>
      <td>${tableDetailButton(run.optimization_agentic_wall_seconds === null || run.optimization_agentic_wall_seconds === undefined ? null : formatDuration(run.optimization_agentic_wall_seconds), agentDetail)}</td>
      <td>${tableDetailButton(run.np_maxcut_points === null || run.np_maxcut_points === undefined ? null : formatNumber(run.np_maxcut_points, 1), npDetail("MaxCut", run.np_maxcut_points, run.np_maxcut_valid, run.np_maxcut_instances), "positive")}</td>
      <td>${tableDetailButton(run.np_max3sat_points === null || run.np_max3sat_points === undefined ? null : formatNumber(run.np_max3sat_points, 1), npDetail("Max3SAT", run.np_max3sat_points, run.np_max3sat_valid, run.np_max3sat_instances), "positive")}</td>
      <td>${tableDetailButton(run.refugio_hidden_score === null || run.refugio_hidden_score === undefined ? null : String(run.refugio_hidden_score), {
        kicker: `${run.model} · policy arena`, title: "Refugio hidden evaluation",
        summary: "The policy was developed on public instances and scored once on the frozen hidden suite.",
        values: [
          { label: "Hidden score", value: String(run.refugio_hidden_score ?? "n/c") },
          { label: "Development score", value: String(run.refugio_development_score ?? "n/c") },
          { label: "Agent time", value: formatDuration(run.refugio_agent_seconds) },
        ],
      }, "positive")}</td>
      <td>${tableDetailButton(run.arc_agentic_exact === null || run.arc_agentic_exact === undefined ? null : `${run.arc_agentic_exact}/${run.arc_agentic_tasks ?? "?"}`, {
        kicker: `${run.model} · ARC-AGI-2 agentic`, title: "ARC exact tasks",
        summary: "Exact task success and cell accuracy are separate measurements.",
        values: [
          { label: "Exact tasks", value: String(run.arc_agentic_exact ?? "n/c") },
          { label: "Tasks evaluated", value: `${run.arc_agentic_tasks ?? "n/c"}/${run.arc_agentic_target_tasks ?? 120}` },
          { label: "Cell accuracy", value: formatPercent(run.arc_agentic_cell_accuracy) },
          { label: "Vision enabled", value: run.arc_agentic_vision ? "Yes" : "No" },
        ],
      })}</td>
    </tr>`;
  }).join("");
  updateCampaignSortHeader();
  document.querySelector("#campaign-note").textContent = campaign.notes.join(" ");
}

function renderReasoning() {
  const container = document.querySelector("#reasoning-models");
  const campaign = state.data.campaign;
  const models = campaign?.models.filter(model => model.reasoning_levels?.length) ?? [];
  if (!models.length) {
    container.innerHTML = '<p class="empty-state">Native reasoning sweeps are queued. Results will appear here automatically.</p>';
    return;
  }
  container.innerHTML = models.map(model => `<article class="reasoning-model-card">
    <header><div><p class="eyebrow">${escapeHtml(model.reasoning_protocol ?? "legacy protocol")}</p><h3>${escapeHtml(model.model)}</h3></div><span>${escapeHtml(model.reasoning_control ?? "native")} · seed ${escapeHtml(model.reasoning_sampling_seed ?? "unfixed")}</span></header>
    <div class="reasoning-levels">${model.reasoning_levels.map(level => {
      const saturation = level.deliberation_saturation_rate;
      const summaryButton = detailButton(
        "quality",
        `${level.successful ?? 0}/${level.cases ?? 0} valid`,
        {
          kicker: `${model.model} · reasoning ${level.level}`,
          title: "Level summary",
          summary: saturation === 1
            ? "Every deliberation hit the token ceiling; this level is saturated and cannot support a clean effort comparison."
            : "Feasibility is the primary result. The normalized score averages only feasible submissions.",
          values: [
            { label: "Feasible", value: `${level.successful ?? 0}/${level.cases ?? 0}` },
            { label: "Normalized score (valid only)", value: formatNumber(level.macro_normalized_score, 4) },
            { label: "Deliberation ceiling", value: `${formatNumber(level.max_deliberation_tokens, 0)} tokens` },
            { label: "Ceiling hits", value: `${level.deliberation_limit_hits ?? "n/c"}/${level.deliberation_requests ?? "n/c"}` },
            { label: "Total tokens", value: formatNumber(level.total_tokens, 0) },
            { label: "Reasoning tokens", value: formatNumber(level.reasoning_tokens, 0) },
            { label: "Effective speed", value: `${formatNumber(level.effective_output_tokens_per_second, 3)} tok/s` },
            { label: "Wall time", value: formatDuration(level.wall_seconds) },
          ],
        },
        saturation === 1 ? "invalid" : "neutral",
      );
      const challenges = (level.challenges ?? []).map(item => detailButton(
        item.challenge,
        item.mean_normalized_score === null || item.mean_normalized_score === undefined
          ? "invalid"
          : formatNumber(item.mean_normalized_score, 2),
        {
          kicker: `${model.model} · ${level.level} reasoning`,
          title: item.challenge,
          summary: scoreExplanation(item.mean_normalized_score),
          values: [
            { label: "Verifier result", value: Number(item.successful ?? 0) > 0 ? "Feasible" : "Invalid" },
            { label: "Normalized score", value: formatNumber(item.mean_normalized_score, 4) },
            { label: "Candidate objective", value: formatNumber(item.mean_candidate_objective, 4) },
            { label: "Baseline objective", value: formatNumber(item.mean_baseline_objective, 4) },
            { label: "Theoretical lower bound", value: formatNumber(item.mean_lower_bound, 4) },
            { label: "Improvement over baseline", value: formatNumber(item.mean_improvement_over_baseline, 4) },
            { label: "Feasible rate", value: formatPercent(item.feasible_rate) },
          ],
        },
        Number(item.successful ?? 0) > 0
          ? (item.mean_normalized_score < 0 ? "negative" : "positive")
          : "invalid",
      )).join("") || '<span class="empty-inline">Per-challenge detail belongs to the legacy run and will appear after r03.</span>';
      return `<section class="reasoning-level"><div class="reasoning-level-heading"><span class="badge complete">${escapeHtml(level.level)}</span>${summaryButton}</div><div class="metric-chip-grid">${challenges}</div></section>`;
    }).join("")}</div>
  </article>`).join("");
}

function bindControls() {
  document.querySelectorAll("[data-campaign-sort]").forEach(button => button.addEventListener("click", () => {
    const key = button.dataset.campaignSort;
    if (state.campaignSort.key === key) {
      state.campaignSort.direction = state.campaignSort.direction === "asc" ? "desc" : "asc";
    } else {
      state.campaignSort = {
        key,
        direction: key === "model" || key === "status" || campaignLowerIsBetter.has(key) ? "asc" : "desc",
      };
    }
    renderCampaign();
  }));
  document.querySelectorAll("[data-sort]").forEach(button => button.addEventListener("click", () => {
    state.sort = button.dataset.sort;
    document.querySelectorAll("[data-sort]").forEach(candidate => candidate.setAttribute("aria-pressed", String(candidate === button)));
    renderRuns();
  }));
  document.querySelector("#show-incomplete").addEventListener("change", event => {
    state.showIncomplete = event.currentTarget.checked;
    renderRuns();
  });
  document.addEventListener("click", event => {
    const trigger = event.target.closest("[data-detail]");
    if (trigger) showDetail(trigger.dataset.detail);
  });
  document.querySelector("#result-dialog-close").addEventListener("click", () => {
    document.querySelector("#result-dialog").close();
  });
  document.querySelector("#result-dialog").addEventListener("click", event => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  });
}

async function initialize() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Dataset returned HTTP ${response.status}`);
    state.data = await response.json();
    state.details.clear();
    state.detailSequence = 0;
    document.querySelector("#run-count").textContent = state.data.campaign?.models.length ?? state.data.creative_runs.length;
    document.querySelector("#pass-count").textContent = state.data.campaign?.counts.complete ?? state.data.creative_runs.filter(run => run.verification === "passed").length;
    document.querySelector("#last-updated").textContent = `Dataset ${state.data.status} · updated ${state.data.updated_at.slice(0, 10)}`;
    renderRuns();
    renderSecondary();
    renderCampaign();
    renderReasoning();
    bindControls();
  } catch (error) {
    document.querySelector("#run-chart").innerHTML = `<p role="alert">The public dataset could not be loaded: ${error.message}</p>`;
    document.querySelector("#last-updated").textContent = "Dataset unavailable";
  }
}

initialize();
