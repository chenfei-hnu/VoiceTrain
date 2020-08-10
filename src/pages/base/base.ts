import { Common } from "../../utils/common";

/*
* 公共基类,各个页面类可继承此类
* */
declare const cordova, _;
export class Base {
  public texts: any = {};               //页面文字
  public loading: boolean;              // 页面loading
  public constructor(val = true) {
    this.loading = val;
    document.addEventListener("resume", Common.onResume, false);//监听应用进入事件
    document.addEventListener("pause", Common.onPause, false); //监听应用退出后台事件
  }

  // 显示页面加载loading
  public standby() {
    this.loading = true;
  }
  // 隐藏页面加载loading
  public ready() {
    this.loading = false;
  }
  public refreshData(isRefresh: boolean = false) {
    return Promise.resolve(true);
  }
  public doRefresh(refresher) {
    this.refreshData(true).then((success) => {
      refresher.complete();
      if (success) {
        Common.showMsg("加载成功");
      } else {
        //Common.showMsg("加载失败");
      }
    });
  }
  // 扫描访客二维码或者授权二维码
  public scan() {
    Common.log('scan - 扫描访客二维码或者授权二维码');
    cordova.plugins.gizscanqrcode.scan(
      {    // 全部参数
        'baseColor': '',             // (边框、按钮、导航栏等背景颜色，优先级最低，单独设置可覆盖)
        'title': '扫描二维码',                 // (标题文字)
        'barColor': '',               // (导航栏颜色)
        'statusBarColor': 'white',          // (状态栏字体颜色 white为白，不填为默认)
        'describe': '请扫描二维码',            // (提示用户文字，支持 \n 换行，多行文字需注意小屏幕设备适配问题)
        'describeFontSize': '15',          // (字体大小)
        'describeLineSpacing': '8',        // (行间距)
        'describeColor': 'ffffff',         // (文字颜色)
        'borderColor': '0066CC',           // (扫描框颜色)
        'borderScale': '0.6',              // (边框大小，0.1 ~ 1)
        'flashlightEnable': 'true'         // (支持手电筒, 默认false)
      },
      (data) => {
        data = Common.safeJSONSwitch(data);
        if (data.resultCode == 1) {
        } else if (data.resultCode == 2) {
          Common.showMsg('识别失败，请调整角度重新扫描', true);
        }
      }
    );
  }

}


