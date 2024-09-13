import Layout from "../components/layout";
import { v4 as uuidv4 } from "uuid";
import { createSignature } from "../utils";
import { ProductType } from "../drizzle/schema/product";
import { KhaltiPaymentInitResponse } from "../api/khalti";

export default function Khalti({ data }: { data: KhaltiPaymentInitResponse }) {
  const url = "https://api.nischal-dahal.com.np";

  return (
    <Layout>
      <div className="flex justify-center items-center flex-col w-full min-h-screen">
        <br />

        <h1 className="font-bold mb-6">Hello, Khalti Web Checkout!</h1>

        <a href={data.go_link}>
          <button class={"border bg-purple-800 text-white rounded px-3 py-2"}>
            Pay via khalti
          </button>
        </a>

        <pre>
          {JSON.stringify(
            {
              return_url: `${url}/khalti/verify`,
              website_url: url,
              amount: 1000,
              purchase_order_id: "order1",
              purchase_order_name: "Macbook",
              customer_info: {
                name: "Nischal Dahal",
                email: "ping@nischal.pro",
                phone: "9800000001",
              },
            },
            null,
            2
          )}
        </pre>
      </div>
    </Layout>
  );
}
