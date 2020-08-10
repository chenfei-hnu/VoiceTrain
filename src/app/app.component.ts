import { Component, ViewChild } from '@angular/core';
import { Platform, AlertController, IonicApp, App, NavController, Events, LoadingController, Tabs, ToastController } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { MainPage } from '../pages/main/main';
import { HttpService } from "../utils/http-service";
import { Common } from '../utils/common';


declare const window;
declare const cordova;
declare const navigator;
declare const device;
declare const screen;
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any;
  @ViewChild('myNav') nav: NavController
  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private app: App,
    private http: HttpService,
    private ionicApp: IonicApp,
    private event: Events,
    private alertFactory: AlertController,
    private loadingController: LoadingController,
    private toast: ToastController
  ) {
    this.initializeApp();
  }
  //初始化APP
  initializeApp() {
    Common.log('initializeApp - 初始化APP');
    this.platform.ready().then(() => {

      try {
        if (device && screen.orientation) {
          screen.orientation.lock('landscape');
          screen.orientation.unlock();
        }
      } catch (e) {
        Common.isInBrowser = true;
      }
      this.initAppStatus();
      const args = {
        // 通用配置
        debug: true,
        channel: "release",
        develop: true,
        version: "1.0",
      };


      this.initAppData().then((results) => {//待翻译文件和数据库读取完成后再跳转
        let language = results[0];
        let appInfo = results[1] || '';
        Common.initLanguage(language);//初始化翻译函数
        this.initLocalData(appInfo);//将从数据读取的AppInfo  赋值
        this.setRootPage(MainPage);
      });
    });
  }


  //初始化APP状态
  initAppStatus() {
    Common.log('initAppStatus - 初始化终端信息，键盘状态，状态栏颜色，公共对象，通知消息推送');
    //初始化公共对象 
    Common.init(this.platform, this.http, this.nav, this.alertFactory, this.event, this.loadingController, this.toast);
    //修改状态栏颜色
    this.initStatusBar();
    //初始化键盘状态 
    this.initKeyboard();
    //初始化返回处理器 
    this.initReturnController();
  }

  //初始化APP数据
  initAppData() {
    Common.log('initAppData - 获取APP本地数据');
    //加载语言文件及查询AppInfo 
    let promise;
    if (Common.isInBrowser) {
      promise = Promise.all([Common.getLanguageFile()]);
    } else {
      //初始化数据库 
      Common.initDataBase();
      promise = Promise.all([Common.getLanguageFile(), this.queryAppData()]);
    }
    return promise;
  }
  //查询历史APP信息
  queryAppData() {
    Common.log('queryAppData - 查询历史APP信息');
    return Common.getAppInfo();
  }
  //获取本地数据
  initLocalData(appInfo) {
    Common.log('initLocalData - 获取本地数据');
    Common.appInfo = Common.safeJSONSwitch(appInfo ? appInfo.JSON : "") || Common.appInfo;
    if (!Common.isInBrowser) {
      Common.isIos = device && device.platform == 'iOS';
      Common.isAndroid = device && device.platform == 'Android';
    }
    Common.connType = navigator.connection && navigator.connection.type || '';
  }

  //设置APP根页面
  setRootPage(page) {
    Common.log('setRootPage - 设置APP根页面');
    this.rootPage = page;
  }
  //隐藏状态栏
  initStatusBar() {
    Common.log('initStatusBar - 隐藏状态栏');
    if (!Common.isInBrowser && device.platform == 'Android') {
      this.statusBar.hide();
    }
  }
  //初始化键盘状态 
  initKeyboard() {
    Common.log('initKeyboard - 初始化键盘状态');
    if (window.cordova && window.cordova.plugins.Keyboard) {   //对键盘的操作：包括隐藏键盘和聚焦
      cordova.plugins.Keyboard.disableScroll(true);
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
    }
  }
  //初始化返回处理器 
  initReturnController() {
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
          let ismain = this.nav.getActive().instance instanceof MainPage;
          if (ismain || !this.nav.canGoBack()) {//当前页面是登录页面或者是首页，防止退出登录后可以使用返回键返回上一个页面
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
          } else if (this.nav.canGoBack()) {
            if (!Common.appInfo.isIgnoreBackButton) {
              this.nav.pop();
            }
          }
        }
      }
    }, 3);
  }

}