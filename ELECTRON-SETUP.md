Electron setup:

L'application Electron embarque un chromium completement, a travers les BrowserWindow (file size de base donc un minimum important)

Un main process en NodeJS run egalement sur la machine hote de l'app, permettant les interactions avec Electron, creer des windows, utiliser des system APIs, utiliser des Node Modules etc etc

Le main process et la BrowserWindow utilisent les IPC (Inter Process Communication) Event Bus pour communiquer. Comment ca fonctionne: l'un publie un evenement avec un certain nom, certains parametres, pour dire a l'autre que quelque chose s'est passe et de changer certaines choses en fonction de ca.

Electron-Builder permet de convertir notre app NodeJs Electron en une application .exe, app-image, donc pouvoir faire des installer, et faire en sorte que ca puisse run nativement sur plusieurs OS.

On separe le code React, TypseScript, HTML, CSS du code Electron (pas un langage mais ce qui est relatif a Electron, en gros on separe le UI du Main Process)

On change la reference de l'endroit du script pour que Vite sache ou est le script

Electron-Builder cree aussi un dossier de distribution avec le nom dist, donc on rename le outdir dans le vite.config

On ajoute electron dans les dev dependencies, on peut mettre pas mal de trucs uniquement dans les dev dependencies, parce qu'elles servent qu'a build le projet.
Exemple TypeScript, sera transpile au build. Electron sert vraiment qu'a convertir notre code React en app.

On refait un fichier de config TypeScript pour Electron, puisque le fichier tsconfig de base est config pour attendre un code frontend

ESModules?

On install cross-env, qui nous permettra de set un mode de dev avec les variables d'environnement, pour check direct dans notre code si on est en mode dev ou pas. Ca permet d'activer certaines features pour le dev et pas pour le prod.

Le HMR (Hot Module Reload) est un truc qu'il y a de base sur React, ca permet de save une modification et qu'elle soit update directement sans avoir a reload la page (grace au cache busting). Ceci dit, faut aussi l'implementer pour l'app Electron lol, ce sera carrement mieux pour dev
Donc on setup un serveur de HMR pour Electron, dans vite.config