import { NextRequest, NextResponse } from 'next/server';
import { fetchOwnerReport, fetchReportDetails } from '@/services/reportService';
import { EmployeeSummary, EodReport } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!groupId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch EOD reports
    const eodReports: EodReport[] = await fetchOwnerReport(groupId, startDate, endDate);

    // Fetch employee sales summaries
    const employeeSummaries: EmployeeSummary[] = [];
    for (const report of eodReports) {
      const details = await fetchReportDetails(groupId, report.date);
      employeeSummaries.push(...details);
    }

    return NextResponse.json({
      message: 'Export data fetched successfully',
      eodReports,
      employeeSummaries,
    });
  } catch (error) {
    console.error('Error fetching export data:', error);
    return NextResponse.json({ error: 'Failed to fetch export data' }, { status: 500 });
  }
}
