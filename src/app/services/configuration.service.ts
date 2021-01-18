import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import * as lod from "lodash";

@Injectable({
  providedIn: 'root'
})
export class ConfigurationService {

  constructor(private http: HttpClient) { }

  public params: any

  load(): Promise<any> {

    return this.http.get("assets/config/config.json")
      .pipe(
        tap(config => {
          this.params = config
        })
      )
      .toPromise();

  }

  get(key: string): string {
    return lod.get(this.params, key);
  }

}

