require('dotenv').config()

const GeneratorTask = require('./generate.task')

GeneratorTask.cronJob().start()
console.log('UTL Cron Started')
