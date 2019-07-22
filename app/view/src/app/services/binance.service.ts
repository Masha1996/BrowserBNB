import {Injectable} from '@angular/core';
import * as Binance from '../../assets/binance/bnbSDK.js';
import {getAddressFromPrivateKey} from './binance-crypto';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class BinanceService {

    binanceInstance: any;
    binanceClient: any;

    endpointList = {
        'MAINNET': 'https://dex.binance.org/',
        'MAINNET_ASIA': 'https://dex-asiapacific.binance.org/',
        'MAINNET_ATLANTIC': 'https://dex-atlantic.binance.org/',
        'MAINNET_EUROPE': 'https://dex-european.binance.org/',
        'TESTNET': 'https://testnet-dex.binance.org',
        'TESTNET_ASIA': 'https://testnet-dex-asiapacific.binance.org',
        'TESTNET_ATLANTIC': 'https://testnet-dex-atlantic.binance.org'
    };

    constructor(private http: HttpClient) {
        this.binanceInstance = Binance.initBNB();
        this.binanceClient = this.initClient(this.endpointList.MAINNET);
    }

    initClient(networkConnection: string): any {
        let client: any;
        try {
            client = this.binanceInstance(networkConnection);
        } catch (e) {
            console.assert(e, `Error during binance client init ${e}`);
        }
        return client;
    }

    async sendTransaction(sum: number, addressTo: string, coin: string, privateKey: string, message?: string) {
        const addressFrom = getAddressFromPrivateKey(privateKey);
        let account: any;
        try {
            account = await this.binanceClient._httpClient.request('get', `/api/v1/account/${addressFrom}`);
        } catch (e) {
            console.assert(e, `Error during sendTransaction ${e}`);
        }
        const sequence = account.result && account.result.sequence;
        return this.binanceClient.transfer(addressFrom, addressTo, sum, coin, message, sequence);
    }


    getBalance(address: string, endpoint: string): Observable<any> {
      // https://dex-asiapacific.binance.org/api/v1/account/bnb1jxfh2g85q3v0tdq56fnevx6xcxtcnhtsmcu64m
      return this.http.get(`${endpoint}api/v1/account/${address}`).pipe(
        catchError((error: HttpErrorResponse) => {
            // TODO: properly handle binance 404 response
            return of({
              balances: []
            });
        })
      );
    }

    getBalanceOfCoin(address: string, coin: string) {
    }

    getFiatBalance(coin: string, fiatCoin: string) {

    }

    getTransactionsHistory(address: string) {
    }
}
