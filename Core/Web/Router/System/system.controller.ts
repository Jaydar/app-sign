import { Controller, Get, Post, Render, Header, Req, Res, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { SystemService } from './system.service';
import init from "../../Entity/init.json";
import { User } from '../../Entity/user.entity';
import { Order } from '../../Entity/order.entity';
import { Apps } from '../../Entity/apps.entity';
import { AppleAPI } from "../../../Lib/Apple/AppleAPI";


@Controller('/system')
export class SystemController {

    constructor(private readonly SystemService: SystemService) { }

    @Get('test')
    async test() {
        let account = init.accounts[0];
        console.log(account.login_key)
        let api = new AppleAPI(account.issuer_id, account.login_kid, account.login_key)
        let devices = await api.getDeviceAll() || [];
        console.log(devices);
    }

    @Get('init')
    async init() {
        let addRes = {
            accounts:[],
            users:[],
            apps:[],
            orders:[],
            devices:[],
        };
        console.log("init account")
        for (const item of init.accounts) {
            let account = await this.SystemService.addAccount(item);
            addRes.accounts.push(account)
        }

        console.log("init users")
        for (const item of init.users) {
            let user = await this.SystemService.addUser(item as User);
            addRes.users.push(user)
        }

        console.log("init app")
        for (const item of init.apps) {

            let app = await this.SystemService.addApp({
                ...item,
                user_id:addRes.users[0].id.toString(),
            } as Apps );
            addRes.apps.push(app)
        }

        console.log("init orders")
        for (const item of init.orders) {

            let exp_time = new Date()
            exp_time.setFullYear(2020);

            let order = await this.SystemService.addOrder({
                ...item,
                user_id:addRes.users[0].id,
                user_name:addRes.users[0].login_name,
                order_add_time: exp_time,
            } as Order)

            addRes.orders.push(order)
        }

        console.log("init devices")

        for (const account of addRes.accounts) {
            let device = await this.SystemService.syncDevice(account);
            addRes.devices.push(device);
        }

        console.log("end")

        return addRes
    }
}
