import crypto from 'node:crypto';
import axios from 'axios'
import { v4 as uuidv4 } from 'uuid';
import qs from 'qs';


const transactionUuid = uuidv4();
// const transactionUuid = '11-201-13'
console.log(transactionUuid);

const amount = 100;
const secret = String('8gBm/:&EnhH.1/q');

const signedFields = 'total_amount,transaction_uuid,product_code';
const message = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=EPAYTEST`;

const hmac = crypto.createHmac('sha256', secret);
hmac.update(message);
const signature = hmac.digest('base64');

console.log('Generated Signature:', signature);




// Prepare the form data to be sent in x-www-form-urlencoded format
const formData = {
    amount: amount,
    tax_amount: '10',
    total_amount: amount + 10,
    transaction_uuid: transactionUuid,
    product_code: 'EPAYTEST',
    product_service_charge: '0',
    product_delivery_charge: '0',
    success_url: 'https://esewa.com.np',
    failure_url: 'https://google.com',
    signed_field_names: signedFields,
    signature: signature  // The generated HMAC signature
};

// Send the POST request to eSewa
axios.post('https://rc-epay.esewa.com.np/api/epay/main/v2/form', qs.stringify(formData), {
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
})
    .then(response => {
        console.log('Payment request sent successfully:', response.data);
    })
    .catch(error => {
        console.error('Error in sending payment request:', error.response.data);
    });