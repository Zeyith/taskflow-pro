'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { appRoutes } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginRequest, meRequest } from '@/features/auth/api/login';
import { useRegister } from '@/features/auth/hooks/use-register';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';
import { useAuthStore } from '@/stores/auth.store';

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const registerMutation = useRegister();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setUser = useAuthStore((state) => state.setUser);

  const [showPassword, setShowPassword] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [pendingCredentials, setPendingCredentials] = useState<{
    email: string;
    password: string;
  } | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'EMPLOYEE',
    },
  });

  async function onSubmit(values: RegisterFormValues): Promise<void> {
    try {
      await registerMutation.mutateAsync(values);

      setPendingCredentials({
        email: values.email,
        password: values.password,
      });

      setIsVerifyDialogOpen(true);
    } catch {
      return;
    }
  }

  async function handleVerifyEmail(): Promise<void> {
    if (!pendingCredentials) {
      toast.error('Registration session could not be found.');
      return;
    }

    if (!verificationCode.trim()) {
      toast.error('Please enter the verification code.');
      return;
    }

    if (verificationCode.trim() !== '1111') {
      toast.error('Invalid verification code.');
      return;
    }

    try {
      const loginResponse = await loginRequest({
        email: pendingCredentials.email,
        password: pendingCredentials.password,
      });

      setAccessToken(loginResponse.accessToken);

      const meResponse = await meRequest();
      setUser(meResponse);

      setVerificationCode('');
      setPendingCredentials(null);
      setIsVerifyDialogOpen(false);

      toast.success('Email verified successfully.');
      router.replace(appRoutes.dashboard);
    } catch {
      toast.error('Verification succeeded but automatic sign-in failed.');
    }
  }

  return (
    <>
      <Card className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-[0_24px_90px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="border-b border-white/8 px-8 py-7">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-medium text-zinc-300">
              TaskFlow Pro
            </div>

            <div className="mt-6 space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-white">
                Create account
              </h1>
              <p className="max-w-md text-sm leading-7 text-zinc-400">
                Register a new account to start managing projects, tasks,
                notifications, and incident workflows.
              </p>
            </div>
          </div>

          <div className="px-8 py-8">
            <Form {...form}>
              <form
                className="space-y-5"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          First name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                              placeholder="Zeynep"
                              className="h-13 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/60"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel className="text-sm font-medium text-zinc-200">
                          Last name
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                            <Input
                              placeholder="Aydinli"
                              className="h-13 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/60"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-200">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <Input
                            type="email"
                            placeholder="zeynep@taskflow.com"
                            autoComplete="email"
                            className="h-13 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/60"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <p className="text-xs text-zinc-500">
                        Only company emails ending with @taskflow.com are
                        accepted.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-sm font-medium text-zinc-200">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="8+ chars, uppercase, number, special char"
                            autoComplete="new-password"
                            className="h-13 rounded-2xl border-white/10 bg-white/[0.04] pl-11 pr-10 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-blue-500/60"
                            {...field}
                          />
                          <button
                            type="button"
                            aria-label={
                              showPassword ? 'Hide password' : 'Show password'
                            }
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-200"
                            onClick={() => {
                              setShowPassword((current) => !current);
                            }}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <div className="text-xs leading-6 text-zinc-500">
                        Password must include at least 8 characters, 1 uppercase
                        letter, 1 number, and 1 special character.
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-sm font-medium text-zinc-200">
                        Role
                      </FormLabel>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('TEAM_LEAD');
                          }}
                          className={`rounded-2xl border p-4 text-left transition ${
                            field.value === 'TEAM_LEAD'
                              ? 'border-blue-500/40 bg-blue-500/10'
                              : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                              <BriefcaseBusiness className="h-4 w-4 text-zinc-200" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-white">
                                Team Lead
                              </p>
                              <p className="mt-1 text-xs leading-5 text-zinc-400">
                                Create projects, manage members, and assign
                                tasks.
                              </p>
                            </div>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            field.onChange('EMPLOYEE');
                          }}
                          className={`rounded-2xl border p-4 text-left transition ${
                            field.value === 'EMPLOYEE'
                              ? 'border-blue-500/40 bg-blue-500/10'
                              : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.06]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-2">
                              <Users className="h-4 w-4 text-zinc-200" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-white">
                                Employee
                              </p>
                              <p className="mt-1 text-xs leading-5 text-zinc-400">
                                View assigned projects and update assigned tasks.
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="mt-2 h-13 w-full rounded-2xl bg-white text-black hover:bg-zinc-200"
                  disabled={registerMutation.isPending}
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center text-sm text-zinc-400">
              Already have an account?{' '}
              <Link
                href={appRoutes.login}
                className="font-medium text-white underline underline-offset-4 transition hover:text-zinc-200"
              >
                Sign in
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isVerifyDialogOpen}>
        <DialogContent
          className="sm:max-w-md"
          showCloseButton={false}
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
          onInteractOutside={(event) => {
            event.preventDefault();
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Verify Email
            </DialogTitle>
            <DialogDescription>
              Enter the verification code to continue. Demo code:{' '}
              <span className="font-semibold text-foreground">1111</span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              value={verificationCode}
              onChange={(event) => {
                setVerificationCode(event.target.value);
              }}
              placeholder="Enter verification code"
            />

            <Button
              type="button"
              className="w-full"
              onClick={() => {
                void handleVerifyEmail();
              }}
            >
              Verify Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}