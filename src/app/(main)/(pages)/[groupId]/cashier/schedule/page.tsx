// RSC page – no context wrapper needed
import {
  listEmployeesByGroup,
  listSchedulesByGroup,
} from '@/services/employeeScheduleService';
import EmployeeScheduleTable from './_components/EmployeeScheduleTable';

export default async function Page({
  params: { groupId },
}: {
  params: { groupId: string };
}) {
  const { data: employeesRaw } = await listEmployeesByGroup(groupId);
  const { data: schedules } = await listSchedulesByGroup(groupId);

  if (!employeesRaw) return <>No employee available</>;

  /* 🔽   flatten & type-narrow */
  const employees = employeesRaw
    .flatMap((row) =>
      Array.isArray(row.profile) ? row.profile : [row.profile]
    )
    .filter(Boolean) as { id: string; name: string }[];

  return (
    <EmployeeScheduleTable
      groupId={groupId}
      employees={employees}
      schedules={schedules ?? []}
    />
  );
}
