import { EnrichedTurn, Profile } from '@/lib/types'; // create this if you want strong types

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
  return data as Profile[];
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

export const sendTurnNotification = async (
  employeeId: string,
  customText: string | null | undefined
) => {
  const res = await fetch('/api/notifications/send-sms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: employeeId,
      message: customText ?? '🎉 Your next client is ready!',
    }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || 'Failed to send notification');
  }
};

export const undoTurn = async ({ turnId }: { turnId: string }) => {
  const res = await fetch('/api/employee-turns/undo', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ turnId }),
  });
  if (!res.ok) throw new Error('Failed to undo turn.');
  return res.json();
};
