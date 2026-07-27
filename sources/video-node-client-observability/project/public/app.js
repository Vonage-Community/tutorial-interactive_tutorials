const scenarioActions = document.querySelector("#scenario-actions");
const requestStatus = document.querySelector("#request-status");
const recordCount = document.querySelector("#record-count");
const summaryMetrics = document.querySelector("#summary-metrics");
const recordsTable = document.querySelector("#records-table");
const alertsContainer = document.querySelector("#alerts");
const supportCaseContainer = document.querySelector("#support-case");
const exerciseChecks = document.querySelector("#exercise-checks");
const completionToken = document.querySelector("#completion-token");
const resetButton = document.querySelector("#reset-button");

await initialize();

async function initialize() {
  resetButton.addEventListener("click", resetData);
  await Promise.all([loadScenarios(), refresh()]);
}

async function loadScenarios() {
  const scenarios = await requestJson("/api/scenarios");
  scenarioActions.replaceChildren(
    ...scenarios.map((scenario) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scenario-button";
      button.innerHTML = `
        <strong>${escapeHtml(scenario.name)}</strong>
        <span>${escapeHtml(scenario.description)}</span>
        <small>${scenario.sampleCount} samples</small>
      `;
      button.addEventListener("click", () => runScenario(scenario.id));
      return button;
    })
  );
}

async function runScenario(scenarioId) {
  setRequestStatus("Processing telemetry...");
  try {
    await requestJson(`/api/scenarios/${scenarioId}`, { method: "POST" });
    setRequestStatus("Telemetry accepted.");
    await refresh();
  } catch (error) {
    setRequestStatus(error.message, true);
  }
}

async function resetData() {
  await fetch("/api/reset", { method: "POST" });
  setRequestStatus("Stored telemetry cleared.");
  await refresh();
}

async function refresh() {
  const [dashboard, supportCase, exerciseStatus] = await Promise.all([
    requestJson("/api/dashboard"),
    requestJson("/api/support-case"),
    requestJson("/api/exercise/status")
  ]);

  renderDashboard(dashboard);
  renderSupportCase(supportCase);
  renderExerciseStatus(exerciseStatus);
}

function renderDashboard(dashboard) {
  recordCount.textContent = dashboard.recordCount;
  const summary = dashboard.sessions[0];

  summaryMetrics.replaceChildren(
    metric("Publisher samples", summary?.publisherSamples ?? 0),
    metric("Subscriber samples", summary?.subscriberSamples ?? 0),
    metric("Warning samples", summary?.warningSamples ?? 0),
    metric("Affected streams", summary?.affectedStreams ?? 0)
  );

  recordsTable.replaceChildren(
    ...dashboard.recentRecords.map((record) => {
      const row = document.createElement("tr");
      const metrics = record.metrics ?? {};
      row.innerHTML = `
        <td>${formatTime(record.capturedAt)}</td>
        <td>${escapeHtml(record.source ?? "unknown")}</td>
        <td><span class="condition condition-${escapeHtml(
          metrics.networkCondition ?? "unknown"
        )}">${escapeHtml(metrics.networkCondition ?? "unknown")}</span></td>
        <td>${escapeHtml(metrics.networkConditionReason ?? "unknown")}</td>
        <td>${formatBitrate(metrics.videoBitrate)}</td>
      `;
      return row;
    })
  );

  if (dashboard.alerts.length === 0) {
    alertsContainer.className = "empty-state";
    alertsContainer.textContent = "No sustained issues detected.";
  } else {
    alertsContainer.className = "alert-list";
    alertsContainer.innerHTML = dashboard.alerts
      .map(
        (alert) => `
          <article class="alert-item">
            <strong>${escapeHtml(alert.condition)} network condition</strong>
            <span>${escapeHtml(alert.reason)} | ${escapeHtml(
              alert.degradationSource
            )}</span>
            <small>${alert.sampleCount} consecutive samples</small>
          </article>
        `
      )
      .join("");
  }
}

function renderSupportCase({ report, evidence }) {
  if (evidence.telemetry.length === 0) {
    supportCaseContainer.className = "empty-state";
    supportCaseContainer.textContent =
      "Run the sustained issue scenario to match the report with telemetry.";
    return;
  }

  supportCaseContainer.className = "support-evidence";
  supportCaseContainer.innerHTML = `
    <strong>${escapeHtml(report.caseId)}</strong>
    <p>${escapeHtml(report.summary)}</p>
    <dl>
      <div><dt>Telemetry records</dt><dd>${evidence.telemetry.length}</dd></div>
      <div><dt>Platform samples</dt><dd>${evidence.platformSamples.length}</dd></div>
      <div><dt>Connection</dt><dd>${escapeHtml(
        evidence.identifiers.connectionIds[0] ?? "Not matched"
      )}</dd></div>
      <div><dt>Stream</dt><dd>${escapeHtml(
        evidence.identifiers.streamIds[0] ?? "Not matched"
      )}</dd></div>
    </dl>
  `;
}

function renderExerciseStatus(status) {
  exerciseChecks.replaceChildren(
    ...status.checks.map((check) => {
      const item = document.createElement("li");
      item.className = check.complete ? "check-complete" : "";
      item.innerHTML = `
        <span aria-hidden="true">${check.complete ? "✓" : "○"}</span>
        ${escapeHtml(check.label)}
      `;
      return item;
    })
  );

  completionToken.hidden = !status.complete;
  completionToken.textContent = status.token
    ? `Completion credential: ${status.token}`
    : "";
}

function metric(label, value) {
  const element = document.createElement("div");
  element.className = "metric";
  element.innerHTML = `<span>${escapeHtml(label)}</span><strong>${value}</strong>`;
  return element;
}

function setRequestStatus(message, isError = false) {
  requestStatus.textContent = message;
  requestStatus.classList.toggle("request-error", isError);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error ?? "The request failed.");
  }
  return body;
}

function formatTime(value) {
  if (!value) {
    return "Unknown";
  }
  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }).format(new Date(value));
}

function formatBitrate(value) {
  return Number.isFinite(value) ? `${Math.round(value / 1000)} kbps` : "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
