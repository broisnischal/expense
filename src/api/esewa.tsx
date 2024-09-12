import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios";
import { requireUser } from "../middlewares/auth/require_user";
import crypto from "crypto";
import ESewa from "../pages/esewa";
import qs from "qs";

import schema from "../drizzle";
import CryptoJS from "crypto-js";
import { drizzle } from "drizzle-orm/d1";
import Layout from "../components/layout";

export const secret = "8gBm/:&EnhH.1/q";

// .use(requireUser)
const esewa = new Hono<Context>()
  .post("/webhook", async (c) => {
    // verify the payment from the payment/success | payment/redirect route

    return c.json({ result: "Payment done" });
  })
  .get("/products", async (c) => {
    const db = drizzle(c.env.DB);
    const products = await db.select().from(schema.products).all();

    // await new Promise((resolve) => setTimeout(resolve, 1000));

    return c.json(products);
  })
  .get("/failure", (c) =>
    c.html(
      <Layout>
        <h1>Payment Failed</h1>
        <br />
        <p>Please try again</p>
      </Layout>
    )
  )
  .get("/", async (c) => {
    const db = drizzle(c.env.DB);
    const [products] = await db.select().from(schema.products).limit(1);

    return c.html(<ESewa products={products} />);
  })
  .post("/pay", async (c) => {
    const value = await c.req.parseBody();

    console.log(value);

    // const formData = {
    //   amount: `${amount}`,
    //   tax_amount: "10",
    //   total_amount: `${amount + 10}`,
    //   transaction_uuid: transactionUuid,
    //   product_code: "EPAYTEST",
    //   product_service_charge: "0",
    //   product_delivery_charge: "0",
    //   success_url: "http://localhost:8787/payment/verify",
    //   failure_url: "http://localhost:8787/payment/failed",
    //   signed_field_names: signed_field_names,
    //   signature: signature, // The generated HMAC signature
    // };

    // console.log(formData);

    // Wrap the axios call in a try-catch block for better error handling
    try {
      const response = await axios.post(
        "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
        qs.stringify(value),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("Payment request sent successfully:", response.data);

      return c.render(response.data);
    } catch (error) {
      console.log(error);
      return c.json({ result: "Payment request failed" });
    }
  })
  .get("/verify", async (c) => {
    const token = c.req.query("data");

    if (!token) {
      return c.json({ result: "Missing token" });
    }

    const decodedData = Buffer.from(token, "base64").toString("utf-8");

    const data = JSON.parse(decodedData);

    console.log(data);
    console.log("data");

    const signedfieldnames = data.signed_field_names.split(",");

    console.log(signedfieldnames);

    const message = signedfieldnames
      .map((field: string) => `${field}=${data[field]}`)
      .join(",");

    console.log(message);

    const hmac = CryptoJS.HmacSHA256(message, secret);

    const signature = CryptoJS.enc.Base64.stringify(hmac);

    if (signature === data.signature) {
      // TODO: update the payment status to success
      // TODO: update the payment details to the database
      // return c.json({
      //   result: `Payment with transaction_id ${data.transaction_uuid} is ${data.status}`,
      // });
      // return c.redirect("/payment/success");

      return c.html(
        <Layout>
          <div
            class={
              "flex justify-center items-center flex-col w-full min-h-screen"
            }
          >
            <h1 class={"text-2xl font-bold mb-6 text-green-500"}>
              Payment Success
            </h1>
            <span>Transaction id is {data.transaction_uuid}</span>
            <span>Status {data.status}</span>
          </div>
        </Layout>
      );
    } else {
      return c.json({ result: "Signature is invalid" });
    }
  });

export default esewa;
