const chatbot = require('../chatbot/chatbot')
const { WebhookClient } = require("dialogflow-fulfillment");

module.exports = app => {
    app.post('/text_query', async (req, res) => {
        console.log(req);
        const { text, userId } = req.body;
        const resultQuery = await chatbot.textQuery(text, userId)
        console.log(resultQuery);
        const resObject = {
            intentName: resultQuery.intent.displayName,
            userQuery: resultQuery.queryText,
            fulfillmentText: resultQuery.fulfillmentText
        }
        res.send(resObject);
    })

    app.post("/teste", function (request, response) {
        const agent = new WebhookClient({ request: request, response: response });

        //MAPEAMENTO DAS INTENTS

        let intentMap = new Map();
        intentMap.set('SALAS', pesquisa);
        intentMap.set('teste', cadastro);
        agent.handleRequest(intentMap);


        //FUNÇÃO DE CADASTRO DE LEADS

        function cadastro(agent) {
            const { nomeSala, resultado } = agent.parameters;
            const data = [{ NomeSala: nomeSala, Resultado: resultado }];

            fetch("https://sheet.best/api/sheets/ec4edacc-4491-483c-af48-29e164f82199", {
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

        function pesquisa(agent) {
            var Sala = request.body.queryResult.parameters["nomeSala"];

            fetch("https://sheet.best/api/sheets/ec4edacc-4491-483c-af48-29e164f82199")
                .then(res => res.json())
                .then(data => {
                    data.forEach(coluna => {
                        if (coluna.Sala === Sala) {
                            response.json({
                                fulfillmentText:
                                    "Para chegar até a " +
                                    "Sala: " +
                                    coluna.NomeSala +
                                    " Siga esses passos: " +
                                    coluna.Resultado
                            });
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