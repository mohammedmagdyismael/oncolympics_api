const db = require('../db');
const prisma = require('../db_prisma');
const Constants = require('../utils/Constants');

exports.getAllMatches = async (req, res) => {
  try {
    const response = {
      [`${Constants.STAGES.Second_round}`]: [],
      [`${Constants.STAGES.Third_round}`]: [],
      [`${Constants.STAGES.Final_round}`]: [],
    };

    for (const [key, value] of Object.entries(Constants.STAGES)) {
      const [results] = await db.query(`
        SELECT 
          m.id as match_id,
          t1.name AS team1_name, 
          t1.abbrev AS team1_abbrev, 
          t1.id AS team1_id, 
          t1.logo AS team1_logo, 
          t2.name AS team2_name, 
          t2.abbrev AS team2_abbrev, 
          t2.id AS team2_id,
          t2.logo AS team2_logo,
          m.score_team1, 
          m.score_team2,
          m.match_type,
          m.date_time,
          m.match_status
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.id
        JOIN Teams t2 ON m.team2_id = t2.id
        WHERE m.match_type = '${value}'
        ORDER BY m.date_time
      `);
      response[key] = results;
    }

    res.json({
      status: 200,
      data: response,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAllMatchesA = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          m.id as match_id,
          t1.name AS team1_name, 
          t1.abbrev AS team1_abbrev, 
          t1.id AS team1_id, 
          t1.logo AS team1_logo, 
          t2.name AS team2_name, 
          t2.abbrev AS team2_abbrev, 
          t2.id AS team2_id,
          t2.logo AS team2_logo,
          m.score_team1, 
          m.score_team2,
          m.match_type,
          m.date_time,
          m.match_status
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.id
        JOIN Teams t2 ON m.team2_id = t2.id
        WHERE m.match_type = '${Constants.STAGES.Second_round}'
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

exports.getAllMatchesB = async (req, res) => {
    try {
      const [results] = await db.query(`
        SELECT 
          m.id as match_id,
          t1.name AS team1_name, 
          t1.abbrev AS team1_abbrev, 
          t1.id AS team1_id, 
          t1.logo AS team1_logo, 
          t2.name AS team2_name, 
          t2.abbrev AS team2_abbrev, 
          t2.id AS team2_id,
          t2.logo AS team2_logo,
          m.score_team1, 
          m.score_team2,
          m.match_type,
          m.date_time,
          m.match_status
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.id
        JOIN Teams t2 ON m.team2_id = t2.id
        WHERE m.match_type = '${Constants.STAGES.Third_round}'
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

exports.getAllMatchesFinal = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        m.id as match_id,
        t1.name AS team1_name, 
        t1.abbrev AS team1_abbrev, 
        t1.id AS team1_id, 
        t1.logo AS team1_logo, 
        t2.name AS team2_name, 
        t2.abbrev AS team2_abbrev, 
        t2.id AS team2_id,
        t2.logo AS team2_logo,
        m.score_team1, 
        m.score_team2,
        m.match_type,
        m.date_time,
        m.match_status
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.id
      JOIN Teams t2 ON m.team2_id = t2.id
      WHERE m.match_type = '${Constants.STAGES.Final_round}'
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

exports.matchdetails = async (req, res) => {

    const { matchid } = req.query;

    const matchscoresRecord = `
        SELECT 
          MatchScore.id,
          MatchScore.questionId,
          MatchScore.matchId,
          team_1.name AS team1_name,
          team_1.abbrev AS team1_abbrev,
          team_1.logo AS team1_logo,
          MatchScore.score_team1,
          team_2.name AS team2_name,
          team_2.abbrev AS team2_abbrev,
          team_2.logo AS team2_logo,
          MatchScore.score_team2
        FROM MatchScore
        JOIN 
          Teams team_1 ON MatchScore.team1_id = team_1.id
        JOIN 
          Teams team_2 ON MatchScore.team2_id = team_2.id
        where MatchScore.matchId = ${matchid};
    `;

    try {
      const [results] = await db.query(matchscoresRecord);
    res.json({
        status: 200,
        data: results
    });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
};

