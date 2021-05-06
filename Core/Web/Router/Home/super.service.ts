import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Account } from "../../Entity/account.entity";
import { Device } from "../../Entity/device.entity";
import { User } from "../../Entity/user.entity";
import { Order } from "../../Entity/order.entity";
import { Apps } from "../../Entity/apps.entity";
import os from "os"
import * as nodeuuid from "node-uuid";
import * as path from "path";
import * as xml2js from "xml2js";
import * as child_process from "child_process";
import * as fs from "fs";
import config from "../../config";
import { AppleAPI, iDevice } from "../../../Lib/Apple/AppleAPI";

@Injectable()
export class SuperService {
    constructor(
        @InjectRepository(Account)
        private readonly AccountRepository: Repository<Account>,
        @InjectRepository(Device)
        private readonly DeviceRepository: Repository<Device>,
        @InjectRepository(User) private readonly UserRepository: Repository<User>,
        @InjectRepository(Order)
        private readonly OrderRepository: Repository<Order>,
        @InjectRepository(Apps) private readonly AppRepository: Repository<Apps>
    ) {
        console.log("init HomeService");
    }

    async getApp(id: string): Promise<Apps> {
        return this.AppRepository.findOne(id);
    }

    async getAppByKey(key: string): Promise<Apps> {
        return this.AppRepository.findOne({ app_key: key });
    }

    async getAccount(udid: string): Promise<Account> {
        let device = await this.DeviceRepository.findOne({ device_udid: udid });
        if (!device) {
            return await this.AccountRepository.findOne({
                where: { account_status: 1, devices_num: { $lt: 100 } },
                order: { devices_num: "DESC" },
            });
        } else {
            return this.AccountRepository.findOne(device.account_id);
        }
    }

    async getSignInfo(account: Account, appInfo: Apps, udid: string) {
        let name = "im.nord." + appInfo.app_key

        let appleAPI = new AppleAPI(
            account.issuer_id,
            account.login_kid,
            account.login_key
        );

        let [device, bundleId, crt] = await Promise.all([
            appleAPI.getDevice(udid),
            appleAPI.getIdentifiers(name),
            appleAPI.getCertificate("IOS_DISTRIBUTION")
        ]);


        bundleId = bundleId || await appleAPI.addIdentifiers(name);
        device = device || await appleAPI.addDevice(udid);

        let proFile = await appleAPI.addProFile(
            name,
            bundleId.id,
            crt.id,
            device.id
        );
        console.log(proFile)
        appleAPI.delProFile(proFile.id);
        return [device, bundleId, crt, proFile];
    }

    async syncData(account: Account, device: iDevice) {
        if (!(await this.DeviceRepository.findOne({ device_id: device.id }))) {
            console.log("Sync Data");
            this.DeviceRepository.save({
                account_id: account.id.toString(),
                account_name: account.login_name,
                device_id: device.id,
                device_udid: device.attributes.udid,
                device_name: device.attributes.name,
                device_class: device.attributes.deviceClass,
                device_model: device.attributes.model,
                device_platform: device.attributes.platform,
                device_status: device.attributes.status,
                device_add_time: device.attributes.addedDate,
            });
            account.devices_num += 1;
            this.AccountRepository.save(account);
        }
    }

    makeUdidMobileConfig(info: Apps) {
        let uuid = nodeuuid.v1();
        let mobileconfig = fs.readFileSync(path.join(path.resolve(), "Core", "Lib", "Apple", "udid.mobileconfig")).toString();
        mobileconfig = mobileconfig.replace(/\{domain\}/gi, config.domain);
        mobileconfig = mobileconfig.replace(`{key}`, info.app_key);
        mobileconfig = mobileconfig.replace(`{app_name}`, info.app_name);
        mobileconfig = mobileconfig.replace(`{app_bundle_id}`, info.app_bundle_id);
        mobileconfig = mobileconfig.replace(`{uuid}`, uuid);

        fs.writeFileSync(
            path.join(
                path.resolve(),
                "Public",
                "apps",
                info.app_bundle_id,
                "udid.mobileconfig"
            ),
            mobileconfig
        );

        let sslPath = path.join(path.resolve(), "Core", "Lib", "SSL");
        let mcPath = path.join(
            path.resolve(),
            "Public",
            "apps",
            info.app_bundle_id
        );

        child_process.execFileSync("openssl", [
            "smime", "-sign",
            `-signer`, `${sslPath}/domain.crt`,
            `-inkey`, `${sslPath}/domain.key`,
            `-certfile`, `${sslPath}/domain.ca`,
            `-nodetach`,
            `-outform`,
            `der`,
            `-in`, `${mcPath}/udid.mobileconfig`,
            `-out`, `${mcPath}/signed-udid.mobileconfig`,
        ]);
    }

    resolveXML(raw: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const xml = raw.substring(
                raw.indexOf('<?xml version="1.0" encoding="UTF-8"?>'),
                raw.indexOf("</plist>") + 8
            );
            xml2js.parseString(xml, (err, data) => {
                let deviceAttributes = data.plist.dict[0];
                let params: any = {};
                deviceAttributes.key.map((item: string, key: number) => {
                    params[item.toLowerCase()] = deviceAttributes.string[key];
                });
                err ? reject(err) : resolve(params);
            });
        });
    }

    getFolder() {
        return Date.now().toString();
    }

    //下载
    saveFile(appPath: string, base64: any, type: "crt" | "profile") {
        let content = Buffer.from(base64, "base64");
        fs.writeFileSync(
            path.join(
                appPath,
                type == "crt" ? "ios_distribution.cer" : "profile.mobileprovision"
            ),
            content
        );
    }

    makeManifest(app: Apps, account: Account, tempPath: string, folder: string) {
        fs.copyFileSync(`./Public/apps/${app.app_bundle_id}/base.ipa`, path.join(tempPath, "base.ipa"));
        fs.copyFileSync(`./Public/apps/${app.app_bundle_id}/icon.png`, path.join(tempPath, "icon.png"));

        let data = fs.readFileSync(`./Core/Lib/Apple/manifest.plist`).toString();
        let url = `https://${config.domain}/apps/${app.app_bundle_id}/temp/${folder}/`;

        data = data.replace(/\{ipa\}/gi, url + "app.ipa");
        data = data.replace(/\{icon\}/gi, url + "icon.png");
        data = data.replace(/\{bundleId\}/gi, "im.nord." + app.app_key);
        data = data.replace(/\{version\}/gi, app.app_version);
        data = data.replace(/\{name\}/gi, app.app_name);

        fs.writeFileSync(path.join(tempPath, "manifest.plist"), data);
    }

    resignIpa(tempPath: string, app: Apps, crt: string) {
        let name = "im.nord." + app.app_key
        child_process.execFileSync(
            path.join(path.resolve(), "Core", "Lib", "Sign", os.type(), "sign"),
            [
                `-k`, path.join(path.resolve(), "Core", "Lib", "Apple", "config", "sign_crt", crt),
                `-p`, `123`,
                `-m`, path.join(tempPath, `profile.mobileprovision`),
                `-b`, "im.nord." + app.app_key,
                `-z`, `9`,
                `-o`, path.join(tempPath, `app.ipa`),
                path.join(tempPath, `base.ipa`)
            ]
        );
    }
}
