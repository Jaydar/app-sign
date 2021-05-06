import * as fs from "fs";
import * as path from "path";
import axios from 'axios';
import config from "./config/config.json";
import * as jwt from "jsonwebtoken";

export interface iDevice {
    type: string,
    id: string,
    attributes: {
        addedDate: string
        name: string,
        deviceClass: string,
        model: string,
        udid: string,
        platform: string,
        status: string
    },
    links: {
        self: string
    }
}

export class AppleAPI {

    login_key: string;
    issuer_id: string;
    kid: string;
    token: string;

    constructor(issuer_id: string, kid: string, login_key: string) {
        this.issuer_id = issuer_id;
        this.kid = kid;
        this.login_key = login_key;
        this.token = this.getToken();
    }

    public getToken() {

        let data = {
            iss: this.issuer_id,
            exp: Date.now() / 1000 + 60 * 20,
            aud: 'appstoreconnect-v1'
        }

        let header = {
            alg: "ES256",
            kid: this.kid,
            typ: "JWT"
        }

        let privatekey = fs.readFileSync(path.join(__dirname, config.key_path, this.login_key))
        return jwt.sign(data, privatekey, { algorithm: "ES256", keyid: this.kid, header: header })
    }

    //获取证书
    public async getCertificate(type) {
        try {
            let res = await axios.get(config.api.certificate + `?filter[certificateType]=${type}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data[0];
        } catch (error) {
            return false;
        }
    }

    //添加证书
    public async addCertificate() {
        const data = {
            data: {
                type: 'certificates',
                attributes: {
                    certificateType: 'IOS_DISTRIBUTION',
                    csrContent: 'ios distribution',
                },
            },
        };
        try {
            let res = await axios.post(config.api.device, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data
        } catch (error) {
            console.error(error.response)
            return false
        }
    }

    //获取所有设备
    public async getDeviceAll(): Promise<[iDevice] | false> {
        try {
            let res = await axios.get(config.api.device, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data;

        } catch (error) {
            console.log(error.response);
            return false;
        }
    }
    //获取设备
    public async getDevice(udid: string) {
        try {
            let res = await axios.get(config.api.device + '?filter[udid]=' + udid, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data[0] || false;

        } catch (error) {
            // console.log(error.response);
            return false;
        }
    }

    //添加设备
    public async addDevice(udid: string): Promise<iDevice | false> {

        try {
            const data = {
                data: {
                    type: 'devices',
                    attributes: {
                        name: udid,
                        udid: udid,
                        platform: 'IOS',
                    },
                },
            };
            let res = await axios.post(config.api.device, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data;
        } catch (error) {
            console.error("addDevice", error.response.status)
            return false
        }
    }

    //获取应用标识
    public async getIdentifiers(identifier: string) {

        try {
            let res = await axios.get(config.api.bundleID + '?filter[name]=' + identifier.replace(/\./gi, ' '), {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data[0] || false;

        } catch (error) {
            console.log(error.response);
            return false;
        }
    }

    //添加设备标识
    public async addIdentifiers(identifier: string) {
        const data = {
            data: {
                type: 'bundleIds',
                attributes: {
                    identifier: identifier,
                    name: identifier.replace(/\./gi, ' '),
                    platform: 'IOS'
                },
            },
        };
        console.log(data);
        try {
            let res = await axios.post(config.api.bundleID, data, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            });
            return res.data.data || false;
        } catch (error) {
            console.error(error.response)
            return false
        }
    }

    //获取Profile
    public async getProFile(identifier) {
        //KRW6Q436V7
        try {
            let res = await axios.get(config.api.profile + `?filter[name]=${identifier}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            })
            return res.data.data[0] || false;
        } catch (error) {
            return false;
        }
    }

    public async delProFile(id) {
        try {
            let res = await axios.delete(config.api.profile + `/${id}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            })
            return res.data.data || false;
        } catch (error) {
            return false;
        }
    }

    //获取Profile 中的 设备
    public async getProFileDevices(profileId, udid) {
        try {
            let res = await axios.get(config.api.profile + `/${profileId}/devices?fields[devices]=${udid}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            })
            return res.data.data;
        } catch (error) {
            console.log(error.response);
            return false
        }

    }

    //注册Profile
    public async addProFile(name, identifier, crtId,udid) {
        try {
            const params = {
                data: {
                    type: 'profiles',
                    attributes: {
                        name: name,
                        profileType: 'IOS_APP_ADHOC',
                    },
                    relationships: {
                        bundleId: {
                            data: {
                                type: 'bundleIds',
                                id: identifier,
                            },
                        },
                        certificates: {
                            data: [{
                                type: 'certificates',
                                id: crtId,
                            }],
                        },
                        devices: {
                            data: [{
                                type: 'devices',
                                id: udid,
                            }],
                        },
                    },

                },
            };
            let res = await axios.post(config.api.profile, params, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + this.token,
                },
            })
            return res.data.data;
        } catch (error) {
            console.error("registerProfile", error.response)
            return false;
        }
    }

    //下载
    public async saveFile(appPath: string, base64: any, type: "crt" | "profile") {
        let content = Buffer.from(base64, "base64")
        fs.writeFileSync(path.join(appPath, type == 'crt' ? 'ios_distribution.cer' : 'profile.mobileprovision'), content)
    }
}

