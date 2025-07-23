import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios";
import { requireUser } from "../middlewares/auth/require_user";
import Layout from "../components/layout";
import Khalti from "../pages/khalti";
import { drizzle } from "drizzle-orm/d1";
import schema from "../drizzle";
import Npx from "../pages/npx";
import { up } from "up-fetch";
import { generateHMAC512 } from "../utils";

const secret_key = "Key 05bf95cc57244045b8df5fad06748dab";

export const upfetch = up(fetch);

// .use(requireUser)
const npx = new Hono<Context>()
  .post("/webhook", async (c) => {
    // verify the payment from the payment/success | payment/redirect route

    return c.json({ result: "Payment done" });
  })
  .get("/", async (c) => {
    const url = "https://api.nischal-dahal.com.np";

    // const db = drizzle(c.env.DB);

    // const [p1] = await db.select().from(schema.products);

    // const amount_in_paisa = p1.price * 100;

    const username = "demo";
    const password = "p@55w0rd";
    const credentials = btoa(`${username}:${password}`);

    const authHeader = `Basic ${credentials}`;
    const MerchantId = "9",
      MerchantName = "TestMerchant";

    const signature = generateHMAC512(MerchantId + MerchantName, "SecretKey");

    console.log(authHeader);
    console.log(signature);

    const response = await upfetch(
      "https://apisandbox.nepalpayment.com/GetPaymentInstrumentDetails",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: {
          MerchantId,
          MerchantName,
          Signature: signature,
        },
      }
    );

    console.log(response);

    // return c.json({ result: response.data });
    return c.html(
      <Layout>
        <Npx />
      </Layout>
    );
  })
  .get("/verify", async (c) => {
    const pidx = c.req.query("pidx");

    const transaction_id = c.req.query("transaction_id");
    const tidx = c.req.query("tidx");
    const amount = c.req.query("amount");
    const total_amount = c.req.query("total_amount");
    const mobile = c.req.query("mobile");
    const status = c.req.query("status");
    const purchase_order_id = c.req.query("purchase_order_id");

    // demo for getting all useful parameter so that you can save in db

    const lookup = await axios.post(
      "https://a.khalti.com/api/v2/epayment/lookup/",
      {
        pidx: pidx,
      },
      {
        headers: {
          Authorization: secret_key,
          "Content-Type": "application/json",
        },
      }
    );

    if (lookup.data.status != "Completed") {
      return c.json({ result: "Payment not completed" });
    }

    // create a payment record, save data, update status

    return c.html(
      <Layout>
        <div className="flex justify-center items-center flex-col min-h-screen">
          <h1>Payment {lookup.data.status}</h1>
          <pre>{JSON.stringify(lookup.data, null, 2)}</pre>
        </div>
      </Layout>
    );
  })
  .get("/lookup", async (c) => {
    const token = c.req.query("token");

    if (!token) {
      return c.json({ result: "Missing token" });
    }

    let data = {
      pidx: token,
    };

    let config = {
      headers: { Authorization: secret_key },
      "Content-Type": "application/json",
    };

    const response = await axios
      .post("https://a.khalti.com/api/v2/epayment/lookup/", data, config)
      .then((response) => {
        console.log(response.data);
        return response.data;
      })
      .catch((error) => {
        console.error("Error in Khalti lookup:", error);
        // throw error;
        return c.json({ result: "you suck!" });
      });

    return c.json({ result: response });
  });
export default npx;
