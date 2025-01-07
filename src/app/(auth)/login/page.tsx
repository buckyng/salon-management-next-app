'use client';

import { login } from '@/actions/users';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'react-toastify';

function LoginPage() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const handleClickLoginButton = (formData: FormData) => {
    startTransition(async () => {
      const { errorMessage } = await login(formData);

      if (errorMessage) {
        toast.error(errorMessage);
      } else {
        router.push('/dashboard');
        toast.success('Log in successfully');
      }
    });
  };

  return (
    <div className="bg-emerald-700 w-96 rounded-lg p-8">
      <h1 className="text-2xl text-center mb-8">Login</h1>
      <form
        className="flex flex-col bg-emerald-700 gap-4"
        action={handleClickLoginButton}
      >
        <input
          type="email"
          name="email"
          className="rounded-lg p-2"
          placeholder="Email"
          disabled={isPending}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          className="rounded-lg p-2"
          disabled={isPending}
        />

        <button className="rounded-lg p-2 mt-4 bg-black text-white flex justify-center">
          {isPending ? <Loader2 /> : 'Log in'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;
