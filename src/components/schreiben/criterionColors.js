// One colour per Leitpunkt links a criterion row to the phrase in the letter that earned it.
const CRITERION_COLORS = {
  lp1: { dot: 'bg-sky-500', mark: 'bg-sky-500/15 decoration-sky-500' },
  lp2: { dot: 'bg-violet-500', mark: 'bg-violet-500/15 decoration-violet-500' },
  lp3: { dot: 'bg-amber-500', mark: 'bg-amber-500/15 decoration-amber-500' },
  frame: { dot: 'bg-content-muted', mark: 'decoration-content-muted' },
};

export function getCriterionColor(criterionId) {
  return CRITERION_COLORS[criterionId] || CRITERION_COLORS.frame;
}
