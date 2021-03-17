const docBasePath = "/api/rest/v2/namespaces/workshop/collections/cavemen";
  const restBasePath = "/api/rest/v2/keyspaces/workshop/"
  const restSchemaPath = "/api/rest/v2/schemas/keyspaces/workshop/tables/"
  let data
  let response
  let status

  async function runCalls () {
    const astraRest = require("@astrajs/rest");
    const sleep = require('sleep');
    const astraClient = await astraRest.createClient({
        astraDatabaseId: process.env.ASTRA_DB_ID,
        astraDatabaseRegion: process.env.ASTRA_DB_REGION,
        authToken: process.env.ASTRA_DB_APPLICATION_TOKEN,
    });

    // REST API

    // List my tables
    response, status = await astraClient.get(restSchemaPath)
    response, status = await astraClient.delete(restSchemaPath + "cavemen")
    console.log(status)

    // Create the cavemen table
    data, status = await astraClient.post(restSchemaPath, {
        name: "cavemen",
        columnDefinitions: [
          {
            name: "firstname",
            typeDefinition: "text",
            static: false
          },
          {
            name: "lastname",
            typeDefinition: "text",
            static: false
          },
              {
                name: "occupation",
                typeDefinition: "text"
              }
        ],
        primaryKey: {
          partitionKey: [
            "lastname"
          ],
          clusteringKey: [
            "firstname"
          ]
        }
      });

        // Rest a bit so the table gets created
        sleep.msleep(5000);

        response = await astraClient.post(restBasePath + "cavemen", {
        firstname: "Fred",
        lastname: "Flintstone"
        });
    
    
    if (status.status==201) {
        console.log("Created Fred in the cavemen collection")
    } 

    // check our tables again
    let query = '{\"lastname\":{\"$in\":[\"Rubble\",\"Flintstone\"]}}'
     response = await astraClient.get(restBasePath+"cavemen?where=" + query);
     console.log(response)

    // create a new user
     response = await astraClient.post(restBasePath+"cavemen", {
        firstname: "Barney",
        lastname: "Rubble"
    });

    if (response.status==201) {
        console.log("Created Barney in the cavemen collection")
    }

    
    // Document API
    // create a new user without a document id
    data, status = await astraClient.post(docBasePath, {
        firstname: "Fred",
        lastname: "Flintstone"
    });

    if (status==201) {
        console.log("Created Fred in the cavemen collection")
        let fredID = data.documentId
    } 

    // search a collection of documents
     data, status = await astraClient.get(docBasePath, {
        params: {
            where: {
                firstname: { $eq: "Fred" }
            }
        }
    });

    // create a new user with a document id
     data, status = await astraClient.put(`${docBasePath}/BarneyRubble`, {
        firstname: "Barney",
        lastname: "Rubble"
    });

    if (status==201) {
        console.log("Created Barney in the cavemen collection")
    }

   
    // get a single user by document id
     data, status = await astraClient.get(`${docBasePath}/BarneyRubble`);

    // get a subdocument by path
     data, status = await astraClient.get(`${docBasePath}/BarneyRubble/firstname`);

    // create a user subdocument
     data, status = await astraClient.put(`${docBasePath}/BarneyRubble/occupation`, {
        title: "Fred's Friend",
    });

    // partially update user
     data, status = await astraClient.patch(`${docBasePath}/fredID`, {
        firstname: "Wilma",
    });

    // delete a user
     data, status = await astraClient.delete(`${docBasePath}/fredID`);
  
    

    // create a new user without a document id
    data, status = await astraClient.post(docBasePath, {
        firstname: "Fred",
        lastname: "Flintstone"
    });

    if (status==201) {
        console.log("Created Fred in the cavemen collection")
        let fredID = data.documentId
    }

    // search a collection of documents
     data, status = await astraClient.get(docBasePath, {
        params: {
            where: {
                firstname: { $eq: "Fred" }
            }
        }
    });

    // create a new user with a document id
     data, status = await astraClient.put(`${docBasePath}/BarneyRubble`, {
        firstname: "Barney",
        lastname: "Rubble"
    });

    if (status==201) {
        console.log("Created Barney in the cavemen collection")
    }

   
    // get a single user by document id
     data, status = await astraClient.get(`${docBasePath}/BarneyRubble`);

    // get a subdocument by path
     data, status = await astraClient.get(`${docBasePath}/BarneyRubble/firstname`);

    // create a user subdocument
     data, status = await astraClient.put(`${docBasePath}/BarneyRubble/occupation`, {
        title: "Fred's Friend",
    });

    // partially update user
     data, status = await astraClient.patch(`${docBasePath}/fredID`, {
        firstname: "Wilma",
    });

    // delete a user
     data, status = await astraClient.delete(`${docBasePath}/fredID`);


  }

runCalls();
