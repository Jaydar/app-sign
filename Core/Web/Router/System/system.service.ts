import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindConditions, FindManyOptions } from 'typeorm';
import { Account } from '../../Entity/account.entity';
import { Device } from '../../Entity/device.entity';
import { User } from '../../Entity/user.entity';
import { Order } from '../../Entity/order.entity';
import { Apps } from '../../Entity/apps.entity';

import { AppleAPI } from "../../../Lib/Apple/AppleAPI";


@Injectable()
export class SystemService {

    constructor(
        @InjectRepository(Account) private readonly AccountRepository: Repository<Account>,
        @InjectRepository(Device) private readonly DeviceRepository: Repository<Device>,
        @InjectRepository(User) private readonly UserRepository: Repository<User>,
        @InjectRepository(Order) private readonly OrderRepository: Repository<Order>,
        @InjectRepository(Apps) private readonly AppRepository: Repository<Apps>
    ) {
        console.log('init SystemService')
    }

    async addAccount(account: any): Promise<Account> {
        return this.AccountRepository.save({
            ...account,
            exp_date: "",
            devices_num: 100,
        });
    }
    async findOneAccount(where?: Account) {
        return this.AccountRepository.findOne({
            account_status: 1,
            ...where
        });
    }

    async findAccounts(where?: Account): Promise<Account[]> {
        return this.AccountRepository.find({
            account_status: 1,
            ...where,
        });
    }

    async addUser(user: User) {
        return this.UserRepository.save(user)
    }
    async addApp(app: Apps) {
        return this.AppRepository.save(app)
    }

    async editAccount(account: Account): Promise<Account> {
        return this.AccountRepository.save(account)
    }

    async addOrder(order: Order) {
        return this.OrderRepository.save(order)
    }


    async syncDevice(account: Account) {
        let api = new AppleAPI(account.issuer_id, account.login_kid, account.login_key)
        let devices = await api.getDeviceAll() || [];

        let res = [];

        this.editAccount({
            ...account,
            devices_num: devices.length
        })

        for (const device of devices) {
            console.log(device);
            let addRes = await this.DeviceRepository.save({
                account_id: account.id.toString(),
                account_name: account.login_name,
                device_id: device.id,
                device_udid: device.attributes.udid,
                device_name: device.attributes.name,
                device_class: device.attributes.deviceClass,
                device_model: device.attributes.model,
                device_platform: device.attributes.platform,
                device_status: device.attributes.status,
                device_add_time: device.attributes.addedDate
            })
            res.push(addRes);
        }

        return res
    }
}
