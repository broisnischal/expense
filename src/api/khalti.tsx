import { Hono } from "hono";
import { Context } from "../context";
import axios from "axios";
import { requireUser } from "../middlewares/auth/require_user";
import Layout from "../components/layout";
import Khalti from "../pages/khalti";
import { drizzle } from "drizzle-orm/d1";
import schema from "../drizzle";

const secret_key = "Key 05bf95cc57244045b8df5fad06748dab";

type KhaltiStatus =
  | "Completed"
  | "Pending"
  | "Initiated"
  | "Refunded"
  | "Expired"
  | "User canceled";

export interface KhaltiPaymentResponse {
  pidx: string;
  total_amount: number;
  status: KhaltiStatus;
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

export interface KhaltiPaymentInitResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
  go_link: string;
}

export interface KhaltiPaymentLookupResponse {
  pidx: string;
  total_amount: number;
  status: KhaltiStatus;
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

// .use(requireUser)
const khalti = new Hono<Context>()
  .post("/webhook", async (c) => {
    // verify the payment from the payment/success | payment/redirect route

    return c.json({ result: "Payment done" });
  })
  .get("/", async (c) => {
    const url = "https://api.nischal-dahal.com.np";

    const db = drizzle(c.env.DB);

    const [p1] = await db.select().from(schema.products);

    const amount_in_paisa = p1.price * 100;

    const options = {
      method: "POST",
      url: "https://a.khalti.com/api/v2/epayment/initiate/",
      headers: {
        Authorization: secret_key,
        "Content-Type": "application/json",
      },
      data: {
        return_url: `${url}/khalti/verify`,
        website_url: url,
        amount: amount_in_paisa,
        purchase_order_id: "Ordwer01",
        purchase_order_name: p1.name,
        customer_info: {
          name: "Nischal Dahal",
          email: "ping@nischal.pro",
          phone: "9800000001",
        },
      },
    };

    const response = await axios.request<KhaltiPaymentInitResponse>(options);

    console.log(response.data);

    // return c.json({ result: response.data });
    return c.html(
      <Layout>
        <Khalti data={response.data} />
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

    const lookup = await axios.post<KhaltiPaymentResponse>(
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
      .post<KhaltiPaymentLookupResponse>(
        "https://a.khalti.com/api/v2/epayment/lookup/",
        data,
        config
      )
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
export default khalti;
