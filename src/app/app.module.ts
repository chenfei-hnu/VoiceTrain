import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { SplashScreen } from '@ionic-native/splash-screen';
import { HTTP } from '@ionic-native/http';
import { MyApp } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { HttpService } from '../utils/http-service';
import { MainPage } from '../pages/main/main';
import { StatusBar } from '@ionic-native/status-bar';
import { IonicModule, IonicApp, IonicErrorHandler } from 'ionic-angular';
import { mainDetailPage } from '../pages/mainDetail/mainDetail';

@NgModule({
  declarations: [
    MyApp,
    MainPage,
    mainDetailPage
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp, {
      backButtonText: '',
      mode: 'ios',          //图标模式设置为ios
      tabsHideOnSubPages: true,    //进入子页面时隐藏tab页面
      iconMode: 'ios',
      scrollAssist: true,
      autoFocusAssist: false,
      tabsPlacement: 'bottom',
      pageTransition: 'ios-transition',
      preloadModules: true
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    MainPage,
    mainDetailPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    HTTP,
    HttpService,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
  ]
})
export class AppModule { }
