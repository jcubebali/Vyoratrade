# Security Specifications & Invariants for trades

## Data Invariants
1. A trade must have a valid `symbol` (uppercase code, e.g. "BTCUSDT").
2. The trade `type` must be either "BUY" or "SELL".
3. The `price` and `amount` fields must be positive numeric values.
4. Client SDK writes are strictly restricted to validating the exact structure, while read access is restricted to authenticated users.

## The Dirty Dozen Payloads (Intrusive test cases)
Each of the following payloads must return `PERMISSION_DENIED` under our security policies when written directly by clients:

1. **Empty Fields**: `{}`
2. **Missing Symbol**: `{"type": "BUY", "price": 95000, "amount": 1}`
3. **Invalid Type**: `{"symbol": "SOLUSDT", "type": "HODL", "price": 240, "amount": 5}`
4. **Negative Price**: `{"symbol": "BTCUSDT", "type": "BUY", "price": -100, "amount": 0.5}`
5. **Zero Amount**: `{"symbol": "ETHUSDT", "type": "SELL", "price": 3100, "amount": 0}`
6. **String Value for Price**: `{"symbol": "BTCUSDT", "type": "BUY", "price": "95000", "amount": 1}`
7. **String Value for Amount**: `{"symbol": "BTCUSDT", "type": "BUY", "price": 95000, "amount": "one"}`
8. **Shadow/Ghost Field Injection**: `{"symbol": "BTCUSDT", "type": "BUY", "price": 95000, "amount": 1, "isAdmin": true}`
9. **Giant Symbol Injection**: `{"symbol": "LONG_SYMBOL_THAT_IS_TOO_LARGE_AND_EXCEEDS_LIMIT", "type": "BUY", "price": 100, "amount": 1}`
10. **ID Poisoning Symbol**: `{"symbol": "BTC/USD\0", "type": "BUY", "price": 95000, "amount": 1}`
11. **Malicious Array Injection**: `{"symbol": ["SOLUSDT"], "type": "BUY", "price": 230, "amount": 1}`
12. **Missing Necessary Fields**: `{"symbol": "BNBUSDT"}`
