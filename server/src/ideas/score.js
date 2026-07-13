export function computeScore(votes) {
  const good = votes.filter((v) => v.value === "good").length;
  const bad = votes.filter((v) => v.value === "bad").length;
  const total = good + bad;
  const percentage = total === 0 ? 0 : Math.round((good / total) * 100);
  return { good, bad, percentage };
}
