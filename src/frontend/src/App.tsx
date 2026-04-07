import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

// ─── Algorithm implementations ───────────────────────────────────────────────

/** 0/1 Knapsack — returns max marks and the DP table */
function knapsackDP(
  n: number,
  hours: number[],
  marks: number[],
  capacity: number,
): { maxMarks: number; dp: number[][]; selected: boolean[] } {
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(capacity + 1).fill(0),
  );
  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (hours[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - hours[i - 1]] + marks[i - 1],
        );
      }
    }
  }
  // Backtrack to find selected subjects
  const selected = new Array(n).fill(false) as boolean[];
  let w = capacity;
  for (let i = n; i > 0; i--) {
    if (dp[i][w] !== dp[i - 1][w]) {
      selected[i - 1] = true;
      w -= hours[i - 1];
    }
  }
  return { maxMarks: dp[n][capacity], dp, selected };
}

/** LCS — returns the LCS string and similarity percentage */
function lcsDP(a: string, b: string): { lcsStr: string; similarity: number } {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  // Reconstruct LCS string
  let result = "";
  let i = m;
  let j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      result = a[i - 1] + result;
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      i--;
    } else {
      j--;
    }
  }
  const similarity = Math.round((dp[m][n] / Math.max(m, n)) * 100);
  return { lcsStr: result, similarity };
}

/** Matrix Chain Multiplication — returns minimum scalar multiplications */
function matrixChainDP(dims: number[]): { minCost: number; dp: number[][] } {
  const n = dims.length - 1;
  const dp: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let si = 0; si <= n - len; si++) {
      const sj = si + len - 1;
      dp[si][sj] = Number.POSITIVE_INFINITY;
      for (let k = si; k < sj; k++) {
        const cost =
          dp[si][k] + dp[k + 1][sj] + dims[si] * dims[k + 1] * dims[sj + 1];
        if (cost < dp[si][sj]) {
          dp[si][sj] = cost;
        }
      }
    }
  }
  return { minCost: dp[0][n - 1], dp };
}

// ─── DP Table Components ──────────────────────────────────────────────────────

interface DPCell {
  key: string;
  value: number;
  className: string;
}
interface DPRow {
  key: string;
  label: string;
  cells: DPCell[];
}

function KnapsackDPTable({
  dp,
  capacity,
}: { dp: number[][]; capacity: number }) {
  const headerCols = Array.from({ length: capacity + 1 }, (_, c) => ({
    key: `kh-${c}`,
    label: `${c}h`,
  }));

  const rows: DPRow[] = dp.map((row, ri) => ({
    key: `kr-${ri}`,
    label: ri === 0 ? "Base" : `S${ri}`,
    cells: row.map((val, ci) => {
      const isOptimal = ri === dp.length - 1 && ci === capacity && val > 0;
      return {
        key: `kc-${ri}-${ci}`,
        value: val,
        className: isOptimal
          ? "dp-cell-optimal"
          : val > 0
            ? "dp-cell-computed"
            : "bg-card text-muted-foreground",
      };
    }),
  }));

  return (
    <table className="text-xs border-collapse">
      <thead>
        <tr>
          <th className="dp-cell-header px-2 py-1.5 border sticky left-0 z-10 min-w-[60px]">
            Subj\Time
          </th>
          {headerCols.map((col) => (
            <th
              key={col.key}
              className="dp-cell-header px-2 py-1.5 border min-w-[36px]"
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td className="dp-cell-header px-2 py-1.5 border sticky left-0 z-10">
              {row.label}
            </td>
            {row.cells.map((cell) => (
              <td
                key={cell.key}
                className={`px-2 py-1.5 border text-center transition-colors ${cell.className}`}
              >
                {cell.value}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MatrixChainDPTable({ dp }: { dp: number[][] }) {
  const n = dp.length;
  const headerCols = dp[0].map((_, j) => `S${j + 1}`);

  const rows: DPRow[] = dp.map((row, ri) => ({
    key: `mr-S${ri + 1}`,
    label: `S${ri + 1}`,
    cells: row.map((val, ci) => ({
      key: `mc-${ri + 1}-${ci + 1}`,
      value: val,
      className:
        ri === 0 && ci === n - 1
          ? "dp-cell-optimal"
          : val > 0 && val !== Number.POSITIVE_INFINITY
            ? "dp-cell-computed"
            : "bg-card text-muted-foreground",
    })),
  }));

  return (
    <table className="text-xs border-collapse">
      <thead>
        <tr>
          <th className="dp-cell-header px-2 py-1.5 border min-w-[50px]">
            i \ j
          </th>
          {headerCols.map((label) => (
            <th
              key={`mh-${label}`}
              className="dp-cell-header px-2 py-1.5 border min-w-[60px]"
            >
              {label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key}>
            <td className="dp-cell-header px-2 py-1.5 border">{row.label}</td>
            {row.cells.map((cell) => (
              <td
                key={cell.key}
                className={`px-2 py-1.5 border text-center ${cell.className}`}
              >
                {cell.value === Number.POSITIVE_INFINITY
                  ? "—"
                  : cell.value.toLocaleString()}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function isValidInt(val: number): boolean {
  return !Number.isNaN(val);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const sections = [
    "home",
    "about",
    "algorithms",
    "demo",
    "comparison",
    "conclusion",
  ] as const;

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <header
      className="sticky top-0 z-50 bg-card border-b shadow-sm"
      data-ocid="nav"
    >
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <span className="font-display font-bold text-lg text-primary">
          📚 DP Optimizer
        </span>
        <nav className="hidden md:flex items-center gap-1">
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => scrollTo(s)}
              className="px-3 py-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth capitalize"
              data-ocid={`nav-${s}`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </nav>
        <button
          type="button"
          className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          data-ocid="nav-hamburger"
        >
          <div className="w-5 flex flex-col gap-1">
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? "rotate-45 translate-y-1.5" : ""}`}
            />
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
            />
          </div>
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden border-t bg-card px-4 py-3 flex flex-col gap-1">
          {sections.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => scrollTo(s)}
              className="text-left px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth capitalize"
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.95 0.04 260) 0%, oklch(0.96 0.03 280) 50%, oklch(0.94 0.04 310) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
              Dynamic Programming
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-foreground mb-4">
              Student Life <span className="text-primary">Optimization</span>{" "}
              System
            </h1>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Ever felt overwhelmed deciding which subjects to study, or if your
              notes are similar? Dynamic Programming turns complex life
              decisions into <strong>step-by-step math</strong> — solve it once,
              reuse the answer forever.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button
                size="lg"
                className="font-semibold"
                onClick={() =>
                  document
                    .getElementById("demo")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="hero-try-demo"
              >
                🚀 Try the Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("about")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                data-ocid="hero-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <img
              src="/assets/generated/hero-dp-optimization.dim_1200x500.jpg"
              alt="Dynamic programming visualization"
              className="rounded-2xl shadow-xl w-full object-cover"
              style={{ maxHeight: 320 }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const dpConcepts = [
  {
    icon: "🔄",
    title: "Solve Once",
    desc: "Calculate a sub-result exactly once, no matter how many times it's needed.",
  },
  {
    icon: "📦",
    title: "Reuse Many Times",
    desc: "Store answers in a table (memoization) and look them up instantly.",
  },
  {
    icon: "🔗",
    title: "Overlapping Subproblems",
    desc: "Big problems break into smaller ones that repeat — DP exploits this.",
  },
  {
    icon: "🏆",
    title: "Optimal Substructure",
    desc: "The best solution to the big problem is built from best sub-solutions.",
  },
];

function AboutSection() {
  return (
    <section id="about" className="py-20 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-secondary/20 text-secondary-foreground border-secondary/20">
            About DP
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            What is Dynamic Programming?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Think of it like a smart student who writes answers on a sticky note
            instead of solving the same problem twice. That's exactly what DP
            does — <em>solve once, reuse many times.</em>
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {dpConcepts.map((c) => (
            <Card key={c.title} className="card-hover border bg-card">
              <CardContent className="pt-6">
                <div className="text-3xl mb-3">{c.icon}</div>
                <h3 className="font-display font-bold text-base mb-2">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-10 p-6 rounded-xl bg-primary/5 border border-primary/10">
          <p className="text-sm text-foreground leading-relaxed">
            <strong>🧠 Real analogy:</strong> Imagine you're asked "What's
            12×15?" five times during an exam. Instead of multiplying each time,
            you write{" "}
            <code className="bg-primary/10 px-1 rounded text-primary">180</code>{" "}
            on your rough sheet and reuse it. That's memoization! DP applies
            this idea to problems with{" "}
            <strong>hundreds of overlapping sub-calculations</strong>.
          </p>
        </div>
      </div>
    </section>
  );
}

const algorithmCards = [
  {
    key: "knapsack",
    icon: "🎒",
    title: "Study Time Optimization",
    subtitle: "0/1 Knapsack Problem",
    colorClass: "text-primary",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/20",
    badgeClass: "bg-primary/10 text-primary border-primary/20",
    realUse:
      "Pick the best subjects to study given a time limit to maximize marks.",
    input:
      "Number of subjects, hours each takes, marks each gives, total study hours",
    output: "Maximum marks achievable within your time budget",
    complexity: "O(n × W)",
  },
  {
    key: "lcs",
    icon: "📝",
    title: "Notes Similarity Checker",
    subtitle: "Longest Common Subsequence",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/5",
    borderClass: "border-secondary/20",
    badgeClass: "bg-secondary/10 text-secondary-foreground border-secondary/20",
    realUse:
      "Check how similar two sets of notes are — useful for plagiarism detection.",
    input: "Two text strings (notes A and notes B)",
    output: "Longest matching subsequence and a % similarity score",
    complexity: "O(m × n)",
  },
  {
    key: "matrix",
    icon: "📐",
    title: "Study Order Optimizer",
    subtitle: "Matrix Chain Multiplication",
    colorClass: "text-accent",
    bgClass: "bg-accent/5",
    borderClass: "border-accent/20",
    badgeClass: "bg-accent/10 text-accent border-accent/20",
    realUse:
      "Find the optimal order to study subjects to minimize total mental effort.",
    input: "Number of subjects and their effort/dimension values",
    output: "Minimum total effort needed to master all subjects in best order",
    complexity: "O(n³)",
  },
];

function AlgorithmsSection() {
  return (
    <section
      id="algorithms"
      className="py-20"
      style={{ background: "oklch(0.96 0.01 240)" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-accent/10 text-accent border-accent/20">
            3 Algorithms
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Real-Life DP Applications
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Three everyday student problems, each solved elegantly with Dynamic
            Programming.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {algorithmCards.map((alg) => (
            <Card
              key={alg.key}
              className={`card-hover border-2 ${alg.borderClass} ${alg.bgClass}`}
            >
              <CardHeader className="pb-3">
                <div className="text-3xl mb-2">{alg.icon}</div>
                <Badge className={`w-fit text-xs mb-2 ${alg.badgeClass}`}>
                  {alg.subtitle}
                </Badge>
                <CardTitle className={`font-display text-lg ${alg.colorClass}`}>
                  {alg.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold">Real-life use:</span>{" "}
                  <span className="text-muted-foreground">{alg.realUse}</span>
                </div>
                <div>
                  <span className="font-semibold">Input:</span>{" "}
                  <span className="text-muted-foreground">{alg.input}</span>
                </div>
                <div>
                  <span className="font-semibold">Output:</span>{" "}
                  <span className="text-muted-foreground">{alg.output}</span>
                </div>
                <div>
                  <span className="font-semibold">Time:</span>{" "}
                  <code
                    className={`px-1.5 py-0.5 rounded text-xs ${alg.bgClass} ${alg.colorClass} border ${alg.borderClass}`}
                  >
                    {alg.complexity}
                  </code>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Knapsack Demo ───────────────────────────────────────────────────────────

interface KnapsackResult {
  maxMarks: number;
  dp: number[][];
  selected: boolean[];
  hours: number[];
  marks: number[];
  capacity: number;
}

function KnapsackDemo() {
  const [numSubjects, setNumSubjects] = useState("4");
  const [hoursInput, setHoursInput] = useState("2,3,4,5");
  const [marksInput, setMarksInput] = useState("10,15,20,25");
  const [capacityInput, setCapacityInput] = useState("8");
  const [result, setResult] = useState<KnapsackResult | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const n = Number.parseInt(numSubjects, 10);
    if (!isValidInt(n) || n < 1 || n > 15) {
      setError("Number of subjects must be between 1 and 15.");
      return;
    }
    const hours = hoursInput
      .split(",")
      .map((x) => Number.parseInt(x.trim(), 10));
    const marks = marksInput
      .split(",")
      .map((x) => Number.parseInt(x.trim(), 10));
    const capacity = Number.parseInt(capacityInput, 10);
    if (hours.length !== n || marks.length !== n) {
      setError(
        `Please enter exactly ${n} comma-separated values for hours and marks.`,
      );
      return;
    }
    if (
      hours.some((v) => !isValidInt(v)) ||
      marks.some((v) => !isValidInt(v))
    ) {
      setError("All hour and mark values must be valid numbers.");
      return;
    }
    if (!isValidInt(capacity) || capacity < 1) {
      setError("Total time must be a positive number.");
      return;
    }
    if (capacity > 50) {
      setError("Total time must be ≤ 50 for visualization clarity.");
      return;
    }
    const res = knapsackDP(n, hours, marks, capacity);
    setResult({ ...res, hours, marks, capacity });
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Number of Subjects
          </Label>
          <Input
            type="number"
            value={numSubjects}
            onChange={(e) => setNumSubjects(e.target.value)}
            placeholder="e.g. 4"
            min={1}
            max={15}
            data-ocid="knapsack-n"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Total Study Hours Available
          </Label>
          <Input
            type="number"
            value={capacityInput}
            onChange={(e) => setCapacityInput(e.target.value)}
            placeholder="e.g. 8"
            data-ocid="knapsack-capacity"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Hours per Subject (comma-separated)
          </Label>
          <Input
            value={hoursInput}
            onChange={(e) => setHoursInput(e.target.value)}
            placeholder="e.g. 2,3,4,5"
            data-ocid="knapsack-hours"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Marks per Subject (comma-separated)
          </Label>
          <Input
            value={marksInput}
            onChange={(e) => setMarksInput(e.target.value)}
            placeholder="e.g. 10,15,20,25"
            data-ocid="knapsack-marks"
          />
        </div>
      </div>
      {error && (
        <p
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
          data-ocid="knapsack-error"
        >
          ⚠️ {error}
        </p>
      )}
      <Button
        onClick={calculate}
        className="w-full sm:w-auto"
        data-ocid="knapsack-calculate"
      >
        🎒 Calculate Max Marks
      </Button>

      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="pt-4">
              <div className="text-2xl font-display font-bold text-primary mb-1">
                🏆 Maximum Marks: {result.maxMarks}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                With {result.capacity} hours available, you can score up to{" "}
                <strong>{result.maxMarks} marks</strong> by studying these
                subjects:
              </p>
              <div className="flex flex-wrap gap-2">
                {result.selected.map((sel, idx) =>
                  sel ? (
                    <Badge
                      key={`s${idx + 1}`}
                      className="bg-primary/15 text-primary border-primary/30"
                    >
                      Subject {idx + 1}: {result.hours[idx]}h →{" "}
                      {result.marks[idx]} marks
                    </Badge>
                  ) : null,
                )}
              </div>
            </CardContent>
          </Card>

          {/* DP Table Visualization */}
          <div>
            <h4 className="font-semibold text-sm mb-2">
              📊 DP Table Visualization (rows = subjects, cols = hours)
            </h4>
            <div className="flex gap-4 mb-2 text-xs flex-wrap">
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 rounded border bg-card border-border" />
                Zero / Initial
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 rounded border dp-cell-computed" />
                Computed value
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-4 h-4 rounded border dp-cell-optimal" />
                Optimal (bottom-right)
              </span>
            </div>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <KnapsackDPTable dp={result.dp} capacity={result.capacity} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Each cell dp[i][w] = best marks using first i subjects with w
              hours. Values are reused from previous rows — no recomputation!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LCS Demo ────────────────────────────────────────────────────────────────

function LcsDemo() {
  const [textA, setTextA] = useState("STUDY MATH PHYSICS CHEMISTRY");
  const [textB, setTextB] = useState("STUDY BIOLOGY PHYSICS ENGLISH");
  const [result, setResult] = useState<{
    lcsStr: string;
    similarity: number;
  } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    if (!textA.trim() || !textB.trim()) {
      setError("Both text fields must have content.");
      return;
    }
    if (textA.length > 200 || textB.length > 200) {
      setError("Please keep each text under 200 characters for performance.");
      return;
    }
    setResult(lcsDP(textA, textB));
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Notes Text A
          </Label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Enter your first set of notes..."
            data-ocid="lcs-text-a"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Notes Text B
          </Label>
          <textarea
            className="w-full min-h-[100px] px-3 py-2 rounded-md border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Enter your second set of notes..."
            data-ocid="lcs-text-b"
          />
        </div>
      </div>
      {error && (
        <p
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
          data-ocid="lcs-error"
        >
          ⚠️ {error}
        </p>
      )}
      <Button
        onClick={calculate}
        className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/90"
        data-ocid="lcs-calculate"
      >
        📝 Check Similarity
      </Button>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <Card className="border-secondary/20 bg-secondary/5">
            <CardContent className="pt-4 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="text-2xl font-display font-bold text-secondary">
                  {result.similarity}% Similar
                </div>
                <Badge
                  className={
                    result.similarity >= 70
                      ? "bg-destructive/15 text-destructive border-destructive/30"
                      : result.similarity >= 40
                        ? "bg-secondary/15 text-secondary-foreground border-secondary/30"
                        : "bg-muted text-muted-foreground"
                  }
                >
                  {result.similarity >= 70
                    ? "⚠️ High Similarity"
                    : result.similarity >= 40
                      ? "🔍 Moderate Similarity"
                      : "✅ Low Similarity"}
                </Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  Longest Common Subsequence:
                </p>
                <code className="text-sm bg-secondary/10 text-secondary-foreground px-2 py-1 rounded border border-secondary/20 block break-all">
                  {result.lcsStr || "(no common subsequence)"}
                </code>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 LCS length = {result.lcsStr.length} characters. Similarity =
                LCS length ÷ max(|A|, |B|) × 100. The DP table compares every
                character pair — avoiding redundant checks via stored results.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Matrix Chain Demo ────────────────────────────────────────────────────────

function MatrixChainDemo() {
  const [nInput, setNInput] = useState("4");
  const [dimsInput, setDimsInput] = useState("10,30,5,60,20");
  const [result, setResult] = useState<{
    minCost: number;
    dp: number[][];
  } | null>(null);
  const [error, setError] = useState("");

  const calculate = () => {
    setError("");
    const n = Number.parseInt(nInput, 10);
    if (!isValidInt(n) || n < 2 || n > 8) {
      setError("Number of subjects must be between 2 and 8.");
      return;
    }
    const dims = dimsInput.split(",").map((x) => Number.parseInt(x.trim(), 10));
    if (dims.length !== n + 1) {
      setError(
        `Please enter exactly ${n + 1} comma-separated values (n+1 values for n subjects).`,
      );
      return;
    }
    if (dims.some((d) => !isValidInt(d) || d <= 0)) {
      setError("All dimension values must be positive numbers.");
      return;
    }
    setResult(matrixChainDP(dims));
  };

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Number of Subjects (2–8)
          </Label>
          <Input
            type="number"
            value={nInput}
            onChange={(e) => setNInput(e.target.value)}
            placeholder="e.g. 4"
            min={2}
            max={8}
            data-ocid="matrix-n"
          />
        </div>
        <div>
          <Label className="text-sm font-medium mb-1.5 block">
            Effort/Dimension Array ({Number.parseInt(nInput, 10) + 1 || 5}{" "}
            values, comma-separated)
          </Label>
          <Input
            value={dimsInput}
            onChange={(e) => setDimsInput(e.target.value)}
            placeholder="e.g. 10,30,5,60,20"
            data-ocid="matrix-dims"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        💡 Think of each subject as a matrix. Dimensions represent complexity.
        We find the optimal study order to minimize total mental effort (scalar
        multiplications).
      </p>
      {error && (
        <p
          className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md"
          data-ocid="matrix-error"
        >
          ⚠️ {error}
        </p>
      )}
      <Button
        onClick={calculate}
        className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90"
        data-ocid="matrix-calculate"
      >
        📐 Calculate Minimum Effort
      </Button>

      {result && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
          <Card className="border-accent/20 bg-accent/5">
            <CardContent className="pt-4 space-y-2">
              <div className="text-2xl font-display font-bold text-accent">
                ⚡ Minimum Effort: {result.minCost.toLocaleString()} units
              </div>
              <p className="text-sm text-muted-foreground">
                By choosing the optimal study order, total mental effort is
                reduced to{" "}
                <strong>{result.minCost.toLocaleString()} units</strong>.
              </p>
            </CardContent>
          </Card>

          <div>
            <h4 className="font-semibold text-sm mb-2">
              📊 DP Cost Table (dp[i][j] = min effort to study subjects i to j)
            </h4>
            <div className="overflow-x-auto rounded-lg border bg-card">
              <MatrixChainDPTable dp={result.dp} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              💡 Green = overall min cost. Blue = reused intermediate values.
              Each cell builds on previously computed sub-ranges — no repeated
              work!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="py-20 bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">
            Interactive Demo
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Try the Algorithms
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Enter real values and see Dynamic Programming solve your student
            problems live!
          </p>
        </div>

        <Tabs defaultValue="knapsack" className="w-full" data-ocid="demo-tabs">
          <TabsList className="w-full justify-start h-auto flex-wrap gap-1 mb-6 bg-muted/50 p-1">
            <TabsTrigger
              value="knapsack"
              className="flex-1 min-w-[120px]"
              data-ocid="tab-knapsack"
            >
              🎒 Knapsack
            </TabsTrigger>
            <TabsTrigger
              value="lcs"
              className="flex-1 min-w-[120px]"
              data-ocid="tab-lcs"
            >
              📝 LCS
            </TabsTrigger>
            <TabsTrigger
              value="matrix"
              className="flex-1 min-w-[120px]"
              data-ocid="tab-matrix"
            >
              📐 Matrix Chain
            </TabsTrigger>
          </TabsList>

          <TabsContent value="knapsack">
            <Card className="border border-primary/15">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <div>
                    <CardTitle className="font-display text-lg text-primary">
                      Study Time Optimizer (0/1 Knapsack)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Choose which subjects to study to maximize total marks
                      within a time limit.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <KnapsackDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="lcs">
            <Card className="border border-secondary/20">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📝</span>
                  <div>
                    <CardTitle className="font-display text-lg text-secondary">
                      Notes Similarity Checker (LCS)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Find the longest matching content between two notes and
                      get a similarity score.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <LcsDemo />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matrix">
            <Card className="border border-accent/20">
              <CardHeader className="pb-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📐</span>
                  <div>
                    <CardTitle className="font-display text-lg text-accent">
                      Study Order Optimizer (Matrix Chain)
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Find the best order to tackle subjects to minimize total
                      mental effort.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <MatrixChainDemo />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─── Comparison Section ───────────────────────────────────────────────────────

const algoComparisonData = [
  {
    algo: "0/1 Knapsack",
    use: "Study time planning",
    time: "O(n × W)",
    space: "O(n × W)",
    efficiency: "★★★★☆",
  },
  {
    algo: "LCS",
    use: "Notes similarity check",
    time: "O(m × n)",
    space: "O(m × n)",
    efficiency: "★★★★★",
  },
  {
    algo: "Matrix Chain",
    use: "Study order optimization",
    time: "O(n³)",
    space: "O(n²)",
    efficiency: "★★★☆☆",
  },
];

const dpVsRecursion = [
  {
    metric: "Time for repeated sub-problems",
    dp: "⚡ O(1) — table lookup",
    recursion: "🐌 Exponential recomputation",
  },
  {
    metric: "Memory usage",
    dp: "📦 Explicit table, predictable",
    recursion: "📚 Call stack, can overflow",
  },
  {
    metric: "Code clarity",
    dp: "🔢 Iterative, easier to debug",
    recursion: "📖 Clean, matches definition",
  },
  {
    metric: "Guaranteed optimal?",
    dp: "✅ Yes, always",
    recursion: "❌ No (without memoization)",
  },
  {
    metric: "Best for",
    dp: "🏆 Optimization problems",
    recursion: "🌲 Tree/graph traversal",
  },
];

function ComparisonSection() {
  return (
    <section
      id="comparison"
      className="py-20"
      style={{ background: "oklch(0.96 0.01 240)" }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-muted text-muted-foreground border-border">
            Comparison
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Algorithms at a Glance
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Compare the three algorithms and understand when DP outshines plain
            recursion.
          </p>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-display font-bold text-xl mb-4">
              📊 Algorithm Comparison
            </h3>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Algorithm</TableHead>
                    <TableHead className="font-semibold">
                      Real-Life Use
                    </TableHead>
                    <TableHead className="font-semibold">
                      Time Complexity
                    </TableHead>
                    <TableHead className="font-semibold">
                      Space Complexity
                    </TableHead>
                    <TableHead className="font-semibold">Efficiency</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {algoComparisonData.map((row) => (
                    <TableRow
                      key={row.algo}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium">{row.algo}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.use}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          {row.time}
                        </code>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                          {row.space}
                        </code>
                      </TableCell>
                      <TableCell style={{ color: "oklch(0.65 0.15 60)" }}>
                        {row.efficiency}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-display font-bold text-xl mb-4">
              ⚔️ DP vs Plain Recursion
            </h3>
            <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Metric</TableHead>
                    <TableHead className="font-semibold text-primary">
                      DP Approach
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Plain Recursion
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dpVsRecursion.map((row) => (
                    <TableRow
                      key={row.metric}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <TableCell className="font-medium text-sm">
                        {row.metric}
                      </TableCell>
                      <TableCell className="text-sm text-primary">
                        {row.dp}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {row.recursion}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Conclusion Section ───────────────────────────────────────────────────────

const conclusionBenefits = [
  {
    icon: "⚡",
    title: "Faster Computation",
    desc: "DP reduces exponential time to polynomial by storing intermediate results. Problems that take hours with recursion finish in milliseconds.",
    colorClass: "text-primary",
    bgClass: "bg-primary/5",
    borderClass: "border-primary/15",
  },
  {
    icon: "♻️",
    title: "Avoids Repetition",
    desc: "By solving each sub-problem once and saving the result, DP eliminates redundant work — like a student who takes good notes instead of re-reading the textbook.",
    colorClass: "text-secondary",
    bgClass: "bg-secondary/5",
    borderClass: "border-secondary/15",
  },
  {
    icon: "🌍",
    title: "Real-Life Applications",
    desc: "From study planning to plagiarism detection, resource allocation, and route optimization — DP powers decisions that matter in everyday student life.",
    colorClass: "text-accent",
    bgClass: "bg-accent/5",
    borderClass: "border-accent/15",
  },
];

function ConclusionSection() {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
  return (
    <section
      id="conclusion"
      className="py-20"
      style={{
        background:
          "linear-gradient(135deg, oklch(0.96 0.03 145) 0%, oklch(0.96 0.025 190) 50%, oklch(0.95 0.03 230) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-secondary/15 text-secondary-foreground border-secondary/20">
            Conclusion
          </Badge>
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Why Every Student Should Know DP
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Dynamic Programming isn't just a coding technique — it's a{" "}
            <em>thinking framework</em> for solving complex problems
            efficiently.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          {conclusionBenefits.map((b) => (
            <Card
              key={b.title}
              className={`card-hover border ${b.borderClass} ${b.bgClass}`}
            >
              <CardContent className="pt-6">
                <div className="text-4xl mb-3">{b.icon}</div>
                <h3
                  className={`font-display font-bold text-lg mb-2 ${b.colorClass}`}
                >
                  {b.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {b.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={scrollTop}
            className="font-semibold"
            data-ocid="back-to-top"
          >
            ↑ Back to Top
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined"
      ? encodeURIComponent(window.location.hostname)
      : "";
  return (
    <footer className="bg-card border-t py-8">
      <div className="max-w-6xl mx-auto px-4 text-center space-y-2">
        <p className="font-display font-bold text-foreground">
          📚 Student Life Optimization System
        </p>
        <p className="text-sm text-muted-foreground">
          Demonstrating Dynamic Programming through real-life student problems —
          Knapsack · LCS · Matrix Chain
        </p>
        <p className="text-xs text-muted-foreground">
          © {year}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <HeroSection />
        <AboutSection />
        <AlgorithmsSection />
        <DemoSection />
        <ComparisonSection />
        <ConclusionSection />
      </main>
      <Footer />
    </div>
  );
}
