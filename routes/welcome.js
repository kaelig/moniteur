import express from 'express'

const router = express.Router()

export default router.get('/', (req, res) => {
  res.render('welcome', { title: 'moniteur: welcome!' })
})
