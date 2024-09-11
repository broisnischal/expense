import { getOrderByOperators } from "drizzle-orm";
import { accounts } from "./schema/account";
import { categories, subCategories } from "./schema/category";
import { products } from "./schema/product";
import { transactions } from "./schema/transaction";
import { users } from "./schema/user";

export default {
    accounts,
    users,
    transactions,
    products,
    categories,
    subCategories,
};