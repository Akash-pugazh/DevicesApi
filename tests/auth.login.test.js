import { describe, it } from 'node:test';
import assert from 'node:assert';
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://localhost:3000/auth/login'
});

const LOGIN_TEST_DATA = {
  NotFoundUser: { email: 'aakashit13@gmail.com', password: 'password' },
  InvalidPassword: { email: 'admin@admin.com', password: '12345678' },
  LoginSuccess: { email: 'admin@admin.com', password: 'password' },
  CaseInsensitiveEmail: { email: 'ADMIN@admin.com', password: 'password' },
  InvalidEmailFormat: { email: '@da@f.com_', password: 'password' },
  MissingFields: { password: 'password' }
};

const LogHelpers = {
  errorExpectedCb() {
    assert.fail('Expected error, but no error was thrown');
  },
  noErrorExpectedCb() {
    assert.fail('Expected no error, but an error was thrown');
  }
};

function successScenariosHelper({ testData, expectedStatus, expectedMessage }) {
  axiosInstance
    .post('/', testData)
    .catch(LogHelpers.noErrorExpectedCb)
    .then(response => {
      assert.strictEqual(response.status, 200, `Expected status code ${expectedStatus}`);
      assert.strictEqual(response.data.message, expectedMessage);
    });
}

function failureScenariosHelper({ testData, expectedStatus, expectedMessage }) {
  axiosInstance
    .post('/', testData)
    .then(LogHelpers.errorExpectedCb)
    .catch(err => {
      assert.strictEqual(err.response.status, expectedStatus, `Expected status code ${expectedStatus}`);
      assert.strictEqual(err.response.data.message, expectedMessage);
    });
}

describe('POSITIVE LOGIN CASES', () => {
  it('Login Success', () =>
    successScenariosHelper({
      testData: LOGIN_TEST_DATA.LoginSuccess,
      expectedStatus: 200,
      expectedMessage: 'Logged In'
    }));

  it('Case Insensitive Email', () =>
    successScenariosHelper({
      testData: LOGIN_TEST_DATA.CaseInsensitiveEmail,
      expectedStatus: 200,
      expectedMessage: 'Logged In'
    }));
});

describe('NEGATIVE LOGIN CASES', () => {
  it('Invalid Email Format', () =>
    failureScenariosHelper({
      testData: LOGIN_TEST_DATA.InvalidEmailFormat,
      expectedStatus: 400,
      expectedMessage: 'Input Validation Error'
    }));

  it('User Not Found', () =>
    failureScenariosHelper({
      testData: LOGIN_TEST_DATA.NotFoundUser,
      expectedStatus: 404,
      expectedMessage: 'User Not Found'
    }));

  it('Password Invalid', () =>
    failureScenariosHelper({
      testData: LOGIN_TEST_DATA.InvalidPassword,
      expectedStatus: 400,
      expectedMessage: 'Invalid Password'
    }));

  it('Missing Fields', () =>
    failureScenariosHelper({
      testData: LOGIN_TEST_DATA.MissingFields,
      expectedStatus: 400,
      expectedMessage: 'Input Validation Error'
    }));
});
