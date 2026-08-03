import {
    ElementaryAutomaton,
    RULE_NEIGHBORHOODS,
    ruleOutput,
} from "./elementary_ca_core.mjs";

const canvas = document.querySelector("#automaton-canvas");
const context = canvas.getContext("2d", {alpha: false});
const ruleRange = document.querySelector("#rule-range");
const ruleNumber = document.querySelector("#rule-number");
const ruleBinary = document.querySelector("#rule-binary");
const densityRange = document.querySelector("#density-range");
const densityValue = document.querySelector("#density-value");
const ticksRange = document.querySelector("#ticks-range");
const ticksNumber = document.querySelector("#ticks-number");
const boundarySelect = document.querySelector("#boundary-select");
const playPauseButton = document.querySelector("#play-pause-button");
const stepButton = document.querySelector("#step-button");
const randomButton = document.querySelector("#random-button");
const singleButton = document.querySelector("#single-button");
const clearButton = document.querySelector("#clear-button");
const generationValue = document.querySelector("#generation-value");
const liveValue = document.querySelector("#live-value");
const statusValue = document.querySelector("#status-value");

const COLORS = {
    alive: [188, 255, 92, 255],
    dead: [7, 13, 11, 255],
};
const automaton = new ElementaryAutomaton(canvas.width, {
    rule: Number(ruleNumber.value),
    boundary: boundarySelect.value,
});
const rowImage = context.createImageData(canvas.width, 1);

let generation = 0;
let canvasRow = 0;
let isRunning = true;
let previousTimestamp = performance.now();
let accumulatedTime = 0;

function clampInteger(value, minimum, maximum) {
    return Math.min(maximum, Math.max(minimum, Math.round(Number(value))));
}

function updateRule(value) {
    const rule = clampInteger(value, 0, 255);
    automaton.setRule(rule);
    ruleRange.value = rule;
    ruleNumber.value = rule;
    ruleBinary.textContent = rule.toString(2).padStart(8, "0");

    for (const neighborhood of RULE_NEIGHBORHOODS) {
        const output = ruleOutput(rule, neighborhood);
        document.querySelector(`[data-neighborhood="${neighborhood}"] .rule-output`).textContent = output;
    }

    setStatus(`Rule ${rule} will be used for the next row.`);
}

function updateTicks(value) {
    const ticks = clampInteger(value, 1, 240);
    ticksRange.value = ticks;
    ticksNumber.value = ticks;
}

function updateDensity() {
    densityValue.textContent = `${Math.round(Number(densityRange.value) * 100)}%`;
}

function setStatus(message) {
    statusValue.textContent = message;
}

function resetCanvas() {
    context.fillStyle = `rgb(${COLORS.dead[0]}, ${COLORS.dead[1]}, ${COLORS.dead[2]})`;
    context.fillRect(0, 0, canvas.width, canvas.height);
    canvasRow = 0;
    generation = 0;
}

function drawCurrentRow() {
    if (canvasRow >= canvas.height) {
        context.drawImage(
            canvas,
            0,
            1,
            canvas.width,
            canvas.height - 1,
            0,
            0,
            canvas.width,
            canvas.height - 1,
        );
        context.fillStyle = `rgb(${COLORS.dead[0]}, ${COLORS.dead[1]}, ${COLORS.dead[2]})`;
        context.fillRect(0, canvas.height - 1, canvas.width, 1);
        canvasRow = canvas.height - 1;
    }

    for (let index = 0; index < automaton.width; index += 1) {
        const color = automaton.current[index] === 1 ? COLORS.alive : COLORS.dead;
        const offset = index * 4;
        rowImage.data[offset] = color[0];
        rowImage.data[offset + 1] = color[1];
        rowImage.data[offset + 2] = color[2];
        rowImage.data[offset + 3] = color[3];
    }

    context.putImageData(rowImage, 0, canvasRow);
    canvasRow += 1;
    generationValue.textContent = generation.toLocaleString();
    liveValue.textContent = automaton.liveCount().toLocaleString();
}

function tick() {
    automaton.step();
    generation += 1;
    drawCurrentRow();
}

function setRunning(nextRunning) {
    isRunning = nextRunning;
    playPauseButton.textContent = isRunning ? "Pause" : "Play";
    playPauseButton.setAttribute("aria-pressed", String(isRunning));
    setStatus(isRunning ? "Running." : "Paused.");
}

function startWithSingleCell() {
    automaton.seedSingle();
    resetCanvas();
    drawCurrentRow();
    setRunning(true);
    setStatus("Started from one cell in the center.");
}

function startWithRandomState() {
    automaton.seedRandom(Number(densityRange.value));
    resetCanvas();
    drawCurrentRow();
    setRunning(true);
    setStatus(`Started from a ${densityValue.textContent} random state.`);
}

function clearSimulation() {
    automaton.clear();
    resetCanvas();
    drawCurrentRow();
    setRunning(false);
    setStatus("Cleared. Choose an initial state or draw the next empty step.");
}

function animationLoop(timestamp) {
    const elapsed = Math.min(timestamp - previousTimestamp, 250);
    previousTimestamp = timestamp;

    if (isRunning) {
        accumulatedTime += elapsed;
        const millisecondsPerTick = 1000 / Number(ticksNumber.value);
        let ticksThisFrame = 0;

        while (accumulatedTime >= millisecondsPerTick && ticksThisFrame < 12) {
            tick();
            accumulatedTime -= millisecondsPerTick;
            ticksThisFrame += 1;
        }
    } else {
        accumulatedTime = 0;
    }

    requestAnimationFrame(animationLoop);
}

ruleRange.addEventListener("input", () => updateRule(ruleRange.value));
ruleNumber.addEventListener("input", () => updateRule(ruleNumber.value));
ticksRange.addEventListener("input", () => updateTicks(ticksRange.value));
ticksNumber.addEventListener("input", () => updateTicks(ticksNumber.value));
densityRange.addEventListener("input", updateDensity);
boundarySelect.addEventListener("change", () => {
    automaton.setBoundary(boundarySelect.value);
    setStatus(`${boundarySelect.options[boundarySelect.selectedIndex].text} will be used for the next row.`);
});
playPauseButton.addEventListener("click", () => setRunning(!isRunning));
stepButton.addEventListener("click", () => {
    setRunning(false);
    tick();
    setStatus("Advanced one generation.");
});
randomButton.addEventListener("click", startWithRandomState);
singleButton.addEventListener("click", startWithSingleCell);
clearButton.addEventListener("click", clearSimulation);

document.addEventListener("keydown", event => {
    if (event.target.matches("input, select, textarea, button")) {
        return;
    }
    if (event.code === "Space") {
        event.preventDefault();
        setRunning(!isRunning);
    } else if (event.key.toLowerCase() === "r") {
        startWithRandomState();
    } else if (event.key.toLowerCase() === "s") {
        startWithSingleCell();
    } else if (event.key.toLowerCase() === "c") {
        clearSimulation();
    }
});

updateRule(ruleNumber.value);
updateTicks(ticksNumber.value);
updateDensity();
startWithSingleCell();
requestAnimationFrame(animationLoop);

