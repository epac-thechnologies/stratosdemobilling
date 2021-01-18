import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from "@angular/router";
import { map, catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { TokenStorage } from './token-storage.service';


@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  constructor(private http: HttpClient, private cfg: ConfigurationService,
    private tokenStorage: TokenStorage,
    private router: Router) { }

  public requestToken(username: string, password: string): Observable<boolean> {

    return this.sendToServer(username, password)
      .pipe(
        map(json => {
          if (json && json.access_token) {
            this.tokenStorage.setAccessToken(json.access_token);
            this.tokenStorage.setUsername(username);
            return true;
          } else {
            return false;
          }
        }),
        catchError((err, caught) => {
          return Observable.throw(err);
        })
      );
  }

  public sendToServer(username: string, password: string): Observable<any> {

    let params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);
    params.append('grant_type', 'password');

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
        'Authorization': 'Basic d2ViOnNlY3JldA=='
      })
    };

    return this.http
      .post(this.cfg.get("Api_Security") + '/token', params.toString(), httpOptions);
  }


  public logout() {
    this.tokenStorage.clear();
    this.router.navigate(['/login']);
  }

  public getusername(): string {
    return this.tokenStorage.getUsername();
  }

  checkIsLogged() {
    if (this.tokenStorage.getAccessToken() == null) {
      console.log('not logged : go to /login');
      
      this.router.navigate(['/login']);
      return false;
    } else {
      return true;
    }

  }

}