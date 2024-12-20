const db = require('../db');
const Constants = require('../utils/Constants');

// Get groups with teams ordered by points
exports.getGroups = async (req, res) => {
  try {
    // Query to get groups and teams ordered by Pts
    const query = `
      SELECT 
          Groups.name AS groupName, 
          Teams.logo AS logo, 
          Teams.name AS teamName, 
          Teams.id AS teamId, 
          Teams.W, 
          Teams.D, 
          Teams.L, 
          Teams.Pts,
          IFNULL(AggregatedScores.AggregatedScore, 0) AS totalScore
      FROM Teams
      JOIN Groups ON Teams.group_Id = Groups.id
      LEFT JOIN (
          SELECT 
              TeamId, 
              SUM(Score) AS AggregatedScore
          FROM (
              SELECT 
                  team1_id AS TeamId, 
                  score_team1 AS Score
              FROM Matches
              WHERE match_type = 'First_round'

              UNION ALL

              SELECT 
                  team2_id AS TeamId, 
                  score_team2 AS Score
              FROM Matches
              WHERE match_type = 'First_round'
          ) AS Combined
          GROUP BY TeamId
      ) AS AggregatedScores ON Teams.id = AggregatedScores.TeamId
      ORDER BY Groups.name, Teams.Pts DESC, totalScore DESC;
    `;

    const [rows] = await db.query(query);
    
    // Categorize teams by group
    const groupedTeams = rows.reduce((acc, row) => {
      const { groupName, teamName, W, D, L, Pts, logo } = row;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push({ teamName, W, D, L, Pts, logo });
      return acc;
    }, {});

    res.json({
        status: 200,
        data: groupedTeams
    });
  } catch (err) {
    console.error('Error fetching groups:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.groupsAggregator = async () => {
  try {
    const query = `
      SELECT 
          team1_id,
          team2_id,
          score_team1,
          score_team2,
          match_status
      FROM Matches where match_type='${Constants.STAGES.First_round}';
    `;
    const [groupMatches] = await db.query(query);

    const response = {};
    if (groupMatches?.length) {

      // Create Empty Template
      groupMatches.forEach(match => {
        if (!response[match.team1_id]) {
          response[match.team1_id] = {
            w: 0,
            l: 0,
            d: 0,
            pts: 0
          };
        }
      
        if (!response[match.team2_id]) {
          response[match.team2_id] = {
            w: 0,
            l: 0,
            d: 0,
            pts: 0
          };
        }
      });

      // Aggregate teams points
      groupMatches.forEach(match => {
        if (match.match_status !== 0) {
          if (match.score_team1 > match.score_team2) {
            response[match.team1_id].w++;
            response[match.team1_id].pts += 3;
            response[match.team2_id].l++;
          } else if (match.score_team1 < match.score_team2) {
            response[match.team2_id].w++;
            response[match.team2_id].pts += 3;
            response[match.team1_id].l++;
          } else {
            response[match.team1_id].d++;
            response[match.team1_id].pts++;
            response[match.team2_id].d++;
            response[match.team2_id].pts++;
          }
        }
      });
    }

    Object.keys(response)?.forEach(async k => {
      try {
        const aggregationQuery = `UPDATE Teams SET W=${response[k].w}, D=${response[k].d}, L=${response[k].l}, Pts=${response[k].pts} WHERE id = ${k};`;
        await db.query(aggregationQuery);
      } catch (e) {
        console.log(e)
      }
    });
  } catch (e) {
    console.log(e);
  }
}