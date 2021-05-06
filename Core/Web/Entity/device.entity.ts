import { Column, Entity, ObjectID, ObjectIdColumn ,OneToOne,ManyToOne } from 'typeorm';

import { Account } from "./account.entity";
import { User } from "./user.entity";

@Entity()
export class Device {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    account_id:string

    @Column()
    account_name:string

    @Column()
    user_id: string;

    @Column()
    device_id: string;

    @Column()
    device_udid: string;

    @Column()
    device_name: string;

    @Column()
    device_class: string;

    @Column()
    device_model: string;

    @Column()
    device_platform: string;

    @Column()
    device_status: string;

    @Column()
    device_add_time: Date;

    @Column()
    order_id: string;

    @Column({default:new Date()})
    data_add_time: Date;
}