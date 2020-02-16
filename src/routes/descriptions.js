const express = require('express')
const Description = require('../models/Descriptions')
const postExist = require('../middleware/postExist')
const imageInPost = require('../middleware/imageInPost')
const adminOnly = require('../middleware/adminOnly')
const auth = require('../middleware/auth')


const router = express.Router()


router.post('/:id/:imageid', postExist, imageInPost, adminOnly, auth, async (req, res) => {
    const description = new Description({
        ...req.body
    })

    if (!description.paragraph || !description.image || description.image.toString() !== req.params.imageid) {
        return res.status(500).send('Please provide a paragraph to an existing image')
    }

    try {
        const newDescription = await description.save()
        req.image.descriptions = req.image.descriptions.concat(newDescription._id)
        req.post.save()
        res.send(req.post)

    } catch (e) {
        res.status(500).send('Could not add description')
    }
})

router.delete('/:id/:imageid/:description', postExist, imageInPost, adminOnly, auth, async (req, res) => {
    const dId = req.params.description
    const existing = req.image.descriptions.find(cur => cur.toString() === dId)
    if (!existing) {
        return res.send('No description to remove')
    }

    try {
        const description = await Description.findById(dId)
        await description.remove()
        req.image.descriptions = req.image.descriptions.filter(cur => cur.toString() !== dId )
        await req.post.save()
        res.send(req.post)

    } catch (e) {
    res.status(500).send('Could not find the description')
    }
})

module.exports = router