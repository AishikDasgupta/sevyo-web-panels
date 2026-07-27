/* Sevyo — Mock data for the static HTML version. */

const LOGO_URL = "https://media.base44.com/images/public/69c7d609f4ca115f68471b64/e2d818e6a_Web_Photo_Editor_1-removebg-preview.png";

const CAREGIVER_TYPES = [
  { id: 'nurse', label: 'Registered Nurse', icon: '🏥', desc: 'Licensed nurses for medical care' },
  { id: 'caregiver', label: 'Personal Caregiver', icon: '🤲', desc: 'Daily assistance and companionship' },
  { id: 'physiotherapist', label: 'Physiotherapist', icon: '💪', desc: 'Physical therapy and rehabilitation' },
  { id: 'lab', label: 'Lab Collection', icon: '🧪', desc: 'Home blood & sample collection' },
  { id: 'mental_health', label: 'Mental Health Aide', icon: '🧠', desc: 'Emotional and psychological support' },
  { id: 'elder_care', label: 'Elder Care', icon: '👴', desc: 'Specialized senior care' },
  { id: 'pediatric', label: 'Pediatric Care', icon: '👶', desc: 'Child healthcare specialists' },
];

const CAREGIVERS = [
  { id: 1, name: 'Sarah Johnson', type: 'nurse', rating: 4.9, reviews: 127, experience: 8, price: 550, avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'HealthFirst Agency', vendorId: 1, specializations: ['Post-surgery care', 'Wound management', 'IV therapy'], bio: 'Dedicated RN with 8 years of home healthcare experience. Specialized in post-operative and chronic care.', verified: true },
  { id: 2, name: 'Michael Chen', type: 'physiotherapist', rating: 4.8, reviews: 89, experience: 6, price: 650, avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'CareWell Partners', vendorId: 2, specializations: ['Sports rehab', 'Geriatric therapy', 'Pain management'], bio: 'Sports rehabilitation expert helping patients recover mobility and strength.', verified: true },
  { id: 3, name: 'Emily Rodriguez', type: 'caregiver', rating: 4.7, reviews: 203, experience: 10, price: 350, avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964c6e0?w=150&h=150&fit=crop&crop=face', available: false, vendor: 'HealthFirst Agency', vendorId: 1, specializations: ['Dementia care', 'Companionship', 'Meal preparation'], bio: 'Compassionate caregiver specializing in dementia and Alzheimers care.', verified: true },
  { id: 4, name: 'David Kim', type: 'elder_care', rating: 4.9, reviews: 156, experience: 12, price: 450, avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'SeniorCare Plus', vendorId: 3, specializations: ['Fall prevention', 'Medication management', 'Mobility assistance'], bio: 'Veteran elder care specialist ensuring dignity and comfort for seniors.', verified: true },
  { id: 5, name: 'Lisa Patel', type: 'pediatric', rating: 4.8, reviews: 94, experience: 7, price: 600, avatar: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'CareWell Partners', vendorId: 2, specializations: ['Newborn care', 'Vaccination support', 'Child development'], bio: 'Pediatric nurse passionate about childrens health and well-being.', verified: true },
  { id: 6, name: 'James Wilson', type: 'mental_health', rating: 4.6, reviews: 67, experience: 5, price: 500, avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'SeniorCare Plus', vendorId: 3, specializations: ['Anxiety support', 'Depression care', 'CBT techniques'], bio: 'Mental health aide providing compassionate emotional and psychological support.', verified: false },
  { id: 7, name: 'Anna Martinez', type: 'nurse', rating: 4.9, reviews: 178, experience: 11, price: 600, avatar: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'HealthFirst Agency', vendorId: 1, specializations: ['Diabetic care', 'BP monitoring', 'Chronic illness'], bio: 'Experienced RN with focus on chronic disease management and patient education.', verified: true },
  { id: 8, name: 'Robert Taylor', type: 'caregiver', rating: 4.5, reviews: 112, experience: 4, price: 300, avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', available: true, vendor: 'CareWell Partners', vendorId: 2, specializations: ['Mobility help', 'Bathing assistance', 'Light housekeeping'], bio: 'Reliable caregiver providing daily living assistance with a warm approach.', verified: false },
];

const VENDORS = [
  { id: 1, name: 'HealthFirst Agency', logo: '🏥', caregivers: 45, activeBookings: 23, rating: 4.8, status: 'active', since: '2021', revenue: 125000, location: 'Mumbai, MH', contact: 'admin@healthfirst.com', phone: '+91 98765 43210' },
  { id: 2, name: 'CareWell Partners', logo: '💚', caregivers: 32, activeBookings: 18, rating: 4.7, status: 'active', since: '2022', revenue: 89000, location: 'Delhi, IN', contact: 'info@carewell.com', phone: '+91 98111 22334' },
  { id: 3, name: 'SeniorCare Plus', logo: '👴', caregivers: 28, activeBookings: 15, rating: 4.6, status: 'active', since: '2020', revenue: 156000, location: 'Bengaluru, KA', contact: 'hello@seniorcare.com', phone: '+91 99000 55667' },
  { id: 4, name: 'NurseOnCall', logo: '📞', caregivers: 18, activeBookings: 8, rating: 4.4, status: 'pending', since: '2023', revenue: 34000, location: 'Pune, MH', contact: 'ops@nurseoncall.com', phone: '+91 91234 56789' },
];

const BOOKINGS = [
  { id: 'BK001', userId: 1, userName: 'John Doe', caregiverId: 1, caregiverName: 'Sarah Johnson', vendorId: 1, vendorName: 'HealthFirst Agency', type: 'nurse', service: 'Post-surgery care', date: '2026-07-24', time: '09:00 AM', duration: 4, status: 'confirmed', price: 2200, address: '123 Main St, Mumbai', payment: 'cash', paymentStatus: 'pending' },
  { id: 'BK002', userId: 2, userName: 'Mary Smith', caregiverId: 4, caregiverName: 'David Kim', vendorId: 3, vendorName: 'SeniorCare Plus', type: 'elder_care', service: 'Daily elder care', date: '2026-07-24', time: '10:00 AM', duration: 6, status: 'in_progress', price: 2700, address: '456 Oak Ave, Bengaluru', payment: 'online', paymentStatus: 'paid' },
  { id: 'BK003', userId: 3, userName: 'Robert Brown', caregiverId: 2, caregiverName: 'Michael Chen', vendorId: 2, vendorName: 'CareWell Partners', type: 'physiotherapist', service: 'Physical therapy', date: '2026-07-25', time: '02:00 PM', duration: 2, status: 'pending', price: 1300, address: '789 Pine Rd, Delhi', payment: 'cash', paymentStatus: 'pending' },
  { id: 'BK004', userId: 1, userName: 'John Doe', caregiverId: 5, caregiverName: 'Lisa Patel', vendorId: 2, vendorName: 'CareWell Partners', type: 'pediatric', service: 'Child vaccination support', date: '2026-07-22', time: '11:00 AM', duration: 1, status: 'completed', price: 600, address: '123 Main St, Mumbai', payment: 'online', paymentStatus: 'paid' },
  { id: 'BK005', userId: 4, userName: 'Alice Green', caregiverId: 7, caregiverName: 'Anna Martinez', vendorId: 1, vendorName: 'HealthFirst Agency', type: 'nurse', service: 'Diabetic monitoring', date: '2026-07-26', time: '08:00 AM', duration: 3, status: 'confirmed', price: 1800, address: '321 Elm St, Mumbai', payment: 'cash', paymentStatus: 'pending' },
  { id: 'BK006', userId: 5, userName: 'Tom White', caregiverId: 3, caregiverName: 'Emily Rodriguez', vendorId: 1, vendorName: 'HealthFirst Agency', type: 'caregiver', service: 'Dementia care', date: '2026-07-21', time: '07:00 AM', duration: 8, status: 'completed', price: 2800, address: '654 Maple Dr, Mumbai', payment: 'cash', paymentStatus: 'paid' },
  { id: 'BK007', userId: 1, userName: 'John Doe', caregiverId: null, caregiverName: null, vendorId: null, vendorName: null, type: 'nurse', service: 'IV Cannulation', date: '2026-07-24', time: 'ASAP', duration: 1, status: 'broadcast', price: 500, address: '123 Main St, Mumbai', payment: 'cash', paymentStatus: 'pending' },
];

const USERS = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '+91 98765 43210', bookings: 5, spent: 12500, joined: '2025-06-15', status: 'active', role: 'user' },
  { id: 2, name: 'Mary Smith', email: 'mary@example.com', phone: '+91 98111 22334', bookings: 3, spent: 8900, joined: '2025-08-20', status: 'active', role: 'user' },
  { id: 3, name: 'Robert Brown', email: 'robert@example.com', phone: '+91 99000 55667', bookings: 2, spent: 4500, joined: '2025-11-01', status: 'active', role: 'user' },
  { id: 4, name: 'Alice Green', email: 'alice@example.com', phone: '+91 91234 56789', bookings: 8, spent: 21000, joined: '2025-04-10', status: 'active', role: 'user' },
  { id: 5, name: 'Tom White', email: 'tom@example.com', phone: '+91 94560 77881', bookings: 1, spent: 2800, joined: '2026-01-05', status: 'inactive', role: 'user' },
];

const REVIEWS = [
  { id: 1, userId: 1, userName: 'John Doe', caregiverId: 1, caregiverName: 'Sarah Johnson', vendorId: 1, rating: 5, comment: 'Sarah was absolutely wonderful! Very professional and caring.', date: '2026-07-20', service: 'Post-surgery care' },
  { id: 2, userId: 2, userName: 'Mary Smith', caregiverId: 4, caregiverName: 'David Kim', vendorId: 3, rating: 5, comment: 'David took amazing care of my father. Highly recommend!', date: '2026-07-18', service: 'Daily elder care' },
  { id: 3, userId: 4, userName: 'Alice Green', caregiverId: 7, caregiverName: 'Anna Martinez', vendorId: 1, rating: 4, comment: 'Anna is very knowledgeable and patient. Great experience.', date: '2026-07-15', service: 'Diabetic monitoring' },
  { id: 4, userId: 3, userName: 'Robert Brown', caregiverId: 2, caregiverName: 'Michael Chen', vendorId: 2, rating: 5, comment: 'Michael helped me recover from my knee surgery amazingly well.', date: '2026-07-12', service: 'Physical therapy' },
];

const ADMIN_STATS = {
  totalRevenue: 456000,
  monthlyRevenue: 38500,
  totalBookings: 1247,
  activeBookings: 64,
  totalUsers: 892,
  totalCaregivers: 123,
  totalVendors: 4,
  satisfactionRate: 4.7,
};

const REVENUE_DATA = [
  { month: 'Feb', revenue: 32000 },
  { month: 'Mar', revenue: 38500 },
  { month: 'Apr', revenue: 35000 },
  { month: 'May', revenue: 41000 },
  { month: 'Jun', revenue: 38500 },
  { month: 'Jul', revenue: 42000 },
];

const BOOKINGS_BY_TYPE = [
  { name: 'Nursing', value: 35, color: '#2563eb' },
  { name: 'Caregiving', value: 25, color: '#059669' },
  { name: 'Elder Care', value: 20, color: '#d97706' },
  { name: 'Physiotherapy', value: 12, color: '#9333ea' },
  { name: 'Pediatric', value: 5, color: '#ec4899' },
  { name: 'Mental Health', value: 3, color: '#14b8a6' },
];

const INSTANT_SERVICES = [
  { icon: '💉', label: 'IV Cannulation' },
  { icon: '💉', label: 'IM / SC Injection' },
  { icon: '💉', label: 'IV Injection' },
  { icon: '💊', label: 'Multi-Vitamin IV' },
  { icon: '💧', label: 'Electrolyte IV (NS/RL/DNS)' },
  { icon: '🩹', label: 'Major Dressing' },
  { icon: '🩹', label: 'Minor Wound Dressing' },
  { icon: '🩺', label: 'Diabetic Foot Ulcer Dressing' },
  { icon: '🌬️', label: "Foley's Catheter Remove" },
  { icon: '🌬️', label: "Foley's Catheter Insert" },
  { icon: '🧪', label: "Ryle's Tube" },
  { icon: '🩺', label: 'Enema Service' },
  { icon: '🩹', label: 'Bedsore Dressing' },
  { icon: '💉', label: 'Albumin Injection' },
  { icon: '❤️', label: 'Suture Removal / Care' },
  { icon: '💉', label: 'Antibiotic IV' },
];

const STEPS = [
  { n: '01', title: 'Choose Your Service', desc: 'Pick from our range of specialised at-home medical procedures, from IV drips to dressings and more.' },
  { n: '02', title: 'We Match a Nurse', desc: 'Our team finds a verified, trained nurse near you within minutes — no apps, no hassle.' },
  { n: '03', title: 'Care at Your Doorstep', desc: 'Receive professional medical care safely from home. No waiting rooms, no commutes.' },
];

const TESTIMONIALS = [
  { quote: 'I needed an IV drip after a fever and a nurse arrived within 30 minutes. Absolutely seamless experience!', name: 'Priya Sharma', location: 'Mumbai, MH', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
  { quote: 'My father needed daily dressing changes post-surgery. Sevyo made it so easy — professional and caring.', name: 'Rahul Mehta', location: 'Delhi, IN', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
  { quote: 'From booking to the nurse arriving, it took under 45 minutes. This service is a game changer.', name: 'Anita Nair', location: 'Bengaluru, KA', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
];

const FAQS = [
  { q: 'How quickly can a nurse arrive?', a: 'For most metro areas, we typically have a trained nurse at your doorstep within 30–60 minutes of booking confirmation.' },
  { q: 'Are your nurses certified and verified?', a: 'All nurses and healthcare professionals are licensed, background-checked, and verified by our clinical team before being onboarded.' },
  { q: 'Can I book for a family member?', a: 'Absolutely. You can book on behalf of any family member by providing their details during the booking flow.' },
  { q: 'What if I need to cancel or reschedule?', a: 'You can cancel or reschedule up to 30 minutes before the scheduled visit with no charge.' },
];

const CURRENT_USER = { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', phone: '+91 98765 43210', address: '123 Main St, Mumbai' };
const CURRENT_VENDOR = VENDORS[0];
const CURRENT_CAREGIVER = CAREGIVERS[0];