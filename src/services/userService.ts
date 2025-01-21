export const fetchUserNames = async (
  userIds: string[]
): Promise<Record<string, string>> => {
  if (!userIds.length) return {};

  const queryParams = new URLSearchParams({
    userIds: userIds.join(','),
  });

  const res = await fetch(
    `/api/users/fetch-user-names?${queryParams.toString()}`
  );
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch user names.');
  }

  // Return a map of userId to userName
  return data.reduce(
    (acc: Record<string, string>, user: { id: string; name: string }) => {
      acc[user.id] = user.name;
      return acc;
    },
    {}
  );
};

export const fetchMemberships = async (groupId: string) => {
  if (!groupId) return {};

  const res = await fetch(`/api/groupUsers/memberships?groupId=${groupId}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch memberships.');
  }

  return data;
};

export const fetchRoles = async (): Promise<Record<string, string>> => {
  const res = await fetch('/api/groupUsers/roles');
  const data = await res.json();

  if (!res.ok) {
    throw new Error('Failed to fetch roles.');
  }

  return data.reduce((acc: Record<string, string>, role: { id: string; name: string }) => {
    acc[role.id] = role.name;
    return acc;
  }, {});
};
