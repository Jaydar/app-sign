import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Account {

    @ObjectIdColumn()
    id: ObjectID;

    @Column({ unique: true })
    login_name: string;

    @Column()
    login_pass: string;

    @Column()
    login_key: string;

    @Column()
    sign_crt: string;

    @Column()
    sign_pass: string;

    @Column()
    issuer_id: string;

    @Column()
    login_kid: string;

    @Column()
    devices_num: number;

    @Column()
    account_exp_time: Date;

    @Column({ type: 'enum', enum: [0, 1] })
    account_status: number; // 0 禁用 1 正常

    @Column({default:new Date()})
    data_add_time:Date;
}