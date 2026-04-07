import type { DiscoverableTeam } from "@/types/domain";
import { CreateTeamSection } from "./CreateTeamSection";
import { DiscoverTeamsList } from "./DiscoverTeamsList";
import { InviteCodeSection } from "./InviteCodeSection";
import { SandboxSkipRow } from "./SandboxSkipRow";

type Props = {
  userName: string;
  inviteCodeInput: string;
  onInviteCodeChange: (value: string) => void;
  onJoinWithInviteCode: () => void | Promise<void>;
  discoverTeams: DiscoverableTeam[];
  onJoinPublicTeam: (workspaceId: string) => void | Promise<void>;
  onOpenCreateTeam: () => void;
  lastCreatedInvite: string | null;
  onCreateSandbox: () => void | Promise<void>;
};

export function OnboardingView({
  userName,
  inviteCodeInput,
  onInviteCodeChange,
  onJoinWithInviteCode,
  discoverTeams,
  onJoinPublicTeam,
  onOpenCreateTeam,
  lastCreatedInvite,
  onCreateSandbox
}: Props) {
  return (
    <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div>
        <h2 className="text-2xl font-semibold">Welcome, {userName}</h2>
        <p className="mt-2 text-slate-300">Join an existing team or create your own team to get started.</p>
      </div>

      <InviteCodeSection value={inviteCodeInput} onChange={onInviteCodeChange} onJoin={onJoinWithInviteCode} />

      <div className="grid gap-6 md:grid-cols-2">
        <DiscoverTeamsList teams={discoverTeams} onJoinTeam={onJoinPublicTeam} />
        <CreateTeamSection onOpenCreateDialog={onOpenCreateTeam} lastCreatedInvite={lastCreatedInvite} />
      </div>

      <SandboxSkipRow onCreateSandbox={onCreateSandbox} />
    </section>
  );
}
