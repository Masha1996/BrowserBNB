import {Component, OnInit} from '@angular/core';
import {map, pluck} from 'rxjs/operators';
import {AuthService} from '../../../../services/auth.service';
import {IUiAccount, StateService} from '../../../../services/state.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';

@Component({
    selector: 'app-accounts',
    templateUrl: './accounts.component.html',
    styleUrls: ['./accounts.component.css']
})
export class AccountsComponent {

    accounts$: Observable<IUiAccount[]>;

    constructor(public stateService: StateService, private authService: AuthService, private router: Router) {
        this.accounts$ = stateService.uiState$.pipe(
            pluck('accounts')
        );
    }

    renameAccount(name: any, index: number): void {
        this.stateService.renameAccount(index, name);
    }

    switchAccount(account: IUiAccount): void {
        this.stateService.switchAccount(account);
    }

    addAccount(): void {
        this.stateService.addAccount();
    }

    logout() {
        this.authService.logout();
    }

    stopEvent(event: Event) {
        event.stopPropagation();
    }

    importAccount() {
        // importSingleKey
        this.router.navigate(['/registration/import'], {
            queryParams: {
                importSingleKey: true
            }
        });
    }
}
