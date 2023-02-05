const path = require('path');

module.exports = {
    // entry:'./src/code.ts',
    entry:'./src/rxjs-operators.ts',
    devtool:'inline-source-map',
    module:{
        rules:[
            {
                test:/\.tsx?$/,
                use:'ts-loader',
                exclude:/node_modules/
            }
        ]
    },
    resolve:{
        extensions:['.ts','.js','.tsx']
    },
    output:{
        filename:'bundle.js',
        path:path.join(__dirname,'./dist')
    },
    devServer:{
        static:{
            directory:path.join(__dirname,"/")
        }
    }
}