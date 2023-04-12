# chatbot-location-server
Api node for connect frontend with dialogflow NLU

for start run npm start in terminal, next send request using url: localhost:3030/text_query with this example payload:

{
    "text": "ola",
    "userId": "testeeeeeeeeeeeeee"
}

you should get a response like:

{
    "intentName": "WELCOME",
    "userQuery": "ola",
    "fulfillmentText": "Olá! Qual o seu nome?"
}