require('./db/mongoose');

const express = require('express');

const userRouter = require('./routers/userRouter');
const taskRouter = require('./routers/taskRouter');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/users', userRouter);
app.use('/tasks', taskRouter);

app.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});