import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios"
import { requireUser } from "../middlewares/auth/require_user";
import crypto from 'crypto';

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

    const token = c.req.query('token');
    const amount = c.req.query('amount');

    if (!token) {
        return c.json({ result: 'Missing token or amount' });
    }

    let data = {
        "pidx": token,
        // "amount": 1300
    };

    let config = {
        headers: { 'Authorization': 'Key 67c1dcfe1c0a4b8db531c3f09a019cb3' },
        'Content-Type': 'application/json'
    };

    const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", data, config)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error);
        });

    return c.json({ result: response });
});

export default esewa;


