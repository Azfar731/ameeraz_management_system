import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { prisma_client } from ".server/db";
import { ServiceSaleRecordWithRelations } from "~/utils/types";
import { formatDate } from "shared/utilityFunctions";
export async function loader({ params }: LoaderFunctionArgs) {
  const record = await prisma_client.service_Sale_Record.findFirst({
    where: { service_record_id: params.id },
    include: {
      client: true,
      deals: true,
      employees: { include: { employee: true } },
      transactions: true,
    },
  });
  if (record) {
    return { record };
  } else {
    throw new Error("Record with the specified Id doesn't exist");
  }
}

export default function Record() {
  const { record } = useLoaderData<{
    record: ServiceSaleRecordWithRelations;
  }>();
  const { client, deals, employees, transactions } = record;
  const renderered_deals: JSX.Element[] = []

  deals.forEach((deal,index) => {
    renderered_deals.push(<h4 key={`deal${index} name`}>{deal.deal_name}</h4>)
    renderered_deals.push(<h4 key={`deal${index} price`}>{deal.deal_price}</h4>)

  })

  const renderered_emp: JSX.Element[] = []

  employees.forEach((record,index)=>{
    renderered_emp.push(<h4 key={`employee${index} name`}>{`${record.employee.emp_fname} ${record.employee.emp_lname}`}</h4>)
    renderered_emp.push(<h4 key={`employee${index} work`}>{record.work_share}</h4>)
  })

  const render_transactions = () =>{
    const rendered_transactions: JSX.Element[] = []

    transactions.forEach((trans,index)=>{
      rendered_transactions.push(<h4 key={`transaction${index} date`}>{formatDate(trans.modified_at)}</h4>)
      rendered_transactions.push(<h4 key={`transaction${index} amount`}>{trans.amount_paid}</h4>)
    })

    return rendered_transactions

  }
  const generate_heading = (title: string,subHeading1: string, subHeading2: string)=> {
    return([
      <h2 key={title} className={title_style}>{title}</h2>,
      <h3 key={`${title} SubHeading 1`}>{subHeading1}</h3>,
      <h3 key={`${title} SubHeading 2`}>{subHeading2}</h3>
    ])
  }
  
  const grid_container_style = "w-1/2 h-full grid grid-cols-1 gap-4";
  const title_style = "col-span-2";
  
  return (
    <div className="container mx-auto">
      
        <h1>Service Record Details</h1>
        <div className="w-2/3 bg-grey-500 grid grid-cols-2 gap4">
        <h3>Client Name</h3>
        <h3>{`${client.client_fname} ${client.client_lname}`}</h3>
        <h3>Client Mobile Number</h3>
        <h3>{client.client_mobile_num}</h3>
        <h3>{record.total_amount}</h3>
        {generate_heading("Deals/Services Taken","Name","Price")}
        {renderered_deals}
        {generate_heading("Employees","Name","Work Share")}
        {renderered_emp}
        {generate_heading("Transactions","Date","Amount Paid")}
        {render_transactions()}
        
      </div>
    </div>
  )
}
