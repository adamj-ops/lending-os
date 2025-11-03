import { SignIn } from '@clerk/nextjs';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function SignInPage() {
  return (
    <div className='flex w-full flex-1 items-center justify-center p-6 md:p-10'>
      <SignIn appearance={clerkAppearance} />
    </div>
  );
}
