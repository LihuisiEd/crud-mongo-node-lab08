const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const registrationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const User = mongoose.model('User', userSchema);

router.get('/', async (req, res) => {
  const users = await User.find();
  res.render('index', { users });
});


router.post('/', async (req, res) => {
  try {
    const { error, value } = registrationSchema.validate(req.body);
    const users = await User.find();
    if (error) {
      const errorDetails = error.details.reduce((acc, err) => {
        acc[err.context.key] = err.message;
        return acc;
      }, {});
      console.log(errorDetails);
      return res.render('partials/error', { errors: errorDetails, formData: req.body, users });
    } else {
      // Resto del código para guardar el usuario
      const { name, email, password } = value;
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        name,
        email,
        password: hashedPassword
      });
      await newUser.save();
      res.redirect('/users');
    }
  } catch (error) {
    console.log("Error al encriptar", error);
  }
});

router.get('/edit/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  res.render('partials/edit', { user });
});

router.post('/update/:id', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const user = await User.findById(req.params.id);

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }
    user.name = name;
    user.email = email;
    await user.save();
    res.redirect('/users');
  } catch (error) {
    console.log("Error al encriptar", error);
  }
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/users');
});

module.exports = router;
