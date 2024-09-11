import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios"
import { requireUser } from "../middlewares/auth/require_user";
import crypto from 'crypto';
import CryptoJS from "crypto-js";

export const secret = "8gBm/:&EnhH.1/q";


// .use(requireUser)
const esewa = new Hono<Context>().post('/webhook', async (c) => {
    // verify the payment from the payment/success | payment/redirect route


    return c.json({ result: 'Payment done' });
}).get('/signature', async (c) => {

    const message = c.req.query('message');

    if (!message) {
        return c.json({ result: 'Missing message' });
    }

    const secret = 'secret';

    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(message);
    const hashInBase64 = hmac.digest('base64');


    return c.json({ result: hashInBase64 });


}).get("/", async (c) => {

    // const { payment } = c.env;


    return c.json({ result: "esewa" });
}).get('/verify', async (c) => {


    const token = c.req.query('data');

    if (!token) {
        return c.json({ result: 'Missing token' });
    }


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
        // TODO: update the payment status to success
        // TODO: update the payment details to the database

        return c.json({ result: 'Signature is valid' });
    } else {
        return c.json({ result: 'Signature is invalid' });
    }

});

export default esewa;


