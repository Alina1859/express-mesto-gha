const router = require('express').Router();
const cookieParser = require('cookie-parser');

const {
  createUser,
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.use(cookieParser());

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.post('/', createUser);
router.get('/:userId', getUserById);

router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
