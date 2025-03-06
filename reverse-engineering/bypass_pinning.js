setTimeout(function() {
    Java.perform(function() {
        console.log("[+] Bypassing SSL Pinning");
        
        var array_list = Java.use("java.util.ArrayList");
        var TrustManagerImpl = Java.use('com.android.org.conscrypt.TrustManagerImpl');
        
        // Bypass various certificate pinning implementations
        try {
            var X509TrustManager = Java.use('javax.net.ssl.X509TrustManager');
            var SSLContext = Java.use('javax.net.ssl.SSLContext');
            
            // TrustManager bypass
            var TrustManager = Java.registerClass({
                name: 'com.sslbypass.TrustManager',
                implements: [X509TrustManager],
                methods: {
                    checkClientTrusted: function(chain, authType) {},
                    checkServerTrusted: function(chain, authType) {},
                    getAcceptedIssuers: function() { return []; }
                }
            });
            
            // Create a new TrustManager instance
            var TrustManagers = [TrustManager.$new()];
            
            // Get the default SSLContext
            var SSLContext_init = SSLContext.init.overload(
                '[Ljavax.net.ssl.KeyManager;', 
                '[Ljavax.net.ssl.TrustManager;', 
                'java.security.SecureRandom'
            );
            
            // Initialize SSLContext with our custom TrustManager
            SSLContext_init.implementation = function(keyManager, trustManager, secureRandom) {
                console.log("[+] Bypassing TrustManager with custom implementation");
                SSLContext_init.call(this, keyManager, TrustManagers, secureRandom);
            };
            
            console.log("[+] TrustManager bypass successful");
        } catch (err) {
            console.log("[!] TrustManager bypass failed: " + err);
        }
        
        // OkHTTP Certificate Pinning Bypass
        try {
            var OkHttpClient = Java.use("okhttp3.OkHttpClient");
            var CertificatePinner = Java.use("okhttp3.CertificatePinner");
            
            CertificatePinner.check.overload('java.lang.String', '[Ljava.security.cert.Certificate;').implementation = function(hostname, certificates) {
                console.log("[+] OkHTTP CertificatePinner check bypassed for " + hostname);
                return;
            };
            
            console.log("[+] OkHTTP pinning bypass successful");
        } catch (err) {
            console.log("[!] OkHTTP pinning bypass failed: " + err);
        }
        
        // Trustkit Certificate Pinning Bypass
        try {
            var TrustKit = Java.use('com.datatheorem.android.trustkit.pinning.OkHostnameVerifier');
            TrustKit.verify.overload('java.lang.String', 'javax.net.ssl.SSLSession').implementation = function(hostname, session) {
                console.log("[+] TrustKit OkHostnameVerifier verify bypassed for " + hostname);
                return true;
            };
            
            console.log("[+] Trustkit pinning bypass successful");
        } catch (err) {
            console.log("[!] Trustkit pinning bypass failed: " + err);
        }
        
        // Appcelerator Titanium Bypass
        try {
            var PinningTrustManager = Java.use('appcelerator.https.PinningTrustManager');
            PinningTrustManager.checkServerTrusted.implementation = function(chain, authType) {
                console.log("[+] Appcelerator PinningTrustManager bypass successful");
                return;
            };
        } catch (err) {
            console.log("[!] Appcelerator pinning bypass failed: " + err);
        }
        
        console.log("[+] Certificate Pinning Bypass Completed");
    });
}, 1000);
