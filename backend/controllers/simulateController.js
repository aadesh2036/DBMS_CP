const db = require("../db");
const simulateModel = require("../models/simulateModel");

const firstNames = [
  "Ava",
  "Noah",
  "Maya",
  "Liam",
  "Zoe",
  "Arjun",
  "Sara",
  "Hugo",
  "Mila",
  "Owen",
];
const lastNames = [
  "Patel",
  "Ng",
  "Gomez",
  "Kim",
  "Singh",
  "Lopez",
  "Carter",
  "Chen",
  "Rossi",
  "Nair",
];
const bioTopics = [
  "coffee runs",
  "data notes",
  "city walks",
  "late-night coding",
  "music playlists",
  "fitness tips",
  "travel plans",
  "book reviews",
];
const postStems = [
  "Sharing a quick update",
  "Learning something new",
  "Trying a fresh routine",
  "Weekend reflections",
  "Small win today",
  "Testing a new idea",
];
const postTopics = [
  "query performance",
  "project planning",
  "healthy habits",
  "favorite playlists",
  "teamwork",
  "new recipes",
  "travel routes",
  "study goals",
];
const commentStems = [
  "Nice!",
  "Agree with this.",
  "Great point.",
  "Thanks for sharing.",
  "Interesting take.",
  "Love it.",
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom(list) {
  return list[randomInt(0, list.length - 1)];
}

function randomDateWithinDays(days) {
  const now = Date.now();
  const offset = randomInt(0, days * 24 * 60 * 60 * 1000);
  return new Date(now - offset);
}

function randomDateBetween(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  if (end <= start) {
    return new Date(start);
  }
  const offset = randomInt(0, end - start);
  return new Date(start + offset);
}

function buildUsername(firstName, lastName) {
  const salt = randomInt(10, 999);
  return `${firstName[0]}${lastName}${salt}`.toLowerCase();
}

async function simulateData(req, res) {
  const connection = await db.getConnection();

  try {
    const body = req.body || {};
    const usersCount = Number(body.users) || randomInt(5, 10);
    const postsCount = Number(body.posts) || randomInt(8, 16);
    const commentsCount = Number(body.comments) || randomInt(10, 20);
    const likesCount = Number(body.likes) || randomInt(10, 20);
    const followersCount = Number(body.followers) || randomInt(10, 20);

    await connection.beginTransaction();

    const existingUserIds = await simulateModel.getAllUserIds(connection);
    const existingPostIds = await simulateModel.getAllPostIds(connection);

    const newUserIds = [];
    const usedUsernames = new Set();

    for (let i = 0; i < usersCount; i += 1) {
      let insertedId = null;
      let attempts = 0;

      while (!insertedId && attempts < 5) {
        const firstName = randomFrom(firstNames);
        const lastName = randomFrom(lastNames);
        const username = buildUsername(firstName, lastName);

        if (usedUsernames.has(username)) {
          attempts += 1;
          continue;
        }

        const createdAt = randomDateWithinDays(90);
        const lastLogin = randomDateBetween(createdAt, new Date());

        const result = await simulateModel.insertUser(connection, {
          username,
          email: `${username}@example.com`,
          password_hash: `hash_${username}`,
          full_name: `${firstName} ${lastName}`,
          bio: `Into ${randomFrom(bioTopics)}.`,
          profile_picture_url: `https://pics.example.com/avatars/${username}.png`,
          created_at: createdAt,
          last_login: lastLogin,
        });

        if (result.affectedRows > 0) {
          insertedId = result.insertId;
          usedUsernames.add(username);
          newUserIds.push(insertedId);
        }

        attempts += 1;
      }
    }

    const allUserIds = existingUserIds.concat(newUserIds);
    if (allUserIds.length === 0) {
      throw new Error("No users available for simulation");
    }

    const newPostIds = [];
    for (let i = 0; i < postsCount; i += 1) {
      const userId = randomFrom(allUserIds);
      const content = `${randomFrom(postStems)} about ${randomFrom(postTopics)}.`;
      const postId = await simulateModel.insertPost(
        connection,
        userId,
        content,
        randomDateWithinDays(60)
      );
      newPostIds.push(postId);
    }

    const allPostIds = existingPostIds.concat(newPostIds);
    if (allPostIds.length === 0) {
      throw new Error("No posts available for simulation");
    }

    let insertedComments = 0;
    for (let i = 0; i < commentsCount; i += 1) {
      const userId = randomFrom(allUserIds);
      const postId = randomFrom(allPostIds);
      const content = `${randomFrom(commentStems)} ${randomFrom(postTopics)}.`;
      await simulateModel.insertComment(
        connection,
        postId,
        userId,
        content,
        randomDateWithinDays(60)
      );
      insertedComments += 1;
    }

    let insertedLikes = 0;
    const likePairs = new Set();
    let likeAttempts = 0;

    while (insertedLikes < likesCount && likeAttempts < likesCount * 4) {
      const userId = randomFrom(allUserIds);
      const postId = randomFrom(allPostIds);
      const key = `${userId}-${postId}`;

      if (likePairs.has(key)) {
        likeAttempts += 1;
        continue;
      }

      likePairs.add(key);
      const result = await simulateModel.insertLike(
        connection,
        postId,
        userId,
        randomDateWithinDays(60)
      );

      if (result.affectedRows > 0) {
        insertedLikes += 1;
      }

      likeAttempts += 1;
    }

    let insertedFollowers = 0;
    const followPairs = new Set();
    let followAttempts = 0;

    while (insertedFollowers < followersCount && followAttempts < followersCount * 4) {
      const followerId = randomFrom(allUserIds);
      const followingId = randomFrom(allUserIds);
      const key = `${followerId}-${followingId}`;

      if (followerId === followingId || followPairs.has(key)) {
        followAttempts += 1;
        continue;
      }

      followPairs.add(key);
      const result = await simulateModel.insertFollow(
        connection,
        followerId,
        followingId,
        randomDateWithinDays(60)
      );

      if (result.affectedRows > 0) {
        insertedFollowers += 1;
      }

      followAttempts += 1;
    }

    await connection.commit();

    res.json({
      message: "Simulation complete",
      inserted: {
        users: newUserIds.length,
        posts: newPostIds.length,
        comments: insertedComments,
        likes: insertedLikes,
        followers: insertedFollowers,
      },
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: "Simulation failed", details: error.message });
  } finally {
    connection.release();
  }
}

module.exports = { simulateData };
