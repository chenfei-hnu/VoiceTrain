var argscheck = require('cordova/argscheck'),
    channel = require('cordova/channel'),
    utils = require('cordova/utils'),
    exec = require('cordova/exec'),
    cordova = require('cordova');
	
function FileUtil() {
    channel.onCordovaReady.subscribe(function() { });
};
		
FileUtil.prototype.md2 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "md2", [urlFile]);
};	
FileUtil.prototype.md5 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "md5", [urlFile]);
};	
FileUtil.prototype.sha1 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "sha1", [urlFile]);
};	
FileUtil.prototype.sha256 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "sha256", [urlFile]);
};	
FileUtil.prototype.sha384 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "sha384", [urlFile]);
};	
FileUtil.prototype.sha512 = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "sha512", [urlFile]);
};
FileUtil.prototype.base64_crc32 = function(urlFile,start,end, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "base64_crc32", [urlFile,start,end]);
};
FileUtil.prototype.length = function(urlFile, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "getFileLength", [urlFile]);
};
FileUtil.prototype.createFile = function(urlFile,isReplace, successCallback, errorCallback) {
   exec(successCallback, errorCallback, "FileUtil", "createFile", [urlFile,isReplace]);
};

module.exports = new FileUtil();
