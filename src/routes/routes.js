const chatbot = require('../chatbot/chatbot')
const { WebhookClient } = require("dialogflow-fulfillment");
const spreadsheetUrl = process.env.REACT_APP_SPREADSHEET_URL;
const fetch = require("node-fetch");

module.exports = app => {
    app.post('/text_query', async (req, res) => {
        const { text, userId } = req.body;
        const resultQuery = await chatbot.textQuery(text, userId)
        const resObject = {
            intentName: resultQuery.intent.displayName,
            userQuery: resultQuery.queryText,
            fulfillmentText: resultQuery.fulfillmentText
        }
        res.send(resObject);
    })

    app.post("/spreadsheet", async (request, response) => {
        console.log("request", request);
        console.log("response", response);
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
            let Sala = request.body.queryResult.parameters["nomeSala"];
            const imagens = [];

            await fetch(spreadsheetUrl)
                .then(res => res.json())
                .then(data => {
                    console.log("data full", data);
                    data.forEach(coluna => {
                        console.log("colunas", coluna)
                        if (coluna.Sala === Sala) {
                            response.json({
                                fulfillmentText:
                                    coluna.Resultado
                            });
                            let i = 1;
                            while (coluna[`imagem${i}`] !== undefined || coluna[`imagem${i}`] !== null) {
                                imagens.push(coluna[`imagem${i}`]);
                                i++;
                            }
                        }
                    });
                })
                .catch((error) => {
                    console.error('Error:', error);
                });
        }
    });
    // app.post('/event_query', (req, res) => {
    //     console.log(req);
    //     res.send("Text Query");
    // })
}