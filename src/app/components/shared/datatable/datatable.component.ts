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
              'Terms: Net45 - No Discount aloowed - Service charge of 1.5% per month may be charged after 45 days \n Please Remit To: EPAC TECHNOLOGIES, Inc., 2561 Grant Ave., San Leandro CA 94579',
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
                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAIAAAD/gAIDAAAQH0lEQVR42u1aC3AcV5Xt6dFIcUhZDgFqy1YqqYJKKEhRwBa7W1upArK1YH1mumeUYPyRoxSBhWQXs6TAH/1mJqOZ6R6NHJIAIRBCiCX5hywbV0hC/IkNxCEG23GIP9iJHSeO7NiWbEmWNN39mnvv6+5pWbYjLDubLV7XVdfT9Ofdd979nHdfS7Y4JnxIAgIBlgBLgCXAEmAJsAQEAiwBlgBLgCXAEmAJCARYAiwBlgBLgCXAEhAIsARYAiwBlgBLgCUgEGAJsARYAiwBlgDryndh0ZmRnP9gjP29L534I5fw8isI1mXU5h/Ist571CbZ49/7+PnBsiyLPIfR+/A8viNPGDoaNCxomJbBmMmYhWKZPtdj455nXgNudXoc2xHDw7JRsGHBC1Edy8L3mxMZMBt70ECYXx98FQwXu7EuESx6JTNsu0Bi0tkgKbhijDuP2PYoNWBUJjNH6UHDJ/5X8TO/3yAkxg+bgwV//E54/7CngMXxM31PjX8c8TVNw7AsT71Rt9OC718DFTYu1bJoNg/3D9a1PlGnL6/XVtwJonNZ7jaKUp9bOV9fUaevuCuz7E9HBkxSrv1XW+v1rvE3k6wEqcutrM+vynZv2/zaiZOWbXiW5o6fWxQMpvvFffMynfPbVkIXddqK+syyN4fsUbzTb7yWPRY2yzIAoJPM3n6s//HfH/z6g2vq86uhRzznUGfQZH6mY8XWl02EdRJggRYvHxuQqprlWJuk6IFoG0osF4hhW4q1ye6ZX+KNUE3Lmv0D/HElvSYYzfJLcCdIIMZfQr8ouvusFoymP17fur13+CxFAOaPB8wasu3Pffsh7FrNBSJtspKXwq1Lnnx2iOBABzrHoCxyXWYP2vZTrx77xF3pstrWQFTHx11tuVYo4VRjx1ZyQ/OS3RC0ALAGpao4QjO2m3MErqJEAcd8aTi+dv8go1lWMj0lavacm2X/v6oDPc2Hdk008cDTO8+yooVgJLPMP7w9HPjyIkl11MCzqt10t96P0dFxXufsBFH8fcC2w/FflqkpWeWz0o7PRnPnqC1HUou7tk4EqXcDqxcsK0EvzQfU9oAKffhRy9Evxb4dsPYNeGAFVa148xi8aNjnTENEL6ls6H7lbc8fTMseZvZsvUsa0y8+FVRb/3j0TIHnn7EHZIFTjP3bgh+XRFoDalYm/XEUMCU0BK9T+Bcsa0nHFsueUF68IFgA9W60rETRcGBuwxlwAakmFQinA9AAbcJp/AV/xHbpzCVr9/QXwYrqjmZqHpWuwWdJ0lJ1KlCTAjTlaE7GAWgIQVSfUvn9A/2jhmsgp237xrqs36wcZRRtTnrZkD8bMp4Q0PvUzOpSJS1Hi08FwfcVHfQkzTP8LIXTcmXTkic30YPmpMACNwxUxlE56EbNB8OJ/+164f6uDSCJ5RuSXZvg7P2bWL4x0bWhteOZve8MYjIeC5ak5D6gJNJP7W5ftw2l54X2tS/o3Vs+/70flkXTcgwsN8fHFlKS7U/vNDhWzOzcdTxQ1VyESXXtQtU/GI0fGbaKFITALdhs7e7Xg5VNcoTHWU1SsqBG+e2pz9/3UEvXZq6wKxuTHc889/JBA7PqJMHqBctqIh8EvHKhqsUHmJO/Qc7axfYwtTE3M8zExLkQLJm7ITlCudJyAu5h+CA+zlDOMLt13Z9La+JSRJPVdswkqnbLvT+kVzAwnE9/c2mAXlIMWO45pOqrdhw1fDwDwAIdrp+fCSjpYCwvw1QpellNsra1o5ex08wecsnHsI+LDNODJrtEnmX5wHICvBzNl1UuPMx4hrZ4FGZjiBwkIQMDMgVdAmttUNF4DgU/Ko809LuplsZmcqJ4xrZv/f7PpWjeNRw9UN14wrALzH7Ltq+LgQI6WTcmAQkzhu5kUiV363ceGnYJFWTGUZtt2v+2NBMmmN+jQ6yYk+8BjEzHSU2uv+0QaYeOsQkg9e5uKFXGA3wMSm5K1aJD2IVJ3XKaDjogcJxng7rIxZmTlSgbanz8CJbS2O+lLV9gBtOof/DX4CyY3TnJqGw4PGjBzOee2hMK3w8eR06aKw0n7/zZZgh2PGCDxYVmLtpxbJBTU8NGVpXr+V0AoidPtdG2j8Saj/lWC/6Fx2VbGxbBci0LpKxq4SEf+fY3DJea8zOfNTXbE1Q4dUDLmkpg2ePoNnjlzOZlELMlMkNsVDf1jtinLDatZmHQhbtEzfzLgp+AaU+tTVMQ1AlEvbFzIyrATMiM8Kq7H1hVEsl6YN3zk2dGzvWAy72Q9rlhs0tt9JKalgWdf2zu2tLQsbmRxGs0OY3n48ue+0vvkGdZQWf86EdTlYbT42o34CDde/vlLy2iLnjw1q69IwFXtxzpu1qJcwThUigSX3dwGO6vjHcGY87NMAcfq2s9Ba8ygWYg15+jdQKsDjOIZJOrt5nvIViN/kwUiELUbOeZyxOHGSO5z10VSQAptYpuqEtOmgPLaoEY1AfrDxIY4WtnR79438NTInGkDpBwIxpIsCaZ7H4JzOGbP90QUtJeMq2Yl4EgDb93vrhPmtlSJGiVjev3HEf3txkY9exsR0jNugprAFYxOE0asovyrKJlUYxw6Vwxi3s0ykdKe/bCcgepQyTrZENuNeg1kawcyQRQskTQgO/oAYIJAQ1jjg9+eeErJ4eOnDWuqm4IOMwb1jfpuqU9kEkhe0BCqJine28GZnt7ZgUu2pE3IFgl3iVFS6zilsWusGVxBl/d7AwVOXReirYjk8CzS4v5WXFQK0OwTtM6HMHiPMt9A9mg8wgGMpkvMyFtQbqEFWJMLwu35J7eBebz0+dfDYWT7ty0haobNh0dNZgBhAgi1P88sRHZuTNt+Q/VthxBTwM3ZLO1jhJFc+dPi696gcAyryBYYLGg0+7jgw5YsHaFnA2xFiwCYjac0To09+yKopdWN/fsOc1JaZgsywUrj1jjWlrzPNozOuoCkIp//eH1Z4ip3dbcKas8kKPtfObehweImyAijP3+cG+wspGghxfm5er40mdfBdoCD35VcyyLYha44YtXNmZxPlLgYFW1SLF29IVYTq5qnplcriR+oSQfJ8FGNPG4iu0n1OQvaloeq215dNsbJzmNIcvKun6Kwdhxxig3NEpniiYrbcCGbrhT+8Fvtg1T3Dk0ZEtfuI9YFUIcCKcSq35n4lIROQpkPbgHMmMwQi9XkX998u62AYpoHCw30ulgWRbngJejintBywLlXh+wIHySIWTRa760aNspG9YyIAPMoeDDbmOI6Dg0RiwnlnKwPMJdoqQ/PCs1446miq80T7+jCQTa189q+udvZHt2vt5vsyEKSeBK9z7y62CkVY4tJX/PS/+5ZMNJ+68jKAdH7AOj9gHT1ra+U4IzkQfTC8TaymuTO/uQkde1dQbB3l3/XfDz5wq2PZGlzKRq8DARYPkf/irEo0wgRqEnkl7UsWmYqkiYqS9WzDW9taHsru+vrml6E/KgYQM7h/Nxw36HZIioGV8IFwwDuNJN3/iBrHLWnqMCg3ZNLFVeG7+2NjUtlpxWmyyvTV0VywKPdRbVNBP3PLYRwGpa9ttAVdIJptH2G+emUWG3CjpJ+7rYhgW8+LbGjiDEDogCpNaMOZnDFq8Cs/M/4LJkpA5ZpA5O+FC08ggxeMsE1ZHt2yaNobjUMJkJy7QNe3uBPXhJQ1J1N/O20ZIIcG+XnDyo0UKKX9Wuq23uLVjrd70Gyx0+PYC1XBVvWPGH0fNszfnr5+wygAVD+eWL+4Jh5EE8msqR9C3/9cDOE8OjdJW5ZJ35lltUC7Y8nuWQcjVXHm7o9y10ECxnqeQcABbQgv/43o8CmM5w9R5QeAEL2nk39jm52M13HD58f6l6/6q/HIUurq1tAWYb4Ot/NfcBJZ5dt33It7QYLxO0Oemiu6Osn9k31mtBvmqj6YXVaWnl4q89uPaxLfu7dxxdtf2N7h1vrSHB9vbXjwyafLKUzBpeKZWQGeS4ZdkX2F1gVPU/wezrZmkYHx2i5C6hVU5N2p0ohoGfp4u8W4DMB9VsZetqQOTRrftCkZQUBqwdVlgSTt763Udy63esfOmNNTveXOMqDJp3/+nQ7rew5mpabFJg2Zh6Cs8e6rtGTaDNR72KEi8/ATPMgoqltXpI1UMwQiVzNTD4vUMm8Sw10xOKas7aONo2dSxY47fVwFp/s+dUSZTnMjQfiETXKPFrlaapStM0tZGk2REFpOHqSEpW3NIgRLeZCw8PGics++a7crjSUjih48U/WHu0AZULRf2SK4ukljz5vGEWJmJa77LJCgtUiJrp9btC4RbZK8iqnAcABEC7qCSARWfyBSSlZ9xKKVqWi2+b37KYL3Z4WvZZ9sfmtsiOESHJuH5W8+ERu69gnSqwPsMTq5/OINtO2lNqGnhBBqRUSad6XgLQDw4WPhRdgjXlmFcCgwnWeTYAbXGhRlYZrL5/8ZObjcns7ozhXDbyl/ZnXymrXhzEwWu8/EjGj7UXN9xio4zWhpyURqgG77HwaZHG0+fL4hjhTAN8cG//4BQ1zoeE44lkH1j/5xFax5wTYiwqtEPIG7Ttf//uI8geFFw2gXqf/c6jvBxyYMj81LfaAzVxZNEK59XAM/Ln7FnIkVRD51bM8PbkLIsCtcU3bWGI2470fWHhYyXhhFSNxg+jkqlIwovoAaqmXxVuWUcbFk42RJ5FRbioXq409F1w0xg5cPtTu4LIUTS8P5L5yOz0CfBNoClARJyMaXmGibttQMqY+fBzu4LVCWC2qAxoVdmwo3do1LRGLCwrLlm28bpZuG8QVGk5iQ7h6EwpXg+Gk4u7tlgTWzxKE9j7NomkGqNUhN193Eh0bPzXe7Ifna9dP1+rmKtNn5udMU+bMTc7fV72htnNv91/ioNVv3R1xZxWfnX6PO3m2Q0DxQGbvlIA7tkB+bop9u2KOq2iTp8+t7Vibvr2lkdxW4w2689fzqXt+LdG7ZvnNM2o0/5pXgb6gh7/e2lngezRJJ+ApPH45pdvW6Df8rXMDfMzoOeMOdkK1IrUnh3PrH7eYJPY3bkI84JUB5ANYEkbcmVR4N8+krOkqGEZsET07oHfzzA2er5RmyZmzxFcFeBt8BR/ZHBitYICPXiS2bx3fBA39/m2vlPYBciGSAHvnn5fg4rOxmTd8OLmRhuTFu0Jm7ygTGs3/B0L4rwsbpt8k4YoqMm//jjfdygm8+7HAGZSLd+Y2PxBXwXM/TRgOvN+mWcuZIJ0yfluxS/Iik2sZVhXDizL+frFR/T4Fyn8Uw4LmTp9A+NsEvMfrQt8sYP3u5/W8KExa2KbCASJxbt2cit9EsN8vbvZl/9uuTsUbOxXNlcArPH8yE8x+TjHfvB3KdMxKZ1cGDhVLH5d9L7/TNKayJdjYy9dntoTY+/6deb78ZvS983BBFj/T78p/b84LAGWsCwBlgBLHAIsAZYAS4AlwBJgiUOAJcASYAmwBFgCLHEIsARYAiwBlgBLgCUOAZYAS4AlwBJgCbDEIcASYL2Xx98AL4Aqm9Gm7qoAAAAASUVORK5CYII=',
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
                  text: 'ISBN',
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
