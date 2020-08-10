#import <Cordova/CDV.h>
#import <Cordova/CDVConfigParser.h>
#import "CodePush.h"
#import "CodePushPackageMetadata.h"
#import "CodePushPackageManager.h"
#import "Utilities.h"
#import "InstallOptions.h"
#import "InstallMode.h"

@implementation CodePush

bool didUpdate = false;
bool pendingInstall = false;
NSDate* lastResignedDate;
NSString* const DeploymentKeyPreference = @"codepushdeploymentkey";

- (void)install:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        
        NSString* location = [command argumentAtIndex:0 withDefault:nil andClass:[NSString class]];
        NSString* installModeString = [command argumentAtIndex:1 withDefault:IMMEDIATE andClass:[NSString class]];
        NSString* minimumBackgroundDurationString = [command argumentAtIndex:2 withDefault:0 andClass:[NSString class]];
        
        InstallOptions* options = [[InstallOptions alloc] init];
        [options setInstallMode:[installModeString intValue]];
        [options setMinimumBackgroundDuration:[minimumBackgroundDurationString intValue]];
        
        if ([options installMode] == IMMEDIATE) {
            if (nil == location) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Cannot read the start URL."];
            }
            else {
                bool applied = [self loadPackage: location];
                if (applied) {
                    [CodePushPackageManager savePendingInstall:options];
                    [self markUpdate];
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
                }
                else {
                    pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"An error happened during package install."];
                }
            }
        }
        else {
            /* install on restart or on resume */
            [CodePushPackageManager savePendingInstall:options];
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
        }
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}



- (void)restartApplication:(CDVInvokedUrlCommand *)command {
    /* Callback before navigating */
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    
    CodePushPackageMetadata* deployedPackageMetadata = [CodePushPackageManager getCurrentPackageMetadata];
    if (deployedPackageMetadata && deployedPackageMetadata.localPath && [self getStartPageURLForLocalPackage:deployedPackageMetadata.localPath]) {
        [self loadPackage: deployedPackageMetadata.localPath];
        InstallOptions* pendingInstall = [CodePushPackageManager getPendingInstall];
        if (pendingInstall) {
            [self markUpdate];
            [CodePushPackageManager clearPendingInstall];
        }
    }
    else {
        [self loadStoreVersion];
    }
}

- (void) markUpdate {
    didUpdate = YES;
    [CodePushPackageManager markInstallNeedsConfirmation];
}

- (void)preInstall:(CDVInvokedUrlCommand *)command {
    [self.commandDelegate runInBackground:^{
        CDVPluginResult* pluginResult = nil;
        
        NSString* location = [command argumentAtIndex:0 withDefault:nil andClass:[NSString class]];
        if (nil == location) {
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Cannot read the start URL."];
        }
        else {
            NSURL* URL = [self getStartPageURLForLocalPackage:location];
            if (URL) {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK];
            }
            else {
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Could not find start page in package."];
            }
        }
        
        [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
    }];
}

- (void)getServerURL:(CDVInvokedUrlCommand *)command {
    [self sendResultForPreference:@"codepushserverurl" command:command];
}

- (void)getDeploymentKey:(CDVInvokedUrlCommand *)command {
    [self sendResultForPreference:DeploymentKeyPreference command:command];
}

- (void)getNativeBuildTime:(CDVInvokedUrlCommand *)command {
    NSString* timeStamp = [Utilities getApplicationTimestamp];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:timeStamp];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)sendResultForPreference:(NSString*)preferenceName command:(CDVInvokedUrlCommand*)command {
    NSString* preferenceValue = ((CDVViewController *)self.viewController).settings[preferenceName];
    // length of NIL is zero
    CDVPluginResult* pluginResult;
    if ([preferenceValue length] > 0) {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:preferenceValue];
    } else {
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:[NSString stringWithFormat:@"Could not find preference %@", preferenceName]];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)dealloc {
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)clearDeploymentsIfBinaryUpdated {
    // check if we have a deployed package
    CodePushPackageMetadata* deployedPackageMetadata = [CodePushPackageManager getCurrentPackageMetadata];
    if (deployedPackageMetadata) {
        //  NSString* deployedPackageNativeBuildTime = deployedPackageMetadata.nativeBuildTime;
        //NSNumber* applicationBuildTime = [Utilities getApplicationTimestamp];
        NSString* appVersion = deployedPackageMetadata.appVersion;
        NSString* buildVersion = [Utilities getApplicationVersion];
        
        if (buildVersion != nil) {
            if (![buildVersion isEqualToString: appVersion]){
                // package version is incompatible with installed native version
                [CodePushPackageManager cleanDeployments];
                [CodePushPackageManager clearFailedUpdates];
                [CodePushPackageManager clearPendingInstall];
                [CodePushPackageManager clearInstallNeedsConfirmation];
                [CodePushPackageManager clearBinaryFirstRunFlag];
                [CodePushPackageManager markDelOldPkg];
            }else{
                [CodePushPackageManager clearIsDelOldPkg];
            }
        }
        
        //        if (deployedPackageNativeBuildTime != nil && applicationBuildTime != nil && buildVersion != nil) {
        //            NSNumber* nativeTime =[[NSNumber alloc] initWithDouble:[deployedPackageNativeBuildTime doubleValue]];
        //            if (![buildVersion isEqualToString: appVersion]||applicationBuildTime > nativeTime) {
        //                // package version is incompatible with installed native version
        //                [CodePushPackageManager cleanDeployments];
        //                [CodePushPackageManager clearFailedUpdates];
        //                [CodePushPackageManager clearPendingInstall];
        //                [CodePushPackageManager clearInstallNeedsConfirmation];
        //                [CodePushPackageManager clearBinaryFirstRunFlag];
        //                [CodePushPackageManager clearIsDelOldPkg];
        //            }
        //        }
    }else{
        [CodePushPackageManager clearIsDelOldPkg];
    }
}

- (void)navigateToLocalDeploymentIfExists {
    CodePushPackageMetadata* deployedPackageMetadata = [CodePushPackageManager getCurrentPackageMetadata];
    if (deployedPackageMetadata && deployedPackageMetadata.localPath) {
        [self redirectStartPageToURL: deployedPackageMetadata.localPath];
    }
}

- (void)pluginInitialize {
    // register for "on resume", "on pause" notifications
    
    [self clearDeploymentsIfBinaryUpdated];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationWillEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(applicationWillResignActive) name:UIApplicationWillResignActiveNotification object:nil];
    InstallOptions* pendingInstall = [CodePushPackageManager getPendingInstall];
    [self navigateToLocalDeploymentIfExists];
    // handle both ON_NEXT_RESUME and ON_NEXT_RESTART - the application might have been killed after transitioning to the background
    if (pendingInstall && (pendingInstall.installMode == ON_NEXT_RESTART || pendingInstall.installMode == ON_NEXT_RESUME)) {
        [self markUpdate];
        [CodePushPackageManager clearPendingInstall];
    }
}

- (void)applicationWillEnterForeground {
    InstallOptions* pendingInstall = [CodePushPackageManager getPendingInstall];
    // calculate the duration that the app was in the background
    long durationInBackground = lastResignedDate ? [[NSDate date] timeIntervalSinceDate:lastResignedDate] : 0;
    if (pendingInstall && pendingInstall.installMode == ON_NEXT_RESUME && durationInBackground >= pendingInstall.minimumBackgroundDuration) {
        CodePushPackageMetadata* deployedPackageMetadata = [CodePushPackageManager getCurrentPackageMetadata];
        if (deployedPackageMetadata && deployedPackageMetadata.localPath) {
            bool applied = [self loadPackage: deployedPackageMetadata.localPath];
            if (applied) {
                [self markUpdate];
                [CodePushPackageManager clearPendingInstall];
            }
        }
    }
}

- (void)applicationWillResignActive {
    // Save the current time so that when the app is later resumed, we can detect how long it was in the background
    lastResignedDate = [NSDate date];
}

- (BOOL)loadPackage:(NSString*)packageLocation {
    NSURL* URL = [self getStartPageURLForLocalPackage:packageLocation];
    if (URL) {
        [self loadURL:URL];
        return YES;
    }
    
    return NO;
}

- (void)loadURL:(NSURL*)url {
    // In order to make use of the "modern" Cordova platform, while still
    // maintaining back-compat with Cordova iOS 3.9.0, we need to conditionally
    // use the WebViewEngine for performing navigations only if the host app
    // is running 4.0.0+, and fallback to directly using the WebView otherwise.
#ifdef __CORDOVA_4_0_0
    [self.webViewEngine loadRequest:[NSURLRequest requestWithURL:url]];
#else
    [(UIWebView*)self.webView loadRequest:[NSURLRequest requestWithURL:url]];
#endif
}

- (void)loadStoreVersion {
    NSString* mainBundlePath = [[NSBundle mainBundle] bundlePath];
    NSString* configStartPage = [self getConfigLaunchUrl];
    NSArray* realLocationArray = @[mainBundlePath, @"www", configStartPage];
    NSString* mainPageLocation = [NSString pathWithComponents:realLocationArray];
    if ([[NSFileManager defaultManager] fileExistsAtPath:mainPageLocation]) {
        NSURL* mainPagePath = [NSURL fileURLWithPath:mainPageLocation];
        [self loadURL:mainPagePath];
    }
}

//加载默认页面
- (void)loadDefaultURL:(CDVInvokedUrlCommand *)command  {
    CDVPluginResult* result;
    NSString* defaultStartPage = [command argumentAtIndex:0 withDefault:nil andClass:[NSString class]];
    if(defaultStartPage){
        NSURL* url=[NSURL fileURLWithPath:defaultStartPage];
        #ifdef __CORDOVA_4_0_0
            [self.webViewEngine loadRequest:[NSURLRequest requestWithURL:url]];
        #else
            [(UIWebView*)self.webView loadRequest:[NSURLRequest requestWithURL:url]];
        #endif
            result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:defaultStartPage];
            [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
    }
  
}


- (NSString*)getConfigLaunchUrl
{
    CDVConfigParser* delegate = [[CDVConfigParser alloc] init];
    NSString* configPath = [[NSBundle mainBundle] pathForResource:@"config" ofType:@"xml"];
    NSURL* configUrl = [NSURL fileURLWithPath:configPath];
    
    NSXMLParser* configParser = [[NSXMLParser alloc] initWithContentsOfURL:configUrl];
    [configParser setDelegate:((id < NSXMLParserDelegate >)delegate)];
    [configParser parse];
    
    return delegate.startPage;
}

- (NSURL *)getStartPageURLForLocalPackage:(NSString*)packageLocation {
    if (packageLocation) {
        NSString* startPage = [self getConfigLaunchUrl];
        NSString* libraryLocation = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0];
        NSArray* realLocationArray = @[libraryLocation, @"NoCloud", packageLocation, @"www", startPage];
        NSString* realStartPageLocation = [NSString pathWithComponents:realLocationArray];
        if ([[NSFileManager defaultManager] fileExistsAtPath:realStartPageLocation]) {
            return [NSURL fileURLWithPath:realStartPageLocation];
        }
    }
    
    return nil;
}

- (void)redirectStartPageToURL:(NSString*)packageLocation{
    NSURL* URL = [self getStartPageURLForLocalPackage:packageLocation];
    if (URL) {
        ((CDVViewController *)self.viewController).startPage = [URL absoluteString];
    }
}

- (void)isFailedUpdate:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* result;
    NSString* packageHash = [command argumentAtIndex:0 withDefault:nil andClass:[NSString class]];
    if (nil == packageHash) {
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Invalid package hash parameter."];
    }
    else {
        BOOL failedHash = [CodePushPackageManager isFailedHash:packageHash];
        result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:failedHash ? 1 : 0];
    }
    
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)isFirstRun:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* result;
    BOOL isFirstRun = NO;
    
    NSString* packageHash = [command argumentAtIndex:0 withDefault:nil andClass:[NSString class]];
    CodePushPackageMetadata* currentPackageMetadata = [CodePushPackageManager getCurrentPackageMetadata];
    if (currentPackageMetadata) {
        isFirstRun = (nil != packageHash
                      && [packageHash length] > 0
                      && [packageHash isEqualToString:currentPackageMetadata.packageHash]
                      && didUpdate);
    }
    
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:isFirstRun ? 1 : 0];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)isPendingUpdate:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* result;
    
    InstallOptions* pendingInstall = [CodePushPackageManager getPendingInstall];
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsInt:pendingInstall ? 1 : 0];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

- (void)getAppVersion:(CDVInvokedUrlCommand *)command {
    NSString* version = [Utilities getApplicationVersion];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:version];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

- (void)isDelOldPkg:(CDVInvokedUrlCommand *)command {
    CDVPluginResult* result;
    BOOL isDelOldPkg = [CodePushPackageManager isDelOldPkg];
    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsBool:isDelOldPkg];
    [CodePushPackageManager clearIsDelOldPkg];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

@end
