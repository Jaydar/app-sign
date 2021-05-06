import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

class App {
    app_name: string;
    app_short_name: string;
    app_bundle_id: string;
    app_version: string;
    android: string;
}

@Entity()
export class User {


    @ObjectIdColumn()
    id: ObjectID;

    @Column({ unique: true })
    user_name: string;

    @Column({ unique: true })
    login_name: string;

    @Column()
    login_pass: string;

    @Column({ type: 'enum', enum: [0, 1] })
    user_status: number; // 0 禁用 1 正常

    @Column({default:new Date()})
    data_add_time:Date;
}