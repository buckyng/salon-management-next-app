import { createSupabaseClient } from '@/lib/supabase/server';
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

// Define Types
interface EodReport {
  date: string;
  total_sale: number;
  total_cash: number;
  total_card: number;
  total_other: number;
}

interface EmployeeSale {
  employeeName: string;
  totalSale: number;
}

interface EmployeeSalesData {
  date: string;
  employees: EmployeeSale[];
}

// Load Google Service Account credentials from .env or JSON file
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS!),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Initialize Google Sheets API
const sheets = google.sheets({ version: 'v4', auth });

async function getLastRow(
  spreadsheetId: string,
  sheetName: string
): Promise<number> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:A`, // Get all rows in column A
    });

    return response.data.values ? response.data.values.length + 1 : 1; // If empty, start at row 1
  } catch (error) {
    console.error(`Error getting last row for sheet ${sheetName}:`, error);
    return 1; // If there's an error, assume it's empty
  }
}

async function ensureSheetExists(spreadsheetId: string, sheetName: string) {
  try {
    // Get current sheet names
    const { data } = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = data.sheets?.some(
      (sheet) => sheet.properties?.title === sheetName
    );

    // If sheet does not exist, create it
    if (!sheetExists) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{ addSheet: { properties: { title: sheetName } } }],
        },
      });
    }
  } catch (error) {
    console.error(`Error ensuring sheet ${sheetName} exists:`, error);
  }
}

async function getGoogleSheetId(groupId: string): Promise<string | null> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from('groups')
    .select('google_sheet_id')
    .eq('id', groupId)
    .single();

  if (error) {
    console.error('Error fetching Google Sheet ID:', error);
    return null;
  }

  return data?.google_sheet_id || null;
}

export async function POST(req: NextRequest) {
  try {
    // Authenticate the User via Supabase
    const supabase = await createSupabaseClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch User Metadata
    const { data: user, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json(
        { error: 'User data not found' },
        { status: 401 }
      );
    }

    // Extract Group Permissions
    const groups = user.user.app_metadata.groups || {};

    const body = await req.json();
    const { groupId, eodReports, employeeSales } = body;

    // 🔹 Validate required fields
    if (!groupId || !eodReports || !employeeSales) {
      return NextResponse.json(
        {
          error: 'Missing required data: groupId, eodReports, or employeeSales',
        },
        { status: 400 }
      );
    }

    const spreadsheetId = await getGoogleSheetId(groupId);

    if (!spreadsheetId) {
      return NextResponse.json(
        { error: 'Google Sheet ID is missing' },
        { status: 500 }
      );
    }

    // Check If User Has Admin Role in the Requested Group
    if (!groups[groupId] || !groups[groupId].includes('admin')) {
      return NextResponse.json(
        { error: 'Access denied: Admin role required' },
        { status: 403 }
      );
    }

    // Ensure sheets exist before writing
    await ensureSheetExists(spreadsheetId, 'EOD Report');
    await ensureSheetExists(spreadsheetId, 'Employee Sales');

    // Sheet names
    const eodSheet = 'EOD Report';
    const employeeSalesSheet = 'Employee Sales';

    // Get last row numbers
    const lastRowEod = await getLastRow(spreadsheetId, eodSheet);
    const lastRowSales = await getLastRow(spreadsheetId, employeeSalesSheet);

    // Prepare data for the first sheet (EOD Reports)
    const eodSheetData: (string | number)[][] = eodReports.length
      ? [
          ...(lastRowEod === 1
            ? [
                [
                  'Date',
                  'Total Sales',
                  'Total Cash',
                  'Total Card',
                  'Total Other',
                ],
              ] // Add headers if empty
            : []),
          ...eodReports.map((report: EodReport) => [
            report.date,
            report.total_sale,
            report.total_cash,
            report.total_card,
            report.total_other,
          ]),
        ]
      : [];

    // Prepare data for the second sheet (Employee Sales)
    const employeeSalesData: (string | number)[][] = employeeSales.length
      ? [
          ...(lastRowSales === 1
            ? [['Date', 'Employee Name', 'Total Sales']] // Add headers if empty
            : []),
          ...employeeSales.flatMap(({ date, employees }: EmployeeSalesData) =>
            employees.map((emp: EmployeeSale) => [
              date,
              emp.employeeName,
              emp.totalSale,
            ])
          ),
        ]
      : [];

    // Append to Google Sheets
    if (eodSheetData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${eodSheet}!A${lastRowEod}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: eodSheetData },
      });
    }

    if (employeeSalesData.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${employeeSalesSheet}!A${lastRowSales}`,
        valueInputOption: 'RAW',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: employeeSalesData },
      });
    }

    return NextResponse.json({
      message: 'Data successfully exported to Google Sheets',
    });
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
