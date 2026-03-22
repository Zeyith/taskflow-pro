'use client';

import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
import { useLogin } from '@/features/auth/hooks/use-login';
import {
  loginSchema,
  type LoginSchemaValues,
} from '@/features/auth/schemas/login.schema';

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const loginMutation = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginSchemaValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginSchemaValues): Promise<void> {
    try {
      await loginMutation.mutateAsync(values);
      toast.success('Signed in successfully.');
      router.push(appRoutes.dashboard);
    } catch (error) {
      const apiError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      toast.error(
        apiError.response?.data?.message ??
          'Sign in failed. Please check your credentials.',
      );
    }
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
              Welcome back
            </h1>
            <p className="max-w-md text-sm leading-7 text-zinc-400">
              Sign in to access your projects, tasks, notifications, and
              incident workflows.
            </p>
          </div>
        </div>

        <div className="px-8 py-8">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
                          placeholder="name@company.com"
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
                          placeholder="Enter your password"
                          autoComplete="current-password"
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

              <Button
                type="submit"
                className="mt-2 h-13 w-full rounded-2xl bg-white text-black hover:bg-zinc-200"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm text-zinc-400">
            Don&apos;t have an account?{' '}
            <Link
              href={appRoutes.register}
              className="font-medium text-white underline underline-offset-4 transition hover:text-zinc-200"
            >
              Create one
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}