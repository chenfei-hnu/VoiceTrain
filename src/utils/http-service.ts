import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import { Injectable } from '@angular/core'
import { Common } from './common'
import { DBOperator } from './db-operator';

declare let navigator, FileUtil, cordova, _;;
@Injectable()

export class HttpService {
    constructor(public http: HttpClient) {
    }

    public head(url): Promise<boolean> {
        return this.http.head(url).retry(1).timeout(3000)
            .toPromise().then((response: any) => {
                if (response.status == 200) {
                    return Promise.resolve(true);
                } else {
                    return Promise.resolve(false);
                }
            }).catch((e) => {
                return Promise.resolve(false);
            })
    }
    /**
     * 向WAC请求数据，不使用缓存，在用户登录时是调用
     * data：传输的数据类
     * url：服务器url
     * isShowLoading：是否显示加载状态，此参数如果不传参，默认为false
     * 返回值 Promise<any>
     * isHandleErr 是否自动处理错误信息默认是自动处理
     * timeout 请求超时时间，单位为秒
     */
    public postData(params: any, isShowLoading = false, timeout?): Promise<any> {

        return this.post(params, isShowLoading, timeout).then((data) => {
            if (data) {
                const success = data.success || false;
                if (!success) {
                    return Promise.resolve(data);
                }
                return Promise.resolve(data);
            }
            return Promise.resolve(null);
        });

    }

    private post(params: any, showLoading: boolean, timeout = 12): Promise<any> {
        // 如果是演示模式禁止发送请求
        const url = params.url;
        const data = params.body;


        if (showLoading) {
            Common.showLoading();
        }
        const body = Common.safeJSONSwitch(data);
        if (url == null || url == '') {
            return Promise.resolve(null);
        }
        const headers = new HttpHeaders(
            {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            });

        return this.http.post(url, body, { headers: headers }).retry(2)
            .timeout(timeout * 1000)
            .delay(10)
            .toPromise()
            .then((response: any) => {
                if (showLoading) {
                    Common.clearLodingTimeout();
                    Common.hideLoading();
                }
                if (response && response.debug) {
                    delete response.debug;
                }
                if (response != '') {
                    return Promise.resolve(response);
                } else {
                    return Promise.resolve(null);
                }
            })
            .catch(this.handleError);
    }


    //异常处理
    private handleError(error: any) {
        try {
            let msg = _("---请求错误---\n") + JSON.stringify(error.message || error);
            Common.clearLodingTimeout();
            Common.hideLoading();
            if (error.name == "HttpErrorResponse") {//切换到WEB认证，流量未放通的时候报错，此时不hideLoading
                return Promise.resolve(null);
            }
            if (error.name == 'TimeoutError') {
                Common.showMsg(_("请求超时，请联系管理员"), true);
                return Promise.resolve(null);
            } else {
                return Promise.resolve(null);
            }

        } catch (e) { }

        return Promise.reject(error.message || error);
    }

    //get数据 url地址，timeout 超时时间，默认10秒
    public get(url, timeout = 10): Promise<any> {
        return this.http.get(url).retry(2)
            .timeout(timeout * 1000)
            .delay(10)
            .toPromise()
            .then((response: any) => response)
            .catch(this.handleGetError);
    }

    //get错误处理
    private handleGetError(error: any): Promise<any> {
        console.error('An error occurred when get', error);
        return Promise.resolve(null);
    }



}

/**
 * 请求选项接口
 * isShowLoading?: boolean;  是否显示请求loading框
 demoData?:any;      demo数据
 isCacheData?: boolean;   是否缓存请求数据
 cacheMark?: string;    缓存标记
 isHandleErr?: boolean;   是否自动处理错误信息，出错之后
 cacheLive?: number;   缓存生存时间单位为秒
 timeout?: number;   请求超时时间单位为秒
 */
export interface IPostOption {
    isShowLoading?: boolean;
    demoData?: any;
    isCacheData?: boolean;
    cacheMark?: string;
    isHandleErr?: boolean;
    cacheLive?: number;
    timeout?: number;
}

