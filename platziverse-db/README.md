# micro-db

## Usage

``` js
const setupDatabase = require('micro-db')

setupDatabase(config).then( db => {
    const {Agent, Metric} = db
    
}).catch( err => console.error(err))
```