/**
 * Splits items that carry `testType` into those of the open module and a count per other module,
 * in first-seen order, so a list can show its own module and point at the rest.
 */
export function splitByModule(items = [], testType = 'lesen') {
  const current = [];
  const counts = new Map();
  for (const item of items) {
    const type = item.testType || 'lesen';
    if (type === testType) current.push(item);
    else counts.set(type, (counts.get(type) || 0) + 1);
  }
  const elsewhere = [...counts].map(([type, count]) => ({ testType: type, count }));
  return { current, elsewhere };
}
