import { EnrichedTurn } from '@/lib/types'; // create this if you want strong types

/* 🔹 fetch employees scheduled for today */
export const fetchScheduledEmployees = async ({
  groupId,
  weekday,
}: {
  groupId: string;
  weekday: string; // "monday"…"sunday"
}) => {
  const qp = new URLSearchParams({ groupId, weekday });
  const res = await fetch(`/api/employee-turns/employees?${qp}`);
  const data = await res.json();

  if (!res.ok) throw new Error('Failed to fetch employees');
  return data as { id: string; name: string; avatar_url: string | null }[];
};

/* 🔹 fetch today’s turns */
export const fetchTodayTurns = async ({
  groupId,
  date,
}: {
  groupId: string;
  date: string; // YYYY-MM-DD
}) => {
  const qp = new URLSearchParams({ groupId, date });
  const res = await fetch(`/api/employee-turns/today?${qp}`);
  const data = await res.json();

  if (!res.ok) throw new Error('Failed to fetch turns');
  return data as EnrichedTurn[];
};

/* 🔹 create a turn */
export const createTurn = async ({
  groupId,
  userId,
}: {
  groupId: string;
  userId: string;
}) => {
  const res = await fetch('/api/employee-turns/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, userId }),
  });

  if (!res.ok) throw new Error('Failed to create turn');
  return res.json();
};

/* 🔹 complete a turn */
export const completeTurn = async (turnId: string) => {
  const res = await fetch('/api/employee-turns/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turnId }),
  });

  if (!res.ok) throw new Error('Failed to complete turn');
};

export const sendTurnNotification = async (employeeId: string) => {
  const res = await fetch('/api/notifications/send-turn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ employeeId }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to send notification');
  }
};
