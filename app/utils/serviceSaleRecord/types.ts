

type ServiceSaleRecordFetchErrors = {
    start_date: string[]
    end_date: string[]
    client_mobile_num: string[]
    category_ids: string[]
    employee_ids: string[]
    deal_ids: string[]
    
}


type ServiceSaleRecordCreateErrors = {
    amount_charged: string[]
    amount_paid: string[]
    mobile_num: string[]
    deals: string[]
    services: string[]
    employees: string[]
    mode_of_payment: string[]
}

export type { ServiceSaleRecordFetchErrors, ServiceSaleRecordCreateErrors }