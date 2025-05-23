'use client';

import { useGroup } from '@/context/GroupContext';

import { toast } from 'react-toastify';
import { useEffect, useState, useTransition } from 'react';
import LoadingSpinner from '@/components/global/LoadingSpinner';
import { formatToLocalTime, getCurrentLocalDate } from '@/lib/utils/dateUtils';
import {
  completeTurn,
  createTurn,
  fetchScheduledEmployees,
  fetchTodayTurns,
  sendTurnNotification,
  undoTurn,
} from '@/services/turnService';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { EnrichedTurn, Profile } from '@/lib/types';

const WEEKDAY_FMT: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  timeZone: 'America/Toronto',
};

export default function TurnsPage() {
  const { activeGroup } = useGroup();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [turns, setTurns] = useState<EnrichedTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [isPending, start] = useTransition();

  const todayISO = getCurrentLocalDate();
  const weekday = new Date()
    .toLocaleDateString('en-US', WEEKDAY_FMT)
    .toLowerCase();

  useEffect(() => {
    if (!activeGroup?.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [emps, t] = await Promise.all([
          fetchScheduledEmployees({ groupId: activeGroup.id, weekday }),
          fetchTodayTurns({ groupId: activeGroup.id, date: todayISO }),
        ]);
        setEmployees(emps);
        setTurns(t.sort(sortTurns));
      } catch (err) {
        console.error(err);
        toast.error('Failed to load turn data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [activeGroup, todayISO, weekday]);

  const sortTurns = (a: EnrichedTurn, b: EnrichedTurn) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return a.created_at && b.created_at
      ? a.created_at.localeCompare(b.created_at)
      : 0;
  };

  const handleCardClick = (emp: Profile) =>
    start(async () => {
      try {
        const newRow = await createTurn({
          groupId: activeGroup!.id,
          userId: emp.id,
        });
        setTurns((p) => [...p, newRow].sort(sortTurns));
      } catch (err) {
        toast.error('Failed to add turn' + err);
      }
    });

  const handleDone = (row: EnrichedTurn) =>
    start(async () => {
      try {
        // 1️⃣ Complete the turn & update UI
        await completeTurn(row.id);
        setTurns((p) =>
          p
            .map((t) => (t.id === row.id ? { ...t, completed: true } : t))
            .sort(sortTurns)
        );

        // 2️⃣ Try sending notification, but don’t let it block the above
        try {
          const emp = employees.find((e) => e.id === row.user_id);
          const customMessage = emp?.default_notification_message;
          await sendTurnNotification(row.user_id, customMessage);
        } catch (notifyErr: unknown) {
          console.error('Notification failed:', notifyErr);
          // Show the real error message if it’s an Error
          const message =
            notifyErr instanceof Error
              ? notifyErr.message
              : 'Couldn’t send notification to the user';
          toast.error(message);
        }
      } catch (err) {
        // Only if completeTurn itself fails
        console.error('Failed to complete turn:', err);
        toast.error('Failed to complete turn');
      }
    });

  const handleUndo = (row: EnrichedTurn) =>
    start(async () => {
      try {
        await undoTurn({ turnId: row.id });
        setTurns((p) =>
          p
            .map((t) => (t.id === row.id ? { ...t, completed: false } : t))
            .sort(sortTurns)
        );
      } catch {
        toast.error('Failed to undo turn');
      }
    });

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="container mx-auto p-6 flex flex-col md:flex-row gap-6 pb-20">
      {/* ◀︎ LEFT — employee grid */}
      <div
        className="
        /* make the left pane wider: 60 % on md+, full width on small */
        w-full md:basis-3/5
        grid grid-cols-3
        md:grid-cols-4      /* 4 cols on iPad Air */
        lg:grid-cols-5      /* 5 cols on desktop */
        gap-3 md:gap-4      /* tighter gap on small screens */
        overflow-y-auto     /* scroll if more than 20 rows */
      "
      >
        {employees.map((emp) => (
          <Card
            key={emp.id}
            className="items-center p-2 md:p-3 cursor-pointer hover:bg-muted/70"
            onClick={() => handleCardClick(emp)}
          >
            <Avatar className="h-10 w-10 md:h-12 md:w-12 mb-1 md:mb-2">
              <AvatarImage
                src={emp.avatar_url ?? undefined}
                alt={emp.name ?? ''}
              />
              <AvatarFallback className="text-xs md:text-sm">
                {emp.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <p className="text-center text-xs md:text-sm font-medium line-clamp-1">
              {emp.name}
            </p>
          </Card>
        ))}
      </div>

      {/* ▶︎ RIGHT — turn table */}
      <div className="w-full md:basis-2/5">
        <Table>
          <thead>
            <tr>
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Employee</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {turns.map((row) => {
              const emp = employees.find((e) => e.id === row.user_id);
              if (!emp) return null;
              return (
                <tr
                  key={row.id}
                  className={`border-t ${
                    row.completed
                      ? 'line-through text-muted-foreground text-red-500'
                      : ''
                  }`}
                >
                  <td className="p-2">{formatToLocalTime(row.created_at)}</td>
                  <td className="p-2">{emp.name}</td>
                  <td className="p-2 text-right">
                    {row.completed ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => handleUndo(row)}
                      >
                        Undo
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={isPending}
                        onClick={() => handleDone(row)}
                      >
                        Call
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
