'use client';

import {
  ArrowLeftIcon,
  Edit2Icon,
  LogOutIcon,
  MailPlusIcon,
  ShieldIcon,
  Trash2Icon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { PageSection } from '@/components/layout/page-section';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTeamRbac } from '@/hooks/use-team-rbac';

import InviteMemberModal from '@/components/teams/invite-member-modal';
import { getApiErrorMessage } from '@/lib/api-core';
import {
  useChangeMemberRole,
  useGetTeamDetail,
  useGetTeamMembers,
  useLeaveTeam,
  useRemoveTeamMember,
} from '@/query/team-hooks';
import dynamic from 'next/dynamic';

const loadEditTeamModal = () => import('@/components/teams/edit-team-modal');
const EditTeamModal = dynamic(loadEditTeamModal, {
  ssr: false,
});

const loadDeleteTeamModal = () =>
  import('@/components/teams/delete-team-modal');
const DeleteTeamModal = dynamic(loadDeleteTeamModal, {
  ssr: false,
});

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = params.id as string;

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const teamDetailQuery = useGetTeamDetail(teamId);
  const teamMembersQuery = useGetTeamMembers(teamId);
  const changeRoleMutation = useChangeMemberRole(teamId);
  const leaveTeamMutation = useLeaveTeam();
  const removeMemberMutation = useRemoveTeamMember(teamId);

  const team = teamDetailQuery.data;
  const members = teamMembersQuery.data?.items ?? [];

  const {
    canEditTeam,
    canDeleteTeam,
    canInviteMember,
    canChangeRole,
    canKickMember,
  } = useTeamRbac(team?.myRole);

  const handleLeaveTeam = () => {
    if (confirm('Are you sure you want to leave this team?')) {
      leaveTeamMutation.mutate(teamId, {
        onSuccess: () => {
          router.push('/teams');
        },
        onError: (err) => {
          setErrorMessage(getApiErrorMessage(err, 'Failed to leave team'));
        },
      });
    }
  };

  const handleRoleChange = (
    userId: string,
    newRole: 'ADMIN' | 'MEMBER' | 'OWNER',
  ) => {
    changeRoleMutation.mutate(
      { userId, input: { role: newRole } },
      {
        onError: (err) => {
          setErrorMessage(getApiErrorMessage(err, 'Failed to change role'));
        },
      },
    );
  };

  const handleKickMember = (userId: string) => {
    if (confirm('Are you sure you want to remove this member?')) {
      removeMemberMutation.mutate(userId, {
        onError: (err) => {
          setErrorMessage(getApiErrorMessage(err, 'Failed to remove member'));
        },
      });
    }
  };

  if (teamDetailQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageSection>
          <Skeleton className="h-40 w-full" />
        </PageSection>
      </div>
    );
  }

  if (teamDetailQuery.isError) {
    return (
      <div className="space-y-6">
        <PageSection>
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(teamDetailQuery.error, 'Failed to load team')}
            </AlertDescription>
          </Alert>
        </PageSection>
      </div>
    );
  }

  return (
    <div data-testid="team-detail-page" className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="ghost" size="icon">
          <Link href="/teams">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
          {team?.name}
        </h1>
        {canEditTeam && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 ml-2"
            onClick={() => setIsEditModalOpen(true)}
          >
            <Edit2Icon className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        {/* Left Column: Overview */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Description
              </p>
              <p className="text-sm text-foreground">
                {team?.description || (
                  <span className="italic text-muted-foreground">
                    No description provided.
                  </span>
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Your Role
              </p>
              <Badge
                variant={team?.myRole === 'OWNER' ? 'default' : 'secondary'}
              >
                {team?.myRole}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Total Members
              </p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <UsersIcon className="h-4 w-4" /> {team?.memberCount}
              </p>
            </div>

            <div className="pt-6 border-t border-border">
              {canDeleteTeam ? (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setIsDeleteModalOpen(true)}
                >
                  <Trash2Icon className="mr-2 h-4 w-4" />
                  Delete Team
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleLeaveTeam}
                  disabled={leaveTeamMutation.isPending}
                >
                  <LogOutIcon className="mr-2 h-4 w-4" />
                  Leave Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Members */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Members</CardTitle>
            {canInviteMember && (
              <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
                <MailPlusIcon className="mr-2 h-4 w-4" />
                Invite member
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {teamMembersQuery.isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : teamMembersQuery.isError ? (
              <Alert variant="destructive">
                <AlertDescription>
                  {getApiErrorMessage(
                    teamMembersQuery.error,
                    'Failed to load members',
                  )}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Role</TableHead>
                      {team?.myRole === 'OWNER' && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {member.displayName || 'Unknown user'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {member.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              member.status === 'ACTIVE'
                                ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                : ''
                            }
                          >
                            {member.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {canChangeRole(member.role) ? (
                            <Select
                              defaultValue={member.role}
                              onValueChange={(val) =>
                                handleRoleChange(
                                  member.userId,
                                  val as 'ADMIN' | 'MEMBER',
                                )
                              }
                              disabled={changeRoleMutation.isPending}
                            >
                              <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ADMIN">ADMIN</SelectItem>
                                <SelectItem value="MEMBER">MEMBER</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-1.5 text-sm">
                              {member.role === 'OWNER' ? (
                                <ShieldIcon className="h-3.5 w-3.5 text-primary" />
                              ) : (
                                <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              )}
                              <span
                                className={
                                  member.role === 'OWNER'
                                    ? 'font-semibold text-primary'
                                    : 'text-muted-foreground'
                                }
                              >
                                {member.role}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        {(team?.myRole === 'OWNER' ||
                          team?.myRole === 'ADMIN') && (
                          <TableCell className="text-right">
                            {member.role === 'OWNER' ? null : (
                              <Button
                                variant="destructive"
                                size="sm"
                                disabled={
                                  removeMemberMutation.isPending ||
                                  !canKickMember(member.role)
                                }
                                onClick={() => handleKickMember(member.userId)}
                                title={
                                  !canKickMember(member.role)
                                    ? 'Admin cannot remove another admin'
                                    : 'Remove member'
                                }
                              >
                                Kick
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isInviteModalOpen && team && (
        <InviteMemberModal
          teamId={team.id}
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
        />
      )}

      {isEditModalOpen && team && (
        <EditTeamModal
          teamId={team.id}
          initialName={team.name}
          initialDescription={team.description || undefined}
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
      )}

      {isDeleteModalOpen && team && (
        <DeleteTeamModal
          teamId={team.id}
          teamName={team.name}
          open={isDeleteModalOpen}
          onOpenChange={setIsDeleteModalOpen}
        />
      )}
    </div>
  );
}
