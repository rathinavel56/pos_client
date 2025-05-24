
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiService {
    baseUrl: any = environment.apiEndPoint;
    token: any = '';
    refreshToken: any = '';
    login_time: any = '';
    httpOptions: any;
    public windowTop: any = window.top;

    constructor(private http: HttpClient) {}

    getHeaders(isFile: any) {
        let addHeaders: HttpHeaders = new HttpHeaders();
        if (isFile) {
            addHeaders = addHeaders.append('Accept', 'multipart/form-data; charset=utf-8; boundary='
            + Math.random().toString().substr(2));
            addHeaders.set('Content-Type', '');
        } else {
            addHeaders = addHeaders.append('Accept', 'application/json');
            addHeaders = addHeaders.append('Content-Type', 'application/json');
        }
        if (sessionStorage.getItem('user_context') !== undefined && sessionStorage.getItem('user_context') !== '') {
            const access_token = sessionStorage.getItem('access_token');
            if (access_token && access_token !== null) {
                this.token = access_token;
                this.refreshToken = sessionStorage.getItem('refresh_token');
                this.login_time = sessionStorage.getItem('login_time');
            }
        } else {
            this.token = '';
            this.refreshToken = '';
            this.login_time = '';
        }
        addHeaders = addHeaders.append('Access-Control-Allow-Origin', '*');
        this.httpOptions = {
            headers: addHeaders
        };
    }

    httpGet<T>(url: string): Observable<T> {
      this.getHeaders(false);
      return this.http
      .get<T>((this.getTokenUrl(this.baseUrl + url)), this.httpOptions)
      .pipe(catchError(this.handleNetworkErrors));
    }

    /**
     * Performs a request with `post` http method.
     */
    httpPost(url: string, body: any): Observable<any> {
      this.getHeaders(false);
      return this.http
      .post((this.getTokenUrl(this.baseUrl + url)), body, this.httpOptions)
      .pipe(catchError(this.handleNetworkErrors));
    }

    httpPostFile(url: string, body: any): Observable<any> {
        this.getHeaders(true);
        let headers: any = {
            headers: this.httpOptions.addHeaders,
            responseType: 'arraybuffer'
        };
        return this.http
        .post((this.getTokenUrl(this.baseUrl + url)), body, headers)
        .pipe(catchError(this.handleNetworkErrors));
    }

    httpPostFileJson(url: string, body: any): Observable<any> {
      this.getHeaders(true);
      let headers: any = {
          headers: this.httpOptions.addHeaders
      };
      return this.http
      .post((this.getTokenUrl(this.baseUrl + url)), body, headers)
      .pipe(catchError(this.handleNetworkErrors));
  }

    /**
     * Performs a request with `put` http method.
     */
    httpPut(url: string, body: any): Observable<any> {
      this.getHeaders(false);
      return this.http
      .put((this.getTokenUrl(this.baseUrl + url)), body, this.httpOptions)
      .pipe(catchError(this.handleNetworkErrors));
    }

    /**
     * Performs a request with `delete` http method.
     */
    httpDelete(url: string, options?: any): Observable<any> {
        this.getHeaders(false);
        return this.http
            .delete((this.getTokenUrl(this.baseUrl + url)), options)
            .pipe(catchError(this.handleNetworkErrors));
    }

    handleNetworkErrors(errObject: any): Observable<any> {
      if (errObject.status === 0) {
          sessionStorage.removeItem('user_context');
          sessionStorage.removeItem('login_time');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.setItem('backend_failure', 'true');
          //window.location.href = '/login';
      } else if (errObject.status === 401) {
          sessionStorage.removeItem('user_context');
          sessionStorage.removeItem('login_time');
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
          sessionStorage.setItem('session_expired', 'true');
         // window.location.href = '/login';
      } else if (errObject.status === 500) {
          alert(errObject.error.statusMessage);
      }
      return of(true);
  }
  getTokenUrl(url : any): string {
    let userDetail: any = sessionStorage.getItem('retail_pos') ? JSON.parse(sessionStorage.getItem('retail_pos') || '{}') : null;
    if (userDetail && url.indexOf('/login') <= -1) {
        return (url.indexOf('?') > -1) ? (url + '&token=' + userDetail.session_detail.token) : (url + '?token=' + userDetail.session_detail.token);
    } else {
        return url;
    }
    return '';
  }
}
