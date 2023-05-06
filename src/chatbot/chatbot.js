const dialogflow = require('dialogflow');

const config = require('../config/devkey');

// const privateKey = config.googlePrivateKey;
const projectId = config.googleProjectId;
const sessionId = config.dialogFlowSessionID;

const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
}

const sessionClient = new dialogflow.SessionsClient({ projectId, credentials });

const textQuery = async (userText, userId) => {
    const sessionPath = sessionClient.sessionPath(projectId, sessionId + userId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: userText,
                languageCode: config.dialogFlowSessionLanguageCode
            }
        }
    }

    try {
        const response = await sessionClient.detectIntent(request)
        return response[0].queryResult;
    } catch (error) {
        console.log(error)
        return error;
    }
}
module.exports = {
    textQuery
}