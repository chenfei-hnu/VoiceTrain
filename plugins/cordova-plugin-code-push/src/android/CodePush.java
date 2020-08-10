package com.microsoft.cordova;

import android.content.pm.PackageManager;
import android.os.AsyncTask;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.ConfigXmlParser;
import org.apache.cordova.CordovaArgs;
import org.apache.cordova.CordovaInterface;
import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CordovaWebView;
import org.json.JSONException;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.security.NoSuchAlgorithmException;

import java.util.Date;

/**
 * Native Android CodePush Cordova Plugin.
 */
public class CodePush extends CordovaPlugin {

    private static final String DEPLOYMENT_KEY_PREFERENCE = "codepushdeploymentkey";
    private static final String WWW_ASSET_PATH_PREFIX = "file:///android_asset/www/";
    private static boolean ShouldClearHistoryOnLoad = false;
    private CordovaWebView mainWebView;
    private CodePushPackageManager codePushPackageManager;
    private boolean pluginDestroyed = false;
    private boolean didUpdate = false;
    private boolean didStartApp = false;
    private long lastPausedTimeMs = 0;

    @Override
    public void initialize(CordovaInterface cordova, CordovaWebView webView) {
        super.initialize(cordova, webView);
        CodePushPreferences codePushPreferences = new CodePushPreferences(cordova.getActivity());
        codePushPackageManager = new CodePushPackageManager(cordova.getActivity(), codePushPreferences);
        mainWebView = webView;
    }

    @Override
    public boolean execute(String action, CordovaArgs args, final CallbackContext callbackContext) {
        if ("getAppVersion".equals(action)) {
            return execGetAppVersion(callbackContext);
        }else if ("getDeploymentKey".equals(action)) {
            this.returnStringPreference(DEPLOYMENT_KEY_PREFERENCE, callbackContext);
            return true;
        } else if ("getNativeBuildTime".equals(action)) {
            return execGetNativeBuildTime(callbackContext);
        } else if ("getServerURL".equals(action)) {
            this.returnStringPreference("codepushserverurl", callbackContext);
            return true;
        } else if ("install".equals(action)) {
            return execInstall(args, callbackContext);
        } else if ("isFailedUpdate".equals(action)) {
            return execIsFailedUpdate(args, callbackContext);
        } else if ("isFirstRun".equals(action)) {
            return execIsFirstRun(args, callbackContext);
        } else if ("isPendingUpdate".equals(action)) {
            return execIsPendingUpdate(args, callbackContext);
        }  else if ("preInstall".equals(action)) {
            return execPreInstall(args, callbackContext);
        } else if ("restartApplication".equals(action)) {
            return execRestartApplication(args, callbackContext);
        } else if ("isDelOldPkg".equals(action)) {
            return execIsDelOldPkg(callbackContext);
        }else if("loadDefaultURL".equals(action)){
            return execLoadDefaultURL(args,callbackContext);
        } else {
            return false;
        }
    }

    
    private boolean execIsFirstRun(CordovaArgs args, CallbackContext callbackContext) {
        try {
            boolean isFirstRun = false;
            String packageHash = args.getString(0);
            CodePushPackageMetadata currentPackageMetadata = codePushPackageManager.getCurrentPackageMetadata();
            if (null != currentPackageMetadata) {
                /* This is the first run for a package if we just updated, and the current package hash matches the one provided. */
                isFirstRun = (null != packageHash
                        && !packageHash.isEmpty()
                        && packageHash.equals(currentPackageMetadata.packageHash)
                        && didUpdate);
            }
            callbackContext.success(isFirstRun ? 1 : 0);
        } catch (JSONException e) {
            callbackContext.error("Invalid package hash. " + e.getMessage());
        }
        return true;
    }

    private boolean execIsDelOldPkg(CallbackContext callbackContext){
        boolean result = this.codePushPackageManager.isDelOldPkg();
        this.codePushPackageManager.clearIsDelOldPkg();
        callbackContext.success(result?1:0);
        return true;
    }

    private boolean execLoadDefaultURL(CordovaArgs args,CallbackContext callbackContext){
          try {
           String startPage = args.getString(0);
           this.navigateToURL(startPage);
           callbackContext.success();
        } catch (Exception e) {
            callbackContext.error("An error occurred. " + e.getMessage());
        }
        return true;
        
    }

    private boolean execIsPendingUpdate(CordovaArgs args, CallbackContext callbackContext) {
        try {
            InstallOptions pendingInstall = this.codePushPackageManager.getPendingInstall();
            callbackContext.success((pendingInstall != null) ? 1 : 0);
        } catch (Exception e) {
            callbackContext.error("An error occurred. " + e.getMessage());
        }
        return true;
    }

    private boolean execIsFailedUpdate(CordovaArgs args, CallbackContext callbackContext) {
        try {
            final String packageHash = args.getString(0);
            boolean isFailedUpdate = this.codePushPackageManager.isFailedUpdate(packageHash);
            callbackContext.success(isFailedUpdate ? 1 : 0);
        } catch (JSONException e) {
            callbackContext.error("Could not read the package hash: " + e.getMessage());
        }
        return true;
    }

    private boolean execInstall(CordovaArgs args, CallbackContext callbackContext) {
        try {
            final String startLocation = args.getString(0);
            final InstallMode installMode = InstallMode.fromValue(args.optInt(1));
            final int minimumBackgroundDuration = args.optInt(2);
            File startPage = this.getStartPageForPackage(startLocation);
            if (startPage != null) {
                /* start page file exists */
                /* navigate to the start page */
                if (InstallMode.IMMEDIATE.equals(installMode)) {
                    InstallOptions pendingInstall = new InstallOptions(installMode, minimumBackgroundDuration);
                    this.codePushPackageManager.savePendingInstall(pendingInstall);
                    this.navigateToFile(startPage);
                    markUpdate();
                } else {
                    InstallOptions pendingInstall = new InstallOptions(installMode, minimumBackgroundDuration);
                    this.codePushPackageManager.savePendingInstall(pendingInstall);
                }

                callbackContext.success();
            } else {
                callbackContext.error("Could not find the package start page.");
            }
        } catch (Exception e) {
            callbackContext.error("Cound not read webview URL: " + e.getMessage());
        }
        return true;
    }

    

    private boolean execRestartApplication(CordovaArgs args, CallbackContext callbackContext) {
        try {
            /* check if we have a deployed package already */
            CodePushPackageMetadata deployedPackageMetadata = this.codePushPackageManager.getCurrentPackageMetadata();
            if (deployedPackageMetadata != null) {
                callbackContext.success();
                didStartApp = false;
                onStart();
            } else {
                final String configLaunchUrl = this.getConfigLaunchUrl();
                if (!this.pluginDestroyed) {
                    callbackContext.success();
                    this.cordova.getActivity().runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            navigateToURL(configLaunchUrl);
                        }
                    });
                }
            }
        } catch (Exception e) {
            callbackContext.error("An error occurred while restarting the application." + e.getMessage());
        }
        return true;
    }

    private void markUpdate() {
    /* this flag will clear when reloading the plugin */
        this.didUpdate = true;
        this.codePushPackageManager.markInstallNeedsConfirmation();
    }

    private void clearDeploymentsIfBinaryUpdated() {
        /* check if we have a deployed package already */
        CodePushPackageMetadata deployedPackageMetadata = this.codePushPackageManager.getCurrentPackageMetadata();
        try {
           if (deployedPackageMetadata != null) {
                String appVersion = deployedPackageMetadata.appVersion;
                String buildVersion = Utilities.getAppVersionName(this.cordova.getActivity());
                if (!appVersion.equals(buildVersion)) {
                    this.codePushPackageManager.cleanDeployments();
                    this.codePushPackageManager.clearFailedUpdates();
                    this.codePushPackageManager.clearPendingInstall();
                    this.codePushPackageManager.clearInstallNeedsConfirmation();
                    this.codePushPackageManager.clearBinaryFirstRunFlag();
                    this.codePushPackageManager.markDelOldPkg();
                }else{
                    this.codePushPackageManager.clearIsDelOldPkg();
                }
            }else{
                this.codePushPackageManager.clearIsDelOldPkg();
            }
        } catch (PackageManager.NameNotFoundException e) {
            
        }
    }

    private void navigateToLocalDeploymentIfExists() {
        CodePushPackageMetadata deployedPackageMetadata = this.codePushPackageManager.getCurrentPackageMetadata();
        if (deployedPackageMetadata != null && deployedPackageMetadata.localPath != null) {
            File startPage = this.getStartPageForPackage(deployedPackageMetadata.localPath);
            if (startPage != null) {
                /* file exists */
                try {
                    navigateToFile(startPage);
                } catch (MalformedURLException e) {
                    /* empty - if there is an exception, the app will launch with the bundled content */
                }
            }
        }
    }

    private boolean execPreInstall(CordovaArgs args, CallbackContext callbackContext) {
    /* check if package is valid */
        try {
            final String startLocation = args.getString(0);
            File startPage = this.getStartPageForPackage(startLocation);
            if (startPage != null) {
                /* start page exists */
                callbackContext.success();
            } else {
                callbackContext.error("Could not get the package start page");
            }
        } catch (Exception e) {
            callbackContext.error("Could not get the package start page");
        }
        return true;
    }

    private boolean execGetAppVersion(CallbackContext callbackContext) {
        try {
            String appVersionName = Utilities.getAppVersionName(this.cordova.getActivity());
            callbackContext.success(appVersionName);
        } catch (PackageManager.NameNotFoundException e) {
            callbackContext.error("Cannot get application version.");
        }
        return true;
    }

    private boolean execGetNativeBuildTime(CallbackContext callbackContext) {
        long millis = Utilities.getApkBuildTime(this.cordova.getActivity());
        if (millis == -1) {
            callbackContext.error("Could not get the application buildstamp.");
        } else {
            String result = String.valueOf(millis);
            callbackContext.success(result);
        }
        return true;
    }

    private void returnStringPreference(String preferenceName, CallbackContext callbackContext) {
        String result = mainWebView.getPreferences().getString(preferenceName, null);
        if (result != null) {
            callbackContext.success(result);
        } else {
            callbackContext.error("Could not get preference: " + preferenceName);
        }
    }

  

    private void navigateToFile(File startPageFile) throws MalformedURLException {
        if (startPageFile != null) {
            String url = startPageFile.toURI().toURL().toString();
            this.navigateToURL(url);
        }
    }

    private void navigateToURL(String url) {
        if (url != null) {
            CodePush.ShouldClearHistoryOnLoad = true;
            this.mainWebView.loadUrlIntoView(url, false);
        }
    }

    private File getStartPageForPackage(String packageLocation) {
        if (packageLocation != null) {
            File startPage = new File(this.cordova.getActivity().getFilesDir() + packageLocation, "www/" + getConfigStartPageName());
            if (startPage.exists()) {
                return startPage;
            }
        }

        return null;
    }

    private String getStartPageURLForPackage(String packageLocation) throws MalformedURLException {
        String result = null;
        File startPageFile = getStartPageForPackage(packageLocation);
        if (startPageFile != null) {
            result = startPageFile.toURI().toURL().toString();
        }

        return result;
    }

    private String getConfigStartPageName() {
        String launchUrl = this.getConfigLaunchUrl();
        int launchUrlLength = launchUrl.length();
        if (launchUrl.startsWith(CodePush.WWW_ASSET_PATH_PREFIX)) {
            launchUrl = launchUrl.substring(CodePush.WWW_ASSET_PATH_PREFIX.length(), launchUrlLength);
        }

        return launchUrl;
    }

    private String getConfigLaunchUrl() {
        ConfigXmlParser parser = new ConfigXmlParser();
        parser.parse(this.cordova.getActivity());
        return parser.getLaunchUrl();
    }

    /**
     * Called when the system is about to start resuming a previous activity.
     *
     * @param multitasking Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onPause(boolean multitasking) {
        lastPausedTimeMs = new Date().getTime();
    }

    /**
     * Called when the activity will start interacting with the user.
     *
     * @param multitasking Flag indicating if multitasking is turned on for app
     */
    @Override
    public void onResume(boolean multitasking) {
        this.pluginDestroyed = false;
    }

    /**
     * Called when the activity is becoming visible to the user.
     */
    @Override
    public void onStart() {
        clearDeploymentsIfBinaryUpdated();
        if (!didStartApp) {
            /* The application was just started. */
            didStartApp = true;
            InstallOptions pendingInstall = this.codePushPackageManager.getPendingInstall();

            /* Revert to the previous version if the install is not confirmed and no update is pending. */
           

            navigateToLocalDeploymentIfExists();
            /* Handle ON_NEXT_RESUME and ON_NEXT_RESTART pending installations */
            if (pendingInstall != null && (InstallMode.ON_NEXT_RESUME.equals(pendingInstall.installMode) || InstallMode.ON_NEXT_RESTART.equals(pendingInstall.installMode))) {
                this.markUpdate();
                this.codePushPackageManager.clearPendingInstall();
            }
        } else {
            /* The application was resumed from the background. */
            /* Handle ON_NEXT_RESUME pending installations. */
            InstallOptions pendingInstall = this.codePushPackageManager.getPendingInstall();
            long durationInBackground = (new Date().getTime() - lastPausedTimeMs) / 1000;
            if (pendingInstall != null && InstallMode.ON_NEXT_RESUME.equals(pendingInstall.installMode) && durationInBackground >= pendingInstall.minimumBackgroundDuration) {
                navigateToLocalDeploymentIfExists();
                this.markUpdate();
                this.codePushPackageManager.clearPendingInstall();
            } 
        }
    }

    /**
     * The final call you receive before your activity is destroyed.
     */
    @Override
    public void onDestroy() {
        this.pluginDestroyed = true;
    }

    @Override
    public Object onMessage(String id, Object data) {
        if ("onPageFinished".equals(id)) {
            if (CodePush.ShouldClearHistoryOnLoad) {
                CodePush.ShouldClearHistoryOnLoad = false;
                if (this.mainWebView != null) {
                    this.mainWebView.clearHistory();
                }
            }
        }

        return null;
    }
}
