import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from '../../services/data.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  columnDefs = [
    { header: 'PO#', field: 'poNumber', sortable: true, filter: true },
    { header: 'PS#', field: 'packing_slips_id', sortable: true, filter: true },
    { header: 'Product', field: 'isbn', sortable: true, filter: true },
   // { header: 'Title', field: 'title', sortable: true, filter: true },
    {
      header: 'Requested Qty',
      field: 'quantity',
      sortable: true,
      filter: true,
    },
    { header: 'Delivered', field: 'produced', sortable: true, filter: true },
    {
      header: 'Delivered Date',
      field: 'shipDate',
      sortable: true,
      filter: true,
    },
    { header: 'Price', field: 'price', sortable: true, filter: true },
  ];
  rowData: any = [];
  sDate = new Date();
  fDate = new Date();
  clientId: string;

  // filter
  selectedClient;
  dateD;
  dateF;
  clients = [{ label: 'Select Client', value: null }];

  constructor(
    private http: HttpClient,
    private dataService: DataService,
    private toastr: ToastrService
  ) {}
  ngOnInit() {
    this.getClients();
  }

  getClients() {
    this.dataService.getClients().subscribe((clients) => {
      console.log(clients);

      let tab = [];
      Object.keys(clients).map(function (clientIndex) {
        let client = clients[clientIndex];
        tab.push(client);
      });
      tab.forEach((element) => {
        this.clients.push({ label: element.firstName, value: element.firstName});
      });
      console.log(this.clients);
    });
  }

  searchOrders() {
    this.sDate = this.dateD.toISOString().split('T')[0];
    this.fDate = this.dateF.toISOString().split('T')[0];
    //  const startDate = this.sDate.toString().replace(/-/g, '/');
    //  const endDate = this.fDate.toString().replace(/-/g, '/');
    const startDate = this.sDate.toString();
    const endDate = this.fDate.toString();

    console.log('start:', startDate);
    console.log('end:', endDate);
    console.log('clientId:', this.selectedClient);

    const filterData = {
      clientId: this.selectedClient,
      startDate: startDate,
      endDate: endDate,
    };
    console.log('filter data',filterData);
    
    this.dataService.searchOrders(filterData).subscribe(
      (res: []) => {
        console.log('result', res);
        if (res == null || res.length == 0) {
          this.toastr.warning(
            'There is no orders at this period of time',
            'oups!'
          );
        } else {
          let jsonTable = [];
          res.forEach((element) => {
            const tableToJson = {
              packing_slips_id: element['packing_slips_id'],
              shipDate: this.formatDate(element['shipDate']),
              notes: element['notes'],
              ordreid: element['ordreid'],
              pnlNumber: element['pnlNumber'],
              status: element['status'],
              dueDate: element['dueDate'],
              quantity: element['quantity'],
              produced: element['produced'],
              oldOrdreid: element['oldOrdreid'],
              isbn: element['isbn'],
              title: element['title'],
              author: element['author'],
              numberOfBoxes: element['numberOfBoxes'],
              qtyPerBox: element['qtyPerBox'],
              boxWeight: element['boxWeight'],
              palletWeight: element['palletWeight'],
              clientId: element['clientId'],
              shippingAdress: element['shippingAdress'],
              billingAdress: element['billingAdress'],
              weight: element['weight'],
              poNumber: element['poNumber'],
              accountName: element['accountName'],
              accountManager: element['accountManager'],
              price: element['price'],
              //  num: element.num,
            };
            jsonTable.push(tableToJson);

            // console.log(jsonTable);
          });

          if (jsonTable.length > 0) {
            this.rowData = jsonTable;
            this.toastr.success(
              'Orders imported successfully',
              'Done!'
            );
          } else {
            this.rowData = null;
          }
        }
      } // else
    );
  }

  formatDate(date) {
    var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }
}
