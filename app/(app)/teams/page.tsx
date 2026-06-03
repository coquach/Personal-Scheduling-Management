'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PlusIcon, UsersIcon, CheckIcon, XIcon, MailIcon } from 'lucide-react';

import { PageSection } from '@/components/layout/page-section';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

import { useGetTeams, useGetMyInvitations, useAcceptInvitation, useDeclineInvitation } from '@/query/team-hooks';
import { getApiErrorMessage } from '@/lib/api-core';
import { toast } from 'sonner';

// 1. Deferred Interactive Loading (ADR 0007)
const loadCreateTeamModal = () =>
  import('@/components/teams/create-team-modal');
const CreateTeamModal = dynamic(loadCreateTeamModal, {
  ssr: false,
});

export default function TeamsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;

  const teamsQuery = useGetTeams({ page, limit });
  const teams = teamsQuery.data?.items ?? [];
  const totalPages = Math.ceil((teamsQuery.data?.total ?? 0) / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const invitationsQuery = useGetMyInvitations({ status: 'PENDING' });
  const invitations = invitationsQuery.data ?? [];

  const acceptMutation = useAcceptInvitation();
  const declineMutation = useDeclineInvitation();

  const handleAccept = (teamId: string, invitationId: string) => {
    acceptMutation.mutate(
      { teamId, invitationId },
      {
        onSuccess: () => {
          toast.success('Invitation accepted.');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Failed to accept invitation.'));
        },
      },
    );
  };

  const handleDecline = (teamId: string, invitationId: string) => {
    declineMutation.mutate(
      { teamId, invitationId },
      {
        onSuccess: () => {
          toast.success('Invitation declined.');
        },
        onError: (err) => {
          toast.error(getApiErrorMessage(err, 'Failed to decline invitation.'));
        },
      },
    );
  };

  return (
    <div data-testid="teams-page" className="space-y-6">
      <PageSection
        title="Teams"
        description="Manage your scheduling teams, invite members, and collaborate efficiently."
        actions={
          <Button
            onClick={() => setIsDialogOpen(true)}
            onMouseEnter={loadCreateTeamModal} // 2. Hover-Intent Prefetching (ADR 0007)
            onFocus={loadCreateTeamModal}
            data-testid="create-team-trigger"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            New team
          </Button>
        }
      >
        {/* Pending Invitations Section */}
        {invitations.length > 0 && (
          <div className="mb-8 space-y-4">
            <h3 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
              <MailIcon className="h-5 w-5 text-primary" />
              Pending Invitations
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {invitations.map((invitation) => (
                <Card
                  key={invitation.invitationId}
                  className="border-primary/50 bg-primary/5 shadow-md"
                >
                  <CardContent className="p-5 flex flex-col h-full justify-between">
                    <div>
                      <h4 className="font-semibold text-lg text-foreground truncate">
                        {invitation.teamName}
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Invited as {invitation.role.toLowerCase()}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          handleAccept(
                            invitation.teamId,
                            invitation.invitationId,
                          )
                        }
                        disabled={
                          acceptMutation.isPending || declineMutation.isPending
                        }
                        className="w-full"
                        data-testid={`invitation-accept-${invitation.invitationId}`}
                      >
                        <CheckIcon className="mr-1.5 h-4 w-4" /> Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDecline(
                            invitation.teamId,
                            invitation.invitationId,
                          )
                        }
                        disabled={
                          acceptMutation.isPending || declineMutation.isPending
                        }
                        className="w-full"
                        data-testid={`invitation-decline-${invitation.invitationId}`}
                      >
                        <XIcon className="mr-1.5 h-4 w-4" /> Decline
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        {teamsQuery.isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="overflow-hidden border-none shadow-none bg-accent/20"
              >
                <CardContent className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-5 w-16 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <div className="pt-2 flex justify-between items-center border-t border-border/50">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-8 w-24 rounded-md" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {teamsQuery.isError && (
          <Alert variant="destructive">
            <AlertDescription>
              {getApiErrorMessage(teamsQuery.error, 'Failed to load teams.')}
            </AlertDescription>
          </Alert>
        )}

        {!teamsQuery.isLoading && !teamsQuery.isError && (
          <>
            {teams.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent shadow-none">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <UsersIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <p className="text-lg font-medium text-foreground">
                    No teams found
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    You haven&apos;t joined or created any teams yet.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {teams.map((team) => (
                  <Card
                    key={team.id}
                    data-testid="team-card"
                    className="group relative overflow-hidden border border-border/50 bg-background/50 backdrop-blur-xl transition-all hover:shadow-lg hover:-translate-y-0.5 hover:border-primary/20"
                  >
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-lg leading-tight tracking-tight text-foreground truncate">
                          {team.name}
                        </h3>
                        <Badge
                          variant={
                            team.role === 'OWNER' ? 'default' : 'secondary'
                          }
                          className="shrink-0 rounded-md"
                        >
                          {team.role}
                        </Badge>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between text-muted-foreground">
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md text-xs font-medium">
                          <UsersIcon className="h-3.5 w-3.5" />
                          <span>{team.memberCount} members</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Link href={`/teams/${team.id}`}>Manage</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground text-center sm:text-left">
                  Showing page {page} of {totalPages}
                </p>
                <Pagination className="justify-end w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasPrevPage && !teamsQuery.isLoading)
                            setPage((p) => p - 1);
                        }}
                        className={
                          !hasPrevPage || teamsQuery.isLoading
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationLink href="#" isActive>
                        {page}
                      </PaginationLink>
                    </PaginationItem>

                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (hasNextPage && !teamsQuery.isLoading)
                            setPage((p) => p + 1);
                        }}
                        className={
                          !hasNextPage || teamsQuery.isLoading
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </PageSection>

      {isDialogOpen && (
        <CreateTeamModal open={isDialogOpen} onOpenChange={setIsDialogOpen} />
      )}
    </div>
  );
}
