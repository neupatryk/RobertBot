import config, { token } from './config.json';
import prompt from 'prompt';
import fs from 'fs';

if (!token.length) {
  prompt.start();

  prompt.get(['token'], (err, result) => {
    if (err) console.error(err);
    else {
      config.token = result.token.toString();

      fs.writeFile('./config.json', JSON.stringify(config), (err) => {
        if (err) {
          console.error(err);
          return;
        }
      });
    }
  });
}
