require('./db/mongoose');
const express = require('express');

const User = require('./models/user');
const Task = require('./models/task');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        await user.save()
        res.status(201).send(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find({});
        res.send(users);
    } catch (err) {
        res.status(500).send();
    }
});

app.get('/users/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findById(_id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.patch('/users/:id', async (req, res) => {
    const _id = req.params.id;
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await User.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        });
        
        if(!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
})

app.delete('/users/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const user = await User.findByIdAndDelete(_id);

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (err) {
        res.status(500).send();
    }
});

app.post('/tasks', async (req, res) => {
    const task = new Task(req.body);

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.get('/tasks', async (req, res) => {
    try {
        const task = await Task.find({});
        res.send(task);        
    } catch (err) {
        res.status(500).send(err);
    }
});

app.get('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    
    try {
        const task = await Task.findById(_id);

        if(!task) {
           return res.status(404).send();
        }

        res.send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

app.patch('/tasks/:id', async (req, res) => {
    const _id = req.params.id;
    const allowedUpdates = ['description', 'completed'];
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const user = await Task.findByIdAndUpdate(_id, req.body, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).send();
        }

        res.send(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.delete('/tasks/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findByIdAndDelete(_id);

        if (!task) {
            return res.status(404).send();
        }

        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});