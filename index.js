require('dotenv').config()

const GeneratorTask = require('./generate.task')

GeneratorTask.handle('solana-tokenlist.json').then(() => {
    console.log('UTL Completed')
})
