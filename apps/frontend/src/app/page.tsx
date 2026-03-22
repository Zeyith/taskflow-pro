import { redirect } from 'next/navigation';

import { appRoutes } from '@/constants/routes';

export default function HomePage(): never {
  redirect(appRoutes.login);
}