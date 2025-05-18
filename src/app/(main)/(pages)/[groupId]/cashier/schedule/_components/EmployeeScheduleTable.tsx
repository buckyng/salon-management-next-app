'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Table } from '@/components/ui/table';
import { useState, useTransition } from 'react';

const WEEKDAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/* REST helper hitting /api/employee-schedules/toggle-weekday */
async function toggleAPI(
  groupId: string,
  userId: string,
  weekday: string,
  checked: boolean
) {
  await fetch('/api/employee-schedules/toggle-weekday', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ groupId, userId, weekday, checked }),
  });
}

export default function EmployeeScheduleTable({
  groupId,
  employees,
  schedules,
}: {
  groupId: string;
  employees: { id: string; name: string }[];
  schedules: { user_id: string; weekday: string }[];
}) {
  /* local optimistic cache:  "userId:weekday" */
  const [checkedSet, setChecked] = useState<Set<string>>(
    () => new Set(schedules.map((s) => `${s.user_id}:${s.weekday}`))
  );
  const [isPending, start] = useTransition();

  const handleChange = (userId: string, day: string, next: boolean) => {
    /* optimistic update */
    setChecked((prev) => {
      const copy = new Set(prev);

      if (next) {
        copy.add(`${userId}:${day}`);
      } else {
        copy.delete(`${userId}:${day}`);
      }

      return copy;
    });

    /* server call */
    start(() => toggleAPI(groupId, userId, day, next));
  };

  const isChecked = (uid: string, d: string) => checkedSet.has(`${uid}:${d}`);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Weekly Schedule</h1>

      <Table>
        <thead>
          <tr>
            <th className="p-2 text-left">Employee</th>
            {WEEKDAYS.map((d) => (
              <th key={d} className="p-2 text-center capitalize">
                {d.slice(0, 3)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id} className="border-t">
              <td className="p-2">{emp.name}</td>
              {WEEKDAYS.map((day) => (
                <td key={day} className="p-2 text-center">
                  <Checkbox
                    checked={isChecked(emp.id, day)}
                    onCheckedChange={(val: boolean) =>
                      handleChange(emp.id, day, val)
                    }
                    disabled={isPending}
                    aria-label={`${day}-${emp.name}`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
