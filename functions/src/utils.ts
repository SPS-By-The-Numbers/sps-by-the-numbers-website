import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";

import type { ApiResponse } from 'common/response';

// Functions copied from transcripts firebase function utilities.
// Set up unique project id for these tests so they can't hit anything real.
export const TEST_PROJECT_ID = 'fakeproject';

// Be sure to use 127.0.0.1 instead of localhost to avoid binding the ipv6 ::1
export const EMULATOR_ENDPOINT_ROOT = 'http://127.0.0.1:5001/sps-by-the-numbers/us-west1';

export const FAKE_USER_ID = 'fakeuser';
export const FAKE_AUTH_CODE = 'fake_auth';

let processInitialized = false;

export function initializeFirebaseTesting() {
  if (!processInitialized) {
    // Initialize test database
    process.env.GCLOUD_PROJECT = TEST_PROJECT_ID;
    process.env.FIREBASE_DATABASE_EMULATOR_HOST="127.0.0.1:9000"
    initializeApp({
        projectId : TEST_PROJECT_ID,
        databaseURL: `http://127.0.0.1:9000/?ns=${TEST_PROJECT_ID}-default-rtdb`,
        storageBucket: `${TEST_PROJECT_ID}.appspot.com`,
    });
    processInitialized = true;
  }
}

function logReqRes(logFunc, header, req, res) {
  logFunc(header, 'URL: ', req.originalUrl,
          'Params: ', req.params,
          'Body: ', req.body,
          'Response Status: ', res.statusCode);
}

export function jsonOnRequest(options : object, func) {
  return onRequest(options, async (req, res) => {
    try {
      return await func(req, res);
    } catch (e) {
      console.error("Exception: ", e);
      return res.status(500).send(makeResponseJson(false, "Exception"));
    } finally {
      const statusType = Math.trunc(res.statusCode/100);
      if (statusType === 2) {
        logReqRes(console.log, 'Success ', req, res);
      } else if (statusType === 4) {
        logReqRes(console.warn, 'Client error ', req, res);
      } else {
        logReqRes(console.error, 'Internal error ', req, res);
      }
    }
  });
}

export function makeResponseJson(ok, message, data = {}) : ApiResponse {
  return {ok, message, data};
}
