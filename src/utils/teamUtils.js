// Find team by ID
export function findTeamById(teams, id) {
  return teams.find(team => team.id === id)
}

// Filter teams by genre
export function filterByGenre(teams, genre) {
  return teams.filter(team => team.genre.toLowerCase() === genre.toLowerCase())
}

// Generate new unique ID
export function generateId(teams) {
  if (teams.length === 0) {
    return 1
  }
  const maxId = Math.max(...teams.map(team => team.id))
  return maxId + 1
}
