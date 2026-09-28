"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { gamePacks, getPack } from "@/data/packs";

type Room = {
  id: string;
  code: string;
  host_user_id: string;
  pack_id: string;
  status: "lobby" | "playing" | "finished";
  round: number;
};

type Player = {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  health: number;
  energy: number;
  supplies: number;
  alive: boolean;
  has_submitted: boolean;
  created_at: string;
};

type RoundResult = {
  id: string;
  player_id: string;
  round: number;
  consequence: string;
  explanation: string;
  health_delta: number;
  energy_delta: number;
  supplies_delta: number;
};

const secretRoles = [
  ["Strategist", "Finish with at least 3 health and 2 supplies."],
  ["Helper", "Prefer choices that protect people or resources."],
  ["Risk Taker", "Choose the bold option whenever you can."],
  ["Survivor", "Your only mission is to make it to the end."],
  ["Collector", "Finish with as many supplies as possible."],
  ["Analyst", "Try to choose the option with the strongest evidence."]
] as const;

function roomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function Home() {
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [selectedPack, setSelectedPack] = useState("history");
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [me, setMe] = useState<Player | null>(null);
  const [role, setRole] = useState<[string, string] | null>(null);
  const [selectedChoice, setSelectedChoice] = useState("");
  const [results, setResults] = useState<RoundResult[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const pack = room ? getPack(room.pack_id) : getPack(selectedPack);
  const currentRound = room ? pack.rounds[Math.min(room.round, pack.rounds.length - 1)] : null;
  const isHost = !!room && room.host_user_id === userId;
  const alivePlayers = players.filter((p) => p.alive);
  const allSubmitted = alivePlayers.length > 0 && alivePlayers.every((p) => p.has_submitted);

  useEffect(() => {
    boot();
  }, []);

  useEffect(() => {
    if (!room) return;

    refreshRoom(room.code);
    refreshPlayers(room.id);
    refreshResults(room.id, room.round);

    const channel = supabase
      .channel(`outsmart-${room.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "players", filter: `room_id=eq.${room.id}` },
        () => refreshPlayers(room.id)
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "rooms", filter: `id=eq.${room.id}` },
        (payload) => {
          const next = payload.new as Room;
          setRoom(next);
          setSelectedChoice("");
          refreshResults(next.id, next.round - 1);
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "round_results", filter: `room_id=eq.${room.id}` },
        () => refreshResults(room.id, room.round)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [room?.id]);

  useEffect(() => {
    if (!room || !userId) return;
    setMe(players.find((p) => p.user_id === userId) ?? null);
  }, [players, room, userId]);

  async function boot() {
    const { data: existing } = await supabase.auth.getSession();
    let session = existing.session;

    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) {
        setMessage(error.message);
        return;
      }
      session = data.session;
    }

    setUserId(session?.user.id ?? "");
  }

  async function refreshRoom(code: string) {
    const { data } = await supabase.from("rooms").select("*").eq("code", code).single();
    if (data) setRoom(data as Room);
  }

  async function refreshPlayers(roomId: string) {
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("room_id", roomId)
      .order("created_at", { ascending: true });

    setPlayers((data ?? []) as Player[]);
  }

  async function refreshResults(roomId: string, round: number) {
    if (round < 0) return;
    const { data } = await supabase
      .from("round_results")
      .select("*")
      .eq("room_id", roomId)
      .eq("round", round)
      .order("created_at", { ascending: true });

    setResults((data ?? []) as RoundResult[]);
  }

  async function createRoom() {
    if (!name.trim() || !userId) {
      setMessage("Enter your name first.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      let created: Room | null = null;

      for (let i = 0; i < 5 && !created; i++) {
        const { data, error } = await supabase
          .from("rooms")
          .insert({
            code: roomCode(),
            host_user_id: userId,
            pack_id: selectedPack,
            status: "lobby",
            round: 0
          })
          .select()
          .single();

        if (!error) created = data as Room;
      }

      if (!created) throw new Error("Could not create a room.");

      const player = await addPlayer(created.id, name.trim());
      if (!player) throw new Error("Could not create your player.");

      await createRole(player.id);

      setRoom(created);
      setMe(player);
      window.history.replaceState({}, "", `?room=${created.code}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not create game.");
    } finally {
      setBusy(false);
    }
  }

  async function joinRoom() {
    if (!name.trim() || !joinCode.trim()) {
      setMessage("Enter your name and room code.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      const { data: found, error } = await supabase
        .from("rooms")
        .select("*")
        .eq("code", joinCode.trim().toUpperCase())
        .single();

      if (error || !found) throw new Error("Room not found.");
      if (found.status !== "lobby") throw new Error("That game has already started.");

      const player = await addPlayer(found.id, name.trim());
      if (!player) throw new Error("Could not join room.");

      await createRole(player.id);

      setRoom(found as Room);
      setMe(player);
      window.history.replaceState({}, "", `?room=${found.code}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not join game.");
    } finally {
      setBusy(false);
    }
  }

  async function addPlayer(roomId: string, playerName: string) {
    const { data, error } = await supabase
      .from("players")
      .insert({
        room_id: roomId,
        user_id: userId,
        name: playerName
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return null;
    }

    return data as Player;
  }

  async function createRole(playerId: string) {
    const picked = secretRoles[Math.floor(Math.random() * secretRoles.length)];
    await supabase.from("player_secrets").insert({
      player_id: playerId,
      user_id: userId,
      role_name: picked[0],
      role_goal: picked[1]
    });
    setRole([picked[0], picked[1]]);
  }

  async function revealRole() {
    if (!me) return;
    const { data } = await supabase
      .from("player_secrets")
      .select("role_name, role_goal")
      .eq("player_id", me.id)
      .single();

    if (data) setRole([data.role_name, data.role_goal]);
  }

  async function startGame() {
    if (!room || !isHost) return;
    if (players.length < 2) {
      setMessage("Add at least 2 players for testing. The real game is better with 4+.");
      return;
    }

    const { error } = await supabase
      .from("rooms")
      .update({ status: "playing", round: 0 })
      .eq("id", room.id);

    if (error) setMessage(error.message);
  }

  async function submitChoice() {
    if (!room || !me || !currentRound || !selectedChoice) return;

    const picked = currentRound.choices.find((c) => c.id === selectedChoice);
    if (!picked) return;

    setBusy(true);
    setMessage("");

    const { error } = await supabase.from("choices").upsert(
      {
        room_id: room.id,
        player_id: me.id,
        user_id: userId,
        round: room.round,
        pack_id: room.pack_id,
        choice_id: picked.id
      },
      { onConflict: "player_id,round" }
    );

    if (!error) {
      await supabase
        .from("players")
        .update({ has_submitted: true })
        .eq("id", me.id);
    } else {
      setMessage(error.message);
    }

    setBusy(false);
  }

  async function resolveRound() {
    if (!room || !isHost || !currentRound) return;

    setBusy(true);
    setMessage("");

    const payload = Object.fromEntries(
      currentRound.choices.map((choice) => [
        choice.id,
        {
          consequence: choice.consequence,
          explanation: choice.explanation,
          health: choice.health,
          energy: choice.energy,
          supplies: choice.supplies
        }
      ])
    );

    const { error } = await supabase.rpc("resolve_learning_round", {
      target_room_code: room.code,
      choice_map: payload,
      max_rounds: pack.rounds.length
    });

    if (error) setMessage(error.message);
    setBusy(false);
  }

  if (!room) {
    return (
      <main className="shell">
        <section className="hero">
          <div className="eyebrow">LEARN BY PLAYING</div>
          <h1>Outsmart</h1>
          <p className="subtitle">
            Multiplayer scenarios where your choices change what happens next.
            Survive history, money problems, science disasters — or pure chaos.
          </p>
        </section>

        <section className="card">
          <h2>Choose a game pack</h2>
          <div className="packgrid">
            {gamePacks.map((p) => (
              <button
                className={`pack ${selectedPack === p.id ? "active" : ""}`}
                key={p.id}
                onClick={() => setSelectedPack(p.id)}
              >
                <span className="emoji">{p.emoji}</span>
                <strong>{p.name}</strong>
                <span className="muted">{p.description}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="grid2">
            <label>
              Your name
              <input value={name} maxLength={24} onChange={(e) => setName(e.target.value)} />
            </label>

            <label>
              Selected scenario
              <input value={getPack(selectedPack).scenarioName} disabled />
            </label>
          </div>

          <button className="primary" style={{ marginTop: 15 }} disabled={busy || !userId} onClick={createRoom}>
            Create game
          </button>

          <div className="divider" />

          <div className="grid2">
            <label>
              Room code
              <input
                value={joinCode}
                maxLength={5}
                placeholder="K9X2Q"
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              />
            </label>
            <div className="row" style={{ alignItems: "end" }}>
              <button className="secondary" disabled={busy || !userId} onClick={joinRoom}>
                Join game
              </button>
            </div>
          </div>

          {message && <p className="error">{message}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">
          {pack.emoji} {pack.name}
        </div>
        <div className="row space">
          <div>
            <div className="code">{room.code}</div>
            <div className="muted">
              {pack.scenarioName} • {players.length} player{players.length === 1 ? "" : "s"}
            </div>
          </div>
          <button
            className="secondary"
            onClick={() => {
              setRoom(null);
              setPlayers([]);
              setResults([]);
              window.history.replaceState({}, "", "/");
            }}
          >
            Leave
          </button>
        </div>
      </section>

      {room.status === "lobby" && (
        <>
          <section className="card">
            <div className="row space">
              <div>
                <h2>Lobby</h2>
                <p className="muted">Share the code. Everyone joins from their own phone or browser.</p>
              </div>
              {isHost && (
                <button className="primary" onClick={startGame}>
                  Start
                </button>
              )}
            </div>

            <div className="players">
              {players.map((player) => (
                <div className="player" key={player.id}>
                  <strong>{player.name}</strong>
                  <span className="muted">
                    {player.user_id === room.host_user_id ? "HOST" : "READY"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="row space">
              <div>
                <h3>Secret role</h3>
                <p className="muted">Your role changes how you might approach the same scenario.</p>
              </div>
              <button className="secondary" onClick={revealRole}>
                Reveal
              </button>
            </div>

            {role && (
              <div className="learn">
                <strong>{role[0]}</strong>
                <div className="muted">{role[1]}</div>
              </div>
            )}
          </section>
        </>
      )}

      {room.status === "playing" && currentRound && (
        <>
          <section className="card">
            <div className="eyebrow">ROUND {room.round + 1} OF {pack.rounds.length}</div>
            <h2>{currentRound.title}</h2>
            <p className="subtitle">{currentRound.setup}</p>

            {me?.has_submitted ? (
              <div className="learn">
                <strong>Choice locked.</strong>
                <div className="muted">Waiting for everybody else.</div>
              </div>
            ) : (
              <>
                <div className="choicegrid">
                  {currentRound.choices.map((choice) => (
                    <button
                      className={`choice ${selectedChoice === choice.id ? "active" : ""}`}
                      key={choice.id}
                      onClick={() => setSelectedChoice(choice.id)}
                    >
                      <strong>{choice.label}</strong>
                    </button>
                  ))}
                </div>

                <button
                  className="primary"
                  style={{ marginTop: 15 }}
                  disabled={!selectedChoice || busy}
                  onClick={submitChoice}
                >
                  Lock in answer
                </button>
              </>
            )}
          </section>

          <section className="card">
            <div className="row space">
              <div>
                <h3>Players</h3>
                <div className="muted">
                  {alivePlayers.filter((p) => p.has_submitted).length}/{alivePlayers.length} locked in
                </div>
              </div>
              {isHost && (
                <button className="primary" disabled={!allSubmitted || busy} onClick={resolveRound}>
                  Reveal what happens
                </button>
              )}
            </div>

            <div className="players">
              {players.map((player) => (
                <div className="player" key={player.id}>
                  <div>
                    <strong>{player.name}</strong>
                    <div className="stats">
                      ❤️ {player.health} &nbsp; ⚡ {player.energy} &nbsp; 🎒 {player.supplies}
                    </div>
                  </div>
                  <span className="muted">
                    {!player.alive ? "OUT" : player.has_submitted ? "LOCKED" : "CHOOSING"}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {results.length > 0 && (
            <section className="card">
              <h3>What happened last round</h3>
              {results.map((result) => {
                const player = players.find((p) => p.id === result.player_id);
                return (
                  <div className="result" key={result.id}>
                    <strong>{player?.name ?? "Player"}</strong>
                    <p>{result.consequence}</p>
                    <div className="learn">
                      <strong>Why?</strong>
                      <div className="muted">{result.explanation}</div>
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {message && <p className="error">{message}</p>}
        </>
      )}

      {room.status === "finished" && (
        <section className="card">
          <div className="eyebrow">SCENARIO COMPLETE</div>
          <h2>You survived {pack.scenarioName}.</h2>
          <p className="subtitle">
            The game is finished. Compare who survived, who collected the most resources,
            and which decisions produced the strongest outcomes.
          </p>

          <div className="players">
            {[...players]
              .sort((a, b) => {
                const sa = a.health * 3 + a.energy + a.supplies * 2;
                const sb = b.health * 3 + b.energy + b.supplies * 2;
                return sb - sa;
              })
              .map((player) => (
                <div className="player" key={player.id}>
                  <strong>{player.name}</strong>
                  <span className="stats">
                    ❤️ {player.health} • ⚡ {player.energy} • 🎒 {player.supplies}
                  </span>
                </div>
              ))}
          </div>
        </section>
      )}
    </main>
  );
}
