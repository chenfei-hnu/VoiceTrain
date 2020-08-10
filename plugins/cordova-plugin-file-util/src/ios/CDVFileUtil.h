
#import <Cordova/CDVPlugin.h>
#import <Foundation/Foundation.h>

#define errorList @{ @"0": @"Execution Error", @"1": @"Unknown Algorithm", @"2": @"File not found", @"3": @"File access error", @"4": @"Digest error" }

@interface CDVFileUtil : CDVPlugin

- (void)md2:(CDVInvokedUrlCommand*)command;
- (void)md5:(CDVInvokedUrlCommand*)command;
- (void)sha1:(CDVInvokedUrlCommand*)command;
- (void)sha256:(CDVInvokedUrlCommand*)command;
- (void)sha384:(CDVInvokedUrlCommand*)command;
- (void)sha512:(CDVInvokedUrlCommand*)command;
- (void)base64_crc32:(CDVInvokedUrlCommand*)command;
- (void)getFileLength:(CDVInvokedUrlCommand*)command;
- (void)createFile:(CDVInvokedUrlCommand*)command;
@end

@interface NSData (CRC32)

-(NSString *) crc32;

@end