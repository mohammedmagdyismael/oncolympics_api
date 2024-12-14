// controllers/matchController.js

const db = require('../db');
const prisma = require('../db_prisma');
const groupController = require('./GroupController');
const Constants = require('../utils/Constants');

// Moderator
exports.getNextMatchModerator = async (req, res) => {
  const token = req.headers.token;


  try {
    // Query to get the userId from the Users table using the token
    const [user] = await db.query(`SELECT id, role FROM Users WHERE token ="${token}"`);

    if (!user || !(user && user.length > 0 && user[0].role === Constants.ROLES.ADMIN)) {
      return res.status(404).json({ message: 'User not found or not authorized' });
    }

    const userId = user[0].id;


    const query = `
      SELECT 
        Matches.id,
          team1_id,
          team_1.name AS team1_name,
          team_1.logo AS team1_logo,
          team_1.abbrev AS team1_abbrev,
          score_team1,
          team2_id,
          team_2.name AS team2_name,
          team_2.logo AS team2_logo,
          team_2.abbrev AS team2_abbrev,
          score_team2,
          date_time,
          match_type,
          question_file,
          match_status,
          current_question,
          canAnswer
      FROM 
          Matches
      JOIN 
          Teams team_1 ON Matches.team1_id = team_1.id
      JOIN 
          Teams team_2 ON Matches.team2_id = team_2.id
      where Matches.id in (
              select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
      );
    `;

    // Query to get the next match for the user's team
    const [match] = await db.query(query);

    if (!match) {
      return res.status(404).json({ message: 'No upcoming match found' });
    }

    res.json({ status: 200, data: match });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCurrentQuestionAnswers = async (req, res) => {
  const { matchId, questionId } = req.query;
  try {
    // Query to get the userId from the Users table using the token
    const questionDetails = await prisma.matchScore.findFirst({
      where: {
        matchId: {
          equals: Number(matchId),
        },
        questionId: {
          equals: Number(questionId),
        },
      }
    });

    res.json({ status: 200, data: { ...questionDetails } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.startMatch = async (req, res) => {
    const token = req.headers.token;
  
    try {
      // Verify user is Admin
      const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
      if (user.length === 0 || user[0].role !== Constants.ROLES.ADMIN) {
        return res.status(403).json({ error: 'User is not authorized to perform this action' });
      }

      const userId = user[0].id;
      try {
        // Get match record
        const matchRecord = `
          SELECT 
            *
          FROM 
              Matches
          where Matches.id in (
                  select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
          );
        `;
        const [match] = await db.query(matchRecord);
        const matchId = match[0].id;


        const questionId = 0;
        const team1_id = match[0].team1_id;
        const team2_id = match[0].team2_id;
        const score_team1 = 0;
        const score_team2 = 0;

        // Change Match Status to 1
        const startmatchquery = `
          UPDATE Matches
          SET match_status = 1, canAnswer = 1
          WHERE id = ${matchId};
        `;
        await db.query(startmatchquery);

        // Check Existantance of question record in MacthScores Table
        const firstquestionExistQuery = `
          select * from MatchScore where matchId = ${matchId} AND questionId = 0;
        `;
        const [checkFirstquestionExistExist] = await db.query(firstquestionExistQuery);

        if (!(checkFirstquestionExistExist && checkFirstquestionExistExist.length)) {

          const insertquestionrecordquery = `
            INSERT INTO MatchScore (matchId, questionId, team1_id, team2_id, score_team1, score_team2)
            VALUES (${matchId}, ${questionId}, ${team1_id}, ${team2_id}, ${score_team1}, ${score_team2});
          `;

          await db.query(insertquestionrecordquery);
          res.status(200).json({ message: `Match ${matchId} started` });
        } else {
          res.status(200).json({ message: `Question record Exists` });
        }

      } catch (err) {
        res.status(400).json({ error: 'Invalid status transition' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

const aggregateScores = async (matchId) => {
  // get match scores
  const matchscorequery = `
    SELECT 
      *
    FROM MatchScore
    where MatchScore.matchId = ${matchId}
  `;
  const [matchscores] = await db.query(matchscorequery);
  let team1_totalScore = 0;
  let team2_totalScore = 0; 

  matchscores.forEach(mq => {
    team1_totalScore = team1_totalScore + mq.score_team1;
    team2_totalScore = team2_totalScore + mq.score_team2;
  });


  const aggregationValuesquery = `
    UPDATE Matches
    SET score_team1 = ${team1_totalScore}, score_team2 = ${team2_totalScore} 
    WHERE id = ${matchId};
  `;
    
  await db.query(aggregationValuesquery);
};

exports.endMatch = async (req, res) => {
  const token = req.headers.token;

  try {
    // Verify user is Admin
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0 || user[0].role !== 'Admin') {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }
    const userId = user[0].id;

    try {
      // Get match record
      const matchRecord = `
        SELECT 
          *
        FROM 
            Matches
        where Matches.id in (
                select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
        );
      `;
      const [match] = await db.query(matchRecord);
      const matchId = match[0].id;

      const query = `
        UPDATE Matches
        SET match_status = 2, canAnswer = 0
        WHERE id = ${matchId};
      `;
    
      await db.query(query);
      try {
        await aggregateScores(matchId);
        await groupController.groupsAggregator();
      } catch (e) {
        console.log(e);
      }
      
      res.status(200).json({ message: `Match ${matchId} ended` });
    } catch (err) {
      res.status(400).json({ error: 'Invalid status transition' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.nextquestion = async (req, res) => {
    const token = req.headers.token;
    try {
        // Verify user is Admin
        const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
        if (user.length === 0 || user[0].role !== 'Admin') {
          return res.status(403).json({ error: 'User is not authorized to perform this action' });
        }

        const userId = user[0].id;
      
        // Get match record
        const matchRecord = `
          SELECT 
            *
          FROM 
              Matches
          where Matches.id in (
                  select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
          );
        `;
      const [match] = await db.query(matchRecord);
      const matchId = match[0].id;
      const nextQuestionId = match[0].current_question + 1;
      const team1_id = match[0].team1_id;
      const team2_id = match[0].team2_id;
      const score_team1 = 0;
      const score_team2 = 0;
      // Update Question Index
      await db.query('UPDATE Matches SET current_question = current_question + 1, canAnswer = 1 WHERE id = ?', [matchId]);
      
      // Create Question Record
      const questionExistQuery = `
          select * from MatchScore where matchId = ${matchId} AND questionId = ${nextQuestionId};
        `;
      const [checkFirstquestionExistExist] = await db.query(questionExistQuery);
      if (!(checkFirstquestionExistExist && checkFirstquestionExistExist.length)) {

        const insertquestionrecordquery = `
          INSERT INTO MatchScore (matchId, questionId, team1_id, team2_id, score_team1, score_team2)
          VALUES (${matchId}, ${nextQuestionId}, ${team1_id}, ${team2_id}, ${score_team1}, ${score_team2});
        `;

        await db.query(insertquestionrecordquery);

        res.status(200).json({ message: 'Current question index incremented successfully' });
      } else {
        res.status(200).json({ message: `Question record Exists` });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.stopAnswer = async (req, res) => {
    const token = req.headers.token;
    try {
        // Verify user is Admin
        const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
        if (user.length === 0 || user[0].role !== 'Admin') {
          return res.status(403).json({ error: 'User is not authorized to perform this action' });
        }
        
        const userId = user[0].id;

        // Get match record
        const matchRecord = `
          SELECT 
            *
          FROM 
              Matches
          where Matches.id in (
                  select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
          );
        `;
        const [match] = await db.query(matchRecord);
        const matchId = match[0].id;


        const query = `
          UPDATE Matches
          SET canAnswer = 0
          WHERE id in (select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId});
        `;

        // Update Question Index
        await db.query(query);
        
        try {
          await aggregateScores(matchId);
          await groupController.groupsAggregator();
        } catch (e) {
          console.log(e);
        }

        res.status(200).json({ message: 'Stoped' });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
}

exports.matchScores = async (req, res) => {
  const token = req.headers.token;

  try {
    // Verify user is Admin
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0) {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }
    const userId = user[0].id;

    try {
      // Get match scores
      let matchscoresRecord = '';

      if (user[0].role === 'Admin') {
        matchscoresRecord = `
          SELECT 
            MatchScore.id,
              MatchScore.questionId,
              MatchScore.matchId,
            team_1.name AS team1_name,
            team_1.logo AS team1_logo,
              MatchScore.score_team1,
              team_2.name AS team2_name,
              team_2.logo AS team2_logo,
              MatchScore.score_team2
          FROM MatchScore
          JOIN 
            Teams team_1 ON MatchScore.team1_id = team_1.id
          JOIN 
            Teams team_2 ON MatchScore.team2_id = team_2.id
          where MatchScore.matchId in (
                  select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
          );
        `;

      } else if (user[0].role === 'Team') {
        matchscoresRecord = `
            SELECT 
                    MatchScore.id,
                      MatchScore.questionId,
                      MatchScore.matchId,
                    team_1.name AS team1_name,
                    team_1.logo AS team1_logo,
                      MatchScore.score_team1,
                      team_2.name AS team2_name,
                      team_2.logo AS team2_logo,
                      MatchScore.score_team2
                  FROM MatchScore
                  JOIN 
                    Teams team_1 ON MatchScore.team1_id = team_1.id
                  JOIN 
                    Teams team_2 ON MatchScore.team2_id = team_2.id
                  where MatchScore.matchId in (
            select currentMatchId from CurrentMatch
          ) AND (team1_id in (
            select id from Teams where userId = ${userId}
          ) OR
          team2_id in (
            select id from Teams where userId = ${userId}
          ));
        `;
      }
      const [match] = await db.query(matchscoresRecord);
      

      if (!match) {
        return res.status(404).json({ message: 'No upcoming match found' });
      }

      let team1_totalScore = 0;
      let team2_totalScore = 0; 

      match.forEach(mq => {
        team1_totalScore = team1_totalScore + mq.score_team1;
        team2_totalScore = team2_totalScore + mq.score_team2;
      })

      res.json({ status: 200, data: { team1_totalScore, team2_totalScore, scores: match,  } });
      
    } catch (err) {
      res.status(400).json({ error: 'Invalid status transition' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.resetMatch = async (req, res) => {
  const token = req.headers.token;

  try {
    // Verify user is Admin
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0 || user[0].role !== 'Admin') {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }

    const userId = user[0].id;
    try {
      // Get match record
      const matchRecord = `
        SELECT 
          *
        FROM 
            Matches
        where Matches.id in (
                select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
        );
      `;
      const [match] = await db.query(matchRecord);
      const matchId = match[0].id;

      const resetqueryA = `
        UPDATE Matches
        SET score_team1 = 0, score_team2 = 0, match_status = 0, current_question = 0, canAnswer = 1
        where id = ${matchId};
      `;
      await db.query(resetqueryA);

      const resetqueryB = `
        DELETE FROM MatchScore where matchId = ${matchId};
      `;
      await db.query(resetqueryB);


      await groupController.groupsAggregator()

      res.status(200).json({ message: `Match Reset!` });
    } catch (err) {
      res.status(400).json({ error: err });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.rewardTeam = async (req, res) => {
  const token = req.headers.token;
  const { teamId } = req.body;
  try {
    // Verify user is Admin
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0 || user[0].role !== 'Admin') {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }

    const userId = user[0].id;
  
    // Get match record
    const matchRecord = `
      SELECT 
        *
      FROM 
          Matches
      where Matches.id in (
              select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
      );
    `;
    const [match] = await db.query(matchRecord);
    const matchId = match[0].id;
    const currentQuestion = match[0].current_question;

    const questionrecordquery = `
      select * from MatchScore where matchId = ${matchId} and questionId = ${currentQuestion};
    `;
    const [question] = await db.query(questionrecordquery);
    const team1Id = question[0]?.team1_id;
    const team2Id = question[0]?.team2_id;
    let updatequery = '';

    if (teamId === team1Id) {
      updatequery = `UPDATE MatchScore SET score_team1 = score_team1 + 1 where matchId = ${matchId} and questionId = ${currentQuestion};`
    }
    if (teamId === team2Id) {
      updatequery = `UPDATE MatchScore SET score_team2 = score_team2 + 1 where matchId = ${matchId} and questionId = ${currentQuestion};`
    }
    await db.query(updatequery);
    await aggregateScores(matchId);
    res.status(200).json({ message: `Team Rewarded!` });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
}

exports.penalTeam = async (req, res) => {
  const token = req.headers.token;
  const { teamId } = req.body;
  try {
    // Verify user is Admin
    const [user] = await db.query('SELECT * FROM Users WHERE token = ?', [token]);
    if (user.length === 0 || user[0].role !== 'Admin') {
      return res.status(403).json({ error: 'User is not authorized to perform this action' });
    }

    const userId = user[0].id;
  
    // Get match record
    const matchRecord = `
      SELECT 
        *
      FROM 
          Matches
      where Matches.id in (
              select currentMatchId from CurrentMatch where id = 0 AND matchAdmin = ${userId}
      );
    `;
    const [match] = await db.query(matchRecord);
    const matchId = match[0].id;
    const currentQuestion = match[0].current_question;

    const questionrecordquery = `
      select * from MatchScore where matchId = ${matchId} and questionId = ${currentQuestion};
    `;
    const [question] = await db.query(questionrecordquery);
    const team1Id = question[0]?.team1_id;
    const team2Id = question[0]?.team2_id;
    let updatequery = '';

    if (teamId === team1Id) {
      updatequery = `UPDATE MatchScore SET score_team1 = score_team1 - 1 where matchId = ${matchId} and questionId = ${currentQuestion};`
    }
    if (teamId === team2Id) {
      updatequery = `UPDATE MatchScore SET score_team2 = score_team2 - 1 where matchId = ${matchId} and questionId = ${currentQuestion};`
    }
    await db.query(updatequery);
    await aggregateScores(matchId);
    res.status(200).json({ message: `Team Penalted!` });

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e });
  }
}

// Player
exports.getNextMatchPlayer = async (req, res) => {
  const token = req.headers.token;


  try {
    // Query to get the userId from the Users table using the token
    const [user] = await db.query(`SELECT id, role FROM Users WHERE token ="${token}"`);

    if (!user || !(user && user.length > 0 && user[0].role === 'Team')) {
      return res.status(404).json({ message: 'User not found or not authorized' });
    }

    const userId = user[0].id;


    const query = `
      SELECT 
        Matches.id,
          team1_id,
          team_1.name AS team1_name,
          team_1.logo AS team1_logo,
          team_1.abbrev AS team1_abbrev,
          score_team1,
          team2_id,
          team_2.name AS team2_name,
          team_2.logo AS team2_logo,
          team_2.abbrev AS team2_abbrev,
          score_team2,
          date_time,
          match_type,
          question_file,
          match_status,
          current_question,
          canAnswer
        FROM 
          Matches
        JOIN 
          Teams team_1 ON Matches.team1_id = team_1.id
        JOIN 
          Teams team_2 ON Matches.team2_id = team_2.id
        where Matches.id in (
        select currentMatchId from CurrentMatch
      ) AND (team1_id in (
        select id from Teams where userId = ${userId}
      ) OR
      team2_id in (
        select id from Teams where userId = ${userId}
      ));
    `;

    // Query to get the next match for the user's team
    const [match] = await db.query(query);
    let response = [];

    if (!match) {
      return res.status(404).json({ message: 'No upcoming match found' });
    } else {
      const currentQuestion = match[0].current_question;
      const matchId = match[0].id;

      const teamInfo = await prisma.teams.findFirst({
        where: {
          userId: userId,
        },
      });

      const currentquestionrecordquery = `SELECT * FROM MatchScore where matchId = ${matchId} And questionId = ${currentQuestion} And (team1_id in (select id from Teams where userId = ${userId})  OR team2_id in (select id from Teams where userId = ${userId}));`;
            
      const [currentquestionrecord] = await db.query(currentquestionrecordquery);


      let myteamAnswerID;
      if (currentquestionrecord[0].team1_id === teamInfo?.id) {
        myteamAnswerID = currentquestionrecord[0].team1answerid;
      } else if (currentquestionrecord[0].team2_id === teamInfo?.id) {
        myteamAnswerID = currentquestionrecord[0].team2answerid;
      }

      response = [{ ...match[0], myteamAnswerID: myteamAnswerID, }];
    }

    res.json({ status: 200, data: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.setAnswer = async (req, res) => {
  const token = req.headers.token;
  const { answer, answerId } = req.body;


  try {
    // Query to get the userId from the Users table using the token
    const [user] = await db.query(`SELECT id, role FROM Users WHERE token ="${token}"`);

    if (!user || !(user && user.length > 0 && user[0].role === Constants.ROLES.TEAM)) {
      return res.status(404).json({ message: 'User not found or not authorized' });
    }

    const userId = user[0].id;


    const query = `
      SELECT 
        Matches.id,
        team1_id,
        score_team1,
        team2_id,
        score_team2,
        current_question
      FROM 
        Matches
      JOIN 
        Teams team_1 ON Matches.team1_id = team_1.id
      JOIN 
        Teams team_2 ON Matches.team2_id = team_2.id
      where Matches.id in (
      select currentMatchId from CurrentMatch
      ) AND (team1_id in (
      select id from Teams where userId = ${userId}
      ) OR
      team2_id in (
      select id from Teams where userId = ${userId}
      ));
    `;

    // Query to get the next match for the user's team
    const [match] = await db.query(query);
    const currentquestion = match[0].current_question;
    const matchId = match[0].id;

    const matchquestionquery = `
      select * from MatchScore where matchId = ${matchId} AND questionId = ${currentquestion}
    `;

    const [questionRecord] = await db.query(matchquestionquery);
    const team1_id = questionRecord[0].team1_id;
    const team2_id = questionRecord[0].team2_id;

    const [team_record] = await db.query(`select * from Teams where userId = ${userId}`);

    if (team_record[0].id === team1_id) {
      await db.query(`UPDATE MatchScore SET score_team1 = ${answer ? 1 : 0}, team1answerid = ${answerId} where matchId = ${matchId} AND questionId = ${currentquestion}`);
    } else if (team_record[0].id === team2_id) {
      await db.query(`UPDATE MatchScore SET score_team2 = ${answer ? 1 : 0}, team2answerid = ${answerId} where matchId = ${matchId} AND questionId = ${currentquestion}`);
    }

  
    res.json({ status: 200, data: 'Answered' });
  } catch (error) {
    res.status(500).json({ message: error });
  }
};