import Layout from "../components/layout";
import { v4 as uuidv4 } from "uuid";
import { createSignature } from "../utils";
import { ProductType } from "../drizzle/schema/product";

export default function Esewa({ products }: { products: ProductType }) {
  const url = "https://api.nischal-dahal.com.np";

  const transactionUuid = uuidv4();
  const signature = createSignature({
    amount: products.price,
    tax_amount: Math.floor(products.price * 0.1),
    transaction_uuid: transactionUuid,
    product_code: "EPAYTEST",
  });

  return (
    <Layout>
      <div className="flex justify-center items-center flex-col w-full min-h-screen">
        <br />
        <h1 className="text-2xl font-bold mb-6 text-green-500">
          Payment With Esewa
        </h1>

        <form
          className="flex flex-col gap-4 w-full max-w-md"
          action="https://rc-epay.esewa.com.np/api/epay/main/v2/form"
          method="post"
        >
          <div className="flex gap-4">
            <label htmlFor="product-name">Name</label>
            <h1 id="product-name">{products.name}</h1>
          </div>
          <div className=" flex flex-col">
            <label
              htmlFor="transaction_uuid"
              className="text-sm font-medium mb-1"
            >
              Transaction UUID
            </label>
            <input
              id="transaction_uuid"
              name="transaction_uuid"
              value={transactionUuid}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="amount" className="text-sm font-medium mb-1">
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              value={products.price}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="tax_amount" className="text-sm font-medium mb-1">
              Tax Amount
            </label>
            <input
              id="tax_amount"
              name="tax_amount"
              value={10}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="total_amount" className="text-sm font-medium mb-1">
              Total Amount
            </label>
            <input
              id="total_amount"
              name="total_amount"
              value={110}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex hidden flex-col">
            <label htmlFor="product_code" className="text-sm font-medium mb-1">
              Product Code
            </label>
            <input
              id="product_code"
              name="product_code"
              value="EPAYTEST"
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className=" hidden flex-col">
            <label
              htmlFor="product_service_charge"
              className="text-sm font-medium mb-1"
            >
              Product Service Charge
            </label>
            <input
              id="product_service_charge"
              name="product_service_charge"
              value={0}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="hidden flex flex-col">
            <label
              htmlFor="product_delivery_charge"
              className="text-sm font-medium mb-1"
            >
              Product Delivery Charge
            </label>
            <input
              id="product_delivery_charge"
              name="product_delivery_charge"
              value={0}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="success_url" className="text-sm font-medium mb-1">
              Success URL
            </label>
            <input
              id="success_url"
              name="success_url"
              value={`${url}/esewa/verify`}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="failure_url" className="text-sm font-medium mb-1">
              Failure URL
            </label>
            <input
              id="failure_url"
              name="failure_url"
              value={`${url}/esewa/failure`}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label
              htmlFor="signed_field_names"
              className="text-sm font-medium mb-1"
            >
              Signed Field Names
            </label>
            <input
              id="signed_field_names"
              name="signed_field_names"
              value="total_amount,transaction_uuid,product_code"
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="signature" className="text-sm font-medium mb-1">
              Signature
            </label>
            <input
              id="signature"
              name="signature"
              value={signature}
              readOnly
              className="border rounded px-3 py-2 bg-gray-100"
            />
          </div>
          <button
            type="submit"
            className="bg-green-500 text-white font-semibold py-2 px-4 rounded hover:bg-green-600 transition-colors"
          >
            Submit Payment
          </button>

          <div id="result"></div>
        </form>
      </div>
      <script type="text/template" id="product-template"></script>
    </Layout>
  );
}
