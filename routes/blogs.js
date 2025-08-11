const express = require('express')
const router = express.Router()

// middleware that is specific to this router
const timeLog = (req, res, next) => {
  console.log('Time: ', Date.now())
  next()
}
router.use(timeLog)

// define the home page route
router.get('/', (req, res) => {
  res.send('Blogs home page')
})
// define the about route
router.get('/post/:post', (req, res) => {
  res.send(`About blog ${req.params.post}`)
})

module.exports = router