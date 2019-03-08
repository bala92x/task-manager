const express = require('express');
const multer = require('multer');
const bufferType = require('buffer-type');

const User = require('./../models/user');
const auth = require('./../middleware/auth');

const router = new express.Router();

router.post('/', async (req, res) => {
    const user = new User(req.body);

    try {
        await user.save()
        const token = await user.generateAuthToken();

        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();

        res.send({ user, token });
    } catch (err) {
        res.status(400).send();
    }
});

router.post('/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.post('/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.get('/me', auth, async (req, res) => {
    res.send(req.user);
});

router.patch('/me', auth,  async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });

        await req.user.save();
        res.send(req.user);
    } catch (err) {
        res.status(400).send();
    }
})

router.delete('/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch (err) {
        res.status(500).send();
    }
});

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
            return cb(new Error('File must be an image.'));
        }

        cb(undefined, true);
    }
});

router.post('/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const avatar = req.file.buffer;
    const avatarInfo = bufferType(avatar);
    const imageCheckRegex = /\.(jpg|jpeg|png|gif|webp)$/i;
    const isImage = typeof avatarInfo !== 'undefined' && imageCheckRegex.test(avatarInfo.extension);

    if (!isImage) {
        return res.status(400).send({ error: 'File must be an image.' });
    }

    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
}, (err, req, res, next) => {
    res.status(400).send({ error: err.message });
});

router.delete('/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
});

module.exports = router;