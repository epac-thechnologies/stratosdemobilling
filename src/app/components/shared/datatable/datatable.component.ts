import { Component, OnInit, Input, Output } from '@angular/core';
import * as _ from 'lodash';
import { LocalStorageService } from 'ngx-webstorage';
import { Invoice } from 'src/app/interfaces/invoice';
import { DataService } from '../../../services/data.service';

//pdf make
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

@Component({
  selector: 'app-datatable',
  templateUrl: './datatable.component.html',
  styleUrls: ['./datatable.component.scss'],
})
export class DatatableComponent implements OnInit {
  @Input() columnDefs;
  @Input() rowData;
  @Input() sDate;
  @Input() fDate;
  @Input() clientId;

  selectedData;
  pricesArray: any;
  totalPrice = 0;
  createdInvoice: Invoice = {};

  constructor(
    private storageService: LocalStorageService,
    private dataService: DataService
  ) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  }

  ngOnInit() {}

  generateInvoice() {
    let invoice = {
      startDate: this.sDate,
      endDate: this.fDate,
      timestamp: +new Date(),
      //  sum: this.calculateTotalPrice(),
      ordreArchives: this.selectedData,
      clientId: this.clientId,
    };
    console.log('INVOICE to save : ', invoice);

    this.dataService.addInvoice(invoice).subscribe((data) => {
      console.log('created invoices', data);
    
     this.createdInvoice = data;
      const documentDefinition = this.getDocumentDefinition();
      pdfMake.createPdf(documentDefinition).open();
      pdfMake.createPdf(documentDefinition).download();
      
    });
  }

  calculateTotalPrice() {
    this.selectedData.map((sData) => {
      let totalPerUnit = parseFloat(sData['price']) * sData['requestedQty'];
      this.totalPrice += totalPerUnit;
    });
    return this.totalPrice;
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

  getDocumentDefinition() {
    return {
      header: {
        columns: [
          {
            text: 'Invoice Number : ' + this.createdInvoice['factureId'],
            style: 'documentHeaderLeft',
          },
          /*
         { text: 'HEADER CENTER', style: 'documentHeaderCenter' },
         { text: 'HEADER RIGHT', style: 'documentHeaderRight' }
            */
        ],
      },

      footer: {
        columns: [
          //   { text: 'FOOTER LEFT', style: 'documentFooterLeft' },
          {
            text:
              'Terms: Net45 - No Discount aloowed - Service charge of 1.5% per month may be charged after 45 days \n Please Remit To: STRATOS CONSULTANTS, Inc., 2561 Grant Ave., San Leandro CA 94579',
            style: 'documentFooterCenter',
          },

          //   { text: 'FOOTER RIGHT', style: 'documentFooterRight' }
        ],
      },
      content: [
        // Header
        {
          columns: [
            {
              image:
                'data:image/jpeg;base64,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',
              width: 150,
            },

            [
              {
                text: 'INVOICE',
                style: 'invoiceTitle',
                width: '*',
              },
              {
                stack: [
                  {
                    columns: [
                      {
                        text: 'Invoice Number',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: 'E' + this.createdInvoice['factureId'],
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Invoice date',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: 
                          this.formatDate(this.createdInvoice['timestamp'])
                        ,
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Due Date',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: this.formatDate(this.createdInvoice['ordreArchives'][0].shipDate),
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  ,
                  {
                    columns: [
                      {
                        text: 'Account Name',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: this.createdInvoice['clientId'],
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: '\n\n\n Customer PO Number',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: '\n\n\n' + 'uknown',
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Third Party PO No.',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: ' ',
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                  {
                    columns: [
                      {
                        text: 'Memo',
                        style: 'invoiceSubTitle',
                        width: '*',
                      },
                      {
                        text: ' ',
                        style: 'invoiceSubValue',
                        width: 130,
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        // Billing Headers

        // Billing Address Title
        {
          columns: [
            {
              text: 'Customer Address',
              style: 'invoiceBillingTitle',
            },
          ],
        },
        // Billing Address
        {
          columns: [
            {
              text: this.createdInvoice['ordreArchives'][0].billingAdress,
              style: 'invoiceBillingAddress',
            },
          ],
        },
        // Line breaks
        '\n\n\n\n\n\n\n',
        // Items
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],

            body: [
              // Table Header
              [
                {
                  text: 'Qty',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Product',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Custumor PO',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Packing Slip No.',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'date',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Unit Price',
                  style: ['itemsHeader', 'center'],
                },
                {
                  text: 'Extension',
                  style: ['itemsHeader', 'center'],
                },
              ],
              // Items
              // Item i
              [
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return data['quantity'] + '\n\n\n';
                  }),
                  style: 'itemNumber',
                },

                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return data['isbn'] + '\n\n\n';
                  }),
                  style: 'itemNumber',
                },
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return data['poNumber'] + '\n\n\n';
                  }),
                  style: 'itemNumber',
                },
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return data['packing_slips_id'] + '\n\n\n';
                  }),
                  style: 'itemNumber',
                },
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return (
                      this.formatDate(data['shipDate']) + '\n\n\n'
                    );
                  }),
                  style: 'itemNumber',
                },
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    return data['price'] + '\n\n\n';
                  }),
                  style: 'itemTotal',
                },
                {
                  text: this.createdInvoice['ordreArchives'].map((data) => {
                    const totalPrice = parseFloat(data['price']) * data['quantity'];

                    return '$' + totalPrice + '\n\n\n';
                  }),
                  style: 'itemTotal',
                },
              ],

              // END Items
            ],
          }, // table
          //  layout: 'HorizontalLines'
        },
        // TOTAL
        {
          table: {
            // headers are automatically repeated if the table spans over multiple pages
            // you can declare how many rows should be treated as headers
            headerRows: 0,
            widths: ['*', 80],

            body: [
              // Total
              [
                {
                  text: '\n',
                  style: 'itemsFooterSubTitle',
                  pageBreak:
                    this.createdInvoice['ordreArchives'].length >= 5
                      ? 'after'
                      : 'after',
                },
                {
                  text: '\n',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: '\n Sales Tax',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: '\n $0.00',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'GST',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: ' ',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'Freight',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: ' ',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'Transaction Fees Total',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: '$0.00',
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'Net Sales',
                  style: 'itemsFooterSubTitle',
                },
                {
                  text: '$' + this.createdInvoice['sum'],
                  style: 'itemsFooterSubValue',
                },
              ],
              [
                {
                  text: 'INVOICE TOTAL (USD)',
                  style: 'itemsFooterTotalTitle',
                },
                {
                  text: '$' + this.createdInvoice['sum'],
                  style: 'itemsFooterTotalValue',
                },
              ],
            ],
          }, // table
          layout: 'lightHorizontalLines',
        },
        // Signature
        /*
         {
             columns: [
                 {
                     text:'',
                 },
                 {
                     stack: [
                         { 
                             text: '_________________________________',
                             style:'signaturePlaceholder'
                         },
                         { 
                             text: 'Your Name',
                             style:'signatureName'
                             
                         },
                         { 
                             text: 'Your job title',
                             style:'signatureJobTitle'
                             
                         }
                         ],
                    width: 180
                 },
             ]
         },
         
           { 
               text: 'NOTES',
               style:'notesTitle'
           },
           { 
               text: 'Terms: Net45 - No Discount aloowed - Service charge of 1.5% per month may be charged after 45 days ',
               style:'notesText'
           }
           */
      ],
      styles: {
        // Document Header
        documentHeaderLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left',
        },
        documentHeaderCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center',
        },
        documentHeaderRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right',
        },
        // Document Footer
        documentFooterLeft: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'left',
        },
        documentFooterCenter: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'center',
        },
        documentFooterRight: {
          fontSize: 10,
          margin: [5, 5, 5, 5],
          alignment: 'right',
        },
        // Invoice Title
        invoiceTitle: {
          fontSize: 22,
          bold: true,
          alignment: 'right',
          margin: [0, 0, 0, 15],
        },
        // Invoice Details
        invoiceSubTitle: {
          fontSize: 12,
          alignment: 'right',
        },
        invoiceSubValue: {
          fontSize: 12,
          alignment: 'right',
        },
        // Billing Headers
        invoiceBillingTitle: {
          fontSize: 14,
          bold: true,
          alignment: 'left',
          margin: [0, 20, 0, 5],
        },
        // Billing Details
        invoiceBillingDetails: {
          alignment: 'left',
        },
        invoiceBillingAddressTitle: {
          margin: [0, 7, 0, 3],
          bold: true,
        },
        invoiceBillingAddress: {},
        // Items Header
        itemsHeader: {
          margin: [0, 5, 0, 5],
          bold: true,
        },
        // Item Title
        itemTitle: {
          bold: true,
        },
        itemSubTitle: {
          italics: true,
          fontSize: 11,
        },
        itemNumber: {
          margin: [0, 5, 0, 5],
          alignment: 'center',
        },
        itemTotal: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },

        // Items Footer (Subtotal, Total, Tax, etc)
        itemsFooterSubTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterSubValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        itemsFooterTotalTitle: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'right',
        },
        itemsFooterTotalValue: {
          margin: [0, 5, 0, 5],
          bold: true,
          alignment: 'center',
        },
        signaturePlaceholder: {
          margin: [0, 70, 0, 0],
        },
        signatureName: {
          bold: true,
          alignment: 'center',
        },
        signatureJobTitle: {
          italics: true,
          fontSize: 10,
          alignment: 'center',
        },
        notesTitle: {
          fontSize: 10,
          bold: true,
          margin: [0, 50, 0, 3],
        },
        notesText: {
          fontSize: 10,
        },
        center: {
          alignment: 'center',
        },
      },
      defaultStyle: {
        columnGap: 20,
      },
    };
  }
}
