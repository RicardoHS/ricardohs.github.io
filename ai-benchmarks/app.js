const DATA_URL = "/content/ai-benchmark-results.json";

const state = {
  data: null,
  sort: "speed",
  showIncomplete: true,
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

function renderCampaign() {
  const campaign = state.data.campaign;
  if (!campaign) {
    document.querySelector("#campaign-counts").innerHTML = '<p class="empty-state">No campaign snapshot published yet.</p>';
    document.querySelector("#campaign-models").innerHTML = "";
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
  document.querySelector("#campaign-models").innerHTML = rows.map(run => {
    const optimizationRows = run.optimization_results?.length
      ? run.optimization_results
      : ["cajas", "sparks", "circuito", "reparto", "stock"].map(challenge => ({
          challenge,
          cases: run.optimization_cases ? 1 : null,
          successful: run[`optimization_${challenge}_score`] === null ? 0 : 1,
          feasible_rate: run[`optimization_${challenge}_score`] === null ? 0 : 1,
          mean_normalized_score: run[`optimization_${challenge}_score`],
          mean_improvement_over_baseline: null,
        }));
    const optimization = optimizationRows
      .filter(item => item.cases !== null && item.cases !== undefined)
      .map(item => {
        const score = item.mean_normalized_score;
        const feasible = Number(item.successful ?? 0) > 0;
        return detailButton(
          item.challenge,
          score === null || score === undefined ? "invalid" : formatNumber(score, 2),
          {
            kicker: `${run.model} · optimization`,
            title: item.challenge,
            summary: scoreExplanation(score),
            values: [
              { label: "Verifier result", value: feasible ? "Feasible" : "Invalid / no feasible solution" },
              { label: "Normalized score", value: formatNumber(score, 4) },
              { label: "Candidate objective", value: formatNumber(item.mean_candidate_objective, 4) },
              { label: "Baseline objective", value: formatNumber(item.mean_baseline_objective, 4) },
              { label: "Theoretical lower bound", value: formatNumber(item.mean_lower_bound, 4) },
              { label: "Improvement over baseline", value: formatNumber(item.mean_improvement_over_baseline, 4) },
              { label: "Feasible cases", value: `${item.successful ?? 0}/${item.cases ?? 0}` },
              { label: "Feasible rate", value: formatPercent(item.feasible_rate) },
            ],
          },
          feasible ? (score < 0 ? "negative" : "positive") : "invalid",
        );
      }).join("") || '<span class="empty-inline">Not measured</span>';

    const runtime = run.decode_mean === null || run.decode_mean === undefined
      ? '<span class="empty-inline">Not measured</span>'
      : detailButton("decode", `${formatNumber(run.decode_mean, 2)} tok/s`, {
          kicker: `${run.model} · runtime smoke`,
          title: "Concurrent decode throughput",
          summary: "Mean per-request decode rate from the two-request runtime smoke. This is not aggregate server throughput.",
          values: [
            { label: "Mean", value: `${formatNumber(run.decode_mean, 4)} tok/s` },
            { label: "Standard deviation", value: `${formatNumber(run.decode_stddev, 4)} tok/s` },
            { label: "Observed host memory", value: `${formatNumber(run.host_used_gib, 2)} GiB` },
            { label: "Available host memory", value: `${formatNumber(run.host_available_gib, 2)} GiB` },
          ],
        });

    const arc = run.arc_agentic_tasks === null || run.arc_agentic_tasks === undefined
      ? '<span class="empty-inline">Paused / not measured</span>'
      : detailButton("ARC agentic", `${run.arc_agentic_exact ?? 0} exact`, {
          kicker: `${run.model} · ARC-AGI-2 agentic`,
          title: "Agentic ARC result",
          summary: "The agent may use the enabled tools and model-native vision. Exact tasks and cell accuracy are reported separately.",
          values: [
            { label: "Exact tasks", value: String(run.arc_agentic_exact ?? "n/c") },
            { label: "Tasks evaluated", value: `${run.arc_agentic_tasks}/${run.arc_agentic_target_tasks ?? 120}` },
            { label: "Cell accuracy", value: formatPercent(run.arc_agentic_cell_accuracy) },
            { label: "Vision enabled", value: run.arc_agentic_vision ? "Yes" : "No" },
          ],
        });

    const np = [
      ["MaxCut", run.np_maxcut_points, run.np_maxcut_valid, run.np_maxcut_instances],
      ["Max3SAT", run.np_max3sat_points, run.np_max3sat_valid, run.np_max3sat_instances],
    ].map(([name, points, valid, instances]) => points === null || points === undefined ? "" : detailButton(
      name,
      formatNumber(points, 1),
      {
        kicker: `${run.model} · NP Frontier`,
        title: name,
        summary: "One-shot optimization frontier score. The independent verifier ignores model-declared objectives.",
        values: [
          { label: "Frontier points", value: formatNumber(points, 4) },
          { label: "Valid solutions", value: `${valid ?? "n/c"}/${instances ?? "n/c"}` },
        ],
      },
      valid ? "positive" : "invalid",
    )).join("") || '<span class="empty-inline">Not measured</span>';

    const refugio = run.refugio_hidden_score === null || run.refugio_hidden_score === undefined
      ? '<span class="empty-inline">Not measured</span>'
      : detailButton("REFUGIO", String(run.refugio_hidden_score), {
          kicker: `${run.model} · policy arena`,
          title: "REFUGIO hidden evaluation",
          summary: "A policy is developed against public instances, then scored once against the frozen hidden suite.",
          values: [
            { label: "Hidden score", value: String(run.refugio_hidden_score) },
            { label: "Development score", value: String(run.refugio_development_score ?? "n/c") },
            { label: "Agent wall time", value: formatDuration(run.refugio_agent_seconds) },
          ],
        });

    return `<article class="model-result-card ${escapeHtml(run.status)}">
      <header class="model-result-header">
        <div><h3>${escapeHtml(run.model)}</h3><span>${escapeHtml(run.quantization ?? "native")} · ${escapeHtml(run.topology)}</span></div>
        <span class="badge ${escapeHtml(run.status)}">${escapeHtml(labels[run.status] ?? run.status)}${run.provisional ? " · provisional" : ""}</span>
      </header>
      <div class="model-test-grid">
        <section class="test-group wide"><h4>Optimization · each challenge</h4><div class="metric-chip-grid">${optimization}</div></section>
        <section class="test-group"><h4>Runtime</h4><div class="metric-chip-grid">${runtime}</div></section>
        <section class="test-group"><h4>ARC agentic</h4><div class="metric-chip-grid">${arc}</div></section>
        <section class="test-group"><h4>NP Frontier</h4><div class="metric-chip-grid">${np}</div></section>
        <section class="test-group"><h4>Policy arena</h4><div class="metric-chip-grid">${refugio}</div></section>
      </div>
      <div class="model-result-footer"><div class="capability-list">${run.capabilities.map(item => `<span>${escapeHtml(item)}</span>`).join("") || "—"}</div></div>
    </article>`;
  }).join("");
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
