const { createRestClient } = require("@astrajs/rest");
const { createDocClient } = require("@astrajs/collections");

  
  const docBasePath = "/api/rest/v2/keyspaces/workshop/collections/cavemen";
  let data
  let status

  async function runCalls () {
    // create an Astra client for the Document API
    const astraDocClient = await createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        username: process.env.ASTRA_DB_USERNAME,
        password: process.env.ASTRA_DB_PASSWORD,
    });

    // create a new user without a document id
    data, status = await astraDocClient.post(DocBasePath, {
        firstname: "Fred",
        lastname: "Flintstone"
    });

    if (status==201) {
        console.log("Created Fred in the cavemen collection")
        let fredID = data.documentId
    }

    // search a collection of documents
     data, status = await astraClient.get(basePath, {
        params: {
            where: {
                firstname: { $eq: "Fred" }
            }
        }
    });

    // create a new user with a document id
     data, status = await astraClient.put(`${DocBasePath}/BarneyRubble`, {
        firstname: "Barney",
        lastname: "Rubble"
    });

    if (status==201) {
        console.log("Created Barney in the cavemen collection")
    }

   
    // get a single user by document id
     data, status = await astraDocClient.get(`${docBasePath}/BarneyRubble`);

    // get a subdocument by path
     data, status = await astraDocClient.get(`${docBasePath}/BarneyRubble/firstname`);

    // create a user subdocument
     data, status = await astraDocClient.put(`${docBasePath}/BarneyRubble/occupation`, {
        title: "Fred's Friend",
    });

    // partially update user
     data, status = await astraDocClient.patch(`${docBasePath}/fredID`, {
        firstname: "Wilma",
    });

    // delete a user
     data, status = await astraDocClient.delete(`${docBasePath}/fredID`);
  }

runCalls();
