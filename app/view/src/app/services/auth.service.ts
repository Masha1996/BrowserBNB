import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { catchError, map, startWith } from 'rxjs/operators';
import { IStorageData, StorageService } from './storage.service';
import { StateService } from './state.service';
import { Router } from '@angular/router';


interface MessageFromPage {
    type: 'startSession' | 'dropSession' | 'keepAlive' | 'restoreSession';
    password?: string;
    timeout?: number;
}


@Injectable()
export class AuthService {

    private subject$ = new Subject<boolean>();
    private _isLoggedIn = false;

    get isLoggedIn(): boolean {
        return this._isLoggedIn;
    }

    set isLoggedIn(value: boolean) {
        this._isLoggedIn = value;
        this.subject$.next(value);
    }

    public isLoggedIn$: Observable<boolean>;

    // subscription: Subscription;

    constructor(private storage: StorageService, private router: Router, private stateService: StateService) {


        this.isLoggedIn$ = this.subject$.asObservable().pipe(
            startWith(this.isLoggedIn)
        );

        chrome.runtime.sendMessage(
            {type: 'restoreSession'},
            (response) => {
                if (response.password) {
                    this.login(response.password).subscribe(
                        () => {
                            this.router.navigate(['/main']);
                        }
                    );
                }
            }
        );
    }

    login(password: string): Observable<boolean> {

        return this.storage.getFromStorage(password).pipe(
            map((data: IStorageData) => {
                this.isLoggedIn = true;
                this.stateService.initState(data, password);


                // init session with a live time 10 sec
                chrome.runtime.sendMessage(
                    {type: 'startSession', timeout: 10000},
                    (response) => {
                        if (response.password) {
                            this.login(response.password); // TODO: Also send keep a lives just while app is running
                        }
                    }
                );


                return true;
            }),
            catchError((error) => {
                return of(false);
            })
        );
    }


    logout(): void {

        chrome.runtime.sendMessage(
            {type: 'dropSession'},
            (response) => {
                if (response.password) {
                    this.login(response.password);
                }
            }
        );

        this.isLoggedIn = false;
        this.router.navigate(['/unlock']).then(() => {
            this.stateService.resetState();
        });
    }
}
