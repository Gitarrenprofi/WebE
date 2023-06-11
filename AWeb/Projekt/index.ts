/*
    Railtable Backend
*/

import express from "express"
import dotenv from "dotenv"
import * as xml2js from "xml-js"
import cors from "cors"
import fetch from "node-fetch"
import {spawn} from 'child_process'
dotenv.config()
//console.log(process.env)
const port = process.env.PORT || 3030

const app = express()
app.use(cors())

let lastTimetableRequestTimestamp = 0
// Milliseconds between requests to the DB timetable API
const TIMETABLE_RATE_LIMIT = 1000

app.use(express.static('dist', {dotfiles: 'ignore'}))

// Allows the client access to the DB timetable API while keeping the client secret hidden.
app.get("/tt", async (req, res) => {
    dotenv.config()
    const endpoint = req.query["endpoint"]
    console.log(`Received request for endpoint ${endpoint}`)
    // needed for CORS
    res.header("Access-Control-Allow-Origin", "*")
    // Validate request
    if (Date.now() - lastTimetableRequestTimestamp < TIMETABLE_RATE_LIMIT) return res.sendStatus(429)
    lastTimetableRequestTimestamp = Date.now()
    if (!endpoint) return res.status(400).send("No endpoint provided")
    if (!process.env.DB_CLIENT_SECRET) return res.status(500).send("No client secret provided")
    if (!process.env.DB_CLIENT_ID) return res.status(500).send("No client ID provided")
    // Forward request to DB
    console.log(`Sending request for endpoint ${endpoint} to DB`)
    try {
        const url = `https://apis.deutschebahn.com/db-api-marketplace/apis/timetables/v1/${endpoint}`
        console.log(`Sending request to ${url}`) 
        const xmlResponse = await fetch(url, {
            headers: [
                ["DB-Api-Key", process.env.DB_CLIENT_SECRET],
                ["DB-Client-Id", process.env.DB_CLIENT_ID],
                ["Accept", "application/xml"]
            ]
        })
        if (!xmlResponse.ok) res.status(xmlResponse.status).send(xmlResponse.statusText)
        else {
            console.log(`Received response for endpoint ${endpoint} from DB`)
            // Convert response to JSON
            const xml = await xmlResponse.text()
            const data = xml2js.xml2js(xml, { compact: true})
            res.status(200).send(data)
        }
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`)
    // Spawn the webserver
    spawn("npm run dev", {
        shell: true,
        detached: false,
        cwd: "."
    })
})
