import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperController } from './super.controller';
import { SuperService } from './super.service';
import { Account } from '../../Entity/account.entity';
import { Device } from '../../Entity/device.entity';
import { User } from '../../Entity/user.entity';
import { Order } from '../../Entity/order.entity';
import { Apps } from '../../Entity/apps.entity';


@Module({
    imports: [TypeOrmModule.forFeature([Account, User, Order, Device, Apps])],
    controllers: [SuperController],
    providers: [SuperService],
})
export class SuperModule { }
