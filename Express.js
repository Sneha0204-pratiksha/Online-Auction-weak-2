/* Improved Online Auction Platform - React (Frontend) and Express.js (Backend) */

// Backend: Express.js (server.js)
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/auction', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  startingBid: { type: Number, required: true, min: 0 },
  currentBid: { type: Number, required: true, min: 0 },
  createdAt: { type: Date, default: Date.now },
});

const Item = mongoose.model('Item', ItemSchema);

app.get('/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching items', error });
  }
});

app.post('/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: 'Error adding item', error });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

// Frontend: React (App.js)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startingBid, setStartingBid] = useState('');

  useEffect(() => {
    axios.get('http://localhost:5000/items')
      .then(response => setItems(response.data))
      .catch(error => console.error('Error fetching items:', error));
  }, []);

  const addItem = () => {
    if (!name || !description || !startingBid) {
      alert('Please fill all fields');
      return;
    }

    const newItem = { name, description, startingBid: Number(startingBid), currentBid: Number(startingBid) };
    axios.post('http://localhost:5000/items', newItem)
      .then(response => setItems([...items, response.data]))
      .catch(error => console.error('Error adding item:', error));
  };

  return (
    <div>
      <h1>Online Auction Platform</h1>
      <div>
        <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
        <input placeholder="Starting Bid" type="number" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} />
        <button onClick={addItem}>Add Item</button>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item._id}>{item.name} - ${item.currentBid}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
