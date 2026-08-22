import { Store, KeywordItem, IndustryTemplate, ReviewItem } from '../types';

export const INDUSTRY_TEMPLATES: IndustryTemplate[] = [
  {
    id: 'cafe',
    name: 'Cafe & Restaurant',
    industry: 'cafe',
    icon: 'Coffee',
    keywords: {
      experience: ['Cozy Atmosphere', 'Quick Service', 'Warm Hospitality', 'Aesthetic Decor', 'Great Music', 'Clean Seating', 'Pet Friendly'],
      product: ['Signature Cappuccino', 'Spanish Latte', 'Avocado Sourdough', 'Freshly Baked Croissant', 'Woodfired Pizza', 'Berry Cheesecake', 'Truffle Pasta'],
      staff: ['Friendly Barista', 'Attentive Waitstaff', 'Talented Chef', 'Smiling Host']
    }
  },
  {
    id: 'salon',
    name: 'Salon, Spa & Beauty',
    industry: 'salon',
    icon: 'Sparkles',
    keywords: {
      experience: ['Relaxing Ambience', 'Clean Sanitized Tools', 'Punctual Appointment', 'Luxury Pampering', 'Aromatic Vibe'],
      product: ['Precision Haircut', 'Balayage Highlights', 'Hydra Facial', 'Deep Tissue Massage', 'Gel Manicure', 'Keratin Treatment'],
      staff: ['Expert Stylist', 'Skilled Masseuse', 'Warm Receptionist', 'Gentle Aesthetician']
    }
  },
  {
    id: 'dental',
    name: 'Dental & Healthcare Clinic',
    industry: 'dental',
    icon: 'HeartPulse',
    keywords: {
      experience: ['Painless Procedure', 'Spotless Modern Clinic', 'Zero Wait Time', 'Reassuring Environment', 'Transparent Billing'],
      product: ['Teeth Whitening', 'Invisible Aligners', 'Routine Cleaning', 'Root Canal', 'Gentle Consultation', 'Preventative Care'],
      staff: ['Compassionate Doctor', 'Gentle Hygienist', 'Caring Staff', 'Knowledgeable Specialist']
    }
  },
  {
    id: 'automotive',
    name: 'Auto Repair & Detailing',
    industry: 'automotive',
    icon: 'Car',
    keywords: {
      experience: ['Honest Diagnosis', 'Fair Transparent Pricing', 'Quick Turnaround', 'Clean Waiting Lounge', 'Thorough Inspection'],
      product: ['Synthetic Oil Change', 'Brake Pad Replacement', 'Ceramic Coating', 'Tire Alignment', 'Engine Diagnostics', 'AC Refill'],
      staff: ['Master Mechanic', 'Honest Service Advisor', 'Efficient Techs']
    }
  },
  {
    id: 'gym',
    name: 'Fitness & Gym Studio',
    industry: 'gym',
    icon: 'Dumbbell',
    keywords: {
      experience: ['High Energy Vibe', 'Clean Disinfected Equipment', 'Spacious Training Floor', 'Motivating Music', 'Friendly Community'],
      product: ['HIIT Classes', 'Personal Training', 'Free Weights Area', 'Sauna Recovery', 'Nutrition Coaching', 'Pilates Reformer'],
      staff: ['Inspiring Coach', 'Dedicated Trainer', 'Helpful Front Desk']
    }
  },
  {
    id: 'retail',
    name: 'Boutique & Retail Store',
    industry: 'retail',
    icon: 'ShoppingBag',
    keywords: {
      experience: ['Welcoming Vibe', 'Organized Displays', 'Hassle-Free Returns', 'Trendy Atmosphere', 'Beautiful Gift Packaging'],
      product: ['Curated Collection', 'Premium Fabric Quality', 'Artisan Accessories', 'Unique Finds', 'Sustainable Materials'],
      staff: ['Knowledgeable Associate', 'Helpful Cashier', 'Attentive Stylist']
    }
  }
];

export const INITIAL_STORES: Store[] = [
  {
    id: 'store-1',
    name: 'Cafe UrbanBite',
    slug: 'cafe-urbanbite-edappally',
    tagline: 'Artisanal Brews, Gourmet Bites & Good Vibes',
    address: 'Near Edappally Toll Junction, Kochi, Kerala 682024',
    locality: 'Edappally, Kochi',
    category: 'Cafe & Specialty Coffee Bistro',
    industry: 'cafe',
    phone: '+91 98470 12345',
    email: 'hello@cafeurbanbite.com',
    website: 'https://cafeurbanbite.com',
    openingHours: 'Mon - Sun: 8:00 AM – 11:00 PM',
    photoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1000&auto=format&fit=crop&q=80',
    logoUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300&auto=format&fit=crop&q=80',
    rating: 4.8,
    userRatingsTotal: 342,
    googlePlaceId: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4',
    socialLinks: {
      instagram: 'https://instagram.com/cafeurbanbite',
      facebook: 'https://facebook.com/cafeurbanbite',
      whatsapp: '+919847012345',
      maps: 'https://maps.google.com/?q=Cafe+UrbanBite+Edappally'
    },
    nfcEnabled: true,
    privateFeedbackShield: true,
    autoPilot: {
      enabled: true,
      minRating: 4,
      tone: 'Warm & Grateful',
      ownerName: 'Rahul & UrbanBite Team'
    }
  },
  {
    id: 'store-2',
    name: 'Cafe UrbanBite - Fort Kochi',
    slug: 'cafe-urbanbite-fortkochi',
    tagline: 'Heritage Courtyard Coffee & Seaside Pastries',
    address: '14/320 Princess Street, Fort Kochi, Kerala 682001',
    locality: 'Fort Kochi, Kochi',
    category: 'Heritage Cafe & Bakery',
    industry: 'cafe',
    phone: '+91 98470 54321',
    email: 'fortkochi@cafeurbanbite.com',
    website: 'https://cafeurbanbite.com/fortkochi',
    openingHours: 'Mon - Sun: 7:30 AM – 10:30 PM',
    photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop&q=80',
    rating: 4.9,
    userRatingsTotal: 189,
    googlePlaceId: 'ChIJb_eP3lE-0DsR8f2F5nQ7qZ8',
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJb_eP3lE-0DsR8f2F5nQ7qZ8',
    socialLinks: {
      instagram: 'https://instagram.com/cafeurbanbite',
      whatsapp: '+919847054321'
    },
    nfcEnabled: true,
    privateFeedbackShield: true,
    autoPilot: {
      enabled: false,
      minRating: 5,
      tone: 'Professional & Brief',
      ownerName: 'UrbanBite Management'
    }
  }
];

export const INITIAL_KEYWORDS: Record<string, KeywordItem[]> = {
  'store-1': [
    { id: 'k1', text: 'Signature Spanish Latte', category: 'product' },
    { id: 'k2', text: 'Truffle Mushroom Pasta', category: 'product' },
    { id: 'k3', text: 'Fresh Almond Croissant', category: 'product' },
    { id: 'k4', text: 'Avocado Sourdough Toast', category: 'product' },
    { id: 'k5', text: 'Cozy Atmosphere & Lighting', category: 'experience' },
    { id: 'k6', text: 'Super Fast Free Wi-Fi', category: 'experience' },
    { id: 'k7', text: 'Warm & Welcoming Hospitality', category: 'experience' },
    { id: 'k8', text: 'Friendly Barista Sarah', category: 'staff', isCustom: true },
    { id: 'k9', text: 'Aesthetic Chill Music', category: 'experience' },
  ],
  'store-2': [
    { id: 'k20', text: 'Iced Cold Brew', category: 'product' },
    { id: 'k21', text: 'Cinnamon Brioche Roll', category: 'product' },
    { id: 'k22', text: 'Courtyard Seating', category: 'experience' },
    { id: 'k23', text: 'Historic Heritage Vibe', category: 'experience' },
    { id: 'k24', text: 'Attentive Staff', category: 'staff' },
  ]
};

export const INITIAL_REVIEWS: ReviewItem[] = [
  {
    id: 'rev-1',
    storeId: 'store-1',
    customerName: 'Ananya Nair',
    customerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '2 hours ago',
    reviewText: 'Had such a delightful afternoon at Cafe UrbanBite! The Signature Spanish Latte was perfectly balanced and smooth, and the Truffle Mushroom Pasta was pure comfort food. Huge shoutout to Barista Sarah for greeting us with the sweetest smile and great coffee recommendations. Definitely our new regular hangout in Edappally!',
    selectedKeywords: ['Signature Spanish Latte', 'Truffle Mushroom Pasta', 'Friendly Barista Sarah', 'Cozy Atmosphere & Lighting'],
    sentiment: 'positive',
    mentionedEntities: ['Signature Spanish Latte', 'Truffle Mushroom Pasta', 'Barista Sarah', 'Edappally'],
    replyStatus: 'published',
    aiReply: 'Hi Ananya, thank you so much for this glowing 5-star review! We are absolutely thrilled you enjoyed the Signature Spanish Latte and the Truffle Mushroom Pasta. We made sure to share your kind words with Sarah—she was all smiles! Looking forward to welcoming you back for your next coffee break.\n\n- Rahul & UrbanBite Team',
    publishedAt: '1 hour ago',
    isAutoPilot: true
  },
  {
    id: 'rev-2',
    storeId: 'store-1',
    customerName: 'Vikram Menon',
    customerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: 'Yesterday',
    reviewText: 'Best spot for remote working in Kochi! The high speed Wi-Fi never dropped during my zoom calls, and the Fresh Almond Croissant paired with their pour-over was heavenly. The cozy atmosphere and chill playlist make focusing effortless.',
    selectedKeywords: ['Fresh Almond Croissant', 'Super Fast Free Wi-Fi', 'Cozy Atmosphere & Lighting'],
    sentiment: 'positive',
    mentionedEntities: ['Almond Croissant', 'Wi-Fi', 'Cozy Atmosphere', 'Pour-over'],
    replyStatus: 'drafted',
    aiReply: 'Hi Vikram, thank you for taking the time to leave us this fantastic review! We are so glad our super fast Wi-Fi and cozy atmosphere provided the ideal remote work environment for your meetings. Pair that with our fresh almond croissant, and you have our favorite setup too! See you again soon for another productive session.\n\n- Rahul & UrbanBite Team',
    publishedAt: undefined
  },
  {
    id: 'rev-3',
    storeId: 'store-1',
    customerName: 'David Matthew',
    customerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    rating: 3,
    date: '3 days ago',
    reviewText: 'The Avocado Sourdough Toast was delicious and fresh, but we had to wait almost 35 minutes for our table on Sunday morning because it was packed. Service was a bit rushed, though the food quality made up for part of it.',
    selectedKeywords: ['Avocado Sourdough Toast'],
    sentiment: 'neutral',
    mentionedEntities: ['Avocado Sourdough Toast', '35 minutes wait time', 'Sunday rush'],
    replyStatus: 'pending',
    aiReply: undefined,
    publishedAt: undefined
  },
  {
    id: 'rev-4',
    storeId: 'store-1',
    customerName: 'Sneha Roy',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    rating: 5,
    date: '4 days ago',
    reviewText: 'Celebrated my friend’s birthday here and the team made it so special. The aesthetic lighting and aesthetic interior look amazing in photos. Also you must try their signature cheesecake!',
    selectedKeywords: ['Warm & Welcoming Hospitality', 'Cozy Atmosphere & Lighting'],
    sentiment: 'positive',
    mentionedEntities: ['Birthday celebration', 'Cheesecake', 'Interior lighting'],
    replyStatus: 'published',
    aiReply: 'Hi Sneha, happy birthday to your friend! We are delighted that you chose Cafe UrbanBite to celebrate and that our cozy lighting made for great photos. Don’t forget to try our seasonal bakes next time you visit!\n\n- Rahul & UrbanBite Team',
    publishedAt: '3 days ago',
    isAutoPilot: false
  }
];
