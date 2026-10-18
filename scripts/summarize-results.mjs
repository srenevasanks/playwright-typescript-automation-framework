import fs from 'node:fs';
import path from 'node:path';
const [
  ,
  ,
  input = 'test-results/results.json',
  output = 'test-results/execution-summary.json',
  scope = 'unspecified',
] = process.argv;
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
const tests = [];
const timeline = [];
function visit(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests) {
        for (const result of test.results) {
          const start = Date.parse(result.startTime);
          if (Number.isFinite(start) && result.duration > 0) {
            timeline.push([start, 1], [start + result.duration, -1]);
          }
        }
        tests.push({
          title: spec.title,
          project: test.projectName,
          status: test.status,
          attempts: test.results.map((result) => ({
            status: result.status,
            durationMs: result.duration,
          })),
        });
      }
    }
    visit(suite.suites ?? []);
  }
}
visit(report.suites);
let active = 0;
let peakConcurrentAttempts = 0;
for (const [, change] of timeline.sort((a, b) => a[0] - b[0] || a[1] - b[1])) {
  active += change;
  peakConcurrentAttempts = Math.max(peakConcurrentAttempts, active);
}
const summary = {
  scope,
  globalErrorCount: report.errors?.length ?? 0,
  stats: report.stats,
  execution: {
    configuredWorkers: report.config.workers,
    peakConcurrentAttempts,
    actualWorkers: report.config.metadata?.actualWorkers ?? null,
    projects: report.config.projects.map((project) => ({
      name: project.name,
      retries: project.retries,
    })),
  },
  projects: {},
  tests,
};
for (const test of tests) {
  const counts = (summary.projects[test.project] ??= {
    passed: 0,
    failed: 0,
    skipped: 0,
    flaky: 0,
  });
  const key = { expected: 'passed', unexpected: 'failed', skipped: 'skipped', flaky: 'flaky' }[
    test.status
  ];
  if (!key) throw new Error(`Unknown runner status ${test.status}`);
  counts[key]++;
}
fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ stats: summary.stats, projects: summary.projects }, null, 2));
