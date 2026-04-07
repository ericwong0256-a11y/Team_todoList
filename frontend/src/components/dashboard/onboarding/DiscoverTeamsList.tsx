import type { DiscoverableTeam } from "@/types/domain";

type Props = {
  teams: DiscoverableTeam[];
  onJoinTeam: (workspaceId: string) => void | Promise<void>;
};

export function DiscoverTeamsList({ teams, onJoinTeam }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Public teams available to join</h3>
      {teams.length === 0 ? (
        <p className="text-sm text-slate-400">No available teams yet.</p>
      ) : (
        teams.map((team) => (
          <div key={team.workspaceId} className="rounded-lg border border-slate-700 p-3">
            <p className="font-medium">{team.name}</p>
            <p className="text-xs text-slate-400">
              {team.members} member(s) · {team.slug} · {team.visibility}
            </p>
            <button
              type="button"
              className="mt-2 rounded bg-blue-600 px-3 py-1 text-sm hover:bg-blue-500"
              onClick={() => void onJoinTeam(team.workspaceId)}
            >
              Join team
            </button>
          </div>
        ))
      )}
    </div>
  );
}
