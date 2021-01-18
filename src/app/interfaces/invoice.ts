export interface Invoice {

    
    startDate? : Date;
    endDate? :Date
    timestamp? :number;
    sum?: number;
    orders? : any[];
    client? : number;
}
