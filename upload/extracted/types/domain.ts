export type Role = 'player' | 'guardian' | 'club' | 'scout' | 'organizer' | 'moderator' | 'support' | 'admin'
export type Player = { id:string; name:string; city:string; country:string; age:number; position:string; height:number; rating:number; verified:boolean; available:boolean; image:string; club:string; bio:string; stats:{ season:string; ppg:number; rpg:number; apg:number }[] }
export type Opportunity = { id:string; title:string; org:string; city:string; country:string; position:string; age:string; deadline:string; type:string; status:string; description:string }
export type Event = { id:string; title:string; city:string; date:string; kind:string; participants:number; capacity:number; description:string }
export const roleLabels: Record<Role,string> = { player:'Joueur', guardian:'Parent / tuteur', club:'Club / académie', scout:'Recruteur / scout', organizer:'Organisateur', moderator:'Modérateur', support:'Support & facturation', admin:'Administrateur' }
export const roleMenus: Record<Role,{label:string;href:string}[]> = {
 player:[{label:'Vue d’ensemble',href:'/app'},{label:'Mon profil',href:'/app/profil'},{label:'Opportunités',href:'/app/opportunites'},{label:'Candidatures',href:'/app/candidatures'},{label:'Messages',href:'/app/messages'},{label:'Abonnement',href:'/app/abonnement'}],
 guardian:[{label:'Vue d’ensemble',href:'/app'},{label:'Joueurs associés',href:'/app/joueurs'},{label:'Consentements',href:'/app/consentements'},{label:'Alertes',href:'/app/alertes'}],
 club:[{label:'Recrutement',href:'/app'},{label:'Joueurs',href:'/joueurs'},{label:'Opportunités',href:'/app/opportunites'},{label:'Pipeline',href:'/app/pipeline'},{label:'Messages',href:'/app/messages'},{label:'Organisation',href:'/app/organisation'}],
 scout:[{label:'Prospection',href:'/app'},{label:'Joueurs',href:'/joueurs'},{label:'Favoris',href:'/app/favoris'},{label:'Comparaison',href:'/app/comparaison'},{label:'Rapports',href:'/app/rapports'}],
 organizer:[{label:'Événements',href:'/app'},{label:'Créer un événement',href:'/app/creer'},{label:'Inscriptions',href:'/app/inscriptions'},{label:'Résultats',href:'/app/resultats'}],
 moderator:[{label:'À traiter',href:'/app'},{label:'Vérifications',href:'/app/verifications'},{label:'Signalements',href:'/app/signalements'},{label:'Journal',href:'/app/journal'}],
 support:[{label:'Support',href:'/app'},{label:'Tickets',href:'/app/tickets'},{label:'Facturation',href:'/app/facturation'}],
 admin:[{label:'Vue globale',href:'/admin'},{label:'Utilisateurs',href:'/admin/utilisateurs'},{label:'Vérifications',href:'/admin/verifications'},{label:'Contenus',href:'/admin/contenus'},{label:'Plans & paiements',href:'/admin/facturation'},{label:'Journal d’audit',href:'/admin/journal'}]
}
