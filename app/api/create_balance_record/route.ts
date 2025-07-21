import { create_balance_record, updateBalanceRecord } from "~/utils/balance/db";
import { calculateDaysEndingBalance } from "~/utils/balance/functions.server";


export async function GET() {
  try {
    const new_record = await create_balance_record({ date: new Date() });
    const previousDay= new Date(new_record.date);
    previousDay.setDate(previousDay.getDate() - 1);

    const current_day_balance = await calculateDaysEndingBalance({date: previousDay})
     await updateBalanceRecord({date: previousDay, ending_balance: current_day_balance});
    return Response.json({ status: 'success', result: new_record });
  } catch (error: any) {
    console.error(error);
    return Response.json({ status: 'error', message: error.message }, { status: 500 });
  }
}

