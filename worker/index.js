// API for the anonymous team vote. Static assets are served by the assets
// binding; only requests that don't match an asset (like /api/*) reach this.

const VOTES_NEEDED = 8;
const NUM_CANDIDATES = 30;
// F1 scoring: points for positions 1 through 10, nothing below that.
const F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
const POINTS = Array.from({ length: NUM_CANDIDATES }, (_, i) => F1[i] ?? 0);

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function listBallots(env) {
  const list = await env.VOTES.list({ prefix: "ballot:" });
  const ballots = [];
  for (const key of list.keys) {
    const value = await env.VOTES.get(key.name, "json");
    if (value) ballots.push(value);
  }
  return ballots;
}

function tally(ballots) {
  const totals = Array.from({ length: NUM_CANDIDATES }, (_, id) => ({
    id,
    points: 0,
    // positions[p] = how many voters put this candidate in position p+1,
    // used for F1-style countback on ties
    positions: Array(NUM_CANDIDATES).fill(0),
  }));
  for (const ranking of ballots) {
    ranking.forEach((candidateId, pos) => {
      totals[candidateId].points += POINTS[pos];
      totals[candidateId].positions[pos] += 1;
    });
  }
  totals.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    for (let p = 0; p < NUM_CANDIDATES; p++) {
      if (b.positions[p] !== a.positions[p]) return b.positions[p] - a.positions[p];
    }
    return a.id - b.id;
  });
  return totals;
}

async function handleResults(env) {
  const ballots = await listBallots(env);
  const body = { votes: ballots.length, needed: VOTES_NEEDED };
  if (ballots.length >= VOTES_NEEDED) {
    const totals = tally(ballots);
    body.totals = totals;
    body.winnerId = totals[0].id;
  }
  return json(body);
}

async function handleVote(request, env) {
  let ranking;
  try {
    ({ ranking } = await request.json());
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const valid =
    Array.isArray(ranking) &&
    ranking.length === NUM_CANDIDATES &&
    [...ranking].sort((a, b) => a - b).every((v, i) => v === i);
  if (!valid) {
    return json({ error: `Ranking must order all ${NUM_CANDIDATES} candidates` }, 400);
  }

  const existing = await env.VOTES.list({ prefix: "ballot:" });
  if (existing.keys.length >= VOTES_NEEDED) {
    return json({ error: "Voting is closed, all votes are in" }, 409);
  }

  const key = `ballot:${Date.now()}-${crypto.randomUUID()}`;
  await env.VOTES.put(key, JSON.stringify(ranking));
  return json({ ok: true, votes: existing.keys.length + 1, needed: VOTES_NEEDED });
}

async function handleReset(url, env) {
  if (url.searchParams.get("token") !== env.RESET_TOKEN) {
    return json({ error: "Wrong token" }, 403);
  }
  const list = await env.VOTES.list({ prefix: "ballot:" });
  for (const key of list.keys) {
    await env.VOTES.delete(key.name);
  }
  return json({ ok: true, deleted: list.keys.length });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/results" && request.method === "GET") {
      return handleResults(env);
    }
    if (url.pathname === "/api/vote" && request.method === "POST") {
      return handleVote(request, env);
    }
    if (url.pathname === "/api/reset" && request.method === "POST") {
      return handleReset(url, env);
    }
    return json({ error: "Not found" }, 404);
  },
};
