import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ConfirmationService } from 'primeng/api';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {
  columnDefs = [
    { header: 'Client #', field: 'clientId', sortable: true, filter: true },
    { header: 'Name', field: 'name', sortable: false, filter: false },
   //  { header: 'Firstname', field: 'firstName', sortable: false, filter: true },
    { header: 'Adress', field: 'postalAddresses', sortable: false, filter: false },
    { header: 'Phone', field: 'phone', sortable: false, filter: false },
   // { header: 'Email', field: 'email', sortable: false, filter: true },
    { header: 'Fiscal Position', field: 'fiscalPosition', sortable: false, filter: true },
    { header: 'Currency', field: 'currency', sortable: false, filter: true },
    { header: 'Shipment Mode', field: 'shipmentMode', sortable: false, filter: true },
    
  ];
  rowData: any = [];
  totalRecords = 0;
  filterWords="";
selectedClientId=null;

  // form
  clientForm = new FormGroup({
    name: new FormControl(null,[ Validators.required]),
    firstName: new FormControl(null,[Validators.required]),
    postalAddresses: new FormControl(null,[ Validators.required]),
    phone: new FormControl(null,[ Validators.required]),
    email: new FormControl(null,[ Validators.required,Validators.email]),
    fiscalPosition: new FormControl(null,[ Validators.required]),
    currency: new FormControl(null,[ Validators.required]),
    shipmentMode: new FormControl(null,[Validators.required]),
});

  constructor(private dataService : DataService, private confirmationService: ConfirmationService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.onGetClients();
  }

  onGetClients(){
    this.rowData = [];
    this.dataService.getClientsData().subscribe((response:[])=>{
      this.rowData = response;
      console.log('all client', this.rowData);
      
    });
  }
  openAddClient(){
    this.clientForm.reset();
    console.log('add client');
    }
  openEditClient(client){
    this.clientForm.reset();
    this.selectedClientId = client['clientId'];
    this.clientForm.patchValue({
      name: client['name'],
      firstName: client['firstName'],
      postalAddresses: client['postalAddresses'],
      phone: client['phone'],
      email: client['email'],
      fiscalPosition: client['fiscalPosition'],
      currency: client['currency'],
      shipmentMode: client['shipmentMode'],
    });
  console.log('edit client', client);
  }

  deleteClient(client){
  console.log('delete client', client);
  this.confirmationService.confirm({
    message: `Are you sure that you want to delete this client (${client['name']})?`,
    accept: () => {
        this.dataService.deleteClient(client['clientId']).subscribe(response=>{
          this.onGetClients();
          this.toastr.success('The client has been deleted.', 'Done!');
        });
    }
});
}
get f() { return this.clientForm.controls; }

addClient(){
  console.log('add form value', this.clientForm.value);
  
this.dataService.addClient(this.clientForm.value).subscribe(response=>{
if(response){
  this.onGetClients();
  this.toastr.success('The client has been saved.', 'Done!');
}
});
}

editClient(){
  console.log('edit form value', this.clientForm.value);
  let newClient = this.clientForm.value;
  newClient['clientId']= this.selectedClientId;
  console.log('new client for update', newClient);
  
  this.dataService.addClient(this.clientForm.value).subscribe(response=>{
  if(response){
    this.onGetClients();
    this.toastr.success('The client modifications has been saved.', 'Done!');
  }
  });
  
}
}

