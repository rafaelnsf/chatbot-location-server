const chatbot = require('../chatbot/chatbot')
const { WebhookClient } = require("dialogflow-fulfillment");
const spreadsheetUrl = process.env.REACT_APP_SPREADSHEET_URL;
const fetch = require("node-fetch");

module.exports = app => {
    const images = [];
    app.post('/text_query', async (req, res) => {
        console.log("imagens: ", imagens)
        const { text, userId } = req.body;
        const resultQuery = await chatbot.textQuery(text, userId)
        console.log("resultquery ###############$$$$$$", resultQuery);
        const resObject = {
            intentName: resultQuery.intent.displayName,
            userQuery: resultQuery.queryText,
            fulfillmentText: resultQuery.fulfillmentText,
            images: images
        }
        res.send(resObject);
    })

    app.post("/spreadsheet", async (request, response) => {
        // console.log("######################################request", request);
        // console.log("##################################response", response);
        const agent = new WebhookClient({ request: request, response: response });

        //MAPEAMENTO DAS INTENTS

        let intentMap = new Map();
        intentMap.set('Localizacoes', pesquisa);
        intentMap.set('teste', cadastro);
        agent.handleRequest(intentMap);


        //FUNÇÃO DE CADASTRO DE LEADS

        async function cadastro(agent) {
            const { nomeSala, resultado } = agent.parameters;

            const data = [{ NomeSala: nomeSala, Resultado: resultado }];

            await fetch(spreadsheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
                .then(() => {
                    agent.add(`Bacana, Muito obrigado por suas informações pessoais.`);
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }

        // PESQUISAR CLIENTE E EVENTOS

        async function pesquisa() {
            // console.log("######################################request", request.body);
            // console.log("##################################response", response);
            try {
                var Sala = request.body.queryResult.parameters["nomeSala"];


                const res = await fetch(spreadsheetUrl);
                const data = await res.json();
                images = [];

                data.forEach(coluna => {
                    if (coluna.Sala === Sala) {
                        Object.keys(coluna).forEach(key => {
                            if (key.startsWith("imagem") && coluna[key]) {
                                images.push(coluna[key]);
                            }
                        });

                        response.json({
                            fulfillmentText: coluna.Resultado,
                        });
                    }
                });
            } catch (error) {
                console.error('Error:', error);
                response.json({ error: 'Ocorreu um erro durante a pesquisa.' });
            }
        }
    });
    // app.post('/event_query', (req, res) => {
    //     console.log(req);
    //     res.send("Text Query");
    // })
}