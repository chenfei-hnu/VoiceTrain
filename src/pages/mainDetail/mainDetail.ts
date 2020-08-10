import { Component } from '@angular/core';
import { Common } from '../../utils/common';
import { Base } from '../base/base';

declare const _, cordova, navigator;

@Component({
  selector: 'mainDetail',
  templateUrl: 'mainDetail.html'
})
export class mainDetailPage extends Base {
  private needReturn: boolean;
  private src: string;
  private name: string;
  private showLast: boolean;
  private showNext: boolean;
  private isEmpty: boolean = false;
  private index: number;
  private matchMap: any;
  private nameMap: any;

  constructor() {
    super();
    Common.log('constructor - 首页构造函数');
    this.texts = {
      title: "",
      empty: _("暂无数据")
    };
    this.nameMap = {
      "vegetables": _("“蔬菜”主题"),
      "fruit": _("“水果”主题"),
      "animal": _("“动物”主题"),
      "dailyThing": _("“生活用品”主题"),
      "snacks": _("“零食”主题"),
      "toy": _("“玩具”主题"),
    };
    this.texts.title = this.nameMap[Common.category];
    this.matchMap = {
      "vegetables": ["土豆", "茄子", "白菜", "萝卜", "辣椒", "玉米", "大蒜", "黄瓜", "木耳", "芹菜"],
      "fruit": ["苹果", "香蕉", "葡萄", "橙子", "西瓜", "草莓", "芒果", "菠萝", "石榴", "桂圆"],
      "animal": ["老虎", "大象", "熊猫", "斑马", "蝴蝶", "乌龟", "嗡嗡", "孔雀", "蚊子", "企鹅"],
      "dailyThing": ["牙刷", "毛巾", "筷子", "水杯", "拖把", "马桶", "枕头", "手套", "衣架", "台灯"],
      "snacks": ["饼干", "软糖", "面包", "牛奶", "海苔", "橙汁", "瓜子", "薯片", "麻花", "核桃"],
      "toy": ["积木", "气球", "拼图", "彩泥", "滑梯", "秋千", "魔方", "风车", "铃铛", "水枪"]
    }

    this.index = 0;
    this.needReturn = true;
    this.updateParams();
  }
  updateParams() {
    if (!this.matchMap[Common.category].length) {
      this.isEmpty = true;
    } else {
      this.isEmpty = false;
      this.src = "assets/imgs/" + Common.category + "/" + (this.index + 1) + ".jpg";
      this.texts.title = this.nameMap[Common.category] + " - " + this.matchMap[Common.category][this.index];
      this.showLast = this.index > 0 ? true : false;
      this.showNext = this.index < (this.matchMap[Common.category].length - 1) ? true : false;
    }
  }
  //返回
  returnBack() {
    Common.log('returnBack - 返回');
    Common.popPage();
  }
  last() {
    if (this.showLast) {
      this.index--;
      this.updateParams();
    }
  }
  next() {
    if (this.showNext) {
      this.index++;
      this.updateParams();
    }
  }
  left() {
    Common.playAudio(Common.category + (this.index + 1) + "-1");
  }
  right() {
    Common.playAudio(Common.category + (this.index + 1) + "-2");
  }

}
