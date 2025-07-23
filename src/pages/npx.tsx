import Layout from "../components/layout";
import { v4 as uuidv4 } from "uuid";
import { createSignature } from "../utils";
import { ProductType } from "../drizzle/schema/product";
import { KhaltiPaymentInitResponse } from "../api/khalti";

export default function Npx({}: {}) {
  const url = "https://api.nischal-dahal.com.np";

  return (
    <Layout>
      <div className="flex justify-center items-center flex-col w-full min-h-screen">
        <br />

        <h1 className="font-bold mb-6">Nepal Payment Solution</h1>

        <a>
          <button class={"border bg-blue-800 text-white rounded-xl px-10 py-2"}>
            Pay via NPX
          </button>
        </a>

        <pre></pre>
      </div>
    </Layout>
  );
}
