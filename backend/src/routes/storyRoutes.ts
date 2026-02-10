import express from 'express';
import {
  createStory,
  deleteStory,
  getStoryFeed,
  getStoryLikes,
  markStorySeen,
  replyToStory,
  storyUpload,
  toggleStoryLike,
} from '../controllers/storyController';

const router = express.Router();

router.get('/feed', getStoryFeed);
router.post('/', storyUpload.single('media'), createStory);
router.patch('/:storyId/seen', markStorySeen);
router.post('/:storyId/like', toggleStoryLike);
router.get('/:storyId/likes', getStoryLikes);
router.post('/:storyId/reply', replyToStory);
router.delete('/:storyId', deleteStory);

export default router;
