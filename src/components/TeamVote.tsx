import { createSignal, For, Show, onMount } from "solid-js"
import { CANDIDATES } from "@data/teamCandidates"

// A ballot is an ordered top 10; F1 points per position, the rest score 0.
const TOP_N = 10
const POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1]
const STORAGE_KEY = "team-vote-submitted-v4"

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
  // Pool order is shuffled per visitor to avoid biasing toward the top
  const [poolOrder] = createSignal(shuffled(CANDIDATES.map((c) => c.id)))
  const [picked, setPicked] = createSignal<number[]>([])
  const [dragId, setDragId] = createSignal<number | null>(null)
  const [voted, setVoted] = createSignal(false)
  const [busy, setBusy] = createSignal(false)
  const [error, setError] = createSignal("")
  const [results, setResults] = createSignal<Results | null>(null)

  const pool = () => poolOrder().filter((id) => !picked().includes(id))

  onMount(() => {
    if (localStorage.getItem(STORAGE_KEY)) {
      setVoted(true)
      refreshResults()
    }
  })

  // Insert id at slot index (removing it first if already picked).
  // If the top 10 is full and a new team is inserted, the last one drops out.
  const insertAt = (id: number, index: number) => {
    const next = picked().filter((p) => p !== id)
    next.splice(Math.min(index, next.length), 0, id)
    setPicked(next.slice(0, TOP_N))
  }

  const addToEnd = (id: number) => {
    if (picked().length < TOP_N) insertAt(id, picked().length)
  }

  const remove = (id: number) => setPicked(picked().filter((p) => p !== id))

  const move = (index: number, delta: number) => {
    const target = index + delta
    if (target < 0 || target >= picked().length) return
    const next = [...picked()]
    ;[next[index], next[target]] = [next[target], next[index]]
    setPicked(next)
  }

  const submit = async () => {
    setBusy(true)
    setError("")
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ranking: picked() }),
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
              Build your top {TOP_N}: drag teams from the box below onto a
              slot, or tap a team to add it to the next free slot. Scoring
              follows F1 rules: 25 points for 1st down to 1 point for 10th;
              teams left in the box score nothing. Your ballot is anonymous.
            </p>

            <div class="flex flex-col gap-2">
              <h2 class="text-lg font-semibold text-black dark:text-white">
                Your top {TOP_N}
              </h2>
              <ol class="flex flex-col gap-2">
                <For each={Array.from({ length: TOP_N })}>
                  {(_, slot) => (
                    <li
                      class="flex items-center gap-4 p-3 border rounded border-black/15 dark:border-white/20"
                      classList={{
                        "border-dashed opacity-70": picked()[slot()] === undefined,
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const id = dragId()
                        if (id !== null) insertAt(id, slot())
                        setDragId(null)
                      }}
                    >
                      <div class="w-14 shrink-0 text-center">
                        <div class="text-lg font-semibold text-black dark:text-white">
                          {slot() + 1}.
                        </div>
                        <div class="text-xs opacity-60">{POINTS[slot()]} pts</div>
                      </div>
                      <Show
                        when={picked()[slot()] !== undefined}
                        fallback={<div class="flex-1 text-sm opacity-50">Drop a team here</div>}
                      >
                        <div
                          class="flex-1 cursor-grab"
                          draggable={true}
                          onDragStart={() => setDragId(picked()[slot()])}
                        >
                          <TeamsLine id={picked()[slot()]} />
                        </div>
                        <div class="flex flex-col gap-1">
                          <button
                            class={btn}
                            disabled={slot() === 0}
                            onClick={() => move(slot(), -1)}
                            aria-label="Move up"
                          >
                            &uarr;
                          </button>
                          <button
                            class={btn}
                            disabled={slot() === picked().length - 1}
                            onClick={() => move(slot(), 1)}
                            aria-label="Move down"
                          >
                            &darr;
                          </button>
                        </div>
                        <button
                          class={btn}
                          onClick={() => remove(picked()[slot()])}
                          aria-label="Remove from top 10"
                        >
                          &times;
                        </button>
                      </Show>
                    </li>
                  )}
                </For>
              </ol>
            </div>

            <button
              class={btn + " self-start px-4 py-2"}
              disabled={busy() || picked().length !== TOP_N}
              onClick={submit}
            >
              {busy()
                ? "Submitting..."
                : picked().length !== TOP_N
                  ? `Pick ${TOP_N - picked().length} more`
                  : "Submit vote"}
            </button>

            <div
              class="flex flex-col gap-2 p-3 border border-black/25 dark:border-white/25 rounded"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const id = dragId()
                if (id !== null) remove(id)
                setDragId(null)
              }}
            >
              <h2 class="text-lg font-semibold text-black dark:text-white">
                All teams ({pool().length} left)
              </h2>
              <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <For each={pool()}>
                  {(id) => (
                    <li
                      class="p-2 border border-black/15 dark:border-white/20 rounded cursor-grab hover:bg-black/5 dark:hover:bg-white/10 blend"
                      draggable={true}
                      onDragStart={() => setDragId(id)}
                      onClick={() => addToEnd(id)}
                    >
                      <TeamsLine id={id} />
                    </li>
                  )}
                </For>
              </ul>
            </div>
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
