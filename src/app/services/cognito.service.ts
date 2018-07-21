import { Injectable } from '@angular/core';
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import * as CognitoIdentity from 'aws-sdk/clients/cognitoidentity';
import * as AWS from 'aws-sdk/global';
import * as awsservice from 'aws-sdk/lib/service';
import { environment } from '../../environments/environment';
import { Callback } from '../models/callback';

@Injectable({
  providedIn: 'root'
})
export class CognitoUtil {
  public static _REGION = environment.region;

  public static _IDENTITY_POOL_ID = environment.identityPoolId;
  public static _USER_POOL_ID = environment.userPoolId;
  public static _CLIENT_ID = environment.clientId;
  public static _ENDPOINT = environment.cognito_idp_endpoint;

  public static _POOL_DATA = {
    UserPoolId: CognitoUtil._USER_POOL_ID,
    ClientId: CognitoUtil._CLIENT_ID,
    Endpoint: CognitoUtil._ENDPOINT
  };

  public cognitoCreds: AWS.CognitoIdentityCredentials;

  constructor() {}

  getUserPool() {
    return new CognitoUserPool(CognitoUtil._POOL_DATA);
  }

  getCurrentUser() {
    return this.getUserPool().getCurrentUser();
  }

  // AWS Stores Credentials in many ways, and with TypeScript this means that
  // getting the base credentials we authenticated with from the AWS globals gets really murky,
  // having to get around both class extension and unions. Therefore, we're going to give
  // developers direct access to the raw, unadulterated CognitoIdentityCredentials
  // object at all times.
  setCognitoCreds(creds: AWS.CognitoIdentityCredentials) {
    this.cognitoCreds = creds;
  }

  getCognitoCreds() {
    return this.cognitoCreds;
  }

  // This method takes in a raw jwtToken and uses the global AWS config options to build a
  // CognitoIdentityCredentials object and store it for us. It also returns the object to the caller
  // to avoid unnecessary calls to setCognitoCreds.
  buildCognitoCreds(idTokenJwt: string) {
    let url = `cognito-idp.${CognitoUtil._REGION.toLowerCase()}.amazonaws.com/${
      CognitoUtil._USER_POOL_ID
    }`;

    if (environment.cognito_idp_endpoint) {
      url = `${environment.cognito_idp_endpoint}/${CognitoUtil._USER_POOL_ID}`;
    }
    const logins: CognitoIdentity.LoginsMap = {};
    logins[url] = idTokenJwt;
    const params = {
      IdentityPoolId: CognitoUtil._IDENTITY_POOL_ID /* required */,
      Logins: logins
    };
    const serviceConfigs: awsservice.ServiceConfigurationOptions = {};
    if (environment.cognito_identity_endpoint) {
      serviceConfigs.endpoint = environment.cognito_identity_endpoint;
    }
    const creds = new AWS.CognitoIdentityCredentials(params, serviceConfigs);
    this.setCognitoCreds(creds);

    return creds;
  }

  getCognitoIdentity(): string {
    return this.cognitoCreds.identityId;
  }

  getAccessToken(callback: Callback): void {
    if (callback === null) {
      throw new Error(
        'CognitoUtil: callback in getAccessToken is null...returning'
      );
    }
    if (this.getCurrentUser() !== null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoUtil: Can't set the credentials:${err}`);
          callback.callbackWithParam(undefined);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getAccessToken().getJwtToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(undefined);
    }
  }

  getIdToken(callback: Callback): void {
    if (callback === null) {
      throw new Error(
        'CognitoUtil: callback in getIdToken is null...returning'
      );
    }
    if (this.getCurrentUser() !== null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoUtil: Can't set the credentials:${err}`);
          callback.callbackWithParam(undefined);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getIdToken().getJwtToken());
          } else {
            console.log(
              "CognitoUtil: Got the id token, but the session isn't valid"
            );
          }
        }
      });
    } else {
      callback.callbackWithParam(undefined);
    }
  }

  getRefreshToken(callback: Callback): void {
    if (!callback) {
      throw new Error(
        'CognitoUtil: callback in getRefreshToken is null...returning'
      );
    }
    if (this.getCurrentUser() !== null) {
      this.getCurrentUser().getSession((err, session) => {
        if (err) {
          console.log(`CognitoUtil: Can't set the credentials:${err}`);
          callback.callbackWithParam(undefined);
        } else {
          if (session.isValid()) {
            callback.callbackWithParam(session.getRefreshToken());
          }
        }
      });
    } else {
      callback.callbackWithParam(undefined);
    }
  }

  refresh(): void {
    this.getCurrentUser().getSession((err, session) => {
      if (err) {
        console.log(`CognitoUtil: Can't set the credentials:${err}`);
      } else {
        if (session.isValid()) {
          console.log('CognitoUtil: refreshed successfully');
        } else {
          console.log('CognitoUtil: refreshed but session is still not valid');
        }
      }
    });
  }
}
