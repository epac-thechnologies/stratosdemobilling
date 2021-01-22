import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {NgxWebstorageModule} from 'ngx-webstorage';
import { ToastrModule, ToastrService } from 'ngx-toastr';





import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ConfigurationService } from './services/configuration.service';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CsvComponent } from './components/csv/csv.component';
import { DatatableComponent } from './components/shared/datatable/datatable.component';
import { StorageServiceModule} from 'angular-webstorage-service';

//primeng
import {TableModule} from 'primeng/table';
import {DropdownModule} from 'primeng/dropdown';
import {CalendarModule} from 'primeng/calendar';
import {ConfirmDialogModule} from 'primeng/confirmdialog';
import { InvoicesComponent } from './components/invoices/invoices.component';
import { ConfirmationService } from 'primeng/api';
import {TooltipModule} from 'primeng/tooltip';
import { ClientsComponent } from './components/clients/clients.component';


 


export function ConfigLoader(cfg: ConfigurationService) {
  return () => cfg.load();
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    NotFoundComponent,
    CsvComponent,
    DatatableComponent,
    InvoicesComponent,
    ClientsComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    AngularFontAwesomeModule,
    NgxWebstorageModule.forRoot(),
    ToastrModule.forRoot(),
    BrowserModule,
    StorageServiceModule,
    TableModule, // prime
    DropdownModule, // prime
    CalendarModule, // prime
    ConfirmDialogModule, // prime
    TooltipModule, // prime


  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      deps: [ConfigurationService],
      multi: true
    },
    ConfigurationService,
    ConfirmationService
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
