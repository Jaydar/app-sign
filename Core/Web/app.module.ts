import { join } from 'path';
import { Module } from '@nestjs/common';
// import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SuperModule } from './Router/Home/super.module';
import { SystemModle } from './Router/System/system.module';
import config from './config'

console.log(config);

@Module({
    imports: [
        TypeOrmModule.forRoot({
            ...config.db,
            type: 'mongodb',
            // ...config.db,
            entities: [join(__dirname, './**/**.entity{.ts,.js}')],
            useNewUrlParser: true,
            useUnifiedTopology:true,
            //synchronize: true,
        }),
        SuperModule,
        SystemModle
    ]
})
export class ApplicationModule { }
