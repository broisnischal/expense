import CryptoJS from "crypto-js";

export const createSignature = (data: {
  amount: number;
  tax_amount: number;
  transaction_uuid: string;
  product_code: string;
}) => {
  const secret = "8gBm/:&EnhH.1/q";
  // total_amount,transaction_uuid,product_code
  const message = `total_amount=${
    data.amount + data.tax_amount
  },transaction_uuid=${data.transaction_uuid},product_code=${
    data.product_code
  }`;
  const hmac = CryptoJS.HmacSHA256(message, secret);
  const signature = CryptoJS.enc.Base64.stringify(hmac);
  return signature;
};
