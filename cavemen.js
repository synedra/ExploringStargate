const docBasePath = "/api/rest/v2/namespaces/workshop/collections/cavemen";
const restBasePath = "/api/rest/v2/keyspaces/workshop/";
const restSchemaPath = "/api/rest/v2/schemas/keyspaces/workshop/tables/";
let data;
let response;
let status;

function wait(timeout) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

async function requestWithRetry(astraClient, url) {
  const MAX_RETRIES = 20;
  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      let response = await astraClient.get(url);
      if (response.status == "200") {
        console.log("It's good?");
        return response;
      } else {
        const timeout = 5000 * i * 10;
        console.log("Waiting", timeout, "ms");
        await wait(timeout);
      }
    } catch {
      const timeout = 5000 * i * 10;
      console.log("Waiting", timeout, "ms");
      await wait(timeout);
    }
  }
}

async function postWithRetry(astraClient, url) {
    const MAX_RETRIES = 20;
    for (let i = 1; i <= MAX_RETRIES; i++) {
      try {
        let response = await astraClient.post(url);
        if (response.status == "200") {
          console.log("It's good?");
          return response;
        } else {
          const timeout = 5000 * i * 10;
          console.log("Waiting", timeout, "ms");
          await wait(timeout);
        }
      } catch {
        const timeout = 5000 * i * 10;
        console.log("Waiting", timeout, "ms");
        await wait(timeout);
      }
    }
  }

async function runCalls() {
  const astraRest = require("@astrajs/rest");
  const astraDoc = require("@astrajs/collections");

  const astraClient = await astraRest.createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    authToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });

  const docClient = await astraDoc.createClient({
    astraDatabaseId: process.env.ASTRA_DB_ID,
    astraDatabaseRegion: process.env.ASTRA_DB_REGION,
    authToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
  });

  testCollection = docClient.namespace("workshop").collection("cavemen");

  // REST API

  // List my tables
  response = await astraClient.get(restSchemaPath);
  console.log(restSchemaPath);
  console.log(status);

  // Delete cavemen if it exists
  try {
    response = await astraClient.delete(restSchemaPath + "cavemen");
    console.log(restSchemaPath);
    console.log(status);
  } catch {
    console.log("No cavemen found");
  }

  // Create the cavemen table
  response = await astraClient.post(restSchemaPath, {
    name: "cavemen",
    columnDefinitions: [
      {
        name: "firstname",
        typeDefinition: "text",
        static: false,
      },
      {
        name: "lastname",
        typeDefinition: "text",
        static: false,
      },
      {
        name: "occupation",
        typeDefinition: "text",
      },
    ],
    primaryKey: {
      partitionKey: ["lastname"],
      clusteringKey: ["firstname"],
    },
  });

  console.log(response);
  let query = '{"lastname":{"$in":["Rubble","Flintstone"]}}';

  response = postWithRetry(astraClient, restBasePath + "cavemen", {
    firstname: "Fred",
    lastname: "Flintstone",
  });

  if (response.status == 201) {
    console.log("Created Fred in the cavemen collection");
  }

  // create a new user
  response = postWithRetry(astraClient, restBasePath + "cavemen/BarneyRubble", {
    firstname: "Barney",
    lastname: "Rubble",
  });

  if (response.status == 201) {
    console.log("Created Barney in the cavemen collection");
  }

  response = await astraClient.get(restSchemaPath);
  console.log(restSchemaPath);
  console.log(response);


  // check our tables again
  query = '{"lastname":{"$in":["Rubble","Flintstone"]}}';
  response = await astraClient.get(restBasePath + "cavemen?where=" + query);
  console.log(response);

  

  

  // Delete cavemen if it exists
  try {
    response = await astraClient.delete(restSchemaPath + "cavemen");
    console.log(restSchemaPath);
    console.log(status);
  } catch {
    console.log("No cavemen found");
  }
  response = await astraClient.get(restSchemaPath);
  console.log(response);


  // Document API
  // create a new user without a document id
  response = await testCollection.create({
    firstname: "Fred",
    lastname: "Flintstone",
  });

  console.log(response);

  if (response.status == 201) {
    console.log("Created Fred in the cavemen collection");
    let fredID = data.documentId;
  }

  response = await testCollection.create("BarneyRubble", {
    firstname: "Barney",
    lastname: "Rubble",
  });

  if (response.status == 201) {
    console.log("Created Barney in the cavemen collection");
  }

  // search a collection of documents
  response = await testCollection.find( {
    firstname: { $eq: "Fred" }
  });
  console.log(response)

  // search a collection of documents
  response = await testCollection.find( {
    firstname: { $eq: "Barney" }
  });
  console.log(response)

  // get a single user by document id
  response = await testCollection.get("BarneyRubble");
  console.log(response);

  // get a subdocument by path
  response = await testCollection.get("BarneyRubble/firstname");

  // create a user subdocument
  await testCollection.update("BarneyRubble/addresses/home", {
    city: "Stone City",
  });

  // partially update user
  response = await testCollection.update("BarneyRubble", {
    occupation: "Fred's Friend",
  });

  response = await testCollection.get("BarneyRubble");
  console.log(response);

  // delete a user subdocument
  response = await testCollection.delete("BarneyRubble/addresses");
  response = await testCollection.get("BarneyRubble");
  console.log(response);

  // delete a user
  response = await testCollection.delete("BarneyRubble/addresses");
  response = await testCollection.get("BarneyRubble");
  console.log(response);

}

runCalls();
