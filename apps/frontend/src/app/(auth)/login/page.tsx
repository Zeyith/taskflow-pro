import { LoginForm } from '@/features/auth/components/login-form';

export default function LoginPage(): React.JSX.Element {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06070b] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.12),transparent_26%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(124,58,237,0.08),transparent_24%)]" />

      <div className="relative w-full max-w-lg">
        <LoginForm />
      </div>
    </main>
  );
}