/* 
此类是公共模块类，提取页面常用的操作
* 1.跳转页面
* 2.延时返回页面
* 3.深拷贝
*/
import { AlertController, Platform, NavController, Events, LoadingController, IonicApp, NavParams, ToastController } from 'ionic-angular';
import { File } from '@ionic-native/file';

import { DBOperator } from '../utils/db-operator';
import { HttpService } from "./http-service";
import { MainPage } from '../pages/main/main';
import { AppInfo } from '../datas/datas';
import { SHARED_FORM_DIRECTIVES } from '@angular/forms/src/directives';
import { NativeAudio } from '@ionic-native/native-audio/ngx';

declare const window, _;
declare const PushNotification;
declare const cordova;
declare const navigator;
declare const Ping;
declare let FileUtil;

export class Common {
    public static isHaveShow = false;                       // 当前是否有提示框显示
    public static isHaveToast = false;                      // 当前是否有toast显示
    private static loadingShow = false;                     //loading加载框标志位
    public static languageJson: any;                        // 翻译数据
    public static http: HttpService;
    public static loadingTimeout: any;
    public static lastAlertTime: any;
    public static lastPlayTime: any;
    public static alertFactory: AlertController;            // 弹出框
    public static event: Events;                            // IONIC事件
    public static eventSet: Set<string>;                    // 事件集合
    public static platform: Platform;
    public static nav: NavController;
    public static globalEventMap: Map<string, Array<any>>;  // 全局事件map
    public static loadingController: LoadingController
    public static loading: any;
    public static toast: ToastController;
    public static appInfo: AppInfo;
    public static ionicApp: IonicApp;
    public static isInBrowser: boolean;
    public static isIos: boolean;
    public static isAndroid: boolean;
    public static connType: any;
    public static category: string;
    //Common初始化变量
    public static init(platform, http, nav, alertFactory, event, loadingController, toast) {

        this.appInfo = new AppInfo();
        this.platform = platform;
        this.http = http;
        this.nav = nav;
        this.toast = toast;
        this.alertFactory = alertFactory;
        this.loadingController = loadingController;
        this.event = event;
        this.eventSet = new Set<string>();
        this.globalEventMap = new Map<string, Array<any>>();
    }
    public static categoryPreloadAudio() {
        let categoryArr = [
            "vegetables",
            "fruit",
            "animal",
            "dailyThing",
            "snacks",
            "toy"
        ];
        for (let j = 1; j < 11; j++) {
            setTimeout(() => {
                this.preloadAudio(Common.category + j + "-1", ("assets/imgs/" + Common.category + "/" + j + "-1.wav"));
            }, (j - 1) * 200);
            setTimeout(() => {
                this.preloadAudio(Common.category + j + "-2", ("assets/imgs/" + Common.category + "/" + j + "-2.wav"));
            }, (j - 1) * 400);
        }
    }
    public static categoryUnloadAudio() {
        if (!Common.category) return;
        for (let j = 1; j < 11; j++) {
            this.unloadAudio(Common.category + j + "-1");
            this.unloadAudio(Common.category + j + "-2");
        }
    }
    public static preloadAudio(id, src) {
        if (window.plugins && window.plugins.NativeAudio) {
            window.plugins.NativeAudio.preloadComplex(id, src, 1, 1, 0, function (msg) {
                console.log(id + "---" + src + "---" + 'preloadAudio success: ' + msg);
            }, function (msg) {
                console.log(id + "---" + src + "---" + 'preloadAudio error: ' + msg);
            });
        } else {
            if (!Common.isInBrowser) {
                Common.showMsg(_("终端不支持音频播放"));
            }
        }
    }
    public static unloadAudio(id) {
        if (window.plugins && window.plugins.NativeAudio) {
            window.plugins.NativeAudio.unload(id, function (msg) {
                console.log(id + "---" + 'unloadAudio success: ' + msg);
            }, function (msg) {
                console.log(id + "---" + 'unloadAudio error: ' + msg);
            });
        } else {
            if (!Common.isInBrowser) {
                Common.showMsg(_("删除失败"));
            }
        }
    }

    public static playAudio(src) {
        if (window.plugins && window.plugins.NativeAudio) {
            window.plugins.NativeAudio.play(src, function (msg) {
                console.log(src + "---" + 'playAudio success: ' + msg);
            }, function (msg) {
                console.log(src + "---" + 'playAudio error: ' + msg);
            });
        } else {
            if (!Common.isInBrowser) {
                Common.showMsg(_("终端不支持音频播放"));
            }
        }
    }
    //初始化数据库 
    public static initDataBase() {
        this.log('initDataBase - 初始化数据库');
        DBOperator.createTables();
    }
    //加载语言文件
    public static getLanguageFile() {
        this.log('getLanguageFile - 获取翻译文件');
        return this.http.get('assets/i18n/en.json');
    }
    /**
     *  显示自消失的提示信息
     * content：消息内容
     * time 时间单位为ms
     */
    static async showMsg(content, isError?: boolean, duration?: number) {
        if (this.lastAlertTime && (new Date().getTime() - this.lastAlertTime) < 1 * 1000) {
            Common.log(_("1秒内不能重复提示"));
            return;
        }
        this.lastAlertTime = new Date().getTime();
        const toast = await this.toast.create({
            message: content,
            position: 'top',
            duration: duration ? duration : 2000,
            cssClass: isError ? "error" : "correct"
        });
        toast.present();
        // this.alert(content);
        return;
    }
    /**
     * 显示弹出框提示
     * title：弹出框的标题
     * content：消息内容
     */
    public static alert(content, title?) {
        if (!content) return;//消息内容为空不提示
        let text = _("确定");
        if (this.lastAlertTime && (new Date().getTime() - this.lastAlertTime) < 1 * 1000) {
            Common.log(_("1秒内不能重复提示"));
            return;
        }
        this.lastAlertTime = new Date().getTime();
        this.alertFactory.create({
            title: title || '',//标题
            message: content,//内容
            buttons: [text],//按钮文字
            enableBackdropDismiss: false
        }).present();

    }

    public static log(log) {
        //在浏览器控制台中打印信息
        console.log(log);
    }

    public static isArray(e) {
        return toString.apply(e) === "[object Array]"
    }
    public static formatDate(date, fmt) { //author: meizz 
        let o = {
            "M+": date.getMonth() + 1, //月份 
            "d+": date.getDate(), //日 
            "h+": date.getHours(), //小时 
            "m+": date.getMinutes(), //分 
            "s+": date.getSeconds(), //秒 
            "q+": Math.floor((date.getMonth() + 3) / 3), //季度 
            "S": date.getMilliseconds() //毫秒 
        };
        if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
        for (let k in o)
            if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        return fmt;
    }
    //发布事件
    public static publishEvent(topic: string, data?) {
        this.event.publish(topic, data);
    }

    //订阅事件
    public static subcribeEvent(topic: string, handler) {
        this.event.subscribe(topic, handler);
        this.eventSet.add(topic);
    }

    //取消订阅事件
    public static unsubcribeEvent(topic: string) {
        this.event.unsubscribe(topic);
        this.eventSet.delete(topic);
    }

    //清除所有订阅事件
    public static clearAllEvent() {
        this.eventSet.forEach((topic) => {
            this.event.unsubscribe(topic);
        })
    }

    //添加全局事件
    public static addGlobalEvent(event: string, handler) {
        document.addEventListener(event, handler, false);
        let handlerArray = this.globalEventMap.get(event) || [];
        handlerArray.push(handler);
        this.globalEventMap.set(event, handlerArray);
    }

    //删除全局事件
    public static elGlobalEvent(event: string, handler?) {
        if (handler) {
            document.removeEventListener(event, handler, false);
            let handlerArray = this.globalEventMap.get(event) || [];
            let index = handlerArray.indexOf(handler);
            handlerArray.slice(index, 1);
            this.globalEventMap.set(event, handler);
        } else {
            let handlerArray = this.globalEventMap.get(event) || [];
            handlerArray.forEach((item) => {
                document.removeEventListener(event, item, false);
            })
            this.globalEventMap.delete(event);
        }
    }

    //删除所有全局事件
    public static delAllGlobalEvent() {
        this.globalEventMap.forEach((handlers, event) => {
            handlers.forEach((item) => {
                document.removeEventListener(event, item, false);
            })
        })
        this.globalEventMap.clear();
    }
    //显示页面
    public static showPage(page, param?) {
        if (this.nav && page) {
            if (param) {
                this.nav.push(page, param);
            } else {
                this.nav.push(page);
            }
        }
    }

    // 延时返回页面,一般用于提交完成之后需要返回上层页面的操作
    public static popPage() {
        this.nav.pop(null, (data) => {
        });
    }

    public static handleErrorInfo(error) {
        if (error == null) {
            return;
        }

        let code = 0;
        code = error.code || 0;
        if (error.error_code) code = 999;
        const msg: Array<string> = error.msg || [];

        let alertMesg = '';

        switch (code) {
            case -1:
            default:
                this.showMsg(alertMesg, true);
        }
    }

    //从数据库获取APP信息
    public static getAppInfo() {
        return DBOperator.queryCache('appInfo');
    }
    //更新本地用户数据
    public static async  localUserAppInfo() {
        this.log('localUserAppInfo - 本地化appInfo');
        DBOperator.saveCache('appInfo', this.safeJSONSwitch(Common.appInfo));
    }
    /**
     * ip地址转换
     * @param ipAddress
     * @returns {string}
     */
    static getIpAddress(ipAddress) {
        let str1 = ipAddress & 0xff, str2 = ipAddress >> 8 & 0xff, str3 =
            ipAddress >> 16 & 0xff, str4 = ipAddress >> 24 & 0xff;
        return str1 + '.' + str2 + '.' + str3 + '.' + str4
    }
    public static addDay(c) {
        var e = new Date();
        if (c === 0) {
            return e
        }
        e.setDate(new Date().getDate() + c);
        return e;
    }
    //获取随机数
    public static getRandom(n, m) {
        return Math.floor(Math.random() * (m - n + 1) + n);
    }
    //初始化翻译方法_
    public static initLanguage(data) {
        this.log('initLanguage - 初始化翻译方法_ 及错误码');
        window._ = function (msg: string, ...args): string {
            if (Common.appInfo.language === 'en') {
                let returnText = data[msg];
                if (returnText) {
                    let len = args.length;
                    for (let i = 0; i < len; i++) {
                        let reg = new RegExp('\\%' + i, 'g');
                        returnText = returnText.replace(reg, args[i]);
                    }
                }
                return returnText == undefined ? msg : returnText;
            }
            return msg;
        }
    }
    /**
     * 字符串调用此方法计算长度，避免中文字符js端按一个字符处理，后台按两个字符处理的冲突。
     */
    public static getLen(s) {
        const str = s ? s : '';
        let len = 0;
        for (let i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 127 || str.charCodeAt(i) === 94) {
                len += 3;
            } else {
                len++;
            }
        }
        return len;
    }
    /**
     * 显示加载状态
     * tip：加载提示，默认为空
     */
    static showLoading(tip = "", autoHide = true) {
        this.log('showLoading - 显示加载状态');
        if (this.loadingShow) {
            return;
        }
        this.clearLodingTimeout();
        let className = "";
        this.loading = this.loadingController.create({
            spinner: "ios",
            cssClass: className,
            content: tip || "请稍候..."
        });
        this.loadingShow = true;
        this.loading.present();

        if (autoHide) {
            this.loadingTimeout = setTimeout(() => {    //防止loading卡死，12秒后如果loading没有消失就强制消失
                if (this.loadingShow) {
                    this.hideLoading();
                }
            }, Common.isInBrowser ? 2000 : 12000);

        }
    }
    static clearLodingTimeout() {
        clearTimeout(this.loadingTimeout);
    }
    /**
     * 隐藏加载状态
     */
    static hideLoading() {
        if (this.loading && this.loadingShow) {
            this.log('hideLoading - 隐藏加载状态');
            this.loading._leavingOpts.animation = '';
            this.loading.dismiss();
            this.loadingShow = false;
        }
    }

    /**
     * 深拷贝
     */
    public static deepCopy(source) {
        const result = (source instanceof Array) ? [] : {};
        for (const key in source) {
            result[key] = (typeof (source[key]) === 'object' ? this.deepCopy(source[key]) : source[key]);
        }
        return result;
    }
    //安全的json与字段串相互转换
    public static safeJSONSwitch(value: any) {
        if (!value) {
            return null;
        }
        try {
            if (typeof value === "string") {
                return JSON.parse(value);
            } else {
                return JSON.stringify(value);
            }
        } catch (e) {
            Common.log("---json parse error--- \n" + e);
            return {};
        }
    }
    public static isObject(e) {
        return !!e && Object.prototype.toString.call(e) === "[object Object]"
    }
    public static isInArr(key, arr, idProperty?) {
        if (arr) {
            if (this.isObject(key)) {
                for (let i = 0; i < arr.length; i++) {
                    if (arr[i] == key[idProperty]) {
                        return true;
                    }
                }
            } else {
                if (idProperty) {
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i][idProperty] == key) {
                            return true;
                        }
                    }
                } else {
                    for (let i = 0; i < arr.length; i++) {
                        if (arr[i] == key) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    };
    //修改时间格式
    private static changeFormat(time: number): string {
        let timeString = "" + time;
        if (time < 10) {
            timeString = "0" + time;
        }
        return timeString;
    }


    // 获取文件大小，自动转换单位，传入的是字节数
    public static getFileSize(s): string {
        const size = parseInt(s, 10);
        if (isNaN(size)) {
            return '';
        }
        if (size < 1024) {
            return size + 'B';
        } else if (size < 1024 * 1024) {
            return (size / 1024).toFixed(1) + 'KB';
        } else {
            return (size / (1024 * 1024)).toFixed(1) + 'MB';
        }
    }
    public static getMd5Sum(path): Promise<any> {
        const filePath = path;
        return new Promise((resolve, reject) => {
            FileUtil.md5(filePath,
                (data) => {
                    resolve(data);
                }, (error) => {
                    resolve(null);
                    this.log('文件校验出错 ' + JSON.stringify(error));
                });
        });
    }
    //app进入前台时调用
    public static onResume() {
        let pauseTime = window.localStorage.getItem("pauseTime");
        let lastTime = (new Date().getTime() - parseInt(pauseTime)) / 1000;
        Common.log("切换到APP继续运行，后台存在时间：" + lastTime + "秒");
    }

    //app退出后台时调用
    public static onPause() {
        Common.log("APP切换到后台运行");
        window.localStorage.setItem("pauseTime", new Date().getTime() + "");
    }
    //初始化返回处理器 
    public static initReturnController(nav: NavController) {
        Common.log('initReturnController - 初始化返回处理器');
        this.platform.registerBackButtonAction(() => {
            let activePortal = this.ionicApp._loadingPortal.getActive() ||
                this.ionicApp._modalPortal.getActive() ||
                this.ionicApp._toastPortal.getActive() ||
                this.ionicApp._overlayPortal.getActive();
            Common.publishEvent('backbuttonClicked');
            if (Common.appInfo.isKeyboardShow) {
                cordova.plugins.Keyboard.close();
                Common.appInfo.isKeyboardShow = false;
            } else {
                if (activePortal) {
                    return activePortal.dismiss();
                } else {
                    // let nav: NavController = this.app.getActiveNavs()[0];
                    let ismain = nav.getActive().instance instanceof MainPage;
                    if (ismain || !nav.canGoBack()) {//当前页面是登录页面或者是首页，防止退出登录后可以使用返回键返回上一个页面
                        if (!Common.appInfo.isIgnoreBackButton) {
                            this.event.publish('goBack');//使得在选择控制器页面时，android的返回按钮可以回退
                            navigator.Backbutton.goHome((data) => {
                                Common.log(data);
                            }, () => {
                                Common.log("返回页面失败")
                            });
                        } else {
                            setTimeout(() => {
                                Common.appInfo.isIgnoreBackButton = false;
                            }, 1000);
                        }
                    } else if (nav.canGoBack()) {
                        if (!Common.appInfo.isIgnoreBackButton) {
                            nav.pop();
                        }
                    }
                }
            }
        }, 3);
    }
}
