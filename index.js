require("dotenv").config();

const AWS = require("aws-sdk");
const fetch = require("node-fetch");

AWS.config.update({
  region: process.env.AWS_REGION,
  credentials: new AWS.Credentials(
    process.env.AWS_ACCESS_KEY_ID,
    process.env.AWS_SECRET_ACCESS_KEY
  ),
});

const queryCustomer = `query list {
  customersByStatus(status: "lead") {items {id}}
}
`;

const post_body = {
  query: queryCustomer,
};

const uri = new URL(process.env.GRAPHQL_API);
const httpRequest = new AWS.HttpRequest(uri.href, process.env.REGION);
httpRequest.headers.host = uri.host;
httpRequest.headers["Content-Type"] = "application/json";
httpRequest.method = "POST";
httpRequest.body = JSON.stringify(post_body);

AWS.config.credentials.get((err) => {
  const signer = new AWS.Signers.V4(httpRequest, "appsync", true);
  signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());

  const options = {
    method: httpRequest.method,
    body: httpRequest.body,
    headers: httpRequest.headers,
  };

  fetch(uri.href, options)
    .then((res) => res.json())
    .then((json) => {
      console.log(`JSON Response = ${JSON.stringify(json, null, 2)}`);
    })
    .catch((err) => {
      console.error(`FETCH ERROR: ${JSON.stringify(err, null, 2)}`);
    });
});
