import { initializeApp } from "firebase-admin/app";
import { initializeFirebaseTesting } from "./utils";

export { finance } from './finance';
export { bigsheet } from './bigsheet';

if (process.env.SPSBTN_FIREBASE_TESTING === "1") {
  initializeFirebaseTesting();
} else {
  initializeApp({});
}
