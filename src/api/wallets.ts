import { ClientResponse } from "../lib/Response";
import { validateSession } from "../lib/auth";
import { createWallet, getWalletsByUserId } from "../lib/db";
import { validateWalletName, validateWalletUrl, validateCurrencyCode, validateAmount } from "../lib/validation";

export async function listWallets(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);
    if (!user) return ClientResponse.json({ error: "Invalid session" }, { status: 401 });

    const wallets = await getWalletsByUserId(user.id);
    return ClientResponse.json({ wallets });

  } catch (error) {
    console.error("List wallets error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function createWalletEndpoint(req: Request) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
        return ClientResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const user = await validateSession(token);
    if (!user) return ClientResponse.json({ error: "Invalid session" }, { status: 401 });

    const body = await req.json();
    const { name, wallet_url, currency_code, initial_amount, is_primary } = body;

    // Validation
    const nameVal = validateWalletName(name);
    if (!nameVal.valid) return ClientResponse.json({ error: nameVal.error }, { status: 400 });

    const urlVal = validateWalletUrl(wallet_url);
    if (!urlVal.valid) return ClientResponse.json({ error: urlVal.error }, { status: 400 });

    if (!validateCurrencyCode(currency_code)) {
        return ClientResponse.json({ error: "Invalid currency code" }, { status: 400 });
    }

    if (initial_amount) {
        const amountVal = validateAmount(initial_amount);
        if (!amountVal.valid) return ClientResponse.json({ error: amountVal.error }, { status: 400 });
    }

    const wallet = await createWallet({
        user_id: user.id,
        name,
        wallet_url,
        currency_code,
        current_balance: initial_amount ? parseFloat(initial_amount) : 0,
        is_primary: !!is_primary,
        status: "active"
    });

    return ClientResponse.json({ wallet });

  } catch (error) {
    console.error("Create wallet error:", error);
    return ClientResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
