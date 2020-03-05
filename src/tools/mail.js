const nodemailer = require('nodemailer');
const mail = {};

mail.generaCodigo = (email) => {
    let abc = [
        'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k',
        'l', 'ñ', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '_', '-', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        '.'
    ]
    let arrayEmail = email.split('');
    let codigo = "";
    for (let index = 0; index < abc.length; index++) {
        if (arrayEmail[0] == abc[index] && (index + 3) < abc.length) {
            codigo += arrayEmail[0] + abc[index + 3];
        }
        if (arrayEmail[2] == abc[index] && (index + 3) < abc.length) {
            codigo += arrayEmail[2] + abc[index + 3];
        }
        if (arrayEmail[4] == abc[index] && (index + 3) < abc.length) {
            codigo += arrayEmail[4] + abc[index + 3];
        }
        if (index == (abc.length - 1)) {
            return codigo;
        }
    }
}

mail.enviaRecuperacion = (email, pass) => {
    let mailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'anzussa@gmail.com',
            pass: '$BTC$#1my00770p'
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    
    let mailOptions = {
        from: 'Anzus',
        to: `${email}`,
        subject: 'Recuperar cuenta',
        html: `
        <div class="container">
          <div class="row container">
              <div class="col s12">
                  <p class="center-align">
                  Muy buenas, le deseamos un excelente dia, al parecer usted a solicitado una 
                  recuperación de cuenta, por medio de este mail, le otorgaremos su contraseña.
                  </p>
              </div>
              <div class="col s12">
                  <h3 class="center-align">Contraseña:</h3>
              </div>
              <div class="col s12">
                  <h2 class="center-align">${pass}</h2>
              </div>
          </div>
      
        </div>  
        `,
        amp: `<!doctype html>
        <html ⚡4email>
          <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">

	        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
         </head>
          <body>
          <div class="container">
          <div class="row container">
              <div class="col s12">
              <p class="center-align">
              Muy buenas, le deseamos un excelente dia, al parecer usted a solicitado una 
              recuperación de cuenta, por medio de este mail, le otorgaremos su contraseña.
              </p>
              </div>
              <div class="col s12">
                  <h3 class="center-align">Contraseña:</h3>
              </div>
              <div class="col s12">
                  <h2 class="center-align">${pass}</h2>
              </div>
          </div>
      
        </div>  
          </body>
        </html>`
    }

    mailTransport.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        }else{
            console.log("Mensaje enviado: " + info.response);
        }
    });
    mailTransport.close();
}

mail.envia = (email, codigo) => {
    let mailTransport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'anzussa@gmail.com',
            pass: '$BTC$#1my00770p'
        },
        tls: {
            // do not fail on invalid certs
            rejectUnauthorized: false
        }
    });
    
    let mailOptions = {
        from: 'Anzus',
        to: `${email}`,
        subject: 'Bienvenido a el proyecto bien mamalon de álgebra, casi has completado tu registro',
        html: `
        <div class="container">
          <div class="row container">
              <div class="col s12">
                  <p class="center-align">Gracias por registrarte en nuestra plataforma, para
                  finalizar tu registro, es importante que copies el siguiente código, de lo ontrario
                  tu cuenta no se registrara, esto para evitar el uso sin sentido de la plataforma, gracias
                  </p>
              </div>
              <div class="col s12">
                  <h3 class="center-align">Código de verificación:</h3>
              </div>
              <div class="col s12">
                  <h2 class="center-align">${codigo}</h2>
              </div>
          </div>
      
        </div>  
        `,
        amp: `<!doctype html>
        <html ⚡4email>
          <head>
            <meta charset="utf-8">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css">

	        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
         </head>
          <body>
          <div class="container">
          <div class="row container">
              <div class="col s12">
                  <p class="center-align">Gracias por registrarte en nuestra plataforma, para
                  finalizar tu registro, es importante que copies el siguiente código, de lo ontrario
                  tu cuenta no se registrara, esto para evitar el uso sin sentido de la plataforma, gracias
                  </p>
              </div>
              <div class="col s12">
                  <h3 class="center-align">Código de verificación:</h3>
              </div>
              <div class="col s12">
                  <h2 class="center-align">${codigo}</h2>
              </div>
          </div>
      
        </div>  
          </body>
        </html>`
    }

    mailTransport.sendMail(mailOptions, (err, info) => {
        if(err){
            console.log(err);
        }else{
            console.log("Mensaje enviado: " + info.response);
        }
    });
    mailTransport.close();
}

module.exports = mail;