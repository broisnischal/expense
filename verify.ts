import { secret } from "./hash";
import CryptoJS from "crypto-js";

const token = "eyJ0cmFuc2FjdGlvbl9jb2RlIjoiMDAwOE1INyIsInN0YXR1cyI6IkNPTVBMRVRFIiwidG90YWxfYW1vdW50IjoiMTEwLjAiLCJ0cmFuc2FjdGlvbl91dWlkIjoiMWFjNDc5MTktMjMwYi00NmJjLTk0NzItNzgzZTJhNmU0OTkzIiwicHJvZHVjdF9jb2RlIjoiRVBBWVRFU1QiLCJzaWduZWRfZmllbGRfbmFtZXMiOiJ0cmFuc2FjdGlvbl9jb2RlLHN0YXR1cyx0b3RhbF9hbW91bnQsdHJhbnNhY3Rpb25fdXVpZCxwcm9kdWN0X2NvZGUsc2lnbmVkX2ZpZWxkX25hbWVzIiwic2lnbmF0dXJlIjoiNitCME9yL2F1alMxUmpMdDlJWUVITE9QSHNHcVRTUzdqODZZSWZkbHQwdz0ifQ=="

const decodedData = Buffer.from(token, 'base64').toString('utf-8');

const data = JSON.parse(decodedData);

console.log(data);
console.log("data")

const signedfieldnames = data.signed_field_names.split(',');

console.log(signedfieldnames);

const message = signedfieldnames.map((field: string) => `${field}=${data[field]}`).join(',');

console.log(message);

const hmac = CryptoJS.HmacSHA256(message, secret);

const signature = CryptoJS.enc.Base64.stringify(hmac);


if (signature === data.signature) {
    console.log("Signature is valid");
} else {
    console.log("Signature is invalid");
}