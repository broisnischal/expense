import CryptoJS from "crypto-js";

export const createSignature = (data: {
  amount: number;
  transaction_uuid: string;
  product_code: string;
}) => {
  const secret = "8gBm/:&EnhH.1/q";
  const signed_field_names = "total_amount,transaction_uuid,product_code";
  const message = `total_amount=${data.amount + 10},transaction_uuid=${data.transaction_uuid},product_code=EPAYTEST`;
  const hmac = CryptoJS.HmacSHA256(message, secret);
  const signature = CryptoJS.enc.Base64.stringify(hmac);
  return signature;
};

