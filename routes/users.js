const router = require('express').Router();

const {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.post('/', createUser);
router.get('/:userId', getUserById);

router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
