import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentification/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'csd';
constructor(private authService : AuthenticationService){
  this.authService.checkIsLogged();

}
}
