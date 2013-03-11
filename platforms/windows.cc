#include <node.h>
#include <v8.h>
#include <iostream>
#define MY_ENCODING_TYPE  (PKCS_7_ASN_ENCODING | X509_ASN_ENCODING)
#include <wincred.h>

using namespace v8;

Handle<Value> add(const Arguments& args) {
	HandleScope scope;
	
	std::string service(*(String::AsciiValue(args[0])));
	std::string username(*(String::AsciiValue(args[1])));
	String::AsciiValue asciipassword(args[2]);
	
	LPWSTR servicew = (LPWSTR) malloc(service.length()*sizeof(wchar_t));
	mbstowcs(servicew, service.c_str(), service.length()+1);//Plus null

	LPWSTR usernamew = (LPWSTR) malloc(username.length()*sizeof(wchar_t));
	mbstowcs(usernamew, username.c_str(), username.length()+1);//Plus null

    char* password = *asciipassword;
    DWORD cbCreds = 1 + strlen(password);

    CREDENTIALW cred = {0};
    cred.Type = CRED_TYPE_GENERIC;
	cred.TargetName = servicew;
    cred.CredentialBlobSize = cbCreds;
    cred.CredentialBlob = (LPBYTE) password;
    cred.Persist = CRED_PERSIST_LOCAL_MACHINE;
	cred.UserName = usernamew;

    BOOL ok = ::CredWriteW (&cred, 0);
    // wprintf (L"CredWrite() - errno %d\n", ok ? 0 : ::GetLastError());
	
	free(servicew);
	free(usernamew);
	
	if (ok) {
		return scope.Close(Boolean::New(1));
	} else {
		return scope.Close(Boolean::New(0));
	}
}

Handle<Value> get(const Arguments& args) {
	HandleScope scope;

	std::string service(*(String::AsciiValue(args[0])));
	
	LPWSTR servicew = (LPWSTR) malloc(service.length()*sizeof(wchar_t));
	mbstowcs(servicew, service.c_str(), service.length()+1);//Plus null

	PCREDENTIALW pcred;
	BOOL ok = ::CredReadW (servicew, CRED_TYPE_GENERIC, 0, &pcred);

	if (ok) {
		std::string ret((char *)pcred->CredentialBlob);
		::CredFree (pcred);

		free(servicew);
	
		return scope.Close(String::New(ret.c_str()));		
	} else {
		return scope.Close(Undefined());		
	}
}

Handle<Value> rem(const Arguments& args) {
	HandleScope scope;

	std::string service(*(String::AsciiValue(args[0])));
	
	LPWSTR servicew = (LPWSTR) malloc(service.length()*sizeof(wchar_t));
	mbstowcs(servicew, service.c_str(), service.length()+1);//Plus null

	BOOL ok = ::CredDeleteW (servicew, CRED_TYPE_GENERIC, 0);
	// wprintf (L"CredDelete() - errno %d\n", ok ? 0 : ::GetLastError());

	free(servicew);
	
	if (ok) {
		return scope.Close(Boolean::New(1));
	} else {
		return scope.Close(Boolean::New(0));
	}
}


void init(Handle<Object> target) {
	NODE_SET_METHOD(target, "add", add);
	NODE_SET_METHOD(target, "get", get);
	NODE_SET_METHOD(target, "rem", rem);	
}

NODE_MODULE(windows, init);
