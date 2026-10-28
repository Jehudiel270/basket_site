import type { Event, Opportunity, Player } from '~/types/domain'
export type DemoRepository = { players: Player[]; opportunities: Opportunity[]; events: Event[] }
export const repositoryContract = {
  persistence: 'localStorage-demo',
  productionTarget: 'neon-postgres',
  mediaTarget: 'cloudinary',
  entities: ['players','organizations','opportunities','applications','events','messages','verifications','reports','subscriptions','payments','audit_logs'] as const
}
export function filterPlayers(players: Player[], query: string, position = 'Tous les postes') {
  const normalized = query.trim().toLowerCase()
  return players.filter((player) => {
    const matchesQuery = !normalized || `${player.name} ${player.city} ${player.country} ${player.club}`.toLowerCase().includes(normalized)
    return matchesQuery && (position === 'Tous les postes' || player.position === position)
  })
}
