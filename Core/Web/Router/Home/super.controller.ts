import { Controller, Get, Post, Render, Header, Req, Res, Body, UploadedFile, UseInterceptors, Param, HttpException, HttpStatus } from '@nestjs/common';
import getRawBody from 'raw-body';
import * as qr from "qr-image"
import { Request, Response } from 'express';
import { SuperService } from './super.service';
import * as path from "path"
import * as fs from "fs"
import config from "../../config"
import { AppleAPI, iDevice } from '../../../Lib/Apple/AppleAPI';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/')
export class SuperController {
    constructor(private readonly SuperService: SuperService) { }

    @Get('qrcode')
    async QRCode(@Req() req: Request, @Res() res: Response) {
        var code = qr.image(req.query.url, { type: 'png', size: 10 });
        res.setHeader('Content-type', 'image/png');
        code.pipe(res);
    }


    @Get('app/:key')
    @Render('Super/home.hbs')
    async app(@Req() req: Request, @Res() res: Response) {
        console.log('-----app-----')
        let key = req.params.key;
        let info = await this.SuperService.getAppByKey(key);
        console.log(info)
        let file = path.join(path.resolve(), 'Public', 'apps', info.app_bundle_id, 'signed-udid.mobileconfig');

        if (!fs.existsSync(file)) {
            this.SuperService.makeUdidMobileConfig(info);
        }



        return {
            ...info,
            type:'sign',
            url: `https://${config.domain}/sign/${key}`,
        };
    }

    @Get('sign/:key')
    @Header('Content-Type', 'application/x-apple-aspen-config')
    async sign(@Req() req: Request, @Res() res: Response) {
        console.log('-----sign-----');
        let key = req.params.key;
        let info = await this.SuperService.getAppByKey(key);
        res.download(`Public/apps/${info.app_bundle_id}/signed-udid.mobileconfig`);
    }

    @Post('udid/:id')
    async udid(@Req() req: Request, @Res() res: Response) {
        console.log('-----receive-----');
        const raw: string = await getRawBody(req, { encoding: 'utf-8' });
        let params = await this.SuperService.resolveXML(raw);
        res.redirect(301, `/install/${req.params.id}/${params.udid}`);
    }

    @Get('toSet')
    @Header('Content-Type', 'application/x-apple-aspen-config')
    async toSet(@Res() res: Response) {
        res.download(`Core/Lib/Apple/signed-setting.mobileconfig`);
    }


    @Get('install/:key/:udid')
    @Render('Super/home.hbs')
    async install(@Req() req: Request, @Res() res: Response) {
        console.log('-----install-----');
        let key = req.params.key;
        let udid = req.params.udid;
        let info = await this.SuperService.getAppByKey(key);
        return {
            ...info,
            url: `https://${config.domain}/download/${key}/${udid}`,
            type:"install"
        }
    }

    @Get('download/:key/:udid')
    @Header('Content-Type', 'application/x-apple-aspen-config')
    async download(@Req() req: Request, @Res() res: Response) {

        console.log('-----donwload-----');

        let key = req.params.key;
        let udid = req.params.udid;

        const folderName = this.SuperService.getFolder();
        let appInfo = await this.SuperService.getAppByKey(key);
        let account = await this.SuperService.getAccount(udid);

        let tempPath = path.join(path.resolve(), 'Public', 'apps', appInfo.app_bundle_id, 'temp', folderName);
        fs.mkdirSync(tempPath, { recursive: true })

        if (!account) {
            console.error("account device num upper limit");
            res.status(405).send("account device num upper limit")
            return;
        }

        let [device, bundleId, crt, profile] = await this.SuperService.getSignInfo(account, appInfo, udid);
        console.log(device, bundleId, crt, profile)

        //保存文件 Profile
        this.SuperService.saveFile(tempPath, profile.attributes.profileContent, 'profile');
        //生成文件
        this.SuperService.makeManifest(appInfo, account, tempPath, folderName);
        //同步数据库
        this.SuperService.syncData(account, device)
        // // console.log(tempPath,appInfo,account.sign_crt,account);
        //重签名
        this.SuperService.resignIpa(tempPath, appInfo, account.sign_crt);
        // //下载文件
        res.download(path.join(tempPath, 'manifest.plist'));
    }

    @Post('upload/:app_id')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile() file, @Param() params) {
        
        try {
            if (!file) {
                throw "请上传文件";
            }
            if(!['.apk'].includes(path.extname(file.originalname))){
                throw "文件格式错误";
            }


            let app_id = params.app_id
            let appInfo = await this.SuperService.getApp(app_id);

            if (!appInfo) {
                throw "App不存在" 
            }

            let appPath = path.join(path.resolve(), 'Public', 'apps', appInfo.app_bundle_id);
            let appName = `base${path.extname(file.originalname)}`
            fs.unlinkSync(path.join(appPath, appName))


            const writeImage = fs.createWriteStream(path.join(appPath, appName));
            writeImage.write(file.buffer)
            return {
                code: 200
            }


        } catch (error) {
            console.error(error);
            throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

  

}
