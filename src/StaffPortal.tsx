import { useState } from 'react'
import {
  Lock, ArrowLeft, CheckCircle, Warning, Stethoscope, Clock, MapPin,
  Heartbeat, ShieldCheck, SignOut, PhoneCall, PaperPlaneRight,
  ChatText, FirstAidKit, CaretRight, Broadcast, Users, Desktop,
  MagnifyingGlass, UserPlus, Check, X
} from '@phosphor-icons/react'

export type Role = 'nurse' | 'admin'

export type StaffUser = {
  id: string
  name: string
  role: 'Hospital Administrator' | 'Triage Nurse' | 'Reception Officer' | 'Medical Doctor' | 'KSL Interpreter' | 'Audiology Specialist'
  department: string
  email: string
  phone: string
  status: 'Active' | 'On-Duty' | 'Break' | 'Offline'
  lastLogin: string
  badgeId: string
}

export type TriagePatient = {
  id: string
  name: string
  symptom: string
  symptomSw: string
  places: string[]
  duration: string
  urgent: boolean
  time: string
  desk: string
  lang: string
  status: 'Waiting' | 'In Triage' | 'With Doctor' | 'Completed'
}

// Exactly 30 Hospital System Users & Staff
export const HOSPITAL_USERS: StaffUser[] = [
  { id: 'USR-01', name: 'Dr. Geoffrey Mutiso', role: 'Hospital Administrator', department: 'Executive Medical Operations', email: 'g.mutiso@knh.or.ke', phone: '+254 711 001 001', status: 'Active', lastLogin: '10 mins ago', badgeId: 'ADMIN-001' },
  { id: 'USR-02', name: 'Sarah Wambui', role: 'Hospital Administrator', department: 'Health Information & Systems', email: 's.wambui@knh.or.ke', phone: '+254 711 001 002', status: 'Active', lastLogin: '25 mins ago', badgeId: 'ADMIN-002' },
  { id: 'USR-03', name: 'David Kiprono', role: 'Hospital Administrator', department: 'Clinical Quality & Accessibility', email: 'd.kiprono@knh.or.ke', phone: '+254 711 001 003', status: 'On-Duty', lastLogin: '1 hour ago', badgeId: 'ADMIN-003' },
  { id: 'USR-04', name: 'Nurse Joyce Mwangi', role: 'Triage Nurse', department: 'Desk 3 · Outpatient Reception', email: 'j.mwangi@knh.or.ke', phone: '+254 722 002 001', status: 'On-Duty', lastLogin: 'Active now', badgeId: 'NURSE-4029' },
  { id: 'USR-05', name: 'Nurse Beatrice Akinyi', role: 'Triage Nurse', department: 'Desk 1 · Emergency Triage', email: 'b.akinyi@knh.or.ke', phone: '+254 722 002 002', status: 'On-Duty', lastLogin: '12 mins ago', badgeId: 'NURSE-4030' },
  { id: 'USR-06', name: 'Nurse Grace Njeri', role: 'Triage Nurse', department: 'Desk 2 · Pediatric Reception', email: 'g.njeri@knh.or.ke', phone: '+254 722 002 003', status: 'On-Duty', lastLogin: '30 mins ago', badgeId: 'NURSE-4031' },
  { id: 'USR-07', name: 'Nurse Mercy Korir', role: 'Triage Nurse', department: 'Desk 4 · Specialized Clinics', email: 'm.korir@knh.or.ke', phone: '+254 722 002 004', status: 'Break', lastLogin: '2 hours ago', badgeId: 'NURSE-4032' },
  { id: 'USR-08', name: 'Nurse Agnes Wanjiku', role: 'Triage Nurse', department: 'Desk 3 · Outpatient Reception', email: 'a.wanjiku@knh.or.ke', phone: '+254 722 002 005', status: 'Active', lastLogin: '45 mins ago', badgeId: 'NURSE-4033' },
  { id: 'USR-09', name: 'Nurse Esther Moraa', role: 'Triage Nurse', department: 'Desk 5 · Maternity Reception', email: 'e.moraa@knh.or.ke', phone: '+254 722 002 006', status: 'On-Duty', lastLogin: '15 mins ago', badgeId: 'NURSE-4034' },
  { id: 'USR-10', name: 'Nurse Lilian Chepkemoi', role: 'Triage Nurse', department: 'Desk 6 · Surgical Outpatient', email: 'l.chepkemoi@knh.or.ke', phone: '+254 722 002 007', status: 'Offline', lastLogin: 'Yesterday', badgeId: 'NURSE-4035' },
  { id: 'USR-11', name: 'Nurse Catherine Nduta', role: 'Triage Nurse', department: 'Emergency Rapid Response', email: 'c.nduta@knh.or.ke', phone: '+254 722 002 008', status: 'On-Duty', lastLogin: '5 mins ago', badgeId: 'NURSE-4036' },
  { id: 'USR-12', name: 'Kevin Otieno', role: 'Reception Officer', department: 'Desk 1 · Emergency Front Counter', email: 'k.otieno@knh.or.ke', phone: '+254 733 003 001', status: 'On-Duty', lastLogin: 'Active now', badgeId: 'RECEP-101' },
  { id: 'USR-13', name: 'Maryanne Achieng', role: 'Reception Officer', department: 'Desk 3 · Main Outpatient Lobby', email: 'm.achieng@knh.or.ke', phone: '+254 733 003 002', status: 'On-Duty', lastLogin: '3 mins ago', badgeId: 'RECEP-102' },
  { id: 'USR-14', name: 'Samuel Kilonzo', role: 'Reception Officer', department: 'Desk 2 · Pediatric Registration', email: 's.kilonzo@knh.or.ke', phone: '+254 733 003 003', status: 'Active', lastLogin: '18 mins ago', badgeId: 'RECEP-103' },
  { id: 'USR-15', name: 'Brenda Mutheu', role: 'Reception Officer', department: 'Desk 4 · ENT & Specialized Desk', email: 'b.mutheu@knh.or.ke', phone: '+254 733 003 004', status: 'On-Duty', lastLogin: '22 mins ago', badgeId: 'RECEP-104' },
  { id: 'USR-16', name: 'Collins Nderitu', role: 'Reception Officer', department: 'Desk 5 · Maternity Wing Desk', email: 'c.nderitu@knh.or.ke', phone: '+254 733 003 005', status: 'Break', lastLogin: '1 hour ago', badgeId: 'RECEP-105' },
  { id: 'USR-17', name: 'Halima Abdi', role: 'Reception Officer', department: 'Desk 6 · Imaging & Lab Front Counter', email: 'h.abdi@knh.or.ke', phone: '+254 733 003 006', status: 'Offline', lastLogin: 'Yesterday', badgeId: 'RECEP-106' },
  { id: 'USR-18', name: 'Dr. Patrick Kariuki', role: 'Medical Doctor', department: 'Consultation Room 1 · General Medicine', email: 'p.kariuki@knh.or.ke', phone: '+254 744 004 001', status: 'On-Duty', lastLogin: '20 mins ago', badgeId: 'DOC-201' },
  { id: 'USR-19', name: 'Dr. Amina Hassan', role: 'Medical Doctor', department: 'Consultation Room 2 · Urgent Care', email: 'a.hassan@knh.or.ke', phone: '+254 744 004 002', status: 'On-Duty', lastLogin: '8 mins ago', badgeId: 'DOC-202' },
  { id: 'USR-20', name: 'Dr. Kennedy Omondi', role: 'Medical Doctor', department: 'Cardiology & Chest Clinic', email: 'k.omondi@knh.or.ke', phone: '+254 744 004 003', status: 'Active', lastLogin: '1 hour ago', badgeId: 'DOC-203' },
  { id: 'USR-21', name: 'Dr. Jane Muthoni', role: 'Medical Doctor', department: 'Pediatric Medical Officer', email: 'j.muthoni@knh.or.ke', phone: '+254 744 004 004', status: 'On-Duty', lastLogin: '35 mins ago', badgeId: 'DOC-204' },
  { id: 'USR-22', name: 'Dr. Victor Koech', role: 'Medical Doctor', department: 'Emergency Medicine Registrar', email: 'v.koech@knh.or.ke', phone: '+254 744 004 005', status: 'On-Duty', lastLogin: '14 mins ago', badgeId: 'DOC-205' },
  { id: 'USR-23', name: 'Dr. Rose Nyambura', role: 'Medical Doctor', department: 'Obstetrics & Gynaecology', email: 'r.nyambura@knh.or.ke', phone: '+254 744 004 006', status: 'Break', lastLogin: '3 hours ago', badgeId: 'DOC-206' },
  { id: 'USR-24', name: 'George Wafula', role: 'KSL Interpreter', department: 'Hospital Deaf Inclusion & KSL Unit', email: 'g.wafula@knh.or.ke', phone: '+254 755 005 001', status: 'On-Duty', lastLogin: 'Active now', badgeId: 'KSL-301' },
  { id: 'USR-25', name: 'Susan Makena', role: 'KSL Interpreter', department: 'Hospital Deaf Inclusion & KSL Unit', email: 's.makena@knh.or.ke', phone: '+254 755 005 002', status: 'On-Duty', lastLogin: '6 mins ago', badgeId: 'KSL-302' },
  { id: 'USR-26', name: 'Dennis Kipchumba', role: 'KSL Interpreter', department: 'Emergency On-Call KSL Network', email: 'd.kipchumba@knh.or.ke', phone: '+254 755 005 003', status: 'Active', lastLogin: '40 mins ago', badgeId: 'KSL-303' },
  { id: 'USR-27', name: 'Pauline Adhiambo', role: 'KSL Interpreter', department: 'Hospital Deaf Inclusion & KSL Unit', email: 'p.adhiambo@knh.or.ke', phone: '+254 755 005 004', status: 'Offline', lastLogin: 'Yesterday', badgeId: 'KSL-304' },
  { id: 'USR-28', name: 'Dr. Evans Muli', role: 'Audiology Specialist', department: 'Audiology & Speech Sciences', email: 'e.muli@knh.or.ke', phone: '+254 766 006 001', status: 'Active', lastLogin: '50 mins ago', badgeId: 'SPEC-501' },
  { id: 'USR-29', name: 'Rachel Jerop', role: 'Audiology Specialist', department: 'Assistive Communication Lab', email: 'r.jerop@knh.or.ke', phone: '+254 766 006 002', status: 'On-Duty', lastLogin: '2 hours ago', badgeId: 'SPEC-502' },
  { id: 'USR-30', name: 'Anthony Musyoka', role: 'Audiology Specialist', department: 'ENT Diagnostic Center', email: 'a.musyoka@knh.or.ke', phone: '+254 766 006 003', status: 'Offline', lastLogin: '2 days ago', badgeId: 'SPEC-503' },
]

// 30 Realistic Hospital Patient Intake Records
export const PATIENT_RECORDS: TriagePatient[] = [
  { id: 'PT-1042', name: 'Wanjiru Karanja', symptom: 'Chest Pain', symptomSw: 'Maumivu ya Kifua', places: ['Chest, left', 'Throat'], duration: 'Since this morning', urgent: true, time: '2 mins ago', desk: 'Desk 3', lang: 'Kiswahili & KSL', status: 'Waiting' },
  { id: 'PT-1041', name: 'Brian Omondi', symptom: 'Fever or Chills', symptomSw: 'Homa', places: ['Head'], duration: 'A few days', urgent: false, time: '14 mins ago', desk: 'Desk 2', lang: 'English', status: 'In Triage' },
  { id: 'PT-1040', name: 'Faith Chebet', symptom: 'Abdominal Pain', symptomSw: 'Maumivu ya Tumbo', places: ['Stomach'], duration: 'More than a week', urgent: false, time: '28 mins ago', desk: 'Desk 3', lang: 'Kiswahili', status: 'With Doctor' },
  { id: 'PT-1039', name: 'Samuel Githinji', symptom: 'Shortness of Breath', symptomSw: 'Pumzi Fupi', places: ['Chest, right'], duration: 'Less than an hour', urgent: true, time: '35 mins ago', desk: 'Desk 1', lang: 'Kiswahili & KSL', status: 'With Doctor' },
  { id: 'PT-1038', name: 'Amina Mohamed', symptom: 'Dizziness', symptomSw: 'Kizunguzungu', places: ['Head'], duration: 'Since this morning', urgent: false, time: '42 mins ago', desk: 'Desk 3', lang: 'English', status: 'Completed' },
  { id: 'PT-1037', name: 'Kelvin Mutua', symptom: 'Headache', symptomSw: 'Kuumwa na Kichwa', places: ['Head'], duration: 'A few days', urgent: false, time: '50 mins ago', desk: 'Desk 4', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1036', name: 'Mercy Atieno', symptom: 'Swelling', symptomSw: 'Kuvimba Mwili', places: ['Right leg', 'Left leg'], duration: 'More than a week', urgent: false, time: '1 hour ago', desk: 'Desk 2', lang: 'KSL Assisted', status: 'Completed' },
  { id: 'PT-1035', name: 'John Kamau', symptom: 'Nausea or Vomiting', symptomSw: 'Kichefuchefu', places: ['Stomach'], duration: 'Since this morning', urgent: false, time: '1 hour ago', desk: 'Desk 3', lang: 'English', status: 'Completed' },
  { id: 'PT-1034', name: 'Dorcas Wanjala', symptom: 'Fatigue', symptomSw: 'Uchovu Mkubwa', places: ['Head', 'Lower belly'], duration: 'More than a week', urgent: false, time: '1.5 hours ago', desk: 'Desk 5', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1033', name: 'Geoffrey Rotich', symptom: 'Chest Pain', symptomSw: 'Maumivu ya Kifua', places: ['Chest, left'], duration: 'Less than an hour', urgent: true, time: '2 hours ago', desk: 'Desk 1', lang: 'English', status: 'Completed' },
  { id: 'PT-1032', name: 'Lydia Nyaboke', symptom: 'Fever or Chills', symptomSw: 'Homa', places: ['Head'], duration: 'A few days', urgent: false, time: '2 hours ago', desk: 'Desk 2', lang: 'Kiswahili & KSL', status: 'Completed' },
  { id: 'PT-1031', name: 'Erick Odhiambo', symptom: 'Abdominal Pain', symptomSw: 'Maumivu ya Tumbo', places: ['Lower belly'], duration: 'A few days', urgent: false, time: '2.5 hours ago', desk: 'Desk 3', lang: 'English', status: 'Completed' },
  { id: 'PT-1030', name: 'Priscilla Mutindi', symptom: 'Other Concern', symptomSw: 'Shida Nyingine', places: ['Right arm'], duration: 'Since this morning', urgent: false, time: '3 hours ago', desk: 'Desk 6', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1029', name: 'Paul Kiptoo', symptom: 'Shortness of Breath', symptomSw: 'Pumzi Fupi', places: ['Chest, right'], duration: 'Less than an hour', urgent: true, time: '3 hours ago', desk: 'Desk 1', lang: 'KSL Assisted', status: 'Completed' },
  { id: 'PT-1028', name: 'Grace Makau', symptom: 'Dizziness', symptomSw: 'Kizunguzungu', places: ['Head'], duration: 'Since this morning', urgent: false, time: '3.5 hours ago', desk: 'Desk 4', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1027', name: 'Victor Wanyama', symptom: 'Headache', symptomSw: 'Kuumwa na Kichwa', places: ['Head'], duration: 'A few days', urgent: false, time: '4 hours ago', desk: 'Desk 2', lang: 'English', status: 'Completed' },
  { id: 'PT-1026', name: 'Eunice Cherono', symptom: 'Swelling', symptomSw: 'Kuvimba Mwili', places: ['Left arm'], duration: 'More than a week', urgent: false, time: '4 hours ago', desk: 'Desk 3', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1025', name: 'Bernard Maina', symptom: 'Chest Pain', symptomSw: 'Maumivu ya Kifua', places: ['Chest, right'], duration: 'Since this morning', urgent: true, time: '4.5 hours ago', desk: 'Desk 1', lang: 'English', status: 'Completed' },
  { id: 'PT-1024', name: 'Judith Auma', symptom: 'Fever or Chills', symptomSw: 'Homa', places: ['Head'], duration: 'A few days', urgent: false, time: '5 hours ago', desk: 'Desk 2', lang: 'Kiswahili & KSL', status: 'Completed' },
  { id: 'PT-1023', name: 'Dennis Gitau', symptom: 'Abdominal Pain', symptomSw: 'Maumivu ya Tumbo', places: ['Stomach'], duration: 'Since this morning', urgent: false, time: '5.5 hours ago', desk: 'Desk 3', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1022', name: 'Sharon Chepkirui', symptom: 'Nausea or Vomiting', symptomSw: 'Kichefuchefu', places: ['Stomach'], duration: 'Less than an hour', urgent: false, time: '6 hours ago', desk: 'Desk 5', lang: 'English', status: 'Completed' },
  { id: 'PT-1021', name: 'Moses Mwangi', symptom: 'Shortness of Breath', symptomSw: 'Pumzi Fupi', places: ['Throat'], duration: 'Less than an hour', urgent: true, time: '6 hours ago', desk: 'Desk 1', lang: 'KSL Assisted', status: 'Completed' },
  { id: 'PT-1020', name: 'Esther Nekesa', symptom: 'Headache', symptomSw: 'Kuumwa na Kichwa', places: ['Head'], duration: 'More than a week', urgent: false, time: '6.5 hours ago', desk: 'Desk 4', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1019', name: 'Stephen Ndung’u', symptom: 'Other Concern', symptomSw: 'Shida Nyingine', places: ['Left leg'], duration: 'A few days', urgent: false, time: '7 hours ago', desk: 'Desk 6', lang: 'English', status: 'Completed' },
  { id: 'PT-1018', name: 'Caroline Moraa', symptom: 'Dizziness', symptomSw: 'Kizunguzungu', places: ['Head'], duration: 'Since this morning', urgent: false, time: '7.5 hours ago', desk: 'Desk 3', lang: 'Kiswahili & KSL', status: 'Completed' },
  { id: 'PT-1017', name: 'Martin Musyoka', symptom: 'Chest Pain', symptomSw: 'Maumivu ya Kifua', places: ['Chest, left'], duration: 'Less than an hour', urgent: true, time: '8 hours ago', desk: 'Desk 1', lang: 'English', status: 'Completed' },
  { id: 'PT-1016', name: 'Ann Wambui', symptom: 'Fever or Chills', symptomSw: 'Homa', places: ['Head'], duration: 'A few days', urgent: false, time: '8.5 hours ago', desk: 'Desk 2', lang: 'Kiswahili', status: 'Completed' },
  { id: 'PT-1015', name: 'Isaac Kipchoge', symptom: 'Swelling', symptomSw: 'Kuvimba Mwili', places: ['Right arm'], duration: 'More than a week', urgent: false, time: '9 hours ago', desk: 'Desk 3', lang: 'English', status: 'Completed' },
  { id: 'PT-1014', name: 'Rosemary Adongo', symptom: 'Abdominal Pain', symptomSw: 'Maumivu ya Tumbo', places: ['Stomach'], duration: 'A few days', urgent: false, time: '9.5 hours ago', desk: 'Desk 5', lang: 'Kiswahili & KSL', status: 'Completed' },
  { id: 'PT-1013', name: 'Daniel Korir', symptom: 'Fatigue', symptomSw: 'Uchovu Mkubwa', places: ['Head'], duration: 'More than a week', urgent: false, time: '10 hours ago', desk: 'Desk 4', lang: 'English', status: 'Completed' },
]

export default function StaffPortal({ defaultRole = 'nurse' }: { defaultRole?: Role }) {
  const [currentRole, setCurrentRole] = useState<Role>(defaultRole)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('clearcaption_staff_auth') === 'true'
  })

  // Login form state
  const [staffId, setStaffId] = useState(defaultRole === 'admin' ? 'ADMIN-001' : 'NURSE-4029')
  const [pin, setPin] = useState('')
  const [department, setDepartment] = useState(defaultRole === 'admin' ? 'Executive Medical Operations' : 'Desk 3 · Outpatient Triage & Reception')
  const [loginError, setLoginError] = useState('')

  // Admin Dashboard Tabs
  const [adminTab, setAdminTab] = useState<'users' | 'patients' | 'kiosks' | 'compliance'>('users')
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState('All')
  const [usersList, setUsersList] = useState<StaffUser[]>(HOSPITAL_USERS)
  const [newUserModal, setNewUserModal] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserRole, setNewUserRole] = useState<StaffUser['role']>('Triage Nurse')
  const [newUserDept, setNewUserDept] = useState('Desk 3 · Outpatient Reception')

  // Patient Registry State
  const [patientSearch, setPatientSearch] = useState('')
  const [patientFilter, setPatientFilter] = useState<'all' | 'urgent' | 'waiting'>('all')

  // Nurse Console State
  const [patients, setPatients] = useState<TriagePatient[]>(() => {
    const saved = localStorage.getItem('clearcaption_active_visit')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.name || parsed.symptom) {
          const livePatient: TriagePatient = {
            id: 'PT-1043',
            name: parsed.name || 'Anonymous Patient',
            symptom: parsed.symptom?.[0] || 'Chest Pain',
            symptomSw: parsed.symptom?.[1] || 'Maumivu ya Kifua',
            places: parsed.places || ['Chest, left'],
            duration: parsed.duration || 'Since this morning',
            urgent: !!parsed.urgent,
            time: 'Just now',
            desk: 'Desk 3',
            lang: 'Kiswahili & KSL',
            status: 'Waiting',
          }
          return [livePatient, ...PATIENT_RECORDS]
        }
      } catch (e) {
        console.error(e)
      }
    }
    return PATIENT_RECORDS
  })

  const [activePatientIndex, setActivePatientIndex] = useState(0)
  const [customPrompt, setCustomPrompt] = useState('')
  const [promptSentToast, setPromptSentToast] = useState('')
  const [interpreterCalled, setInterpreterCalled] = useState(false)

  const activePatient = patients[activePatientIndex] || patients[0]

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Accept demo PINs: 4821 (nurse), 9900 (admin), or any 4 digits
    if (pin.trim() === '4821' || pin.trim() === '9900' || pin.trim().length === 4) {
      setIsAuthenticated(true)
      sessionStorage.setItem('clearcaption_staff_auth', 'true')
      if (staffId.startsWith('ADMIN') || pin.trim() === '9900' || currentRole === 'admin') {
        setCurrentRole('admin')
      } else {
        setCurrentRole('nurse')
      }
      setLoginError('')
    } else {
      setLoginError('Invalid PIN. Use demo Nurse PIN 4821 or Admin PIN 9900')
    }
  }

  const handleQuickNurseFill = () => {
    setCurrentRole('nurse')
    setStaffId('NURSE-4029')
    setPin('4821')
    setDepartment('Desk 3 · Outpatient Triage & Reception')
  }

  const handleQuickAdminFill = () => {
    setCurrentRole('admin')
    setStaffId('ADMIN-001')
    setPin('9900')
    setDepartment('Executive Medical Operations')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('clearcaption_staff_auth')
  }

  const handleSendPrompt = (text: string) => {
    setPromptSentToast(`Sent to Desk 3 Screen: "${text}"`)
    setTimeout(() => setPromptSentToast(''), 4000)
    setCustomPrompt('')
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim()) return
    const id = `USR-${usersList.length + 1}`
    const badge = newUserRole === 'Hospital Administrator' ? `ADMIN-00${usersList.length + 1}` : `STAFF-${4000 + usersList.length}`
    const created: StaffUser = {
      id,
      name: newUserName,
      role: newUserRole,
      department: newUserDept,
      email: `${newUserName.toLowerCase().replace(/\s+/g, '.')}@knh.or.ke`,
      phone: '+254 722 ' + Math.floor(100000 + Math.random() * 900000),
      status: 'On-Duty',
      lastLogin: 'Just registered',
      badgeId: badge,
    }
    setUsersList([created, ...usersList])
    setNewUserName('')
    setNewUserModal(false)
  }

  // Filtered staff users
  const filteredUsers = usersList.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.badgeId.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.department.toLowerCase().includes(userSearch.toLowerCase())
    const matchesRole = userRoleFilter === 'All' || u.role === userRoleFilter
    return matchesSearch && matchesRole
  })

  // Filtered patients for registry
  const filteredPatients = patients.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.symptom.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.desk.toLowerCase().includes(patientSearch.toLowerCase())
    if (patientFilter === 'urgent') return matchesSearch && p.urgent
    if (patientFilter === 'waiting') return matchesSearch && p.status === 'Waiting'
    return matchesSearch
  })

  /* ---------- Login View ---------- */
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col justify-between p-4 md:p-8">
        <div className="max-w-[1240px] w-full mx-auto flex items-center justify-between">
          <a
            href="#/"
            className="inline-flex items-center gap-2 h-11 px-5 rounded-full bg-ash hover:bg-line text-navy text-[14px] font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Hospital Home
          </a>
          <span className="text-[13px] text-slate font-medium">Kenyatta National Hospital · Clinical & Admin Systems</span>
        </div>

        <div className="max-w-[500px] w-full mx-auto my-10 bg-ash/70 rounded-[28px] p-8 md:p-10 border border-line shadow-sm">
          <div className="flex flex-col items-center text-center gap-3 mb-6">
            <span className="w-14 h-14 rounded-[18px] bg-brand text-canvas grid place-items-center shadow-md">
              <Lock size={26} weight="bold" />
            </span>
            <div>
              <h1 className="text-[26px] font-display font-bold tracking-tight">Hospital Access Portal</h1>
              <p className="text-[14px] text-slate mt-1">Sign in as Triage Clinician or Hospital Administrator</p>
            </div>
          </div>

          {/* Role selector tabs */}
          <div className="grid grid-cols-2 p-1.5 rounded-full bg-canvas border border-line mb-6">
            <button
              type="button"
              onClick={handleQuickNurseFill}
              className={`h-10 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                currentRole === 'nurse' ? 'bg-navy text-canvas shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              <Stethoscope size={16} /> Triage Nurse
            </button>
            <button
              type="button"
              onClick={handleQuickAdminFill}
              className={`h-10 rounded-full font-bold text-[13px] flex items-center justify-center gap-2 transition-all ${
                currentRole === 'admin' ? 'bg-navy text-canvas shadow-sm' : 'text-slate hover:text-navy'
              }`}
            >
              <ShieldCheck size={16} /> Hospital Admin
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Department / Authority
              </label>
              <input
                type="text"
                readOnly
                value={department}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas/80 border border-line text-[14px] font-medium text-navy outline-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-slate mb-1.5 uppercase tracking-wider">
                Staff Badge / ID
              </label>
              <input
                type="text"
                required
                value={staffId}
                onChange={(e) => setStaffId(e.target.value)}
                placeholder={currentRole === 'admin' ? 'ADMIN-001' : 'NURSE-4029'}
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[15px] text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">
                  Access PIN
                </label>
                <button
                  type="button"
                  onClick={currentRole === 'admin' ? handleQuickAdminFill : handleQuickNurseFill}
                  className="text-[12px] text-accent font-semibold hover:underline"
                >
                  Fill Demo {currentRole === 'admin' ? 'Admin PIN (9900)' : 'Nurse PIN (4821)'}
                </button>
              </div>
              <input
                type="password"
                required
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="4-digit PIN"
                className="w-full h-12 px-4 rounded-[12px] bg-canvas border border-line text-[16px] text-navy focus:border-accent focus:ring-2 focus:ring-accent/15 outline-none tracking-widest font-mono"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-[10px] bg-alert/10 text-alert text-[13px] flex items-center gap-2">
                <Warning size={18} />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="mt-2 w-full h-13 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[16px] flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              Sign In as {currentRole === 'admin' ? 'Administrator' : 'Clinician'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-line text-center">
            <p className="text-[12px] text-slate flex items-center justify-center gap-1.5">
              <ShieldCheck size={16} className="text-brand" />
              Confidential Patient Health System · DPA & HIPAA Compliant
            </p>
          </div>
        </div>

        <div className="text-center text-[12px] text-slate pb-4">
          © 2026 ClearCaption Hospital Systems · 30 Active Hospital Staff & Clinicians
        </div>
      </div>
    )
  }

  /* ---------- Logged-in Header & Navigation ---------- */
  return (
    <div className="min-h-screen bg-canvas text-navy font-ui flex flex-col">
      {/* Top Console Navigation */}
      <header className="h-18 px-6 md:px-10 bg-ash/80 backdrop-blur-md border-b border-line flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="w-9 h-9 rounded-[10px] bg-canvas border border-line grid place-items-center text-navy hover:bg-ash transition-colors"
            title="Hospital Home"
          >
            <ArrowLeft size={16} />
          </a>
          <div className="flex items-center gap-2 font-display font-bold text-[20px] text-navy">
            <span className="w-8 h-8 rounded-[8px] bg-brand text-canvas grid place-items-center">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
                <path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7z" fill="currentColor" />
              </svg>
            </span>
            ClearCaption{' '}
            <span className="text-[14px] font-normal text-slate">
              | {currentRole === 'admin' ? 'Hospital Administration Suite' : 'Clinician Triage Console'}
            </span>
          </div>
        </div>

        {/* Center Role Toggle for Pair Review */}
        <div className="hidden md:flex items-center p-1 rounded-full bg-canvas border border-line text-[13px]">
          <button
            onClick={() => setCurrentRole('nurse')}
            className={`h-8 px-4 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
              currentRole === 'nurse' ? 'bg-navy text-canvas' : 'text-slate hover:text-navy'
            }`}
          >
            <Stethoscope size={15} /> Nurse View
          </button>
          <button
            onClick={() => setCurrentRole('admin')}
            className={`h-8 px-4 rounded-full font-bold transition-colors flex items-center gap-1.5 ${
              currentRole === 'admin' ? 'bg-navy text-canvas' : 'text-slate hover:text-navy'
            }`}
          >
            <ShieldCheck size={15} /> Admin View ({usersList.length} Staff)
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-right">
            <span className="w-8 h-8 rounded-full bg-accent text-canvas grid place-items-center font-bold text-[12px]">
              {currentRole === 'admin' ? 'GM' : 'JM'}
            </span>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-[13px] font-semibold leading-tight">
                {currentRole === 'admin' ? 'Dr. Geoffrey Mutiso' : 'Nurse Joyce Mwangi'}
              </span>
              <span className="text-[11px] text-slate">
                {currentRole === 'admin' ? 'Hospital Director' : 'Desk 3 Triage'}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-full bg-canvas hover:bg-alert/10 text-slate hover:text-alert border border-line text-[13px] font-medium flex items-center gap-1.5 transition-colors"
          >
            <SignOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* ---------- ADMIN VIEW ---------- */}
      {currentRole === 'admin' ? (
        <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
          {/* Admin KPI Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Users size={16} className="text-accent" /> Hospital Users & Staff
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {usersList.length}
              </span>
              <span className="text-[12px] text-slate">30 active staff profiles</span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Desktop size={16} className="text-brand" /> Kiosk Fleet Desks
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                6 / 6
              </span>
              <span className="text-[12px] text-mint font-semibold text-brand">100% Online & Synced</span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <Heartbeat size={16} className="text-alert" /> Captioned Intakes Today
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                {patients.length}
              </span>
              <span className="text-[12px] text-slate">Average 2.4 min intake time</span>
            </div>

            <div className="p-5 rounded-[20px] bg-ash/60 border border-line flex flex-col gap-1">
              <span className="text-[12px] uppercase font-bold tracking-wider text-slate flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-accent" /> DPA Privacy Wipes
              </span>
              <span className="text-[32px] font-display font-bold text-navy leading-none mt-1">
                100%
              </span>
              <span className="text-[12px] text-brand font-semibold">Zero persistent records</span>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
            <div className="flex items-center gap-2">
              {[
                { id: 'users', label: `Hospital Staff (${usersList.length})`, icon: Users },
                { id: 'patients', label: `Patient Intake Registry (${patients.length})`, icon: Heartbeat },
                { id: 'kiosks', label: 'Reception Desks Fleet (6)', icon: Desktop },
                { id: 'compliance', label: 'Privacy & DPA Logs', icon: ShieldCheck },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setAdminTab(t.id as any)}
                  className={`h-10 px-4 rounded-full font-bold text-[14px] flex items-center gap-2 transition-colors ${
                    adminTab === t.id
                      ? 'bg-navy text-canvas shadow-sm'
                      : 'bg-ash hover:bg-line text-slate hover:text-navy'
                  }`}
                >
                  <t.icon size={16} /> {t.label}
                </button>
              ))}
            </div>

            {adminTab === 'users' && (
              <button
                onClick={() => setNewUserModal(true)}
                className="h-10 px-4 rounded-full bg-accent hover:bg-brand text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <UserPlus size={16} /> Add Hospital Staff
              </button>
            )}
          </div>

          {/* Tab 1: 30 Hospital Users & Staff Directory */}
          {adminTab === 'users' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-[360px]">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search staff by name, badge, department..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-[13px] text-slate font-medium">Filter Role:</span>
                  <select
                    value={userRoleFilter}
                    onChange={(e) => setUserRoleFilter(e.target.value)}
                    className="h-10 px-3 rounded-[12px] bg-canvas border border-line text-[13px] font-semibold text-navy outline-none"
                  >
                    <option value="All">All Roles (30)</option>
                    <option value="Hospital Administrator">Hospital Administrator</option>
                    <option value="Triage Nurse">Triage Nurse</option>
                    <option value="Reception Officer">Reception Officer</option>
                    <option value="Medical Doctor">Medical Doctor</option>
                    <option value="KSL Interpreter">KSL Interpreter</option>
                    <option value="Audiology Specialist">Audiology Specialist</option>
                  </select>
                </div>
              </div>

              {/* Staff Table */}
              <div className="rounded-[18px] bg-canvas border border-line overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-ash/80 border-b border-line text-[12px] uppercase font-bold text-slate tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Badge / ID</th>
                      <th className="py-3.5 px-4">Staff Name</th>
                      <th className="py-3.5 px-4">Assigned Role</th>
                      <th className="py-3.5 px-4">Department / Clinic</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Last Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-ash/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[12px] text-brand">{u.badgeId}</td>
                        <td className="py-3 px-4 font-bold text-navy">{u.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            u.role === 'Hospital Administrator' ? 'bg-navy text-canvas' :
                            u.role === 'Triage Nurse' ? 'bg-mint text-brand' :
                            u.role === 'KSL Interpreter' ? 'bg-amber/15 text-amber' :
                            u.role === 'Medical Doctor' ? 'bg-sky text-navy' : 'bg-ash text-slate'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate text-[13px]">{u.department}</td>
                        <td className="py-3 px-4 text-[12px] text-slate">
                          <div>{u.email}</div>
                          <div className="text-[11px] opacity-75">{u.phone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            u.status === 'Active' || u.status === 'On-Duty'
                              ? 'bg-mint text-brand'
                              : u.status === 'Break'
                              ? 'bg-amber/15 text-amber'
                              : 'bg-ash text-slate'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'Offline' ? 'bg-slate' : 'bg-brand'}`} />
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate text-[12px]">{u.lastLogin}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: 30 Patient Intake Registry */}
          {adminTab === 'patients' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-[360px]">
                  <MagnifyingGlass size={18} className="absolute left-3.5 top-3 text-slate" />
                  <input
                    type="text"
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by patient name, complaint, desk..."
                    className="w-full h-10 pl-10 pr-4 rounded-full bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPatientFilter('all')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${patientFilter === 'all' ? 'bg-navy text-canvas' : 'bg-canvas text-slate border border-line'}`}
                  >
                    All ({patients.length})
                  </button>
                  <button
                    onClick={() => setPatientFilter('urgent')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${patientFilter === 'urgent' ? 'bg-alert text-canvas' : 'bg-canvas text-slate border border-line'}`}
                  >
                    Urgent Only ({patients.filter((p) => p.urgent).length})
                  </button>
                  <button
                    onClick={() => setPatientFilter('waiting')}
                    className={`h-9 px-3.5 rounded-full text-[13px] font-bold ${patientFilter === 'waiting' ? 'bg-amber text-navy' : 'bg-canvas text-slate border border-line'}`}
                  >
                    Waiting ({patients.filter((p) => p.status === 'Waiting').length})
                  </button>
                </div>
              </div>

              <div className="rounded-[18px] bg-canvas border border-line overflow-x-auto">
                <table className="w-full text-left text-[14px]">
                  <thead className="bg-ash/80 border-b border-line text-[12px] uppercase font-bold text-slate tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Triage ID</th>
                      <th className="py-3.5 px-4">Patient Name</th>
                      <th className="py-3.5 px-4">Chief Complaint</th>
                      <th className="py-3.5 px-4">Body Area</th>
                      <th className="py-3.5 px-4">Duration</th>
                      <th className="py-3.5 px-4">Language / KSL</th>
                      <th className="py-3.5 px-4">Desk</th>
                      <th className="py-3.5 px-4">Urgency</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {filteredPatients.map((p) => (
                      <tr key={p.id} className="hover:bg-ash/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[12px] text-brand">{p.id}</td>
                        <td className="py-3 px-4 font-bold text-navy">{p.name}</td>
                        <td className="py-3 px-4 font-medium">
                          {p.symptom} <span className="text-[12px] text-slate font-normal">({p.symptomSw})</span>
                        </td>
                        <td className="py-3 px-4 text-slate text-[13px]">{p.places.join(', ') || 'General'}</td>
                        <td className="py-3 px-4 text-slate text-[13px]">{p.duration}</td>
                        <td className="py-3 px-4 text-slate text-[12px]">{p.lang}</td>
                        <td className="py-3 px-4 font-semibold text-navy text-[13px]">{p.desk}</td>
                        <td className="py-3 px-4">
                          {p.urgent ? (
                            <span className="px-2 py-0.5 rounded-full bg-alert text-canvas text-[11px] font-bold inline-flex items-center gap-1">
                              <Warning size={12} weight="fill" /> URGENT
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-mint text-brand text-[11px] font-bold">
                              STANDARD
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            p.status === 'Waiting' ? 'bg-amber/15 text-amber' :
                            p.status === 'In Triage' ? 'bg-sky text-navy' :
                            p.status === 'With Doctor' ? 'bg-mint text-brand' : 'bg-ash text-slate'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Reception Kiosks Fleet */}
          {adminTab === 'kiosks' && (
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { desk: 'Desk 1 · Emergency Admitting', device: 'iPad Pro 12.9" (Reception Terminal)', status: 'Online', latency: '42ms', mic: 'Boundary Mic Active', nurse: 'Beatrice Akinyi', intakes: 8 },
                { desk: 'Desk 2 · Pediatric Registration', device: 'Samsung Galaxy Tab S9', status: 'Online', latency: '38ms', mic: 'Dual Array Mic', nurse: 'Grace Njeri', intakes: 6 },
                { desk: 'Desk 3 · Main Outpatient Lobby', device: 'iPad Pro 12.9" (Main Kiosk)', status: 'Online · Active', latency: '35ms', mic: 'Directional Array Active', nurse: 'Joyce Mwangi', intakes: 12 },
                { desk: 'Desk 4 · ENT & Audiology Desk', device: 'Surface Pro 9', status: 'Online', latency: '40ms', mic: 'Specialized Acoustic Array', nurse: 'Mercy Korir', intakes: 5 },
                { desk: 'Desk 5 · Maternity Wing Counter', device: 'iPad Air 11"', status: 'Online', latency: '45ms', mic: 'Boundary Mic Active', nurse: 'Esther Moraa', intakes: 4 },
                { desk: 'Desk 6 · Specialized Diagnostics', device: 'Samsung Galaxy Tab S9', status: 'Online', latency: '39ms', mic: 'Directional Mic', nurse: 'Lilian Chepkemoi', intakes: 3 },
              ].map((k) => (
                <div key={k.desk} className="p-6 rounded-[22px] bg-ash/60 border border-line flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="h-6 px-2.5 rounded-full bg-mint text-brand text-[11px] font-bold flex items-center gap-1">
                      <Broadcast size={13} className="animate-pulse" /> {k.status}
                    </span>
                    <span className="text-[12px] text-slate font-mono">{k.latency}</span>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-[18px] text-navy">{k.desk}</h3>
                    <p className="text-[13px] text-slate mt-0.5">{k.device}</p>
                  </div>
                  <div className="pt-3 border-t border-line text-[13px] space-y-1 text-slate">
                    <div>Audio: <span className="font-semibold text-navy">{k.mic}</span></div>
                    <div>Staff: <span className="font-semibold text-navy">{k.nurse}</span></div>
                    <div>Today's Intakes: <span className="font-bold text-accent">{k.intakes} patients</span></div>
                  </div>
                  <a
                    href="#/kiosk"
                    className="mt-2 w-full h-10 rounded-full bg-canvas hover:bg-line border border-line font-bold text-[13px] text-navy flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Open Live Kiosk Feed <CaretRight size={14} />
                  </a>
                </div>
              ))}
            </div>
          )}

          {/* Tab 4: Compliance & Privacy Wipes */}
          {adminTab === 'compliance' && (
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                    <ShieldCheck size={20} className="text-brand" /> Kenya Data Protection Act (DPA) & Medical Privacy Audit
                  </h3>
                  <p className="text-[13px] text-slate">Automatic verification of zero-retention terminal wiping</p>
                </div>
                <span className="h-7 px-3 rounded-full bg-mint text-brand text-[12px] font-bold flex items-center gap-1">
                  <Check size={14} /> Audited Compliant
                </span>
              </div>

              <div className="rounded-[18px] bg-canvas border border-line p-5 space-y-3 text-[14px]">
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="font-semibold text-navy">Automatic 30-Second Privacy Wipe</span>
                  <span className="text-brand font-bold">ACTIVE (Enabled on all 6 desks)</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="font-semibold text-navy">Local Cache Encryption</span>
                  <span className="text-brand font-bold">AES-256 Enabled</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-line">
                  <span className="font-semibold text-navy">Audio Recording Storage Policy</span>
                  <span className="text-brand font-bold">Ephemeral Streaming Only (No voice audio saved)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-navy">KSL Video Clip Licensing</span>
                  <span className="text-brand font-bold">Verified with Kenya National Association of the Deaf (KNAD)</span>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Add New Staff Member */}
          {newUserModal && (
            <div className="fixed inset-0 z-50 bg-navy/50 backdrop-blur-sm grid place-items-center p-4">
              <div className="w-full max-w-[500px] rounded-[28px] bg-canvas border border-line p-8 flex flex-col gap-5 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-display font-bold text-[20px] text-navy">
                    <UserPlus size={22} className="text-accent" /> Register Hospital Staff
                  </div>
                  <button onClick={() => setNewUserModal(false)} className="w-8 h-8 rounded-full bg-ash grid place-items-center text-slate">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleAddUser} className="flex flex-col gap-4">
                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Nurse Damaris Wekesa"
                      className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Role</label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none font-medium"
                    >
                      <option value="Triage Nurse">Triage Nurse</option>
                      <option value="Reception Officer">Reception Officer</option>
                      <option value="Medical Doctor">Medical Doctor</option>
                      <option value="KSL Interpreter">KSL Interpreter</option>
                      <option value="Hospital Administrator">Hospital Administrator</option>
                      <option value="Audiology Specialist">Audiology Specialist</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[12px] font-semibold text-slate uppercase mb-1">Department / Desk</label>
                    <input
                      type="text"
                      required
                      value={newUserDept}
                      onChange={(e) => setNewUserDept(e.target.value)}
                      placeholder="e.g. Desk 3 · Outpatient Reception"
                      className="w-full h-11 px-4 rounded-[12px] bg-ash/50 border border-line text-[14px] text-navy outline-none focus:border-accent"
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setNewUserModal(false)}
                      className="flex-1 h-12 rounded-full bg-ash hover:bg-line text-navy font-bold text-[14px]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 rounded-full bg-accent hover:bg-brand text-canvas font-bold text-[14px] shadow-sm"
                    >
                      Save Staff User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      ) : (
        /* ---------- NURSE VIEW ---------- */
        <main className="flex-1 max-w-[1340px] w-full mx-auto p-4 md:p-8 grid lg:grid-cols-12 gap-6">
          {/* Left Column: Active Patient Overview & Live Transcript */}
          <section className="lg:col-span-8 flex flex-col gap-6">
            {/* Active Intake Card */}
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-6 border-b border-line">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[12px] uppercase font-bold tracking-wider text-slate">Active Desk Intake</span>
                    <span className="h-5 px-2 rounded-full bg-sky text-[11px] text-navy font-semibold inline-flex items-center">
                      {activePatient.desk}
                    </span>
                  </div>
                  <h2 className="text-[28px] font-display font-bold text-navy flex items-center gap-3">
                    {activePatient.name}
                    {activePatient.urgent ? (
                      <span className="h-7 px-3 rounded-full bg-alert text-canvas text-[12px] font-bold inline-flex items-center gap-1">
                        <Warning size={14} weight="fill" /> URGENT TRIAGE
                      </span>
                    ) : (
                      <span className="h-7 px-3 rounded-full bg-brand/15 text-brand text-[12px] font-bold inline-flex items-center">
                        STANDARD TRIAGE
                      </span>
                    )}
                  </h2>
                  <p className="text-[13px] text-slate mt-0.5">Checked in {activePatient.time} · Communication: {activePatient.lang}</p>
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-[13px] text-slate font-medium">Status:</span>
                  <select
                    value={activePatient.status}
                    onChange={(e) => {
                      const val = e.target.value as TriagePatient['status']
                      setPatients((prev) =>
                        prev.map((p, idx) => (idx === activePatientIndex ? { ...p, status: val } : p))
                      )
                    }}
                    className="h-10 px-3 rounded-[10px] bg-canvas border border-line text-[13px] font-semibold text-navy focus:border-accent outline-none"
                  >
                    <option value="Waiting">Waiting</option>
                    <option value="In Triage">In Triage</option>
                    <option value="With Doctor">With Doctor</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Medical Data Grid */}
              <div className="grid sm:grid-cols-3 gap-4 pt-6">
                <div className="p-4 rounded-[16px] bg-canvas border border-line">
                  <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                    <Heartbeat size={16} className="text-accent" /> Chief Complaint
                  </span>
                  <p className="text-[17px] font-bold text-navy leading-tight">{activePatient.symptom}</p>
                  {activePatient.symptomSw && (
                    <p className="text-[13px] text-slate mt-0.5">{activePatient.symptomSw}</p>
                  )}
                </div>

                <div className="p-4 rounded-[16px] bg-canvas border border-line">
                  <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                    <MapPin size={16} className="text-accent" /> Reported Pain Areas
                  </span>
                  <p className="text-[17px] font-bold text-navy leading-tight">
                    {activePatient.places.length ? activePatient.places.join(', ') : 'None specified'}
                  </p>
                  <p className="text-[13px] text-slate mt-0.5">Indicated via Body Map</p>
                </div>

                <div className="p-4 rounded-[16px] bg-canvas border border-line">
                  <span className="text-[11px] uppercase tracking-wider text-slate font-bold flex items-center gap-1.5 mb-1">
                    <Clock size={16} className="text-accent" /> Duration
                  </span>
                  <p className="text-[17px] font-bold text-navy leading-tight">{activePatient.duration}</p>
                  <p className="text-[13px] text-slate mt-0.5">Reported by patient</p>
                </div>
              </div>
            </div>

            {/* Live Transcript Log */}
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[18px] font-display font-bold text-navy flex items-center gap-2">
                    <ChatText size={20} className="text-accent" /> Live Desk Conversation Stream
                  </h3>
                  <p className="text-[13px] text-slate">Synchronized real-time speech captions and patient inputs</p>
                </div>
                <span className="text-[12px] px-2.5 py-1 rounded-full bg-mint text-brand font-semibold border border-brand/20">
                  Live Sync
                </span>
              </div>

              <div className="space-y-3 p-4 rounded-[18px] bg-canvas border border-line max-h-[300px] overflow-y-auto">
                <div className="flex flex-col gap-1 items-start text-left">
                  <span className="text-[11px] font-bold text-slate uppercase">08:14 AM · Nurse (Spoken)</span>
                  <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                    Good morning. Please tell me your name.
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                  <span className="text-[11px] font-bold text-slate uppercase">08:14 AM · Patient (On-Screen Keypad)</span>
                  <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold">
                    {activePatient.name}
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-start text-left">
                  <span className="text-[11px] font-bold text-slate uppercase">08:15 AM · Nurse (Spoken)</span>
                  <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                    What brings you in today?
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                  <span className="text-[11px] font-bold text-slate uppercase">08:15 AM · Patient (Symptom Card)</span>
                  <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold flex items-center gap-2">
                    <Heartbeat size={18} /> {activePatient.symptom} · {activePatient.symptomSw}
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-start text-left">
                  <span className="text-[11px] font-bold text-slate uppercase">08:16 AM · Nurse (Spoken)</span>
                  <div className="px-4 py-2.5 rounded-[12px] rounded-tl-sm bg-mint text-navy text-[15px] font-medium">
                    Can you show me where it hurts?
                  </div>
                </div>

                <div className="flex flex-col gap-1 items-end text-right">
                  <span className="text-[11px] font-bold text-slate uppercase">08:16 AM · Patient (Body Map)</span>
                  <div className="px-4 py-2 rounded-[12px] rounded-tr-sm bg-navy text-canvas text-[15px] font-bold">
                    {activePatient.places.length ? activePatient.places.join(', ') : 'Chest, left'}
                  </div>
                </div>
              </div>

              {/* Quick Prompt to Patient Screen */}
              <div className="pt-2">
                <label className="block text-[13px] font-semibold text-slate mb-2">
                  Send Direct Message / Guidance to Patient Screen:
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    'Please have a seat in Bay 3',
                    'Doctor is reviewing your chart',
                    'Please prepare your ID / SHIF card',
                    'An interpreter has been requested',
                  ].map((msg) => (
                    <button
                      key={msg}
                      onClick={() => handleSendPrompt(msg)}
                      className="h-8 px-3 rounded-full bg-canvas hover:bg-sky text-navy text-[12px] font-medium border border-line transition-colors"
                    >
                      + {msg}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Type custom note to show on patient's screen..."
                    className="flex-1 h-11 px-4 rounded-[12px] bg-canvas border border-line text-[14px] text-navy outline-none focus:border-accent"
                  />
                  <button
                    disabled={!customPrompt.trim()}
                    onClick={() => handleSendPrompt(customPrompt)}
                    className="h-11 px-5 rounded-[12px] bg-accent hover:bg-brand disabled:opacity-40 text-canvas font-semibold text-[13px] flex items-center gap-1.5 transition-colors"
                  >
                    <PaperPlaneRight size={16} /> Send to Tablet
                  </button>
                </div>

                {promptSentToast && (
                  <div className="mt-2 text-[13px] text-brand font-semibold flex items-center gap-1.5">
                    <CheckCircle size={16} /> {promptSentToast}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Column: Actions & Reception Queue */}
          <aside className="lg:col-span-4 flex flex-col gap-6">
            {/* Quick Actions Card */}
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4">
              <h3 className="text-[17px] font-display font-bold text-navy flex items-center gap-2">
                <Stethoscope size={20} className="text-accent" /> Clinical Triage Actions
              </h3>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => setInterpreterCalled(true)}
                  className={`w-full h-12 px-4 rounded-[12px] font-semibold text-[14px] flex items-center justify-between border transition-colors ${
                    interpreterCalled
                      ? 'bg-amber text-navy border-amber font-bold'
                      : 'bg-canvas text-navy border-line hover:border-accent'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <PhoneCall size={18} />
                    {interpreterCalled ? 'KSL Interpreter Dispatched' : 'Request On-Site KSL Interpreter'}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-navy/10">Priority</span>
                </button>

                <button
                  onClick={() => {
                    setPatients((prev) =>
                      prev.map((p, idx) => (idx === activePatientIndex ? { ...p, status: 'In Triage' } : p))
                    )
                  }}
                  className="w-full h-12 px-4 rounded-[12px] bg-canvas hover:bg-sky text-navy font-semibold text-[14px] flex items-center justify-between border border-line transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <FirstAidKit size={18} /> Handoff to Triage Bay #2
                  </span>
                  <CaretRight size={16} className="text-slate" />
                </button>

                <a
                  href="#/kiosk"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full h-12 px-4 rounded-[12px] bg-accent hover:bg-brand text-canvas font-semibold text-[14px] flex items-center justify-between transition-colors shadow-sm"
                >
                  <span className="flex items-center gap-2">
                    <Broadcast size={18} /> Open Desk 3 Patient Tablet
                  </span>
                  <CaretRight size={16} />
                </a>
              </div>
            </div>

            {/* Today's Triage Queue */}
            <div className="bg-ash/50 rounded-[24px] border border-line p-6 flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-[17px] font-display font-bold text-navy">Desk Queue ({patients.length})</h3>
                <span className="text-[12px] text-slate">Live</span>
              </div>

              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {patients.map((p, idx) => (
                  <button
                    key={p.id}
                    onClick={() => setActivePatientIndex(idx)}
                    className={`w-full p-3 rounded-[16px] text-left border transition-all ${
                      idx === activePatientIndex
                        ? 'bg-canvas border-accent ring-2 ring-accent/15 shadow-sm'
                        : 'bg-canvas/60 border-line hover:bg-canvas'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[14px] text-navy">{p.name}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.status === 'Waiting'
                            ? 'bg-amber/15 text-amber'
                            : p.status === 'In Triage'
                            ? 'bg-sky text-navy'
                            : 'bg-mint text-brand'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-slate mt-1">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Heartbeat size={13} /> {p.symptom}
                      </span>
                      <span className="text-[11px]">{p.time}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-line text-[12px] text-slate flex items-center justify-between">
                <span>Auto-wipe privacy enabled</span>
                <span className="text-brand font-medium">KNH Reception</span>
              </div>
            </div>
          </aside>
        </main>
      )}
    </div>
  )
}
