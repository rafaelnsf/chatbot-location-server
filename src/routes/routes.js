const chatbot = require('../chatbot/chatbot')
const { WebhookClient } = require("dialogflow-fulfillment");
const spreadsheetUrl = process.env.REACT_APP_SPREADSHEET_URL;
const fetch = require("node-fetch");

module.exports = app => {
    app.post('/text_query', async (req, res) => {
        const { text, userId } = req.body;
        const resultQuery = await chatbot.textQuery(text, userId);

        const textArray = resultQuery.fulfillmentText.split('\n');
        const resObject = {
            intentName: resultQuery.intent.displayName,
            userQuery: resultQuery.queryText,
            fulfillmentText: []
        };

        for (let line of textArray) {
            if (isImageUrl(line)) {
                resObject.fulfillmentText.push({ img: line });
            } else {
                resObject.fulfillmentText.push(line);
            }
        }

        res.send(resObject);
    });

    function isImageUrl(line) {
        // Verifica se a linha contém uma URL de imagem
        // Pode ser feita uma validação mais robusta conforme suas necessidades
        return line.startsWith('https://drive.google.com/file/');
    }

    app.post("/spreadsheet", async (request, response) => {
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
            try {
                let Sala = request.body.queryResult.parameters["salas"];

                const res = await fetch(spreadsheetUrl);
                const data = await res.json();
                let result = null;

                data.forEach(coluna => {
                    if (coluna.NomeSala === Sala) {
                        result = {
                            fulfillmentText: coluna.Resultado
                        };
                    }
                });

                if (result) {
                    response.json(result);
                } else {
                    response.json({ fulfillmentText: 'Nenhum resultado encontrado.' });
                }
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