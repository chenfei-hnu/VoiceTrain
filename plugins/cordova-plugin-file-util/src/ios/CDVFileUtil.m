#import <Cordova/CDV.h>
#import <Foundation/Foundation.h>
#import <CommonCrypto/CommonDigest.h>
#import "CDVFileUtil.h"

@interface CDVFileUtil () {}
@end


@implementation CDVFileUtil

- (void)md2:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_MD2_DIGEST_LENGTH];
				CC_MD2( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD2_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_MD2_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"MD2", @"result": output };
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void)md5:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
                NSNumber *size = [dic objectForKey:NSFileSize];
				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_MD5_DIGEST_LENGTH];
				CC_MD5( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_MD5_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"MD5", @"result": output,@"size":size };
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void)sha1:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
                NSNumber *size = [dic objectForKey:NSFileSize];

				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_SHA1_DIGEST_LENGTH];
				CC_SHA1( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA1_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_SHA1_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"SHA-1", @"result": output ,@"size":size};
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void)sha256:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
                NSNumber *size = [dic objectForKey:NSFileSize];

				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_SHA256_DIGEST_LENGTH];
				CC_SHA256( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA256_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_SHA256_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"SHA-256", @"result": output,@"size":size };
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void)sha384:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
                NSNumber *size = [dic objectForKey:NSFileSize];
				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_SHA384_DIGEST_LENGTH];
				CC_SHA384( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA384_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_SHA384_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"SHA-384", @"result": output ,@"size":size};
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void)sha512:(CDVInvokedUrlCommand*)command {
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;

	@try {
		NSFileManager *fileManager = [NSFileManager defaultManager];
		if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
		{
			if( [fileManager isReadableFileAtPath:FileURL] )
			{
				NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
                NSNumber *size = [dic objectForKey:NSFileSize];
				NSData *data = [NSData dataWithContentsOfFile:FileURL]; unsigned char digest[CC_SHA512_DIGEST_LENGTH];
				CC_SHA512( data.bytes, (CC_LONG)data.length, digest ); NSMutableString *output = [NSMutableString stringWithCapacity:CC_SHA512_DIGEST_LENGTH * 2];
		 
				for( int i = 0; i < CC_SHA512_DIGEST_LENGTH; i++ ) { [output appendFormat:@"%02x", digest[i]]; }
		 
				NSDictionary* hashProperties = @{ @"file": FileURL, @"algo": @"SHA-512", @"result": output,@"size": size };
				pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
			}
			else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
		}
		else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
	}
	@catch (NSException * e) {
		NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
		if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
		if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
		pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
		}

    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
	}

- (void) base64_crc32:(CDVInvokedUrlCommand*)command{
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    NSNumber *start=[command argumentAtIndex:1];
    NSNumber *end=[command argumentAtIndex:2];
    CDVPluginResult* pluginResult = nil;
    
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
        {
            if( [fileManager isReadableFileAtPath:FileURL] )
            {
                NSFileHandle* file = [NSFileHandle fileHandleForReadingAtPath:FileURL];
                if (start > 0) {
                    [file seekToFileOffset:[start longLongValue]];
                }
                
                NSData* readData;
                if (end < 0) {
                    readData = [file readDataToEndOfFile];
                } else {
                    readData = [file readDataOfLength:[end longLongValue] - [start longLongValue]];
                }
                [file closeFile];
                NSData *base64Data = [readData base64EncodedDataWithOptions:0];
                NSString *base64= [[NSString alloc] initWithData:base64Data encoding:NSUTF8StringEncoding];
                NSString *crc32 = [readData crc32];
                
                
                NSDictionary* hashProperties = @{ @"file": FileURL,  @"base64": base64, @"crc32": crc32 };
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
            }
            else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
        }
        else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
    }
    @catch (NSException * e) {
        NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:[e description]]};
        if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
        if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

//获取文件大小
- (void)getFileLength:(CDVInvokedUrlCommand*)command{
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    CDVPluginResult* pluginResult = nil;
    
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
        {
            if( [fileManager isReadableFileAtPath:FileURL] )
            {
                NSDictionary *dic = [fileManager attributesOfItemAtPath:FileURL error:nil];
               NSNumber *size = [dic objectForKey:NSFileSize];
               // NSInteger size = number.intValue;
                NSLog(@"文件大小%@", size);
                NSDictionary* hashProperties = @{ @"file": FileURL,  @"size": size };
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
            }
            else { NSException* execp = [NSException exceptionWithName:@"NoFileAccess" reason:@"_-_" userInfo:nil]; @throw execp; }
        }
        else { NSException* execp = [NSException exceptionWithName:@"FileNotFound" reason:@"_-_" userInfo:nil]; @throw execp; }
    }
    @catch (NSException * e) {
        NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
        if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
        if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

//获取文件大小
- (void)createFile:(CDVInvokedUrlCommand*)command{
    NSString* FileURL = [[[[command argumentAtIndex:0] stringByReplacingOccurrencesOfString:@"file:///" withString:@"/"] stringByReplacingOccurrencesOfString:@"+" withString:@" "] stringByRemovingPercentEncoding];
    BOOL isReplace=[command argumentAtIndex:1];
	CDVPluginResult* pluginResult = nil;
    
    @try {
        NSFileManager *fileManager = [NSFileManager defaultManager];
        if( [fileManager fileExistsAtPath:FileURL isDirectory:nil] )
        {
            if(isReplace){
                [fileManager removeItemAtPath:FileURL error:nil];
                BOOL isSuccess=[fileManager createFileAtPath:FileURL contents:nil attributes:nil];
                NSDictionary* hashProperties = @{ @"file": FileURL,  @"success": @(isSuccess) };
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
            }else{
                NSDictionary* hashProperties = @{ @"file": FileURL,  @"success": @TRUE };
                pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
            }
        }else {
            BOOL isSuccess=[fileManager createFileAtPath:FileURL contents:nil attributes:nil];
            NSDictionary* hashProperties = @{ @"file": FileURL,  @"success": @(isSuccess) };
            pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:hashProperties];
        }
    }
    @catch (NSException * e) {
        NSDictionary* errorProperties = @{ @"code": [NSNumber numberWithInt:4], @"message":[errorList valueForKey:@"4"]};
        if([[e name] isEqualToString:@"FileNotFound"]){errorProperties = @{ @"code": [NSNumber numberWithInt:2], @"message": [errorList valueForKey:@"2"]};}
        if([[e name] isEqualToString:@"NoFileAccess"]){errorProperties = @{ @"code": [NSNumber numberWithInt:3], @"message": [errorList valueForKey:@"3"]};}
        pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsDictionary:errorProperties];
    }
    
    [self.commandDelegate sendPluginResult:pluginResult callbackId:command.callbackId];
}

@end



@implementation NSData (CRC32)

-(NSString *)crc32
{
    uint32_t *table = malloc(sizeof(uint32_t) * 256);
    uint32_t crc = 0xffffffff;
    uint8_t *bytes = (uint8_t *)[self bytes];
    
    for (uint32_t i=0; i<256; i++) {
        table[i] = i;
        for (int j=0; j<8; j++) {
            if (table[i] & 1) {
                table[i] = (table[i] >>= 1) ^ 0xedb88320;
            } else {
                table[i] >>= 1;
            }
        }
    }
    
    for (int i=0; i<self.length; i++) {
        crc = (crc >> 8) ^ table[(crc & 0xff) ^ bytes[i]];
    }
    crc ^= 0xffffffff;
    
    free(table);
    NSString *nLetterValue;
    NSString *crcStr =@"";
    long long int ttmpig;
    for (int i = 0; i<9; i++) {
        ttmpig=crc%16;
        crc=crc/16;
        switch (ttmpig)
        {
            case 10:
                nLetterValue =@"a";break;
            case 11:
                nLetterValue =@"b";break;
            case 12:
                nLetterValue =@"c";break;
            case 13:
                nLetterValue =@"d";break;
            case 14:
                nLetterValue =@"e";break;
            case 15:
                nLetterValue =@"f";break;
            default:nLetterValue=[[NSString alloc]initWithFormat:@"%lli",ttmpig];
                
        }
        crcStr = [nLetterValue stringByAppendingString:crcStr];
        if (crc == 0) {
            break;
        }
        
    }
    return crcStr;
}

@end



