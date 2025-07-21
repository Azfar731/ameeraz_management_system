import { Prisma } from "@prisma/client";
import { prisma_client } from "~/.server/db";


// a function to getch balance record by date(single record)
const getBalanceRecordByDate = async (date: Date) => {
  date.setHours(0, 0, 0, 0); // Ensure the time is set to the start of the day
    return await prisma_client.balance_record.findFirst({
        where: { date },
    });
};


const create_balance_record = async({date = new Date(), ending_balance = 0 }:{date?: Date; ending_balance?: number}) => {
    const new_date = date;
    new_date.setHours(0,0,0,0)
    // Check if a record for the given date already exists
    const existingRecord = await getBalanceRecordByDate(new_date);
    if (existingRecord) {
        // If it exists, return the existing record
        return existingRecord;
    }
    return await prisma_client.balance_record.create({
        data: {
            date: new_date,
            ending_balance,
        }
    })
}


//a function that accepts an amount, fetches the current_date record and adds or substract the amount based on another param
const updateTodaysBalance = async({tx, amount, operation}:{tx: Prisma.TransactionClient; amount: number; operation: "add" | "subtract"}) => {
     const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the record with today's date
  let record = await tx.balance_record.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // less than tomorrow 00:00
      },
    },
  });

  if (!record) {
    //create record if it doesn't exist
    record = await tx.balance_record.create({
        data: {
            date: today,
            ending_balance: 0,
        }
    })
  }

  const updatedBalance =
    operation === "add"
      ? record.ending_balance + amount
      : record.ending_balance - amount;

  const updated = await tx.balance_record.update({
    where: { id: record.id },
    data: {
      ending_balance: updatedBalance,
    },
  });

  return updated;
}


const updateBalanceRecord = async ({date, ending_balance}: {date: Date; ending_balance: number}) => {
  
  date.setHours(0, 0, 0, 0);
  const record = await getBalanceRecordByDate(date);
  if (record) {
    return await prisma_client.balance_record.update({
      where: { id: record.id },
      data: { ending_balance },
    });
  }else {
    return await create_balance_record({ date, ending_balance });
  }
  
}

export { create_balance_record, getBalanceRecordByDate, updateTodaysBalance, updateBalanceRecord };
