import { Column, Entity, ObjectID, ObjectIdColumn } from 'typeorm';

@Entity()
export class Order {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    user_id: string; //用户ID

    @Column()
    user_name: string; //用户名称

    @Column()
    client_num: number; //购买数量

    @Column()
    order_amount: number; //订单金额

    @Column()
    pay_amount: number; //实际支付金额

    @Column({ type: 'enum', enum: [1, 2, 3] })
    order_status: number; //订单状态 0:已取消, 1:待支付, 2:完成

    @Column({default:new Date()})
    order_add_time: Date; //下单时间

    @Column()
    order_exp_time: Date; //过期时间
}