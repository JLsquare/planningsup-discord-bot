# PlanningSup Discord Bot

![PlanningSup Discord Bot](https://i.imgur.com/gyKnK9m.png)

## Description
PlanningSup Bot est un bot Discord qui permet d'afficher le planning de la semaine pour différents établissements en se connectant à l'API de [PlanningSup](https://planningsup.app/). Il offre également la possibilité de sauvegarder un planning spécifique pour un rappel rapide ultérieur.

## Fonctionnalités
- **/planning** : Affiche le planning de la semaine basé sur des filtres spécifiques, le planning sauvegardé, ou les plannings disponibles suivant les filtres donnés. Si plusieurs plannings sont disponibles, une sélection sera proposée à l'aide de réactions. Il y a aussi deux boutons "<" et ">" pour changer de semaine.
- **/ping** : Affiche le ping du bot et la latence avec l'API de PlanningSup.
- **/info** : Fournit des informations sur le bot et ses liens associés.
- **/help** : Liste toutes les commandes disponibles du bot.
- **/saveplanning** : Sauvegarde un planning spécifique pour une utilisation ultérieure.

## Configuration
Le bot utilise un fichier **config.json** pour définir divers paramètres et options. Certains des paramètres clés inclus sont :
- discordToken : Le token de votre bot Discord.
- discordClientId : L'ID de votre bot Discord.
- planningSupUrl : L'URL de l'API PlanningSup, si vous souhaitez utiliser votre propre instance.
- database : L'emplacement de la base de données pour stocker les plannings des utilisateurs.
- D'autres paramètres sont liés à la personnalisation de l'apparence des messages intégrés envoyés par le bot sur Discord.

## Mise en route
- Clonez ce dépôt.
- Installer les dépendances : `npm install`
- Remplissez votre config.json avec les informations nécessaires, y compris le token de votre bot Discord.
- Lancez le bot : `node index.js`

## Crédits
Ce bot a été créé par [JL](https://github.com/JLsquare), et utilise [PlanningSup](https://planningsup.app) créé par [Kernoeb](https://github.com/kernoeb).
- [Github de PlanningSup](https://github.com/kernoeb/planningsup)
- [Soutenez PlanningSup!](https://www.paypal.com/paypalme/kernoeb)