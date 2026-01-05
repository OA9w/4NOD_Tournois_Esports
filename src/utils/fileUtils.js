import fs from 'fs/promises'
import path from 'path'

// Generic function to load data from JSON file
export async function loadData(filename) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename)
    const data = await fs.readFile(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`Error reading file ${filename}:`, error.message)
    return []
  }
}

// Generic function to save data to JSON file
export async function saveData(filename, data) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename)
    await fs.writeFile(filePath, JSON.stringify(data, null, 2))
  } catch (error) {
    console.error(`Error writing file ${filename}:`, error.message)
    throw error
  }
}

// Load teams from JSON file
export function loadGames() {
  return loadData('teams.json')
}

// Save teams to JSON file
export function saveGames(games) {
  return saveData('teams.json', games)
}

// Load tournaments from JSON file
export function loadStations() {
  return loadData('tournaments.json')
}

// Save tournaments to JSON file
export function saveStations(stations) {
  return saveData('tournaments.json', stations)
}
