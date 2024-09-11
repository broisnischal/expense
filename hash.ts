import crypto from "node:crypto";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import qs from "qs";
import CryptoJS from "crypto-js";

const transactionUuid = uuidv4();
// const transactionUuid = '11-201-13'
console.log(transactionUuid);

const amount = 100;
export const secret = "8gBm/:&EnhH.1/q";

const signed_field_names = "total_amount,transaction_uuid,product_code";
const message = `total_amount=${amount + 10},transaction_uuid=${transactionUuid},product_code=EPAYTEST`;

console.log(message);

const hmac = CryptoJS.HmacSHA256(message, secret);
const signature = CryptoJS.enc.Base64.stringify(hmac);

console.log("Generated Signature:", signature);

const formData = {
  amount: `${amount}`,
  tax_amount: "10",
  total_amount: `${amount + 10}`,
  transaction_uuid: transactionUuid,
  product_code: "EPAYTEST",
  product_service_charge: "0",
  product_delivery_charge: "0",
  success_url: "http://localhost:8787/payment/verify",
  failure_url: "http://localhost:8787/payment/failed",
  signed_field_names: signed_field_names,
  signature: signature, // The generated HMAC signature
};

console.log(formData);

// Wrap the axios call in a try-catch block for better error handling
// try {
//   const response = await axios.post(
//     "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
//     qs.stringify(formData),
//     {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded",
//       },
//     }
//   );
//   console.log("Payment request sent successfully:", response.data);
// } catch (error) {
//   console.log(error);
// }



