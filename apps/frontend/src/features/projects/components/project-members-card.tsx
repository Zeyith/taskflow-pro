'use client';

import { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ProjectMemberDetailsDialog } from '@/features/projects/components/project-member-details-dialog';
import type { ProjectMember } from '@/types/project-member';

type ProjectMembersCardProps = {
  members: ProjectMember[];
  canRemoveMembers: boolean;
  isRemovingMemberId?: string;
  onRemoveMember: (member: ProjectMember) => Promise<void> | void;
};

function getMemberFullName(member: ProjectMember): string {
  if (!member.user) {
    return `User ${member.userId.slice(0, 8)}`;
  }

  return `${member.user.firstName} ${member.user.lastName}`.trim();
}

function getRoleLabel(role: 'TEAM_LEAD' | 'EMPLOYEE'): string {
  return role === 'TEAM_LEAD' ? 'Team Lead' : 'Employee';
}

export function ProjectMembersCard({
  members,
  canRemoveMembers,
  isRemovingMemberId,
  onRemoveMember,
}: ProjectMembersCardProps): React.JSX.Element {
  const [selectedMember, setSelectedMember] = useState<ProjectMember | null>(
    null,
  );

  return (
    <>
      <div className="rounded-3xl border border-border/60 bg-card/95 p-6 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold text-foreground">
            Project Members
          </h2>
          <p className="text-sm text-muted-foreground">
            {members.length} member{members.length === 1 ? '' : 's'} assigned to
            this project
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-5 w-full">
          <AccordionItem value="members" className="border-border/60">
            <AccordionTrigger className="rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:no-underline">
              Show members
            </AccordionTrigger>

            <AccordionContent className="pt-4">
              {members.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/60 bg-muted/20 p-6 text-sm text-muted-foreground">
                  No members found for this project.
                </div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedMember(member);
                      }}
                      className="w-full rounded-2xl border border-border/60 bg-muted/20 p-4 text-left transition hover:bg-muted/35"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {getMemberFullName(member)}
                          </p>

                          {member.user ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {member.user.email}
                            </p>
                          ) : (
                            <p className="truncate text-xs text-muted-foreground">
                              User data unavailable
                            </p>
                          )}
                        </div>

                        <span className="rounded-full border border-border/60 bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                          {member.user
                            ? getRoleLabel(member.user.role)
                            : 'Unknown'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <ProjectMemberDetailsDialog
        open={selectedMember !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMember(null);
          }
        }}
        member={selectedMember}
        canRemove={canRemoveMembers}
        isRemoving={
          selectedMember !== null &&
          isRemovingMemberId === selectedMember.userId
        }
        onRemove={async (member) => {
          await onRemoveMember(member);
          setSelectedMember(null);
        }}
      />
    </>
  );
}