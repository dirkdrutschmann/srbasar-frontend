const { spawnSync } = require('node:child_process');

const result = spawnSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['audit', '--omit=dev', '--audit-level=high', '--json'],
  { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
let report;
try { report = JSON.parse(result.stdout || '{}'); } catch { report = null; }
const networkCodes = /ENOTFOUND|EAI_AGAIN|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ENETUNREACH|E503|E502|E504/;
const failure = [result.error?.code, report?.error?.code, report?.error?.summary, result.stderr].filter(Boolean).join(' ');
if ((report?.error || result.error || !report) && networkCodes.test(failure)) {
  console.warn('WARNUNG: Produktions-Audit wegen Registry-/Netzwerkfehler übersprungen; NICHT bestanden. Bei erreichbarer Registry nachholen.');
  process.exit(0);
}
if (report?.error || result.error || !report?.metadata?.vulnerabilities) {
  console.error('Produktions-Audit konnte nicht ausgewertet werden:', failure || result.stdout);
  process.exit(1);
}
const counts = report.metadata.vulnerabilities;
console.log('Produktionsabhängigkeiten:', JSON.stringify(counts));
for (const [name, item] of Object.entries(report.vulnerabilities || {})) {
  if (!['high', 'critical'].includes(item.severity)) continue;
  console.error(JSON.stringify({ name, severity: item.severity, nodes: item.nodes, via: item.via, effects: item.effects, fixAvailable: item.fixAvailable }, null, 2));
}
process.exit(counts.high || counts.critical ? 1 : 0);
