const firma={};
const pdfUtil = require('pdf-to-text');
const pdf_path = "public/files/1572488913156-guia_digit_conacyt.pdf";
const crypto = require("crypto"),
  keypair = require("keypair"),
  winston = require("winston");

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
      handleExceptions: true
    })
  ]
});
let exampleString;

 firma.demonstrateSignature = () => {
  try {
    pdfUtil.pdfToText(upload.path, function(err, data) {
        if (err) throw(err);
        console.log(data); //print all text  
        exampleString =data;  
      });
    var pair = keypair(3072);

    // sign String
    var signerObject = crypto.createSign("RSA-SHA512");
    signerObject.update(exampleString);
    var signature = signerObject.sign(pair["private"], "base64");

    //verify String
    var verifierObject = crypto.createVerify("RSA-SHA512");
    verifierObject.update(exampleString);
    var verified = verifierObject.verify(pair["public"], signature, "base64");

    logger.info("is signature ok?: %s", verified);
  } catch (error) {
    logger.error(error.message);
  }
};

;

// for unit testing purposes
module.exports = { demonstrateSignature, logger };

