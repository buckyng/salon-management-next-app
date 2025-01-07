import Navbar from '@/components/global/navbar';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const RootPage = async () => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-semibold">
            Welcome to the Salon Management App
          </h2>
          <p className="mt-2 text-gray-600">
            Manage your salon effortlessly with our user-friendly platform.
          </p>
        </div>
      </main>
    </div>
  );
};

export default RootPage;
