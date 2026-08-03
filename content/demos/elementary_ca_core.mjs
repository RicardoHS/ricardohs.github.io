export const RULE_NEIGHBORHOODS = [7, 6, 5, 4, 3, 2, 1, 0];

export function ruleOutput(rule, neighborhood) {
    validateRule(rule);
    if (!Number.isInteger(neighborhood) || neighborhood < 0 || neighborhood > 7) {
        throw new RangeError("Neighborhood must be an integer between 0 and 7.");
    }
    return (rule >> neighborhood) & 1;
}

export class ElementaryAutomaton {
    constructor(width, {rule = 30, boundary = "fixed"} = {}) {
        if (!Number.isInteger(width) || width < 3) {
            throw new RangeError("Width must be an integer of at least 3.");
        }

        this.width = width;
        this.current = new Uint8Array(width);
        this.next = new Uint8Array(width);
        this.setRule(rule);
        this.setBoundary(boundary);
    }

    setRule(rule) {
        validateRule(rule);
        this.rule = rule;
    }

    setBoundary(boundary) {
        if (boundary !== "fixed" && boundary !== "periodic") {
            throw new RangeError('Boundary must be "fixed" or "periodic".');
        }
        this.boundary = boundary;
    }

    clear() {
        this.current.fill(0);
        this.next.fill(0);
        return this.current;
    }

    seedSingle() {
        this.clear();
        this.current[Math.floor(this.width / 2)] = 1;
        return this.current;
    }

    seedRandom(density = 0.5, random = Math.random) {
        if (!Number.isFinite(density) || density < 0 || density > 1) {
            throw new RangeError("Density must be between 0 and 1.");
        }

        for (let index = 0; index < this.width; index += 1) {
            this.current[index] = random() < density ? 1 : 0;
        }
        this.next.fill(0);
        return this.current;
    }

    step() {
        const lastIndex = this.width - 1;

        for (let index = 0; index < this.width; index += 1) {
            const left = index === 0
                ? (this.boundary === "periodic" ? this.current[lastIndex] : 0)
                : this.current[index - 1];
            const center = this.current[index];
            const right = index === lastIndex
                ? (this.boundary === "periodic" ? this.current[0] : 0)
                : this.current[index + 1];
            const neighborhood = (left << 2) | (center << 1) | right;

            this.next[index] = (this.rule >> neighborhood) & 1;
        }

        [this.current, this.next] = [this.next, this.current];
        return this.current;
    }

    liveCount() {
        let count = 0;
        for (const cell of this.current) {
            count += cell;
        }
        return count;
    }
}

function validateRule(rule) {
    if (!Number.isInteger(rule) || rule < 0 || rule > 255) {
        throw new RangeError("Rule must be an integer between 0 and 255.");
    }
}

