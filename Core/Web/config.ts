
function config(env) {
    return env == "dev" ? {
        domain: "app.nord.im",
        db: {
            host: '127.0.0.1',
            port: 27017,
            database: 'app-sign',
            username: "sign",
            password: "123123",
            // useNewUrlParser:true,
        }
    } : {
        domain: "super.ancpoker.com",
        db: {
            host: '172.18.1.3',
            port: 27017,
            database: 'super-sign',
            username: "super",
            password: "123123",
        }
    }
}


export default config(process.env.NODE_ENV);
