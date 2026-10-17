from pathlib import Path
import base64
import io
import json
import re
import shutil
import sys
import zipfile

# Optional publication helper. Python 3 standard library only; never changes source reports.
root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit('Usage: python scripts/prepare-public-reports.py <new-output-directory>')
target = Path(sys.argv[1]).resolve()
target.mkdir(parents=True, exist_ok=False)
source = root / 'playwright-report-followup-smoke'
allure_source = root / 'allure-results-followup-smoke'
summary = json.loads((root / 'evidence/parallel-smoke-followup.json').read_text())
assert summary['stats']['expected'] == 11 and summary['stats']['unexpected'] == 0
assert summary['stats']['skipped'] == 0 and summary['stats']['flaky'] == 0
patterns = [
    (r'sdet\.[a-f0-9-]+@example\.com', 'synthetic-user@example.com'),
    (r'Qa![a-f0-9-]{16}A7', '[REDACTED_TEST_PASSWORD]'),
    (r'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+', '[REDACTED_TOKEN]'),
    (r'(?i)Bearer\s+[A-Za-z0-9._~-]+', 'Bearer [REDACTED_TOKEN]'),
    (r'(?i)C:(?:\\+|/)Users(?:\\+|/)Admin(?:\\+|/)Documents(?:\\+|/)Codex(?:\\+|/)2026-10-17(?:\\+|/)project-enterprise-grade-playwright-typescript-ui(?:\\+|/)outputs(?:\\+|/)playwright-typescript-automation', '/workspace/playwright-typescript-automation'),
]
def clean(text):
    for pattern, replacement in patterns:
        text = re.sub(pattern, lambda _: replacement, text)
    return text

native = target / 'playwright'
shutil.copytree(source, native)
page = (native / 'index.html').read_text(encoding='utf-8')
match = re.search(r'data:application/zip;base64,([A-Za-z0-9+/=]+)', page)
assert match, 'Expected a genuine Playwright HTML embedded report'
original = zipfile.ZipFile(io.BytesIO(base64.b64decode(match.group(1))))
result = io.BytesIO()
with zipfile.ZipFile(result, 'w', zipfile.ZIP_DEFLATED) as output:
    for name in original.namelist():
        assert name.endswith('.json'), f'Unexpected native report entry: {name}'
        data = clean(original.read(name).decode('utf-8'))
        json.loads(data)
        output.writestr(name, data)
encoded = base64.b64encode(result.getvalue()).decode('ascii')
(native / 'index.html').write_text(page[:match.start(1)] + encoded + page[match.end(1):], encoding='utf-8')
for path in native.rglob('*'):
    if path.is_file() and path.suffix in {'.txt', '.json'}:
        path.write_text(clean(path.read_text(encoding='utf-8')), encoding='utf-8')

raw = target / 'allure-sanitized-results'
raw.mkdir()
for path in allure_source.iterdir():
    assert path.suffix in {'.json', '.txt'}, f'Review unexpected attachment before publication: {path.name}'
    text = clean(path.read_text(encoding='utf-8'))
    if path.name.endswith('-result.json'):
        data = json.loads(text)
        for label in data.get('labels', []):
            if label['name'] == 'host':
                label['value'] = 'portfolio-runner'
        text = json.dumps(data, ensure_ascii=False)
    (raw / path.name).write_text(text, encoding='utf-8')
manifest = {
    'scope': 'Chromium + API smoke; 2 workers',
    'runStartedAt': summary['stats']['startTime'],
    'durationMs': summary['stats']['duration'],
    'passed': 11, 'failed': 0, 'skipped': 0, 'flaky': 0,
    'sourceSummary': 'evidence/parallel-smoke-followup.json',
    'sanitization': 'Synthetic emails/passwords, bearer tokens, local paths and Allure host labels redacted. Test outcomes and timings unchanged.',
    'fullRegression': {'tests': 61, 'passed': 58, 'failed': 3, 'skipped': 0, 'workersValidated': [1, 2]},
}
(target / 'snapshot.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
(target / '.nojekyll').write_text('', encoding='utf-8')
print(json.dumps(manifest, indent=2))
