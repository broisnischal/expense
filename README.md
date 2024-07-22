```
npm install
npm run dev
```

```
npm run deploy
```

curl -X POST https://gateway.ai.cloudflare.com/v1/fe3a90c3d83796efba8c518914dad9b0/nees/workers-ai/@cf/meta/llama-2-7b-chat-int8 \
 --header 'Authorization: Bearer CF_TOKEN' \
 --header 'Content-Type: application/json' \
 --data '{"prompt": "What is Cloudflare?"}'

Chatbots with RAG
Ground chatbots in your data using Retrieval Augmented Generation (RAG) to enhance the quality of LLM responses.

Semantic caching
Identify and retrieve cached LLM outputs to reduce response times and the number of requests to your LLM provider, which saves time and money.

Recommendation systems
Power recommendation engines with fresh, relevant suggestions at low-latency, and point your users to the products they’re most likely to buy.

Document search
Make it easier to discover and retrieve information across documents and knowledge bases, using natural language and semantic search.
