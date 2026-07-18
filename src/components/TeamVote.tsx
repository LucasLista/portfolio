import { createSignal, For, Show, onMount } from "solid-js"
import { CANDIDATES } from "@data/teamCandidates"

// F1 scoring: points for positions 1 through 10, nothing below that.
const F1 = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
const POINTS = Array.from({ length: CANDIDATES.length }, (_, i) => F1[i] ?? 0)
const STORAGE_KEY = "team-vote-submitted-v3"

type CandidateTotal = {
  id: number
  points: number
  positions: number[]
}

type Results = {
  votes: number
  needed: number
  totals?: CandidateTotal[]
  winnerId?: number
}

function shuffled<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function Team(props: { team: string[] }) {
  return (
    <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
      <For each={props.team}>
        {(person) => (
          <span class="flex items-center gap-1.5 text-sm">
            <img
              src={`/vote/${person.toLowerCase()}.jpg`}
              alt={person}
              width="24"
              height="24"
              loading="lazy"
              class="size-6 rounded-full object-cover"
            />
            {person}
          </span>
        )}
      </For>
    </div>
  )
}

function TeamsLine(props: { id: number }) {
  const c = CANDIDATES.find((c) => c.id === props.id)!
  return (
    <div class="flex flex-col gap-1">
      <Team team={c.teamA} />
      <span class="opacity-50 text-xs">vs</span>
      <Team team={c.teamB} />
    </div>
  )
}

export default function TeamVote() {
  // Start each voter with a random order to avoid biasing toward the top
  const [order, setOrder] = createSignal(shuffled(CANDIDATES.map((c) => c.id)))
  const [voted, setVoted] = createSignal(false)
  const [busy, setBusy] = createSignal(false)
  const [error, setError] = createSignal("")
  const [results, setResults] = createSignal<Results | null>(null)

  onMount(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setVoted(true)
      refreshResults()
    }
  })

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= order().length) return
    const next = [...order()]
    ;[next[index], next[target]] = [next[target], next[index]]
    setOrder(next)
  }

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ranking: order() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Something went wrong")
      localStorage.setItem(STORAGE_KEY, "1")
      setVoted(true)
      await refreshResults()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong")
    } finally {
      setBusy(false)
    }
  }

  const refreshResults = async () => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/results")
      if (!res.ok) throw new Error("Could not load results")
      setResults(await res.json())
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load results")
    } finally {
      setBusy(false)
    }
  }

  const btn =
    "px-2 py-0.5 border border-black/25 dark:border-white/25 hover:bg-black/5 dark:hover:bg-white/15 blend disabled:opacity-30"

  return (
    <div class="flex flex-col gap-6">
      <Show
        when={voted()}
        fallback={
          <>
            <p class="text-sm opacity-75">
              Order the {CANDIDATES.length} team candidates from best to worst
              using the arrows, then submit. Scoring follows F1 rules: 25
              points for 1st, 18 for 2nd, down to 1 point for 10th; positions
              below 10th score nothing. Your ballot is anonymous.
            </p>
            <ul class="flex flex-col gap-2">
              <For each={order()}>
                {(id, index) => (
                  <li class="flex items-center gap-4 p-3 border border-black/15 dark:border-white/20 rounded">
                    <div class="w-14 shrink-0 text-center">
                      <div class="text-lg font-semibold text-black dark:text-white">
                        {index() + 1}.
                      </div>
                      <div class="text-xs opacity-60">{POINTS[index()]} pts</div>
                    </div>
                    <div class="flex-1">
                      <TeamsLine id={id} />
                    </div>
                    <div class="flex flex-col gap-1">
                      <button
                        class={btn}
                        disabled={index() === 0}
                        onClick={() => move(index(), -1)}
                        aria-label="Move up"
                      >
                        &uarr;
                      </button>
                      <button
                        class={btn}
                        disabled={index() === order().length - 1}
                        onClick={() => move(index(), 1)}
                        aria-label="Move down"
                      >
                        &darr;
                      </button>
                    </div>
                  </li>
                )}
              </For>
            </ul>
            <button class={btn + " self-start px-4 py-2"} disabled={busy()} onClick={submit}>
              {busy() ? "Submitting..." : "Submit vote"}
            </button>
          </>
        }
      >
        <div class="flex items-center gap-4">
          <p class="text-sm opacity-75">Your vote is in. Thanks!</p>
          <button class={btn} disabled={busy()} onClick={refreshResults}>
            {busy() ? "Loading..." : "Refresh results"}
          </button>
        </div>

        <Show when={results()}>
          {(r) => (
            <Show
              when={r().totals}
              fallback={
                <p>
                  {r().votes} of {r().needed} votes are in. Results unlock when
                  everyone has voted.
                </p>
              }
            >
              {(totals) => (
                <div class="flex flex-col gap-4">
                  <div class="p-4 border border-black/25 dark:border-white/25 rounded">
                    <div class="text-xs uppercase opacity-60 mb-1">Winner</div>
                    <TeamsLine id={r().winnerId!} />
                  </div>
                  <ol class="flex flex-col gap-2">
                    <For each={totals()}>
                      {(t, index) => (
                        <li class="flex items-center gap-4 p-3 border border-black/15 dark:border-white/20 rounded">
                          <div class="w-14 shrink-0 text-center">
                            <div class="text-lg font-semibold text-black dark:text-white">
                              {index() + 1}.
                            </div>
                            <div class="text-xs opacity-60">{t.points} pts</div>
                          </div>
                          <div class="flex-1">
                            <TeamsLine id={t.id} />
                          </div>
                        </li>
                      )}
                    </For>
                  </ol>
                </div>
              )}
            </Show>
          )}
        </Show>
      </Show>

      <Show when={error()}>
        <p class="text-sm text-red-500">{error()}</p>
      </Show>
    </div>
  )
}
