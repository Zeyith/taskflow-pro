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
  User,
  Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { appRoutes } from '@/constants/routes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useRegister } from '@/features/auth/hooks/use-register';
import {
  registerSchema,
  type RegisterFormValues,
} from '@/features/auth/schemas/register.schema';

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);

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
    await registerMutation.mutateAsync(values);
    router.replace(appRoutes.login);
  }

  return (
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
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                          placeholder="zeynep@example.com"
                          autoComplete="email"
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
                          placeholder="Minimum 8 characters"
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
                              Create projects, manage members, and assign tasks.
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
  );
}