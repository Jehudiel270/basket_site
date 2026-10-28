import { players as seedPlayers, opportunities as seedOpportunities, events as seedEvents, organizations } from '~/data/demo'
import { applications, conversations, verifications, reports, payments, auditLogs } from '~/data/workflows'
import type { Player, Role } from '~/types/domain'
export const useCourtlink = () => {
  const players = useState<Player[]>('players',()=>seedPlayers)
  const opportunities = useState('opportunities',()=>seedOpportunities)
  const events = useState('events',()=>seedEvents)
  const role = useState<Role>('demoRole',()=> 'player')
  const favorites = useState<string[]>('favorites',()=>[])
  const applied = useState<string[]>('applied',()=>['o2'])
  const notice = useState<string>('notice',()=> '')
  const hydrated = useState('hydrated',()=>false)
  const persist=()=>{ if(import.meta.client) localStorage.setItem('courtlink-demo',JSON.stringify({players:players.value,opportunities:opportunities.value,events:events.value,role:role.value,favorites:favorites.value,applied:applied.value})) }
  if(import.meta.client && !hydrated.value){ hydrated.value=true; const raw=localStorage.getItem('courtlink-demo'); if(raw){ try { const d=JSON.parse(raw); if(d.players) players.value=d.players; if(d.opportunities) opportunities.value=d.opportunities; if(d.events) events.value=d.events; if(d.role) role.value=d.role; if(d.favorites) favorites.value=d.favorites; if(d.applied) applied.value=d.applied } catch {} } }
  const flash=(message:string)=>{notice.value=message; setTimeout(()=>notice.value='',2800)}
  const setRole=(next:Role)=>{ role.value=next; persist(); flash(`Mode démo : ${next==='admin'?'administrateur':next==='player'?'joueur':next==='club'?'club / académie':next==='scout'?'recruteur / scout':next}`) }
  const toggleFavorite=(id:string)=>{ favorites.value=favorites.value.includes(id)?favorites.value.filter(x=>x!==id):[...favorites.value,id]; persist(); flash(favorites.value.includes(id)?'Profil ajouté aux favoris':'Profil retiré des favoris') }
  const apply=(id:string)=>{ if(!applied.value.includes(id)){ applied.value.push(id); persist(); flash('Candidature envoyée. Le club recevra votre profil vérifié.') } else flash('Cette candidature est déjà enregistrée.') }
  const updatePlayer=(id:string, patch:Partial<Player>)=>{ const p=players.value.find(x=>x.id===id); if(p) Object.assign(p,patch); persist(); flash('Profil mis à jour et visibilité synchronisée.') }
  const changeOpportunityStatus=(id:string,status:string)=>{ const o=opportunities.value.find(x=>x.id===id); if(o) o.status=status; persist(); flash(`Pipeline mis à jour : ${status}`) }
  const registerEvent=(id:string)=>{ const e=events.value.find(x=>x.id===id); if(e && e.participants<e.capacity) {e.participants++; persist(); flash('Inscription confirmée pour cet événement.')} }
  return { players, opportunities, events, organizations, applications, conversations, verifications, reports, payments, auditLogs, role, favorites, applied, notice, roleLabel:computed(()=>role.value), flash, setRole, toggleFavorite, apply, updatePlayer, changeOpportunityStatus, registerEvent }
}
