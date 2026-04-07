import type { DiscoverableTeam } from "@/types/domain";

type Props = {
  teams: DiscoverableTeam[];
  onJoinTeam: (workspaceId: string) => void | Promise<void>;
};

export function DiscoverTeamsList({ teams, onJoinTeam }: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-zinc-800/90 bg-zinc-950/25 p-5">
      <div>
        <h3 className="app-section-title">Public teams</h3>
        <p className="app-muted mt-1">Discoverable workspaces you can join in one click.</p>
      </div>
      {teams.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-800/90 bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-500">
          No public teams yet. Create one or use an invite.
        </p>
      ) : (
        <ul className="space-y-3">
          {teams.map((team) => (
            <li
              key={team.workspaceId}
              className="flex flex-col gap-3 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-100">{team.name}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {team.members} member{team.members === 1 ? "" : "s"} · {team.slug} · {team.visibility}
                </p>
              </div>
              <button
                type="button"
                className="app-btn-secondary shrink-0 text-sm"
                onClick={() => void onJoinTeam(team.workspaceId)}
              >
                Join team
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
