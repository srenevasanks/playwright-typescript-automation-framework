import fs from 'node:fs';
const [, , input = 'test-results/results.json', output = 'evidence/latest-run.json'] = process.argv;
const report = JSON.parse(fs.readFileSync(input, 'utf8'));
const tests = [];
function visit(suites) {
  for (const suite of suites) {
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests) {
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
const summary = { stats: report.stats, projects: {}, tests };
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
fs.mkdirSync('evidence', { recursive: true });
fs.writeFileSync(output, JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify({ stats: summary.stats, projects: summary.projects }, null, 2));
