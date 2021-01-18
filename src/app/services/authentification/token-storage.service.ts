import { Injectable } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';

@Injectable({
  providedIn: 'root'
})
export class TokenStorage {


  constructor(private localSt:LocalStorageService) {}

  public getAccessToken(): string {
    const token: string = <string>this.localSt.retrieve('accessToken');
    return token;
  }

  public getRefreshToken(): string {
    const token: string = <string>this.localSt.retrieve('refreshToken');
    return token;
  }
  
  public getUsername(): string {
      const token: string = <string>this.localSt.retrieve('username');
      return token;
    }
  
  public getUserData(): any {
      const userData = this.localSt.retrieve('userData');
      console.log(JSON.parse(userData));
      
      return JSON.parse(userData);
  } 
  

  public setAccessToken(token: string) : any{
    return this.localSt.store('accessToken', token);
  }

  public setRefreshToken(token: string): any{
    return this.localSt.store('refreshToken', token);
  }
  
  public setUsername(username: string): any{
    return this.localSt.store('username', username);
  }

  public setUserData(userData: any): any{
    return this.localSt.store('userData', JSON.stringify(userData));
  }

   /**
   * Remove tokens
   */
  public clear() {
    this.localSt.clear();
  }
}