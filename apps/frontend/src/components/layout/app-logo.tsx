import Link from 'next/link';

import { appRoutes } from '@/constants/routes';

export function AppLogo(): React.JSX.Element {
  return (
    <Link
      href={appRoutes.dashboard}
      className="text-lg font-semibold tracking-tight text-foreground"
    >
      TaskFlow Pro
    </Link>
  );
}