'use client';

import { useUser } from '@/context/UserContext';

export default function DashboardPage() {
  const { user, loading, error } = useUser();

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!user) {
    return <p>No user data available.</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>
        Welcome, <strong>{user.email}</strong>!
      </p>
      <h2 className="text-xl font-semibold mt-4">Your Groups:</h2>
      <ul className="list-disc list-inside">
        {user.groups.map((group) => (
          <li key={group.id}>
            Group Name: <strong>{group.name}</strong>
            <br />
            Roles: <strong>{group.roles.join(', ')}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
