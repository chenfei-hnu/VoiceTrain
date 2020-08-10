/******************************************************************************************** 
	 THIS FILE HAS BEEN COMPILED FROM TYPESCRIPT SOURCES. 
	 PLEASE DO NOT MODIFY THIS FILE DIRECTLY AS YOU WILL LOSE YOUR CHANGES WHEN RECOMPILING. 
	 INSTEAD, EDIT THE TYPESCRIPT SOURCES UNDER THE WWW FOLDER, AND THEN RUN GULP. 
	 FOR MORE INFORMATION, PLEASE SEE CONTRIBUTING.md. 
*********************************************************************************************/


"use strict";
var LocalPackage = require("./localPackage");
var CodePushUtil = require("./codePushUtil");
var NativeAppInfo = require("./nativeAppInfo");
var GetFilePathUtil = require("./fileUtil");
var CodePush = (function () {
  function CodePush() {}
  CodePush.prototype.restartApplication = function (installSuccess, errorCallback) {
    cordova.exec(installSuccess, errorCallback, "CodePush", "restartApplication", []);
  };
  CodePush.prototype.getAppVersion = function (notifySucceeded, notifyFailed) {
    cordova.exec(notifySucceeded, notifyFailed, "CodePush", "getAppVersion", []);
  };
  CodePush.prototype.isDelOldPkg = function (notifySucceeded, notifyFailed) {
    cordova.exec(notifySucceeded, notifyFailed, "CodePush", "isDelOldPkg", []);
  };

  CodePush.prototype.loadDefaultURL = function (startPath,notifySucceeded, notifyFailed) {
    cordova.exec(notifySucceeded, notifyFailed, "CodePush", "loadDefaultURL", [startPath]);
  };

  CodePush.prototype.getCurrentPackage = function (packageSuccess, packageError) {
    NativeAppInfo.isPendingUpdate(function (pendingUpdate) {
      var packageInfoFile = pendingUpdate ? LocalPackage.OldPackageInfoFile : LocalPackage.PackageInfoFile;
      LocalPackage.getPackageInfoOrNull(packageInfoFile, packageSuccess, packageError);
    });
  };
  CodePush.prototype.getPendingPackage = function (packageSuccess, packageError) {
    NativeAppInfo.isPendingUpdate(function (pendingUpdate) {
      if (pendingUpdate) {
        LocalPackage.getPackageInfoOrNull(LocalPackage.PackageInfoFile, packageSuccess, packageError);
      } else {
        packageSuccess(null);
      }
    });
  };

  CodePush.prototype.installPackage = function (syncCallback, options, deployPath) {
    if (!options) {
      options = this.getDefaultSyncOptions();
    }
    var onInstallSuccess = function (success) {
      CodePushUtil.logMessage("Update is installed and will be run on the next app restart.");
    };

    var installError = function (error) {
      CodePushUtil.logMessage(error);
      syncCallback && syncCallback(-1);
    };

    GetFilePathUtil.getDataDirectory(deployPath, false, function (innerError, unzipDir) {
      CodePushUtil.logMessage("install information:");
      CodePushUtil.logMessage(unzipDir);
      CodePushUtil.logMessage(unzipDir.fullPath);
      if (innerError) {
        CodePushUtil.logMessage("some error has been deteced");
        installError && installError(innerError);
      } else {
        CodePushUtil.logMessage("new version will be installed");
        var preInstallSuccess = function (success) {
          syncCallback && syncCallback(0);
          setTimeout(function() {
             cordova.exec(function () {
              onInstallSuccess && onInstallSuccess()
            }, function () {
              installError && installError()
            },
            "CodePush", "install", [unzipDir.fullPath, options.installMode, options.minimumBackgroundDuration]);
          }, 500);
         
        };
        var preInstallFailure = function (preInstallError) {
          CodePushUtil.logError("Preinstall failure.", preInstallError);
          var error = new Error("An error has occured while installing the package. " + CodePushUtil.getErrorMessage(preInstallError));
          syncCallback && syncCallback(-1);
          installError && installError(error);
        };
        cordova.exec(preInstallSuccess, preInstallFailure, "CodePush", "preInstall", [unzipDir.fullPath]);
      }
    });
  };


  CodePush.prototype.getDefaultSyncOptions = function () {
    if (!CodePush.DefaultSyncOptions) {
      CodePush.DefaultSyncOptions = {
        ignoreFailedUpdates: true,
        installMode: InstallMode.ON_NEXT_RESTART,
        minimumBackgroundDuration: 0,
        mandatoryInstallMode: InstallMode.IMMEDIATE,
        updateDialog: false,
        deploymentKey: undefined
      };
    }
    return CodePush.DefaultSyncOptions;
  };
  CodePush.prototype.getDefaultUpdateDialogOptions = function () {
    if (!CodePush.DefaultUpdateDialogOptions) {
      CodePush.DefaultUpdateDialogOptions = {
        updateTitle: "Update available",
        mandatoryUpdateMessage: "An update is available that must be installed.",
        mandatoryContinueButtonLabel: "Continue",
        optionalUpdateMessage: "An update is available. Would you like to install it?",
        optionalInstallButtonLabel: "Install",
        optionalIgnoreButtonLabel: "Ignore",
        appendReleaseDescription: false,
        descriptionPrefix: " Description: "
      };
    }
    return CodePush.DefaultUpdateDialogOptions;
  };
  return CodePush;
}());

var instance = new CodePush();
module.exports = instance;
