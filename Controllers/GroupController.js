const db = require('../db');

// Get groups with teams ordered by points
exports.getGroups = async (req, res) => {
  try {
    // Query to get groups and teams ordered by Pts
    const query = `
      SELECT Groups.name as groupName, Teams.name as teamName, Teams.W, Teams.D, Teams.L, Teams.Pts
        FROM Teams
        JOIN Groups ON Teams.group_Id = Groups.id
        ORDER BY Groups.name, Teams.Pts DESC
    `;

    const [rows] = await db.query(query);
    
    // Categorize teams by group
    const groupedTeams = rows.reduce((acc, row) => {
      const { groupName, teamName, W, D, L, Pts } = row;
      if (!acc[groupName]) {
        acc[groupName] = [];
      }
      acc[groupName].push({ teamName, W, D, L, Pts });
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
