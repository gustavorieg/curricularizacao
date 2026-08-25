require("dotenv").config();
const createApp = require("./app");

const app = createApp();
const port = process.env.PORT || 3333;

app.listen(port, () => {
  console.log(`minha-saude-feminina-api rodando em http://localhost:${port}/api/v1`);
});
