const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedStates() {
  console.log('🌱 Seeding Indian States and Cities...');

  const indianStatesAndCities = [
    {
      stateName: 'Gujarat',
      stateCode: 'GJ',
      cities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh', 'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Bharuch']
    },
    {
      stateName: 'Maharashtra',
      stateCode: 'MH',
      cities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Solapur', 'Aurangabad', 'Navi Mumbai', 'Kolhapur']
    },
    {
      stateName: 'Delhi',
      stateCode: 'DL',
      cities: ['New Delhi', 'Delhi']
    },
    {
      stateName: 'Karnataka',
      stateCode: 'KA',
      cities: ['Bangalore', 'Mysore', 'Hubli-Dharwad', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davanagere', 'Bellary', 'Bijapur', 'Shimoga', 'Tumkur']
    },
    {
      stateName: 'Tamil Nadu',
      stateCode: 'TN',
      cities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli', 'Tiruppur', 'Ranipet', 'Nagercoil', 'Thanjavur', 'Vellore', 'Kancheepuram', 'Erode', 'Tiruvannamalai', 'Pollachi']
    },
    {
      stateName: 'Rajasthan',
      stateCode: 'RJ',
      cities: ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar']
    },
    {
      stateName: 'Uttar Pradesh',
      stateCode: 'UP',
      cities: ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar']
    },
    {
      stateName: 'West Bengal',
      stateCode: 'WB',
      cities: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman', 'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj']
    },
    {
      stateName: 'Andhra Pradesh',
      stateCode: 'AP',
      cities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa', 'Vizianagaram', 'Eluru', 'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni']
    },
    {
      stateName: 'Telangana',
      stateCode: 'TS',
      cities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Siddipet', 'Miryalaguda', 'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem']
    },
    {
      stateName: 'Madhya Pradesh',
      stateCode: 'MP',
      cities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli', 'Burhanpur', 'Khandwa', 'Morena', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha']
    },
    {
      stateName: 'Punjab',
      stateCode: 'PB',
      cities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Phagwara', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur']
    },
    {
      stateName: 'Haryana',
      stateCode: 'HR',
      cities: ['Faridabad', 'Gurgaon', 'Hisar', 'Rohtak', 'Panipat', 'Karnal', 'Sonipat', 'Yamunanagar', 'Panchkula', 'Bhiwani', 'Bahadurgarh', 'Jind', 'Sirsa', 'Thanesar', 'Kaithal', 'Palwal', 'Rewari', 'Hansi']
    },
    {
      stateName: 'Kerala',
      stateCode: 'KL',
      cities: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Kollam', 'Thrissur', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Malappuram', 'Manjeri']
    },
    {
      stateName: 'Odisha',
      stateCode: 'OR',
      cities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore', 'Bhadrak', 'Baripada']
    },
    {
      stateName: 'Jharkhand',
      stateCode: 'JH',
      cities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar']
    },
    {
      stateName: 'Assam',
      stateCode: 'AS',
      cities: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur']
    },
    {
      stateName: 'Bihar',
      stateCode: 'BR',
      cities: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar']
    },
    {
      stateName: 'Chhattisgarh',
      stateCode: 'CG',
      cities: ['Raipur', 'Bhilai', 'Korba', 'Bilaspur', 'Durg', 'Rajnandgaon']
    },
    {
      stateName: 'Uttarakhand',
      stateCode: 'UK',
      cities: ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani-cum-Kathgodam', 'Rudrapur', 'Kashipur', 'Rishikesh']
    },
    {
      stateName: 'Goa',
      stateCode: 'GA',
      cities: ['Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda']
    },
    {
      stateName: 'Himachal Pradesh',
      stateCode: 'HP',
      cities: ['Shimla', 'Mandi', 'Solan', 'Nahan', 'Sundarnagar', 'Palampur']
    },
    {
      stateName: 'Jammu and Kashmir',
      stateCode: 'JK',
      cities: ['Srinagar', 'Jammu', 'Anantnag']
    },
    {
      stateName: 'Manipur',
      stateCode: 'MN',
      cities: ['Imphal']
    },
    {
      stateName: 'Meghalaya',
      stateCode: 'ML',
      cities: ['Shillong']
    },
    {
      stateName: 'Mizoram',
      stateCode: 'MZ',
      cities: ['Aizawl']
    },
    {
      stateName: 'Nagaland',
      stateCode: 'NL',
      cities: ['Kohima', 'Dimapur']
    },
    {
      stateName: 'Tripura',
      stateCode: 'TR',
      cities: ['Agartala']
    },
    {
      stateName: 'Arunachal Pradesh',
      stateCode: 'AR',
      cities: ['Itanagar']
    },
    {
      stateName: 'Sikkim',
      stateCode: 'SK',
      cities: ['Gangtok']
    },
    {
      stateName: 'Puducherry',
      stateCode: 'PY',
      cities: ['Puducherry', 'Karaikal']
    },
    {
      stateName: 'Chandigarh',
      stateCode: 'CH',
      cities: ['Chandigarh']
    },
    {
      stateName: 'Dadra and Nagar Haveli and Daman and Diu',
      stateCode: 'DN',
      cities: ['Daman', 'Diu', 'Silvassa']
    },
    {
      stateName: 'Andaman and Nicobar Islands',
      stateCode: 'AN',
      cities: ['Port Blair']
    },
    {
      stateName: 'Lakshadweep',
      stateCode: 'LD',
      cities: ['Kavaratti']
    },
    {
      stateName: 'Ladakh',
      stateCode: 'LA',
      cities: ['Leh', 'Kargil']
    }
  ];

  try {
    for (const stateData of indianStatesAndCities) {
      // Check if state already exists
      let state = await prisma.state.findFirst({
        where: { stateName: stateData.stateName }
      });

      if (!state) {
        // Create state
        state = await prisma.state.create({
          data: {
            stateName: stateData.stateName,
            stateCode: stateData.stateCode,
            isActive: true
          }
        });
        console.log(`✅ Created state: ${stateData.stateName}`);
      } else {
        console.log(`⏭️  State already exists: ${stateData.stateName}`);
      }

      // Create cities for this state
      for (const cityName of stateData.cities) {
        const existingCity = await prisma.city.findFirst({
          where: {
            cityName: cityName,
            stateId: state.id
          }
        });

        if (!existingCity) {
          await prisma.city.create({
            data: {
              cityName: cityName,
              stateId: state.id,
              isActive: true
            }
          });
          console.log(`  ✅ Created city: ${cityName}`);
        } else {
          console.log(`  ⏭️  City already exists: ${cityName}`);
        }
      }
    }

    console.log('\n✅ States and cities seeded successfully!');

    // Print summary
    const statesCount = await prisma.state.count();
    const citiesCount = await prisma.city.count();
    console.log(`\n📊 Summary:`);
    console.log(`   Total States: ${statesCount}`);
    console.log(`   Total Cities: ${citiesCount}`);

  } catch (error) {
    console.error('❌ Error seeding states and cities:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedStates()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
