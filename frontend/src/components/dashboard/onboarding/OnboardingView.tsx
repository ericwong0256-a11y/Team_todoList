import type { DiscoverableTeam } from "@/types/domain";
import { AppLogo } from "@/components/ui/AppLogo";
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
    <section className="app-card-elevated overflow-hidden">
      <div className="border-b border-zinc-800/80 bg-zinc-950/30 px-6 py-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <AppLogo />
          <div className="rounded-full border border-zinc-800/80 bg-zinc-900/50 px-3 py-1 text-xs font-medium text-zinc-400">
            Signed in as <span className="text-zinc-200">{userName}</span>
          </div>
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">Get started</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Join a team with an invite or from discovery, create your own workspace, or start in a personal sandbox.
        </p>
      </div>

      <div className="space-y-6 p-6 sm:p-8">
        <InviteCodeSection value={inviteCodeInput} onChange={onInviteCodeChange} onJoin={onJoinWithInviteCode} />

        <div className="grid gap-6 lg:grid-cols-2">
          <DiscoverTeamsList teams={discoverTeams} onJoinTeam={onJoinPublicTeam} />
          <CreateTeamSection onOpenCreateDialog={onOpenCreateTeam} lastCreatedInvite={lastCreatedInvite} />
        </div>

        <SandboxSkipRow onCreateSandbox={onCreateSandbox} />
      </div>
    </section>
  );
}
