import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios"
import { requireUser } from "../middlewares/auth/require_user";


// .use(requireUser)
const khalti = new Hono<Context>().post('/webhook', async (c) => {
    // verify the payment from the payment/success | payment/redirect route


    return c.json({ result: 'Payment done' });
}).get("/", async (c) => {

    // const { payment } = c.env;

    const options = {
        method: 'POST',
        url: 'https://a.khalti.com/api/v2/epayment/initiate/',
        headers: {
            Authorization: 'key 67c1dcfe1c0a4b8db531c3f09a019cb3',
            'Content-Type': 'application/json'
        },
        data: {
            return_url: 'http://localhost:8787/payment/verify',
            website_url: 'http://localhost:8787',
            amount: '1300',
            purchase_order_id: 'Order01',
            purchase_order_name: 'test',
            customer_info: {
                name: 'Testing Payment',
                email: 'test@khalti.com',
                phone: '9800000001'
            },
            "product_details": [
                {
                    "identity": "1234567890",
                    "name": "Khalti logo",
                    "total_price": 1300,
                    "quantity": 1,
                    "unit_price": 1300
                }
            ],
            merchant_name: 'Nischal'
        }
    };

    const response = await axios.request(options);

    return c.json({ result: response.data });
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

export default khalti;