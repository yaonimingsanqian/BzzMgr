sudo apt-get install nodejs
sudo apt-get install npm
npm install -g pm2
pm2 start controller.js
pm2 start loop.js
