const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(cors());

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const response = await axios.get(`http://localhost:4000/user?username=${username}`);
        const users = response.data;

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username' });
        } else {
            const user = users[0];
            if (user.password === password) {
                res.json({ message: 'Login successful' });
            } else {
                res.status(401).json({ message: 'Invalid password' });
            }
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while trying to authenticate' });
    }
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const balance = 0;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    if (password.length <= 8) {
        return res.status(400).json({ message: 'Password must be more than 8 characters' });
    }

    try {
        const usersResp = await axios.get('http://localhost:4000/user');
        const users = usersResp.data;
        const userExists = users.find(u => u.username === username);

        if (userExists) {
            return res.status(409).json({ message: 'User already exists' });
        }

        await axios.post('http://localhost:4000/user', { username, password, balance });

        res.status(201).json({ message: 'User registered successfully', username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

app.get('/get_balance', async (req, res) => {
    const { username } = req.body; 

    if (!username) {
        return res.status(400).json({ message: 'Username is required' });
    }

    try {
        const usersResp = await axios.get('http://localhost:4000/user');
        const users = usersResp.data;
        const user = users.find(u => u.username === username);

        if (user) {
            res.json({ username: user.username, balance: user.balance });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while trying to fetch the balance' });
    }
});

app.post('/deposit', async (req, res) => {
    const { username, balance } = req.body;

    if (!username || balance == null) {
        return res.status(400).json({ message: 'Username and balance are required' });
    }

    if (balance <= 0) {
        return res.status(400).json({ message: 'balance must be greater than 0' });
    }

    try {
        const usersResp = await axios.get(`http://localhost:4000/user?username=${username}`);
        const users = usersResp.data;

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];
        const updatedBalance = user.balance + balance;

        await axios.patch(`http://localhost:4000/user/${user.id}`, { balance: updatedBalance });

        res.json({ message: 'Deposit successful', balance: updatedBalance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while trying to deposit' });
    }
});

app.get('/', (req, res) => {
    res.json("home");
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});