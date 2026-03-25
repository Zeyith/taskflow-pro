'use client';

import { useState } from 'react';
import { LogOut, Menu, UserRound } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { appRoutes } from '@/constants/routes';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useChangePassword } from '@/features/auth/hooks/use-change-password';

type AppHeaderProps = {
  onOpenMobileSidebar: () => void;
};

export function AppHeader({
  onOpenMobileSidebar,
}: AppHeaderProps): React.JSX.Element {
  const router = useRouter();
  const { user, clearSession } = useAuth();
  const changePasswordMutation = useChangePassword();

  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  function handleLogout(): void {
    clearSession();
    router.replace(appRoutes.login);
  }

  async function handlePasswordFormSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    if (!user?.id) {
      toast.error('User session could not be found.');
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      toast.error('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        userId: user.id,
        currentPassword,
        newPassword,
      });

      toast.success('Password changed successfully.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setIsProfileDialogOpen(false);
    } catch {
      toast.error('Password change failed. Please check your current password.');
    }
  }

  const firstName =
    user && 'firstName' in user && typeof user.firstName === 'string'
      ? user.firstName
      : '-';

  const lastName =
    user && 'lastName' in user && typeof user.lastName === 'string'
      ? user.lastName
      : '-';

  const role =
    user && 'role' in user && typeof user.role === 'string' ? user.role : '-';

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Dialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
          >
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-xl px-2 py-1 text-left transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Open profile dialog"
              >
                <div className="space-y-0.5">
                  <h1 className="text-base font-semibold tracking-tight text-foreground">
                    Welcome back
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {user?.email ?? 'Authenticated user'}
                  </p>
                </div>
              </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <UserRound className="h-5 w-5" />
                  Profile
                </DialogTitle>
                <DialogDescription>
                  View account details and manage your password.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-2">
                <div className="grid gap-4 rounded-2xl border bg-muted/30 p-4 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      First Name
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {firstName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Last Name
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {lastName}
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {user?.email ?? '-'}
                    </p>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Role
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {role}
                    </p>
                  </div>
                </div>

                <form
                  className="grid gap-4 rounded-2xl border p-4"
                  onSubmit={handlePasswordFormSubmit}
                >
                  <div className="space-y-1">
                    <h2 className="text-sm font-semibold text-foreground">
                      Change Password
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Update your password securely from your profile.
                    </p>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(event) =>
                        setCurrentPassword(event.target.value)
                      }
                      placeholder="Enter current password"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirm-new-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-new-password"
                      type="password"
                      value={confirmNewPassword}
                      onChange={(event) =>
                        setConfirmNewPassword(event.target.value)
                      }
                      placeholder="Re-enter new password"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending
                        ? 'Updating...'
                        : 'Update Password'}
                    </Button>
                  </div>
                </form>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Button
          variant="outline"
          className="border-border/70 bg-background/70 shadow-sm hover:bg-accent"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}