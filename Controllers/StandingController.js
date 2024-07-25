const db = require('../db'); // Assuming db is your database connection module

exports.getAllMatches = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          t1.name AS team1_name, 
          t1.id AS team1_id, 
          t2.name AS team2_name, 
          t2.id AS team2_id,
          m.score_team1, 
          m.score_team2,
          m.match_type,
          m.date_time
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.id
        JOIN Teams t2 ON m.team2_id = t2.id
        ORDER BY m.date_time
      `);
    res.json({
        status: 200,
        data: results
    });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };