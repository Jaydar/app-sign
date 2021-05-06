<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo_text.svg" width="320" alt="Nest Logo" /></a>
</p>

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# production mode
$ npm run pm2:pro

# PM2 dev
$ npm run dev
```

## SSL

mobileconfig 签名
```bash
sudo openssl smime -sign -signer /usr/local/nginx/conf/_ancpoker_com.crt -inkey /usr/local/nginx/conf/_ancpoker_com.key  -certfile /usr/local/nginx/conf/USERTrust_RSA_Certification_Authority.crt  -nodetach -outform der -in /root/AnobetGameServer/super-sign/Public/apps/udid.mobileconfig  -out /root/AnobetGameServer/super-sign/Public/apps/signed-udid.mobileconfig

openssl smime -sign -signer ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.crt -inkey ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.key  -certfile ~Jaydar/SSL/_ancpoker_com/USERTrust_RSA_Certification_Authority.crt  -nodetach -outform der -in ./Public/apps/dzpoker/udid.mobileconfig  -out ./Public/apps/dzpoker/signed-udid.mobileconfig

openssl smime -sign -signer ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.crt -inkey ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.key  -certfile ~Jaydar/SSL/_ancpoker_com/USERTrust_RSA_Certification_Authority.crt  -nodetach -outform der -in ./Public/apps/quickeasy/udid.mobileconfig  -out ./Public/apps/quickeasy/signed-udid.mobileconfig

openssl smime -sign -signer ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.crt -inkey ~Jaydar/SSL/_ancpoker_com/_ancpoker_com.key  -certfile ~Jaydar/SSL/_ancpoker_com/USERTrust_RSA_Certification_Authority.crt  -nodetach -outform der -in ./Public/apps/super/udid.mobileconfig  -out ./Public/apps/super/signed-udid.mobileconfig

```

