
export class AppInfo {
    language: string = "ch";
    isKeyboardShow: boolean;
    isIgnoreBackButton: boolean;
    constructor() {

    }

}

/**
 * 本地存储键值
 */
export const LocalKeys = {
    currentPkgInfo: 'currentPkgInfo', // 当前使用的页面版本信息
    oldPkgInfo: 'oldPkgInfo',   // 旧版本信息
    localPkgInfo: 'localPkgInfo',  // 本地所有包信息
    updateServerAddress: 'updateServerAddress',  // 升级服务器地址
};