import { Component } from '@angular/core';
import { Common } from '../../utils/common';
import { Base } from '../base/base';
import { StatusBar } from '@ionic-native/status-bar';
import { mainDetailPage } from '../mainDetail/mainDetail';

declare const _, cordova, navigator;

@Component({
  selector: 'main',
  templateUrl: 'main.html'
})
export class MainPage extends Base {
  private categorys: Array<any>;
  private needReturn: boolean;
  private lastAlertTime: number;
  constructor(private statusBar: StatusBar) {
    super();
    this.texts = {
      title: _("词汇主题")
    }

    this.initStatusBar();
    this.categorys = [{
      "name": _("“蔬菜”主题"),
      "icon": "vegetables"
    }, {
      "name": _("“水果”主题"),
      "icon": "fruit"
    }, {
      "name": _("“动物”主题"),
      "icon": "animal"
    }, {
      "name": _("“生活用品”主题"),
      "icon": "dailyThing"
    }, {
      "name": _("“零食”主题"),
      "icon": "snacks"
    }, {
      "name": _("“玩具”主题"),
      "icon": "toy"
    }];
  }
  //隐藏状态栏
  initStatusBar() {
    Common.log('initStatusBar - 隐藏状态栏');
    //状态栏显示
    this.statusBar.hide();
  }
  //返回
  returnBack() {
    Common.log('returnBack - 返回');
    Common.popPage();
  }
  //类别详情
  detailCategory(category) {
    if (this.lastAlertTime && (new Date().getTime() - this.lastAlertTime) < 1 * 1000) {
      Common.log(_("1秒内不能重复触发"));
      return;
    }
    this.lastAlertTime = new Date().getTime();
    Common.categoryUnloadAudio();
    Common.category = category;
    //预加载音频
    Common.categoryPreloadAudio();
    Common.showPage(mainDetailPage);
    Common.log('detailCategory - 类别详情');
  }



}
