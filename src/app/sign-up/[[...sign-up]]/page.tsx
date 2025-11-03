import { SignUp } from '@clerk/nextjs';
import { ChartLine, Clock, ShieldCheck, Sparkles } from 'lucide-react';
import { clerkAppearance } from '@/lib/clerk-theme';

export default function SignUpPage() {
  return (
    <div className='grid flex-1 lg:grid-cols-2'>
      <div className='hidden flex-1 items-center justify-end p-6 md:p-10 lg:flex'>
        <ul className='max-w-sm space-y-8'>
          <li>
            <div className='flex items-center gap-2'>
              <Clock className='size-4' />
              <p className='font-semibold'>Streamline your lending operations</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Manage loans, borrowers, and lenders all in one powerful platform.
            </p>
          </li>
          <li>
            <div className='flex items-center gap-2'>
              <ChartLine className='size-4' />
              <p className='font-semibold'>Real-time analytics & forecasting</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Track portfolio performance with AI-powered insights and forecasting.
            </p>
          </li>
          <li>
            <div className='flex items-center gap-2'>
              <ShieldCheck className='size-4' />
              <p className='font-semibold'>Enterprise-grade security</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Your data is protected with bank-level encryption and compliance features.
            </p>
          </li>
          <li>
            <div className='flex items-center gap-2'>
              <Sparkles className='size-4' />
              <p className='font-semibold'>Automated workflows</p>
            </div>
            <p className='text-muted-foreground mt-2 text-sm'>
              Automate document generation, compliance checks, and payment processing.
            </p>
          </li>
        </ul>
      </div>
      <div className='flex flex-1 items-center justify-center p-6 md:p-10 lg:justify-start'>
        <SignUp appearance={clerkAppearance} />
      </div>
    </div>
  );
}
