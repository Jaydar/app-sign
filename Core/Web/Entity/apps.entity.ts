import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Apps {

    @ObjectIdColumn()
    id:string;

    @Column()
    user_id: string;
    @Column()
    app_key: string;

    @Column()
    app_name: string;

    @Column()
    app_bundle_id: string;

    @Column()
    app_version: string;

    @Column()
    android_target: string;
    
    @Column()
    ios_target: string;

    @Column({default:new Date()})
    data_add_time:Date;
}