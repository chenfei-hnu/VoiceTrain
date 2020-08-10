import { SqlStorage } from './sql';
import { Common } from '../utils/common';
declare let cordova;
export class DBOperator {
  private static storage: SqlStorage;


  //创建表
  static createTables(): Promise<any> {
    this.storage = new SqlStorage({ name: "data.db" });
    return new Promise(async (resolve, reject) => {
      let data = await this.exeSql('select * from sqlite_master where tbl_name="Cache"');

      //数据库表已经创建无需再执行创建表的操作
      if (data) {
        return resolve(true);
      }
      this.storage.sqlBatch([
        'CREATE TABLE IF NOT EXISTS Cache(URL TEXT PRIMARY KEY,JSON TEXT,OVERTIME INTEGER)',
        'CREATE TABLE IF NOT EXISTS CommonInfo(NAME TEXT PRIMARY KEY,KEYVALUE TEXT)',
        'CREATE TABLE IF NOT EXISTS PersonalImage(UUID TEXT PRIMARY KEY,TERM_NAME TEXT ,JSON TEXT, LAST_TIME INTEGER)'
      ], () => {
        Common.log("表创建成功")
        return resolve(true);
      }, (error) => {
        return resolve(false);
      })
    })
  }

  /**
   * 执行sql语句
   * sql：sql语句
   * 返回值：Promise<any>封装的查询结果,如果查到结果返回结果对象，否则返回null
   */
  static exeSql(sql: string, params?: any[]): Promise<any> {
    if (!this.storage) return Promise.resolve(null);
    return this.storage.query(sql, params).then((data) => {
      data = data.res.rows;
      if (data.length == 0) {
        return Promise.resolve(null);
      }
      return Promise.resolve(data.item(0));
    }, (err) => {
      return Promise.resolve(null);
    });
  }

  /**
   * 执行sql语句返回所有结果
   */
  static exeAllSql(sql: string): Promise<any> {
    if (!this.storage) return Promise.resolve(null);
    return this.storage.query(sql).then((data) => {
      let tempArray = new Array<any>();
      let tempInfo = data.res.rows;
      for (let i = 0; i < tempInfo.length; i++) {
        tempArray.push(tempInfo.item(i));
      }
      if (tempArray.length == 0) {
        return Promise.resolve(null);
      }
      return Promise.resolve(tempArray);
    }, (err) => {
      return Promise.reject(null);
    });
  }
  /**
   * 删除所有的缓存数据，切换用户调用
   */
  static delAllCache() {
    this.exeSql('DELETE FROM Cache');
    this.exeSql('DELETE FROM PersonalImage');
  }

  /**
   * 缓存查询函数
   * url：请求的url地址
   * 返回值：Promise<any> 封装查询数据
   */
  static queryCache(url: string): Promise<any> {
    return this.exeSql("SELECT * FROM Cache WHERE URL='" + url + "'");;
  }
  /**
  * 缓存数据保存函数
  * url：请求的url地址
  * json：存储的json数据
  * time：缓存有效期，单位为秒默认值为5
  */
  static saveCache(url: string, json: string, time = 5) {
    time = Math.round(new Date().getTime() / 1000) + time;
    this.exeSql("REPLACE INTO Cache (URL,JSON,OVERTIME) VALUES ('" + url + "','" + json + "'," + time + ")");
  }



  /**
    * 缓存人脸画像数据
    * url：请求的url地址
    * json：存储的json数据
    * time：最后保存时间
    */
  static savePersonalImage(UUID: string, TERM_NAME: string, json: string, time: number) {
    this.exeSql("REPLACE INTO PersonalImage (UUID,TERM_NAME,JSON,LAST_TIME) VALUES ('" + UUID + "','" + TERM_NAME + "','" + json + "'," + time + ")");
  }
  /**
   * 删除个人画像数据
   */
  static deletePersonalImage(UUID: string) {
    this.exeSql("DELETE FROM PersonalImage WHERE UUID = '" + UUID + "'");
  }

  /**
   * 修改个人画像数据
   */
  static updatePersonalImage(UUID: string, TERM_NAME: string, json: string, time: number): Promise<any> {
    return this.exeSql("UPDATE PersonalImage SET TERM_NAME = '" + TERM_NAME + "' , JSON = '" + json + "' , LAST_TIME = " + time + " WHERE UUID ='" + UUID + "'");
  }
  /**
   * 查询人脸画像数据
   * @param UUID 
   */
  static queryPersonalImage(UUID: string): Promise<any> {
    return this.exeAllSql("SELECT * FROM PersonalImage WHERE UUID='" + UUID + "'");
  }
  /**
   * 删除搜索关键字表中数据
   */

  static deleteAllCommonInfo() {
    this.exeSql('DELETE FROM CommonInfo');
  }

  /**
   * 删除搜索关键字表中NAME字段值等于name的元素
   */
  static deleteCommonInfo(name) {
    this.exeSql("delete from CommonInfo where NAME = '" + name + "'");
  }

  /**
   *置缓存为无效
   * url：缓存的主键
   */
  static disableCache(url: string): Promise<any> {
    let time = Math.round(new Date().getTime() / 1000) - 30;
    return this.exeSql("UPDATE Cache SET OVERTIME = " + time + " WHERE URL ='" + url + "'");
  }

}
