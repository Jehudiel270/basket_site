export type Role =
  | 'visitor'
  | 'player'
  | 'guardian'
  | 'club'
  | 'scout'
  | 'organizer'
  | 'moderator'
  | 'support'
  | 'admin';

export type Visibility = 'public' | 'members' | 'private';

export interface SeasonStat {
  season: string;
  competition: string;
  ppg: number;
  rpg: number;
  apg: number;
  spg: number;
  bpg: number;
  fgPct: number;
  tpPct: number;
  games: number;
}

export interface VideoLink {
  id: string;
  label: string;
  url: string;
  kind: 'highlights' | 'match' | 'workout';
}

export interface Reference {
  id: string;
  name: string;
  role: string;
  org: string;
  contact: string;
  verified: boolean;
}

export interface Player {
  id: string;
  name: string;
  photo: string;
  country: string;
  city: string;
  birthDate: string;
  height: number;
  weight: number;
  position: string;
  secondaryPositions: string[];
  dominantHand: 'Droitier' | 'Gaucher';
  club: string;
  number: number;
  rating: number;
  verified: boolean;
  available: boolean;
  visibility: Visibility;
  bio: string;
  languages: string[];
  availability: string;
  goals: string[];
  targetZones: string[];
  education: string;
  experience: { team: string; years: string; note: string }[];
  stats: SeasonStat[];
  videos: VideoLink[];
  references: Reference[];
  guardianId?: string;
  isMinor: boolean;
  suspended?: boolean;
  wingspan?: number;
  verticalReach?: number;
  views: number;
  videoViews: number;
}

export interface Organization {
  id: string;
  name: string;
  type: 'Club' | 'Académie' | 'Organisation' | 'Agence';
  country: string;
  city: string;
  logoSeed: string;
  image: string;
  verified: boolean;
  verificationStatus: 'vérifiée' | 'en attente' | 'correction demandée' | 'non vérifiée';
  members: number;
  playersCount: number;
  founded: string;
  description: string;
  divisions: string[];
  achievements: string[];
  staff: { name: string; role: string; license: string }[];
  suspends?: boolean;
}

export interface Opportunity {
  id: string;
  orgId: string;
  org: string;
  title: string;
  type: string;
  country: string;
  city: string;
  position: string;
  ageRange: string;
  level: string;
  deadline: string;
  startDate: string;
  status: 'Ouverte' | 'Brouillon' | 'Fermée' | 'Archivée';
  description: string;
  requirements: string[];
  conditions: string[];
  slots: number;
  applicants: number;
  salary: string;
  createdAt: string;
}

export type ApplicationStatus =
  | 'Nouveau'
  | 'À examiner'
  | 'Présélectionné'
  | 'Contacté'
  | 'Essai proposé'
  | 'Retenu'
  | 'Refusé';

export interface Application {
  id: string;
  playerId: string;
  playerName: string;
  opportunityId: string;
  opportunityTitle: string;
  orgId: string;
  status: ApplicationStatus;
  updatedAt: string;
  motivation: string;
  history: { status: ApplicationStatus; date: string }[];
}

export interface CourtEvent {
  id: string;
  title: string;
  kind: 'Combine' | 'Showcase' | 'Tournoi 3x3' | 'Clinic' | 'Camp';
  city: string;
  country: string;
  venue: string;
  date: string;
  endDate: string;
  participants: number;
  capacity: number;
  description: string;
  program: string[];
  price: string;
  ageRange: string;
  status: 'Ouvert' | 'Complet' | 'Terminé' | 'Brouillon';
  image: string;
  results?: { rank: number; player: string; note: string }[];
  organizerId: string;
  organizer: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  eventTitle: string;
  playerId: string;
  playerName: string;
  status: 'En attente' | 'Confirmée' | 'Présent' | 'Absente' | 'Annulée';
  registeredAt: string;
  consent: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames: string[];
  subject: string;
  messages: { from: string; body: string; time: string; me?: boolean }[];
  unread: boolean;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: 'info' | 'success' | 'warning' | 'danger';
  role?: Role;
}

export interface Verification {
  id: string;
  subject: string;
  subjectType: 'Joueur' | 'Organisation' | 'Recruteur';
  subjectId: string;
  status: 'En attente' | 'Approuvée' | 'Refusée' | 'Correction demandée';
  submitted: string;
  documents: string[];
  reviewer?: string;
  justification?: string;
}

export interface Report {
  id: string;
  subject: string;
  target: string;
  reason: string;
  details: string;
  status: 'À traiter' | 'En revue' | 'Résolu' | 'Rejeté';
  priority: 'Haute' | 'Normale' | 'Basse';
  submitted: string;
  reporter: string;
  action?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  requester: string;
  topic: string;
  status: 'Ouvert' | 'En cours' | 'Résolu';
  priority: 'Haute' | 'Normale' | 'Basse';
  opened: string;
  messages: { from: 'user' | 'support'; body: string; time: string }[];
}

export interface Payment {
  id: string;
  userId: string;
  user: string;
  plan: string;
  amount: string;
  method: string;
  status: 'Confirmé' | 'En attente' | 'Remboursé' | 'Litige';
  date: string;
  invoice: string;
}

export interface Subscription {
  planId: string;
  status: 'Actif' | 'Essai' | 'Expiré';
  renews: string;
  since: string;
}

export interface Plan {
  id: string;
  name: string;
  audience: string;
  price: number;
  currency: string;
  period: 'mois' | 'an';
  features: string[];
  highlighted?: boolean;
  active: boolean;
}

export interface AuditLog {
  id: string;
  time: string;
  actor: string;
  action: string;
  scope: string;
}

export interface ScoutingReport {
  id: string;
  playerId: string;
  playerName: string;
  scout: string;
  strengths: string[];
  improvements: string[];
  confidence: 'Élevée' | 'Moyenne' | 'Faible';
  observations: string;
  date: string;
  rating: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  filters: Record<string, string>;
  alerts: boolean;
}

export interface PrivateNote {
  id: string;
  targetId: string;
  targetName: string;
  body: string;
  date: string;
  author: string;
}

export interface ConsentRequest {
  id: string;
  guardianId: string;
  playerId: string;
  playerName: string;
  requester: string;
  kind: 'Contact' | 'Essai' | 'Partage de données' | 'Média';
  status: 'En attente' | 'Approuvée' | 'Refusée';
  date: string;
}

export interface PlatformSettings {
  brandName: string;
  tagline: string;
  accentColor: string;
  maintenance: boolean;
  newRegistrations: boolean;
  autoVerifyPlayers: boolean;
  maxFreeApplications: number;
  featuredSlots: number;
}

export interface DemoState {
  role: Role;
  loggedIn: boolean;
  currentUserId: string;
  players: Player[];
  organizations: Organization[];
  opportunities: Opportunity[];
  applications: Application[];
  events: CourtEvent[];
  registrations: EventRegistration[];
  conversations: Conversation[];
  notifications: Notification[];
  verifications: Verification[];
  reports: Report[];
  tickets: Ticket[];
  payments: Payment[];
  subscription: Subscription | null;
  plans: Plan[];
  auditLogs: AuditLog[];
  scoutingReports: ScoutingReport[];
  savedSearches: SavedSearch[];
  privateNotes: PrivateNote[];
  consentRequests: ConsentRequest[];
  favorites: string[];
  followedClubs: string[];
  hiddenContent: string[];
  suspendedAccounts: string[];
  settings: PlatformSettings;
  profileViews: number;
  videoViews: number;
}
