// controllers/matchController.js

const db = require('../db'); // Assuming you have a database module for handling DB operations

exports.getNextMatch = async (req, res) => {
  const token = req.headers.token;

  try {
    // Query to get the userId from the Users table using the token
    const [user] = await db.query(`SELECT id, role FROM Users WHERE token ="${token}"`);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let query = '';

    if (user[0].role === 'Team') {
        query = `SELECT * FROM Matches 
       WHERE (team1_id IN (
               SELECT userId 
               FROM Teams 
               WHERE userId = ?) 
           OR team2_id IN (
               SELECT userId 
               FROM Teams 
               WHERE userId = ?))
       AND match_status <> 2
       ORDER BY date_time ASC
       LIMIT 1`;
    } else {
        query = `
            SELECT * FROM Matches 
            where match_status <> 2
            ORDER BY date_time ASC
            LIMIT 1
        `
    }

    const userId = user[0].id;


    // Query to get the next match for the user's team
    const [match] = await db.query(
        query,
      [userId, userId]
    );

    if (!match) {
      return res.status(404).json({ message: 'No upcoming match found' });
    }

    res.json({ status: 200, data: match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updateMatchStatus = async (req, res) => {
    const { newStatus } = req.body;
    const token = req.headers.token;
  
    if (![1, 2].includes(newStatus)) {
      return res.status(400).json({ error: 'Invalid new status' });
    }
  
    try {
      // Verify user is Admin
      const [user] = await db.query('SELECT role FROM Users WHERE token = ?', [token]);
      if (user.length === 0 || user[0].role !== 'Admin') {
        return res.status(403).json({ error: 'User is not authorized to perform this action' });
      }
  
      // Get the first match with match_status 0 or 1
      const [matches] = await db.query(
        'SELECT id, match_status FROM Matches WHERE match_status IN (0, 1) ORDER BY date_time LIMIT 1'
      );
  
      if (matches.length === 0) {
        return res.status(404).json({ error: 'No match found with status 0 or 1' });
      }
  
      const match = matches[0];
      if ((match.match_status === 0 && newStatus === 1) || (match.match_status === 1 && newStatus === 2)) {
        // Update match status
        await db.query(`UPDATE Matches SET match_status=${newStatus} WHERE id=${match.id}`);
        res.status(200).json({ message: `Match status updated to ${newStatus}` });
      } else {
        res.status(400).json({ error: 'Invalid status transition' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

exports.incrementCurrentQuestion = async (req, res) => {
    const token = req.headers.token;
  
    try {
      // Verify user is Admin
      const [user] = await db.query('SELECT role FROM Users WHERE token = ?', [token]);
      if (user.length === 0 || user[0].role !== 'Admin') {
        return res.status(403).json({ error: 'User is not authorized to perform this action' });
      }
  
      // Increment current_question for the first match with status 0
      const [matches] = await db.query('SELECT id FROM Matches WHERE match_status = 1 LIMIT 1');
      
      if (matches.length === 0) {
        return res.status(404).json({ error: 'No match found with status 0' });
      }
  
      const matchId = matches[0].id;
      await db.query('UPDATE Matches SET current_question = current_question + 1 WHERE id = ?', [matchId]);
  
      res.status(200).json({ message: 'Current question index incremented successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };