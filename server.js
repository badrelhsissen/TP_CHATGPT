const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const fs = require('fs');

const app = express();
const port = 3000;

// Configuration pour utiliser body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Route pour afficher le formulaire HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Route pour traiter les données du formulaire
app.post('/submit', async (req, res) => {
  try {
    // Récupérer les données du formulaire
    const { nom, prenom, email, recherche } = req.body;

    // Sauvegarder les données dans un fichier JSON
    const formData = { nom, prenom, email, recherche };
    fs.writeFileSync('data.json', JSON.stringify(formData));

    // Requête vers l'API de ChatGPT
    const chatGPTResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: recherche },
        ],
      },
      {
        headers: {
          Authorization: `Bearer '${process.env.CHATGPT_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Récupérer la réponse de ChatGPT
    const chatGPTAnswer = chatGPTResponse.data.choices[0].message.content;

    // Afficher la réponse sur la page HTML
    res.send(`<h1>Réponse de ChatGPT:</h1><p>${chatGPTAnswer}</p>`);

    // Sauvegarder la réponse de ChatGPT dans le fichier JSON
    formData.chatGPTAnswer = chatGPTAnswer;
    fs.writeFileSync('data.json', JSON.stringify(formData));

  } catch (error) {
    if (error.response && error.response.data) {
        console.error('Erreur lors de la requête ChatGPT:', error.response.data);
        res.status(500).send({ error: 'Erreur lors de la requête ChatGPT' });
      } else {
        console.error('Erreur lors de la requête ChatGPT:', error.message);
        res.status(500).send({ error: 'Erreur lors de la requête ChatGPT' });
      }
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur le port ${port}`);
});
