import { Injectable,EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import { ConfigurationService } from './configuration.service';
import { TokenStorage } from './authentification/token-storage.service';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  // endpoints
  private orderSerivce = 'http://13.49.149.211:8022/CLIENT-SERVICE';

  private eventEmitter: EventEmitter<any> = new EventEmitter<any>();
 
  constructor(private http: HttpClient, private cfg: ConfigurationService,
    private tokenStorage: TokenStorage, private router: Router) { 

      let headers = this.getHeaders();
      headers.set('Accept', 'text/event-stream');  
    }

    public getClients(){
      return this.http.get("http://13.49.149.211:8022/clients");
    }
    

public getInvoices(criteria){
  return this.http.get("http://13.49.149.211:8022"+`/invoices/${criteria.page}/${criteria.count}` );
}

public addInvoice(invoice){
  return this.http.post("http://13.49.149.211:8022"+"/invoice" ,invoice );
}

public cancelInvoice(invoiceId){
  return this.http.get("http://13.49.149.211:8022"+`/annulerfacture/${invoiceId}` );
}

public getEventObservable(){
  return this.eventEmitter.asObservable();
}

private getHeaders() : HttpHeaders {
  const token = this.tokenStorage.getAccessToken();
 
  let headers = new HttpHeaders({
    'Authorization': 'Bearer'+' '+ token,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  })
  return headers;
}


searchOrders(filterData){

  return this.http.get("http://13.49.149.211:8022"+`/findOrdresbetween/${filterData.clientId}/${filterData.startDate}/${filterData.endDate}`).pipe(
    map((data) => data )
    );
}


getClientsData(){
  return this.http.get(`http://13.49.149.211:8022/clients` );
}
addClient(client){
  return this.http.post(`http://13.49.149.211:8022/addClient`, client);
}
editClient(client){
  return this.http.post(`http://13.49.149.211:8022/addClient`, client);
}
deleteClient(clientId){
  return this.http.get(`http://13.49.149.211:8022/deleteClient/${clientId}` );
}

}
