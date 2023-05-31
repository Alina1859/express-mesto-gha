const router = require('express').Router();

const {
  createUser,
  getUser,
  getUserById,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/users', getUser);
router.post('/users', createUser);
router.get('/users/:userId', getUserById);

router.patch('/users/me', updateProfile);
router.patch('/users/me/avatar', updateAvatar);

module.exports = router;
