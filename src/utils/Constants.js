exports.ROLES = {
    ADMIN: 'Admin',
    TEAM: 'Team',
    PLAYER: 'Player',
};

exports.STAGES = {
    First_round: 'First_round',
    Second_round: 'Second_round',
    Third_round: 'Third_round',
    Final_round: 'Final_round',
}

exports.httpStatuses = [
    { status: 200, message: "OK" },
    { status: 201, message: "Created" },
    { status: 204, message: "No Content" },
    { status: 400, message: "Bad Request" },
    { status: 401, message: "Unauthorized" },
    { status: 403, message: "Forbidden" },
    { status: 404, message: "Not Found" },
    { status: 500, message: "Internal Server Error" },
    { status: 502, message: "Bad Gateway" },
    { status: 503, message: "Service Unavailable" },
];