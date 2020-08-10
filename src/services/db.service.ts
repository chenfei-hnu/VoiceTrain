/* import {globalConfig} from '../global-configs/global-configs'; */
/* const DB_NAME = '__ionicstorage';
const win: any = window; */

/**
 * DBService uses SQLite or WebSQL (development only!) to store data in a
 * persistent SQL store on the filesystem.
 *
 * This is the preferred storage engine, as data will be stored in appropriate
 * app storage, unlike Local Storage which is treated differently by the OS.
 *
 * For convenience, the engine supports key/value storage for simple get/set and blob
 * storage. The full SQL engine is exposed underneath through the `query` method.
 *
 * @usage
 ```js
 * let storage = new DBService(options);
 * storage.set('name', 'Max');
 * storage.get('name').then((name) => {
 * });
 *
 * // Sql storage also exposes the full engine underneath
 * storage.query('insert into projects(name, data) values("Cool Project", "blah")');
 * storage.query('select * from projects').then((resp) => {})
 * ```
 *
 * The `DBService` service supports these options:
 * {
 *   name: the name of the database (__ionicstorage by default)
 *   backupFlag: // where to store the file, default is BACKUP_LOCAL which DOES NOT store to iCloud. Other options:
 *  BACKUP_LIBRARY, BACKUP_DOCUMENTS
 *   existingDatabase: whether to load this as an existing database (default is false)
 * }
 *
 */

/** Utility functions
* TODO: MOVE THESE TO A UTIL CLASS LATER
*/
export const isFunction = (val: any) => typeof val === 'function';
export const isObject = (val: any) => typeof val === 'object';
export const isArray = Array.isArray;

export class DBService {


}
