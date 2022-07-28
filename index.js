const axios = require('axios');
const express = require('express')
const bodyParser = require('body-parser')
const {WebhookClient} = require('dialogflow-fulfillment');

const app = express()
app.use(bodyParser.json())
const port = process.env.PORT || 3000
app.post('/dialogflow-fulfillment', express.json(), (request, response) => {
    dialogflowFulfillment(request, response)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

const statesUrl = 'https://api.iskibris.com/api/hooks/bots/jobs/statistics'
const categoriesUrl = 'https://staging.iskibris.com/api/hooks/bots/job-categories'

const dialogflowFulfillment = (request, response) => {
    const agent = new WebhookClient({request, response})
    
    function getStates() {
        return axios.get(statesUrl).then(res => {
            const user_logged_in = res.data.users_logged_in
            const applied_users = res.data.applied_users
            const number_of_applications = res.data.number_of_applications
            agent.add(`Number of users logged in  :${user_logged_in} \n Number of users applied :${applied_users} \n Number of applications :${number_of_applications}
            `)
        })
    }

    function getCategories() {
        return axios.get(categoriesUrl).then(res => {
             const categories = res.data.map((category)=>{
                const categoryName =   `${category.name_en}`
                return categoryName
            })
            agent.add(`${categories.join('\n')}`)
        })
    }
   

    let intentMap = new Map();
    intentMap.set("Jobs Stats", getStates)
    intentMap.set("Jobs Categories", getCategories)

    agent.handleRequest(intentMap)

}