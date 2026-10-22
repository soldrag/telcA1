/**
 * PreToolUse guard for the hidden Schreiben evaluation set.
 * An agent may stage a new batch (Write into the staging folder) and run the two sanctioned commands,
 * `node scripts/eval/seal-hidden.mjs <batch>` and `npm run eval:hidden`, but never read the letters,
 * the key or the decrypting module. Exit code 2 blocks the call and tells the agent why.
 * This is a fence against fitting by accident, not a security boundary.
 */

const GUARDED = [
  'hidden-staging',
  'schreiben-hidden',
  'hidden-eval.key',
  'telc-a1/',
  'hiddenSetStore',
  'loadHiddenLetters',
  'TELC_HIDDEN_KEY',
];

const ALLOWED_COMMANDS = [
  /^node scripts\/eval\/seal-hidden\.mjs [a-z0-9-]+$/,
  /^npm run (-s )?eval:hidden( -- --ranker)?$/,
  /^git (status|add|commit|log|push)\b(?!.*[|;&`$<>])/,
];

const STAGING_WRITE = /\/\.cache\/telc-a1\/hidden-staging\/[a-z0-9-]+\.json$/;

function block(reason) {
  process.stderr.write(`Blocked: ${reason} The hidden evaluation set is write-only; measure it with \`npm run eval:hidden\`.\n`);
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
      block('this command touches the hidden set.');
    }
    return;
  }
  if (tool === 'Write' && STAGING_WRITE.test(String(input.file_path || ''))) return;
  if (mentionsGuarded(JSON.stringify(input))) block(`${tool} on the hidden set.`);
});
