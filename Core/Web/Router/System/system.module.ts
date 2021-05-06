import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '../../Entity/account.entity';
import { Device } from '../../Entity/device.entity';
import { User } from '../../Entity/user.entity';
import { Order } from '../../Entity/order.entity';
import { Apps } from '../../Entity/apps.entity';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';


@Module({
    imports: [TypeOrmModule.forFeature([Account, User, Order, Device, Apps])],
    controllers: [SystemController],
    providers: [SystemService],
})
export class SystemModle { }
