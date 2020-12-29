import express from 'express'

const router = express.Router!

router.get('/') do $2.status(200).send('Notion 2 Anki')

export default router