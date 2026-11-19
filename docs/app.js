import { compoundAmount, compoundInterest, simpleInterest, yearlyBalances } from "./interest.js";

const FIELDS = ["principal", "rate", "years"];
const RULES = {
  principal: { name: "Amount", max: 1e12, whole: false, min: 0 },
  rate: { name: "Rate", max: 100, whole: false, min: 0 },
  years: { name: "Years", max: 100, whole: true, min: 1 },
};
const MAX_CHARS = 13;

// What the user has typed, kept as text so "12." can be shown while typing
const state = {
  entries: { principal: "1000", rate: "5", years: "20" },
  active: "principal",
  fresh: true, // the next digit replaces the value instead of appending
  mode: "compound",
};

const money = new Intl.NumberFormat("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const SVG_NS = "http://www.w3.org/2000/svg";

/* ---------- Input handling ---------- */

function select(field) {
  state.active = field;
  state.fresh = true;
  render();
}

function next(step = 1) {
  const i = FIELDS.indexOf(state.active);
  select(FIELDS[(i + step + FIELDS.length) % FIELDS.length]);
}

function type(char) {
  let text = state.fresh ? "" : state.entries[state.active];
  state.fresh = false;
  if (char === ".") {
    if (RULES[state.active].whole || text.includes(".")) return render();
    text = (text || "0") + ".";
  } else {
    text = text === "0" ? char : text + char;
  }
  if (text.length <= MAX_CHARS) state.entries[state.active] = text;
  render();
}

function backspace() {
  state.fresh = false;
  state.entries[state.active] = state.entries[state.active].slice(0, -1);
  render();
}

function clearEntry() {
  state.fresh = false;
  state.entries[state.active] = "";
  render();
}

function setMode(mode) {
  state.mode = mode;
  render();
}

/* ---------- Validation ---------- */

function validate() {
  const values = {};
  const problems = {};
  for (const field of FIELDS) {
    const rule = RULES[field];
    const text = state.entries[field];
    const value = Number(text);
    if (text === "" || text === ".") problems[field] = `Enter ${rule.name.toLowerCase()}.`;
    else if (value < rule.min) problems[field] = `${rule.name} needs to be ${rule.min} or more.`;
    else if (value > rule.max) problems[field] = `${rule.name} can be at most ${rule.max.toLocaleString("en")}.`;
    else if (rule.whole && !Number.isInteger(value)) problems[field] = `${rule.name} needs to be a whole number.`;
    values[field] = value;
  }
  return { values, problems };
}

/* ---------- Rendering ---------- */

function showEntry(text) {
  if (text === "") return "";
  const [whole, fraction] = text.split(".");
  const grouped = Number(whole || 0).toLocaleString("en");
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

function render(animate = false) {
  for (const field of FIELDS) {
    $(`[data-value="${field}"]`).textContent = showEntry(state.entries[field]);
    const isActive = String(field === state.active);
    $(`.entry[data-field="${field}"]`).setAttribute("aria-pressed", isActive);
    $(`.key[data-select="${field}"]`).setAttribute("aria-pressed", isActive);
  }
  for (const key of $$(".key[data-mode]")) key.setAttribute("aria-pressed", String(key.dataset.mode === state.mode));
  $(".key[data-digit='.']").disabled = RULES[state.active].whole;

  const { values, problems } = validate();
  for (const field of FIELDS) {
    $(`.entry[data-field="${field}"]`).setAttribute("aria-invalid", String(Boolean(problems[field])));
  }

  const error = $("#error");
  const messages = Object.values(problems);
  error.hidden = messages.length === 0;
  error.textContent = messages.join(" ");
  $("#result").classList.toggle("is-stale", messages.length > 0);
  if (messages.length) return;

  const simple = simpleInterest(values);
  const compound = compoundInterest(values);
  const isCompound = state.mode === "compound";

  $("#mode-line").textContent = isCompound ? "Compound interest" : "Simple interest";
  $("#result").textContent = money.format(isCompound ? compound : simple);
  const finalBalance = isCompound ? compoundAmount(values) : values.principal + simple;
  $("#result-note").textContent = `interest earned, final balance ${money.format(finalBalance)}`;

  const difference = $("#difference");
  if (values.rate === 0 || values.principal === 0) {
    difference.textContent = "With nothing to earn interest on, simple and compound interest come to the same.";
  } else if (values.years === 1) {
    difference.textContent = "After one year, simple and compound interest are the same. The difference starts in year two, once interest earns interest.";
  } else {
    difference.replaceChildren(
      "Compound interest earns ",
      Object.assign(document.createElement("strong"), { textContent: money.format(compound - simple) }),
      " more than simple interest here, because each year’s interest earns interest too.",
    );
  }

  const rows = yearlyBalances(values);
  drawChart(rows, animate);
  drawLedger(rows);
}

function el(name, attrs = {}, text) {
  const node = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (text !== undefined) node.textContent = text;
  return node;
}

function niceStep(range, target) {
  const raw = range / target || 1;
  const power = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s >= raw);
}

function drawChart(rows, animate) {
  const svg = $("#chart");
  const W = 720, H = 380;
  const pad = { top: 16, right: 150, bottom: 40, left: 64 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;
  const last = rows[rows.length - 1];
  const maxYears = last.year;
  const maxValue = Math.max(last.compound, last.simple, 1);
  const yStep = niceStep(maxValue, 5);
  const yMax = Math.ceil(maxValue / yStep) * yStep;
  const x = (year) => pad.left + (year / maxYears) * innerW;
  const y = (value) => pad.top + innerH - (value / yMax) * innerH;
  const xStep = maxYears <= 10 ? 1 : maxYears <= 30 ? 5 : maxYears <= 60 ? 10 : 20;

  svg.replaceChildren();

  const grid = el("g", { class: "grid" });
  const axis = el("g", { class: "axis" });
  for (let v = 0; v <= yMax + 1e-9; v += yStep) {
    grid.append(el("line", { x1: pad.left, x2: pad.left + innerW, y1: y(v), y2: y(v) }));
    axis.append(el("text", { x: pad.left - 10, y: y(v) + 5, "text-anchor": "end" }, compact.format(v)));
  }
  for (let year = 0; year <= maxYears; year += xStep) {
    grid.append(el("line", { x1: x(year), x2: x(year), y1: pad.top, y2: pad.top + innerH }));
    axis.append(el("text", { x: x(year), y: H - 12, "text-anchor": "middle" }, year === 0 ? "start" : `${year} y`));
  }
  svg.append(grid, axis);

  const top = rows.map((r) => `${x(r.year)},${y(r.compound)}`);
  const bottom = rows.slice().reverse().map((r) => `${x(r.year)},${y(r.simple)}`);
  svg.append(el("polygon", { class: "gap", points: [...top, ...bottom].join(" ") }));

  const path = (key) => rows.map((r, i) => `${i ? "L" : "M"}${x(r.year).toFixed(1)},${y(r[key]).toFixed(1)}`).join(" ");
  svg.append(el("path", { class: "line simple", d: path("simple") }));
  const curve = el("path", { class: "line compound", d: path("compound") });
  svg.append(curve);
  if (animate) {
    curve.style.setProperty("--length", Math.ceil(curve.getTotalLength()));
    curve.classList.add("draw");
  }

  // End labels, pushed apart so they never overlap
  const yCompound = y(last.compound) + 5;
  const ySimple = Math.max(y(last.simple) + 5, yCompound + 24);
  svg.append(el("text", { class: "end-label compound", x: x(maxYears) + 12, y: yCompound }, money.format(last.compound)));
  svg.append(el("text", { class: "end-label simple", x: x(maxYears) + 12, y: ySimple }, money.format(last.simple)));
}

function drawLedger(rows) {
  $("#ledger-body").replaceChildren(
    ...rows.slice(1).map((r) => {
      const tr = document.createElement("tr");
      for (const value of [r.year, money.format(r.simple), money.format(r.compound), `+${money.format(r.difference)}`]) {
        tr.append(Object.assign(document.createElement("td"), { textContent: value }));
      }
      return tr;
    }),
  );
}

/* ---------- Wiring ---------- */

// Clicking a key with the mouse shouldn't move keyboard focus onto it,
// otherwise Enter would press that key again instead of moving to the next value.
document.addEventListener("mousedown", (event) => {
  if (event.target.closest(".key, .entry")) event.preventDefault();
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("button");
  if (!target) return;
  if (target.dataset.digit) type(target.dataset.digit);
  else if (target.dataset.select) select(target.dataset.select);
  else if (target.dataset.field) select(target.dataset.field);
  else if (target.dataset.mode) setMode(target.dataset.mode);
  else if (target.dataset.action === "clear") clearEntry();
  else if (target.dataset.action === "back") backspace();
  else if (target.dataset.action === "next") next();
});

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const onButton = event.target instanceof HTMLButtonElement;
  if (/^[0-9]$/.test(event.key)) type(event.key);
  else if (event.key === "." || event.key === ",") type(".");
  else if (event.key === "Backspace") backspace();
  else if (event.key === "Escape" || event.key === "Delete") clearEntry();
  else if (event.key === "ArrowDown") next(1);
  else if (event.key === "ArrowUp") next(-1);
  else if (event.key === "Enter" && !onButton) next(1);
  else return;
  event.preventDefault();
});

render(true);
