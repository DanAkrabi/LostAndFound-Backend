import initApp from "./server";
import http from 'http'
import https from 'https'
import fs from 'fs'

const PORT = process.env.PORT;

initApp().then((app) => {
  if (process.env.NODE_ENV != 'production') {
    console.log('server in dev-mode');
    http.createServer(app).listen(PORT)
  } else {
    const option = {
      key: fs.readFileSync('./client-key.pem'),
      cert: fs.readFileSync('./client-cert.pem'),

    }
    console.log('server in prod-mode');
    https.createServer(option, app).listen(PORT);
  }

})
  .catch((err) => {
    console.log("Error initializing app", err);
  }
  );
