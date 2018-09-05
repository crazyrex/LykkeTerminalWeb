import mockAuthApi from '../api/mocks/authApi';
import {RestApi} from './index';
import {ApiResponse} from './types';

export interface AuthApi {
  fetchBearerToken: (app: any, code: string, path: string) => ApiResponse;
}

export class RestAuthApi extends RestApi implements AuthApi {
  fetchBearerToken = (path: string, email: string, password: string) =>
    this.extendWithMocks(
      () =>
        this.post(path, {
          ClientInfo: '',
          Email: email,
          PartnerId: '',
          Password: password
        }),
      () => mockAuthApi.fetchBearerToken(path, email, password)
    );

  fetchToken = (accessToken: string) =>
    this.extendWithMocks(
      () =>
        this.wretcher()
          .url(process.env.REACT_APP_AUTH_URL!, true)
          .headers({
            Authorization: `Bearer ${accessToken}`,
            application_id: process.env.REACT_APP_ID
          })
          .url('/getlykkewallettoken')
          .get()
          .json(),
      () => mockAuthApi.fetchToken()
    );

  fetchUserInfo = () =>
    this.extendWithMocks(
      () => this.get('/client/userinfo'),
      () => mockAuthApi.fetchUserInfo()
    );

  signout = () =>
    this.extendWithMocks(
      () =>
        this.wretcher()
          .url(process.env.REACT_APP_AUTH_URL!, true)
          .url('/signout')
          .post()
          .res(),
      () => mockAuthApi.signout()
    );
}

export default RestAuthApi;
