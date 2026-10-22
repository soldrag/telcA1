/**
 * PreToolUse guard for the hidden Schreiben evaluation set.
 * Sealed batches are encrypted with the repository's public key and cannot be read without the private key,
 * which lives only in the CI secret. What remains readable is a batch while it is being written: an agent may
 * stage it (Write into the staging folder) and seal it (`node scripts/eval/seal-hidden.mjs <batch>`), but never
 * read the staged letters or the private key. Exit code 2 blocks the call and tells the agent why.
 */

const GUARDED = [
  'hidden-staging',
  'hidden-eval.pem',
];

const ALLOWED_COMMANDS = [
  /^node scripts\/eval\/seal-hidden\.mjs [a-z0-9-]+$/,
];

const STAGING_WRITE = /\/\.cache\/telc-a1\/hidden-staging\/[a-z0-9-]+\.json$/;

function block(reason) {
  process.stderr.write(`Blocked: ${reason} Staged hidden letters and the private key are not readable; measure the hidden set in CI.\n`);
  process.exit(2);
}

const mentionsGuarded = (text) => GUARDED.some((token) => String(text || '').includes(token));

let raw = '';
process.stdin.on('data', (chunk) => { raw += chunk; });
process.stdin.on('end', () => {
  const { tool_name: tool, tool_input: input = {} } = JSON.parse(raw || '{}');
  if (tool === 'Bash') {
    const command = String(input.command || '').trim();
    if (mentionsGuarded(command) && !ALLOWED_COMMANDS.some((re) => re.test(command))) {
      block('this command touches the staged hidden letters or the private key.');
    }
    return;
  }
  if (tool === 'Write' && STAGING_WRITE.test(String(input.file_path || ''))) return;
  if (mentionsGuarded(JSON.stringify(input))) block(`${tool} on the staged hidden letters or the private key.`);
});
